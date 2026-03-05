import { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { SKU, AIReport } from '../types';

interface AIReportDrawerProps {
  sku: SKU;
  report: AIReport;
  onClose: () => void;
}

const AIReportDrawer: React.FC<AIReportDrawerProps> = ({ sku, report, onClose }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
      
      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis' as const,
          axisPointer: { type: 'shadow' as const },
          backgroundColor: 'rgba(28, 25, 23, 0.95)',
          borderColor: '#44403C',
          textStyle: { color: '#E7E5E4' },
        },
        legend: {
          data: ['利多因素', '利空因素'],
          textStyle: { color: '#A8A29E' },
          bottom: 0,
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '15%',
          top: '10%',
          containLabel: true,
        },
        xAxis: {
          type: 'value' as const,
          axisLabel: { color: '#A8A29E', formatter: '{value}%' },
          splitLine: { lineStyle: { color: '#44403C' } },
        },
        yAxis: {
          type: 'category' as const,
          data: report.battleFactors.map((f: { name: string }) => f.name),
          axisLabel: { color: '#E7E5E4', fontSize: 12 },
          axisLine: { lineStyle: { color: '#44403C' } },
        },
        series: [
          {
            name: '利多因素',
            type: 'bar' as const,
            data: report.battleFactors.map((f: { bullish: number }) => f.bullish),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#DC2626' },
                { offset: 1, color: '#EF4444' },
              ]),
              borderRadius: [0, 4, 4, 0],
            },
            barWidth: 16,
          },
          {
            name: '利空因素',
            type: 'bar' as const,
            data: report.battleFactors.map((f: { bearish: number }) => -f.bearish),
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                { offset: 0, color: '#16A34A' },
                { offset: 1, color: '#22C55E' },
              ]),
              borderRadius: [4, 0, 0, 4],
            },
            barWidth: 16,
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
  }, [report]);

  const getDirectionDisplay = () => {
    const { conclusion } = report;
    if (conclusion.direction === 'up') {
      return (
        <span className="text-red-600 font-bold text-xl">
          ↑ {conclusion.deltaPercent.min}% ~ {conclusion.deltaPercent.max}%
        </span>
      );
    } else if (conclusion.direction === 'down') {
      return (
        <span className="text-green-600 font-bold text-xl">
          ↓ {conclusion.deltaPercent.min}% ~ {conclusion.deltaPercent.max}%
        </span>
      );
    }
    return (
      <span className="text-stone-400 font-bold text-xl">
        → {conclusion.deltaPercent.min}% ~ {conclusion.deltaPercent.max}%
      </span>
    );
  };

  const getDirectionText = () => {
    if (report.conclusion.direction === 'up') return '看涨';
    if (report.conclusion.direction === 'down') return '看跌';
    return '震荡';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-stone-800 rounded-2xl shadow-2xl border border-stone-700/50 overflow-hidden flex flex-col">
        <div className="p-6 border-b border-stone-700/50 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-xl font-semibold text-white">AI 证据链推演战报</h3>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-medium rounded">
                  {sku.name}
                </span>
              </div>
              <p className="text-sm text-stone-400">生成时间：{report.generatedAt}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-stone-700 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-700/30">
            <h4 className="text-sm font-medium text-stone-400 mb-2">核心提要</h4>
            <p className="text-white leading-relaxed">{report.summary}</p>
          </div>

          <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-700/30">
            <h4 className="text-sm font-medium text-stone-400 mb-4">预测结论</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-400 mb-1">未来一旬涨跌方向</p>
                <p className="text-lg font-semibold text-white">{getDirectionText()}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-stone-400 mb-1">预测涨跌幅</p>
                {getDirectionDisplay()}
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-stone-700/30">
              <p className="text-sm text-stone-400">
                换算为绝对价格：¥{(sku.basePrice * (1 + report.conclusion.deltaPercent.min / 100)).toFixed(0)} ~ 
                ¥{(sku.basePrice * (1 + report.conclusion.deltaPercent.max / 100)).toFixed(0)} 元/吨
              </p>
            </div>
          </div>

          <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-700/30">
            <h4 className="text-sm font-medium text-stone-400 mb-4">多空因子博弈图</h4>
            <div ref={chartRef} className="w-full h-64"></div>
          </div>

          <div className="bg-stone-900/50 rounded-xl p-5 border border-stone-700/30">
            <h4 className="text-sm font-medium text-stone-400 mb-4">证据与逻辑正文</h4>
            <div className="space-y-4">
              {report.evidence.map((item) => (
                <div key={item.id} className="flex items-start space-x-3 p-3 bg-stone-800/50 rounded-lg">
                  <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${
                    item.polarity === 'bullish' ? 'bg-red-500' : 
                    item.polarity === 'bearish' ? 'bg-green-500' : 'bg-stone-500'
                  }`}></div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-xs font-medium text-amber-400">{item.source}</span>
                      <span className="text-xs text-stone-500">•</span>
                      <span className="text-xs text-stone-500">{item.type === 'quant' ? '量化数据' : 'NLP情报'}</span>
                      <span className="text-xs text-stone-500">•</span>
                      <span className="text-xs text-stone-500">{item.timestamp}</span>
                    </div>
                    <p className="text-sm text-stone-300 leading-relaxed">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-500/10 rounded-xl p-5 border border-amber-500/30">
            <h4 className="text-sm font-medium text-amber-500 mb-2">操作建议</h4>
            <p className="text-white leading-relaxed">{report.recommendation}</p>
          </div>
        </div>

        <div className="p-6 border-t border-stone-700/50 bg-stone-900/30 flex-shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-xs text-stone-500">
              本报告基于 AI 生成，不构成配煤技术指导，请结合实际炉况谨慎决策。不对交易盈亏负责。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIReportDrawer;
