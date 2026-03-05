import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { PriceHistory } from '../types';

interface PriceTrendChartProps {
  priceHistory: PriceHistory;
  basePrice: number;
}

const PriceTrendChart: React.FC<PriceTrendChartProps> = ({ priceHistory, basePrice }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current && priceHistory.dates.length > 0) {
      chartInstance.current = echarts.init(chartRef.current);
      
      const todayIndex = 90; // 第 90 天是今天
      const dates = priceHistory.dates;
      const actualPrices = priceHistory.actualPrices;
      const forecastRanges = priceHistory.forecastRanges;
      
      // 分离历史预测和未来预测
      const historicalForecastMin: (number | null)[] = [];
      const historicalForecastMax: (number | null)[] = [];
      const futureForecastMin: (number | null)[] = [];
      const futureForecastMax: (number | null)[] = [];
      
      forecastRanges.forEach((range, index) => {
        if (index <= todayIndex) {
          // 历史预测
          historicalForecastMin.push(range.min);
          historicalForecastMax.push(range.max);
          futureForecastMin.push(null);
          futureForecastMax.push(null);
        } else {
          // 未来预测
          historicalForecastMin.push(null);
          historicalForecastMax.push(null);
          futureForecastMin.push(range.min);
          futureForecastMax.push(range.max);
        }
      });

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis' as const,
          backgroundColor: 'rgba(28, 25, 23, 0.95)',
          borderColor: '#44403C',
          textStyle: { color: '#E7E5E4', fontSize: 12 },
          formatter: (params: any) => {
            const date = params[0].axisValue;
            const actual = params.find((p: any) => p.seriesName === '现货价格')?.value;
            const forecast = params.find((p: any) => p.seriesName === '预测区间');
            
            let html = `<div style="padding: 8px;">
              <div style="color: #A8A29E; font-size: 12px; margin-bottom: 8px;">${date}</div>`;
            
            if (actual && typeof actual === 'number') {
              html += `<div style="color: #1E40AF; font-size: 14px; margin-bottom: 4px;">
                ● 现货价格：¥${actual.toFixed(1)}/吨
              </div>`;
            }
            
            if (forecast) {
              const minVal = forecast.data[1];
              const maxVal = forecast.data[2];
              if (minVal !== null && maxVal !== null) {
                const isFuture = forecast.data[0] === 'future';
                html += `<div style="color: ${isFuture ? '#F59E0B' : '#10B981'}; font-size: 13px;">
                  ${isFuture ? '📈' : '✅'} 预测区间：¥${minVal.toFixed(1)} ~ ¥${maxVal.toFixed(1)}
                </div>`;
              }
            }
            
            html += '</div>';
            return html;
          },
        },
        legend: {
          data: ['现货价格', '预测区间'],
          textStyle: { color: '#A8A29E', fontSize: 11 },
          top: 5,
          right: 100,
        },
        grid: {
          left: '3%',
          right: '3%',
          bottom: '15%',
          top: '45',
          containLabel: true,
        },
        xAxis: {
          type: 'category' as const,
          data: dates,
          axisLabel: { 
            color: '#78716C', 
            fontSize: 10,
            rotate: 45,
            formatter: (value: string) => {
              const date = new Date(value);
              return `${date.getMonth() + 1}/${date.getDate()}`;
            },
          },
          axisLine: { lineStyle: { color: '#44403C' } },
          axisTick: { show: false },
        },
        yAxis: {
          type: 'value' as const,
          axisLabel: { 
            color: '#78716C',
            fontSize: 11,
            formatter: (value: number) => `¥${value}`,
          },
          splitLine: { lineStyle: { color: '#44403C', type: 'dashed' } },
          min: (_value: any) => {
            const minPrice = Math.min(...actualPrices.filter(p => !isNaN(p)));
            return Math.floor(minPrice * 0.95);
          },
          max: (_value: any) => {
            const maxPrice = Math.max(...actualPrices.filter(p => !isNaN(p)));
            const maxForecast = Math.max(...forecastRanges.map(r => r.max));
            return Math.ceil(Math.max(maxPrice, maxForecast) * 1.03);
          },
        },
        series: [
          {
            name: '现货价格',
            type: 'line' as const,
            data: actualPrices.map((price, index) => {
              if (isNaN(price)) return null;
              return {
                value: price,
                itemStyle: {
                  color: index <= todayIndex ? '#1E40AF' : '#9CA3AF',
                },
              };
            }),
            smooth: true,
            symbol: 'none',
            lineStyle: {
              color: '#1E40AF',
              width: 3,
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(30, 64, 175, 0.2)' },
                { offset: 1, color: 'rgba(30, 64, 175, 0.02)' },
              ]),
            },
          },
          {
            name: '预测区间',
            type: 'custom' as const,
            renderItem: (_params: any, api: any) => {
              const index = api.value(0);
              const minVal = api.value(1);
              const maxVal = api.value(2);
              const isFuture = api.value(3) === 'future';
              
              if (minVal === null || maxVal === null) return null;
              
              const start = api.coord([index - 0.4, minVal]);
              const end = api.coord([index + 0.4, maxVal]);
              const width = end[0] - start[0];
              const height = start[1] - end[1];
              
              return {
                type: 'rect',
                shape: {
                  x: start[0],
                  y: end[1],
                  width: width,
                  height: height,
                },
                style: {
                  fill: isFuture ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.2)',
                  stroke: isFuture ? '#F59E0B' : '#10B981',
                  lineWidth: 1,
                },
              };
            },
            encode: {
              x: [0, 0, 0, 3],
              y: [1, 2],
            },
            data: forecastRanges.map((range, index) => [
              index,
              range.min,
              range.max,
              index > todayIndex ? 'future' : 'history',
            ]),
          },
        ],
        graphic: [
          {
            type: 'line' as const,
            left: '0%',
            right: '0%',
            top: (api: any) => api.coord([todayIndex, 0])[1],
            style: {
              stroke: '#F59E0B',
              lineWidth: 2,
              lineDash: [5, 5],
            },
          },
          {
            type: 'text' as const,
            right: 10,
            top: 20,
            style: {
              text: `近 3 个月方向预测胜率：${(priceHistory.winRate * 100).toFixed(0)}%`,
              fill: '#10B981',
              fontSize: 13,
              fontWeight: 'bold',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: [6, 12],
              borderRadius: 4,
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
    }
  }, [priceHistory, basePrice]);

  return (
    <div ref={chartRef} className="w-full h-64" />
  );
};

export default PriceTrendChart;
