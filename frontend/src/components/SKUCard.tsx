import React from 'react';
import { SKU } from '../types';
import PriceTrendChart from './PriceTrendChart';
import { mockPriceHistory } from '../data/mockData';

interface SKUCardProps {
  sku: SKU;
  onViewReport: () => void;
}

const SKUCard: React.FC<SKUCardProps> = ({ sku, onViewReport }) => {
  const { prediction } = sku;
  const priceHistory = mockPriceHistory[sku.id];

  const getDirectionDisplay = () => {
    if (prediction.direction === 'up') {
      return (
        <span className="text-red-500 font-bold text-2xl">
          ↑ {prediction.deltaPercent.min}% ~ {prediction.deltaPercent.max}%
        </span>
      );
    } else if (prediction.direction === 'down') {
      return (
        <span className="text-green-500 font-bold text-2xl">
          ↓ {Math.abs(prediction.deltaPercent.min)}% ~ {Math.abs(prediction.deltaPercent.max)}%
        </span>
      );
    }
    return (
      <span className="text-stone-400 font-bold text-2xl">
        → {prediction.deltaPercent.min}% ~ {prediction.deltaPercent.max}%
      </span>
    );
  };

  const getDirectionText = () => {
    if (prediction.direction === 'up') return '看涨';
    if (prediction.direction === 'down') return '看跌';
    return '震荡';
  };

  const getDirectionColor = () => {
    if (prediction.direction === 'up') return 'bg-red-500/10 text-red-500 border-red-500/30';
    if (prediction.direction === 'down') return 'bg-green-500/10 text-green-500 border-green-500/30';
    return 'bg-stone-500/10 text-stone-400 border-stone-500/30';
  };

  return (
    <div className="bg-stone-800/60 backdrop-blur-sm border border-stone-700/50 rounded-xl p-6 hover:border-stone-600/50 transition-all hover:shadow-lg hover:shadow-black/20 group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">
            {sku.name}
          </h3>
          <p className="text-sm text-stone-400 mt-1">{sku.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getDirectionColor()}`}>
          {getDirectionText()}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400">基准价格（P0）</span>
          <span className="text-lg font-semibold text-white">
            ¥{sku.basePrice.toLocaleString()}/吨
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400">预测涨跌</span>
          {getDirectionDisplay()}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400">涨跌区间</span>
          <span className="text-sm font-medium text-white">
            ¥{prediction.deltaPrice.min > 0 ? '+' : ''}{prediction.deltaPrice.min} ~ 
            {prediction.deltaPrice.max > 0 ? '+' : ''}{prediction.deltaPrice.max} 元/吨
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-stone-400">产地</span>
          <span className="text-sm text-stone-300">{sku.region}</span>
        </div>
      </div>

      {/* 价格趋势图表 */}
      <div className="mb-4 p-3 bg-stone-900/40 rounded-lg border border-stone-700/30">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-medium text-stone-400">价格趋势与预测对比</h4>
          {priceHistory && (
            <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded">
              近 3 个月胜率：{(priceHistory.winRate * 100).toFixed(0)}%
            </span>
          )}
        </div>
        {priceHistory ? (
          <PriceTrendChart priceHistory={priceHistory} basePrice={sku.basePrice} />
        ) : (
          <div className="h-64 flex items-center justify-center text-stone-500 text-xs">
            图表加载中...
          </div>
        )}
        <div className="flex items-center justify-center space-x-4 mt-2 text-xs text-stone-500">
          <span className="flex items-center">
            <span className="w-3 h-0.5 bg-blue-900 mr-1"></span>
            现货价格
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-green-500/20 border border-green-500 mr-1"></span>
            历史预测
          </span>
          <span className="flex items-center">
            <span className="w-3 h-3 bg-amber-500/20 border border-amber-500 mr-1"></span>
            未来预测
          </span>
        </div>
      </div>

      <button
        onClick={onViewReport}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500/20 to-red-500/20 hover:from-amber-500/30 hover:to-red-500/30 border border-amber-500/50 hover:border-amber-400 text-amber-400 hover:text-amber-300 font-medium rounded-lg transition-all text-sm"
      >
        查看本旬深度 AI 战报
      </button>
    </div>
  );
};

export default SKUCard;
