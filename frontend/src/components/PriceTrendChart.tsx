import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { PriceHistory } from '../types';

interface PriceTrendChartProps {
  priceHistory: PriceHistory;
  basePrice: number;
}

type TrendDirection = 'up' | 'down' | 'neutral';

interface TrendChunk {
  start: number;
  end: number;
  min: number;
  max: number;
  direction: TrendDirection;
}

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ priceHistory, basePrice }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!chartRef.current || priceHistory.dates.length === 0) {
      return;
    }

    chartInstance.current = echarts.init(chartRef.current);

    const dates = priceHistory.dates;
    const actualPrices = priceHistory.actualPrices;
    const forecastRanges = priceHistory.forecastRanges;

    const futureStart = forecastRanges.findIndex((item) => !item.predicted);
    const todayIndex = futureStart > 0 ? futureStart - 1 : Math.min(90, dates.length - 1);
    const historyWindow = 30;
    const startIndex = Math.max(0, todayIndex - historyWindow + 1);
    const visibleTodayIndex = todayIndex - startIndex;

    const visibleDates = dates.slice(startIndex);
    const visibleActual = actualPrices.slice(startIndex);
    const visibleForecast = forecastRanges.slice(startIndex);

    const todayObserved = visibleActual[visibleTodayIndex];
    const todayPrice = !Number.isNaN(todayObserved)
      ? Number(todayObserved.toFixed(1))
      : (Number.isNaN(actualPrices[todayIndex]) ? basePrice : actualPrices[todayIndex]) ?? basePrice;

    const actualHistorySeries = visibleActual.map((price, index) =>
      index <= visibleTodayIndex && !Number.isNaN(price) ? Number(price.toFixed(1)) : null,
    );
    const futureRanges = visibleForecast
      .map((range, index) => ({ range, index }))
      .filter((item) => item.index > visibleTodayIndex && !item.range.predicted)
      .map((item) => item.range);

    const futureCenters = futureRanges.map((item) => (item.min + item.max) / 2);
    const futureStartCenter = futureCenters[0] ?? todayPrice;
    const futureEndCenter = futureCenters[futureCenters.length - 1] ?? todayPrice;
    const futureMin = futureRanges.length > 0 ? Math.min(...futureRanges.map((item) => item.min)) : todayPrice;
    const futureMax = futureRanges.length > 0 ? Math.max(...futureRanges.map((item) => item.max)) : todayPrice;
    const deltaPercentMin = ((futureMin - todayPrice) / todayPrice) * 100;
    const deltaPercentMax = ((futureMax - todayPrice) / todayPrice) * 100;
    const centerSlopePercent = ((futureEndCenter - futureStartCenter) / todayPrice) * 100;
    const slopeThreshold = 0.12;
    const direction: TrendDirection =
      centerSlopePercent > slopeThreshold ? 'up' : centerSlopePercent < -slopeThreshold ? 'down' : 'neutral';
    const deltaMidPercent = (deltaPercentMin + deltaPercentMax) / 2;
    const targetPrice = Number((todayPrice * (1 + deltaMidPercent / 100)).toFixed(1));
    const futureStripStart = Math.min(visibleTodayIndex + 1, visibleDates.length - 1);
    const futureStripEnd = visibleDates.length - 1;

    const chunks: TrendChunk[] = [];
    const chunkSize = 10;
    // 从 Today 向左按每 10 天分组，避免右侧出现 1 天残块
    for (let localEnd = visibleTodayIndex; localEnd >= 0; localEnd -= chunkSize) {
      const localStart = Math.max(0, localEnd - chunkSize + 1);
      const slice = visibleForecast.slice(localStart, localEnd + 1).filter((item) => item.predicted);
      if (slice.length === 0) continue;

      const firstCenter = (slice[0].min + slice[0].max) / 2;
      const lastCenter = (slice[slice.length - 1].min + slice[slice.length - 1].max) / 2;
      const delta = lastCenter - firstCenter;
      const direction: TrendDirection = delta > 0 ? 'up' : delta < 0 ? 'down' : 'neutral';

      chunks.unshift({
        start: localStart,
        end: localEnd,
        min: Math.min(...slice.map((item) => item.min)),
        max: Math.max(...slice.map((item) => item.max)),
        direction,
      });
    }

    const chunkStripData = chunks.map((chunk) => ({
      value: [chunk.start, chunk.end, 0, 1, chunk.direction === 'up' ? 1 : chunk.direction === 'down' ? -1 : 0],
    }));
    if (futureStripStart <= futureStripEnd) {
      chunkStripData.push({
        value: [futureStripStart, futureStripEnd, 0, 1, direction === 'up' ? 1 : direction === 'down' ? -1 : 0],
      });
    }

    const trendColor = direction === 'up' ? '#ff5959' : direction === 'down' ? '#52d428' : '#94A3B8';
    const trendGlow = direction === 'up'
      ? 'rgba(255,89,89,0.55)'
      : direction === 'down'
        ? 'rgba(82,212,40,0.55)'
        : 'rgba(148,163,184,0.45)';
    const upRangeMin = Math.max(deltaPercentMin, 0.1);
    const upRangeMax = Math.max(deltaPercentMax, upRangeMin + 0.1);
    const downRangeMax = Math.min(deltaPercentMax, -0.1);
    const downRangeMin = Math.min(deltaPercentMin, downRangeMax - 0.1);
    const displayMin = direction === 'up' ? upRangeMin : direction === 'down' ? downRangeMin : deltaPercentMin;
    const displayMax = direction === 'up' ? upRangeMax : direction === 'down' ? downRangeMax : deltaPercentMax;
    const futureLabel = `${direction === 'up' ? '预测上涨' : direction === 'down' ? '预测下跌' : '预测震荡'} ${displayMin >= 0 ? '+' : ''}${displayMin.toFixed(1)}% ~ ${displayMax >= 0 ? '+' : ''}${displayMax.toFixed(1)}%`;

    let hitCount = 0;
    let hitTotal = 0;
    for (let i = 0; i <= todayIndex; i += 1) {
      const actual = actualPrices[i];
      const range = forecastRanges[i];
      if (Number.isNaN(actual) || !range?.predicted) continue;
      hitTotal += 1;
      if (actual >= range.min && actual <= range.max) hitCount += 1;
    }
    const hitRate = hitTotal > 0 ? Math.round((hitCount / hitTotal) * 100) : 0;
    const winRate = Math.round(priceHistory.winRate * 100);

    const yCandidates: number[] = [];
    actualHistorySeries.forEach((value) => {
      if (typeof value === 'number') yCandidates.push(value);
    });
    visibleForecast.forEach((item, index) => {
      if (index >= visibleTodayIndex) yCandidates.push(item.min, item.max);
    });
    if (yCandidates.length === 0) yCandidates.push(basePrice);

    const yMinRaw = Math.min(...yCandidates);
    const yMaxRaw = Math.max(...yCandidates);
    const yPad = Math.max((yMaxRaw - yMinRaw) * 0.14, basePrice * 0.0055);
    const yMin = Number((yMinRaw - yPad).toFixed(1));
    const yMax = Number((yMaxRaw + yPad).toFixed(1));
    const tenDayBoundaryPositions = chunks
      .slice(1)
      .map((chunk) => chunk.start - 0.5)
      .filter((position) => position > -0.5 && position < visibleTodayIndex + 0.5);

    const option = {
      backgroundColor: 'transparent',
      animationDuration: 450,
      axisPointer: {
        link: [{ xAxisIndex: [0, 1] }],
      },
      legend: {
        top: 0,
        right: 0,
        itemWidth: 10,
        itemHeight: 3,
        textStyle: { color: '#A8A29E', fontSize: 11 },
        data: ['真实现货', '历史预测方向', '未来一旬预测'],
      },
      grid: [
        {
          left: 44,
          right: 14,
          top: 38,
          bottom: 78,
          containLabel: false,
        },
        {
          left: 44,
          right: 14,
          bottom: 48,
          height: 18,
          containLabel: false,
        },
      ],
      xAxis: [
        {
          type: 'category' as const,
          gridIndex: 0,
          data: visibleDates,
          boundaryGap: false,
          axisTick: { show: false },
          axisLabel: { show: false },
          axisLine: { show: false },
        },
        {
          type: 'category' as const,
          gridIndex: 1,
          data: visibleDates,
          boundaryGap: false,
          axisTick: { show: false },
          axisLine: { lineStyle: { color: 'rgba(120,113,108,0.35)' } },
          axisLabel: {
            color: '#A8A29E',
            fontSize: 10,
            interval: 0,
            formatter: (value: string, index: number) => {
              const showEvery = 5;
              if (
                index !== 0 &&
                index !== visibleTodayIndex &&
                index !== visibleDates.length - 1 &&
                index % showEvery !== 0
              ) {
                return '';
              }
              const d = new Date(value);
              return `${d.getMonth() + 1}/${d.getDate()}`;
            },
          },
        },
      ],
      yAxis: [
        {
          type: 'value' as const,
          gridIndex: 0,
          min: yMin,
          max: yMax,
          axisTick: { show: false },
          axisLine: { show: false },
          axisLabel: {
            show: true,
            color: '#78716C',
            fontSize: 10,
            formatter: (value: number) => `¥${Math.round(value)}`,
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: 'rgba(120,113,108,0.2)',
              type: 'dashed' as const,
            },
          },
        },
        {
          type: 'value' as const,
          gridIndex: 1,
          min: 0,
          max: 1,
          show: false,
        },
      ],
      tooltip: {
        trigger: 'axis' as const,
        axisPointer: {
          type: 'line' as const,
          lineStyle: { color: '#78716C', type: 'dashed' as const },
        },
        backgroundColor: 'rgba(17, 24, 39, 0.95)',
        borderColor: 'rgba(120, 113, 108, 0.5)',
        textStyle: { color: '#E7E5E4', fontSize: 12 },
        formatter: (params: any) => {
          const dataIndex = params[0]?.dataIndex ?? -1;
          const date = params[0]?.axisValue ?? '';
          const actual = params.find((item: any) => item.seriesName === '真实现货')?.value;

          let trendText = '';
          if (typeof dataIndex === 'number' && dataIndex <= visibleTodayIndex) {
            const chunk = chunks.find((item) => dataIndex >= item.start && dataIndex <= item.end);
            if (chunk) {
              const label =
                chunk.direction === 'up'
                  ? '上涨'
                  : chunk.direction === 'down'
                    ? '下跌'
                    : '震荡';
              const color =
                chunk.direction === 'up'
                  ? '#ff5959'
                  : chunk.direction === 'down'
                    ? '#52d428'
                    : '#94A3B8';
              trendText = `<div style="color:${color};">历史预测方向: ${label}</div>`;
            }
          }

          let html = `<div style="padding:6px 8px;"><div style="margin-bottom:6px;color:#A8A29E;">${date}</div>`;
          if (typeof actual === 'number') {
            html += `<div style="color:#E7E5E4;">真实现货: ¥${actual.toFixed(1)}/吨</div>`;
          }
          if (trendText) html += trendText;
          if (typeof dataIndex === 'number' && dataIndex >= visibleTodayIndex) {
            html += `<div style="color:${trendColor};">未来一旬: ${futureLabel}</div>`;
          }
          html += '</div>';
          return html;
        },
      },
      series: [
        {
          name: '真实现货',
          type: 'line' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: actualHistorySeries,
          smooth: 0.35,
          symbol: 'none',
          lineStyle: {
            color: '#E7E5E4',
            width: 2.8,
          },
          z: 5,
          markLine: {
            silent: true,
            symbol: ['none', 'none'],
            lineStyle: {
              color: 'rgba(245, 158, 11, 0.65)',
              width: 1.1,
              type: 'dashed',
            },
            label: {
              show: true,
              formatter: 'Today',
              color: '#F59E0B',
              fontSize: 10,
            },
            data: [{ xAxis: visibleDates[visibleTodayIndex] }],
          },
        },
        {
          name: '__旬交界线',
          type: 'custom' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: tenDayBoundaryPositions.map((position) => [position]),
          renderItem: (_params: any, api: any) => {
            const xPos = api.value(0);
            const start = api.coord([xPos, yMin]);
            const end = api.coord([xPos, yMax]);
            return {
              type: 'line',
              shape: {
                x1: start[0],
                y1: start[1],
                x2: end[0],
                y2: end[1],
              },
              style: {
                stroke: 'rgba(248, 113, 113, 0.55)',
                lineWidth: 1,
                lineDash: [6, 4],
              },
            };
          },
          tooltip: { show: false },
          silent: true,
          emphasis: { disabled: true },
          z: 1,
        },
        {
          name: '历史预测方向',
          type: 'custom' as const,
          xAxisIndex: 1,
          yAxisIndex: 1,
          data: chunkStripData,
          renderItem: (_params: any, api: any) => {
            const start = api.value(0);
            const end = api.value(1);
            const directionFlag = api.value(4);
            const topLeft = api.coord([start - 0.5, 1]);
            const bottomRight = api.coord([end + 0.5, 0]);
            const rectX = topLeft[0];
            const rectY = topLeft[1];
            const rectWidth = bottomRight[0] - topLeft[0];
            const rectHeight = bottomRight[1] - topLeft[1];
            const labelText = directionFlag > 0 ? '预测上涨' : directionFlag < 0 ? '预测下跌' : '预测震荡';
            const blockStyle = directionFlag > 0
              ? {
                  fill: 'rgba(239, 68, 68, 0.9)',
                  stroke: 'rgba(248, 113, 113, 0.95)',
                }
              : directionFlag < 0
                ? {
                    fill: 'rgba(34, 197, 94, 0.9)',
                    stroke: 'rgba(74, 222, 128, 0.95)',
                  }
                : {
                    fill: 'rgba(100, 116, 139, 0.85)',
                    stroke: 'rgba(148, 163, 184, 0.9)',
                  };

            return {
              type: 'group',
              children: [
                {
                  type: 'rect',
                  shape: {
                    x: rectX,
                    y: rectY,
                    width: rectWidth,
                    height: rectHeight,
                    r: 3,
                  },
                  style: {
                    ...blockStyle,
                    lineWidth: 1,
                  },
                },
                {
                  type: 'text',
                  style: {
                    x: rectX + rectWidth / 2,
                    y: rectY + rectHeight / 2,
                    text: labelText,
                    fill: '#FFFFFF',
                    fontSize: 10,
                    fontWeight: 600,
                    textAlign: 'center',
                    textVerticalAlign: 'middle',
                  },
                },
              ],
            };
          },
          tooltip: { show: false },
          silent: true,
          emphasis: { disabled: true },
          z: 2,
        },
        {
          name: '未来一旬预测',
          type: 'custom' as const,
          xAxisIndex: 0,
          yAxisIndex: 0,
          data: [[visibleTodayIndex, todayPrice, visibleDates.length - 1, targetPrice]],
          renderItem: (_params: any, api: any) => {
            const startIndex = api.value(0);
            const startPrice = api.value(1);
            const endIndex = api.value(2);
            const endPrice = api.value(3);
            const start = api.coord([startIndex, startPrice]);
            const end = api.coord([endIndex, endPrice]);

            const dx = end[0] - start[0];
            const dy = end[1] - start[1];
            const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
            const ux = dx / length;
            const uy = dy / length;
            const headLength = 10;
            const headWidth = 5;

            return {
              type: 'group',
              children: [
                {
                  type: 'line',
                  shape: {
                    x1: start[0],
                    y1: start[1],
                    x2: end[0],
                    y2: end[1],
                  },
                  style: {
                    stroke: trendColor,
                    lineWidth: 2.4,
                    lineDash: [6, 4],
                    shadowBlur: 8,
                    shadowColor: trendGlow,
                  },
                },
                {
                  type: 'polygon',
                  shape: {
                    points: [
                      [end[0], end[1]],
                      [
                        end[0] - ux * headLength - uy * headWidth,
                        end[1] - uy * headLength + ux * headWidth,
                      ],
                      [
                        end[0] - ux * headLength + uy * headWidth,
                        end[1] - uy * headLength - ux * headWidth,
                      ],
                    ],
                  },
                  style: {
                    fill: trendColor,
                    shadowBlur: 8,
                    shadowColor: trendGlow,
                  },
                },
                {
                  type: 'text',
                  style: {
                    x: end[0] + 6,
                    y: end[1] - 8,
                    text: futureLabel,
                    fill: trendColor,
                    fontSize: 10,
                    fontWeight: 600,
                    textAlign: 'left',
                    textVerticalAlign: 'middle',
                  },
                },
              ],
            };
          },
          tooltip: { show: false },
          silent: true,
          emphasis: { disabled: true },
          z: 4,
        },
      ],
      graphic: [
        {
          type: 'text' as const,
          right: 4,
          top: 2,
          style: {
            text: `${Math.min(historyWindow, todayIndex + 1)}D History + 1 Xun Forecast`,
            fill: '#78716C',
            fontSize: 11,
            fontFamily: 'Consolas, Menlo, Monaco, monospace',
          },
        },
        {
          type: 'text' as const,
          left: 6,
          bottom: 4,
          style: {
            text: `近3个月方向预测胜率: ${winRate}%`,
            fill: '#A8A29E',
            fontSize: 11,
          },
        },
        {
          type: 'text' as const,
          right: 6,
          bottom: 4,
          style: {
            text: `区间命中率: ${hitRate}%`,
            fill: '#A8A29E',
            fontSize: 11,
          },
        },
      ],
    };

    chartInstance.current.setOption(option);

    const handleResize = () => chartInstance.current?.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.current?.dispose();
    };
  }, [priceHistory, basePrice]);

  return <div ref={chartRef} className="w-full h-72 lg:h-80" />;
};

export default PriceTrendChart;
