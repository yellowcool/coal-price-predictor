export interface SKU {
  id: string;
  name: string;
  description: string;
  region: string;
  basePrice: number;
  prediction: {
    direction: 'up' | 'down' | 'neutral';
    deltaPercent: { min: number; max: number };
    deltaPrice: { min: number; max: number };
  };
  unlocked: boolean;
}

export interface EvidenceItem {
  id: string;
  type: 'quant' | 'nlp';
  source: string;
  content: string;
  timestamp: string;
  polarity: 'bullish' | 'bearish' | 'neutral';
  weight: number;
}

export interface BattleFactor {
  name: string;
  bullish: number;
  bearish: number;
}

export interface AIReport {
  skuId: string;
  skuName: string;
  summary: string;
  conclusion: {
    direction: 'up' | 'down' | 'neutral';
    deltaPercent: { min: number; max: number };
    deltaPrice: { min: number; max: number };
  };
  battleFactors: BattleFactor[];
  evidence: EvidenceItem[];
  recommendation: string;
  generatedAt: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  unlockedSKUs: string[];
}

export interface ForecastRange {
  min: number;
  max: number;
  predicted: boolean; // true=历史预测，false=未来预测
}

export interface PriceHistory {
  skuId: string;
  dates: string[];
  actualPrices: number[];
  forecastRanges: ForecastRange[];
  winRate: number; // 预测胜率
}
