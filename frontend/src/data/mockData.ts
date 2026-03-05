import { SKU, AIReport, User, PriceHistory } from '../types';

export const mockUser: User = {
  id: 'user_001',
  name: '张三',
  unlockedSKUs: ['SKU_01', 'SKU_02'],
};

// 历史价格数据（过去 90 天）+ 未来 10 天预测
export const mockPriceHistory: Record<string, PriceHistory> = {
  SKU_01: {
    skuId: 'SKU_01',
    dates: [], // 将在初始化时生成
    actualPrices: [],
    forecastRanges: [],
    winRate: 0.85, // 近 3 个月方向预测胜率 85%
  },
  SKU_02: {
    skuId: 'SKU_02',
    dates: [],
    actualPrices: [],
    forecastRanges: [],
    winRate: 0.78,
  },
  SKU_03: {
    skuId: 'SKU_03',
    dates: [],
    actualPrices: [],
    forecastRanges: [],
    winRate: 0.82,
  },
};

// 生成模拟的历史价格和预测数据
function generateMockData(basePrice: number, trend: 'up' | 'down' | 'neutral', volatility: number) {
  const dates: string[] = [];
  const actualPrices: number[] = [];
  const forecastRanges: { min: number; max: number; predicted: boolean }[] = [];
  
  const today = new Date();
  
  // 生成过去 90 天数据
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
    
    // 生成带有趋势和波动的价格
    const trendFactor = trend === 'up' ? 0.02 : trend === 'down' ? -0.02 : 0;
    const randomWalk = (Math.random() - 0.5) * volatility;
    const price = basePrice * (1 + trendFactor * (90 - i) / 90 + randomWalk);
    actualPrices.push(Math.round(price * 10) / 10);
    
    // 生成预测区间（过去 60 天有预测记录）
    if (i <= 60) {
      const forecastVolatility = 0.015 + Math.random() * 0.02; // 1.5%~3.5% 的预测区间
      const centerPrice = actualPrices[90 - i] * (1 + (Math.random() - 0.5) * 0.02);
      forecastRanges.push({
        min: Math.round(centerPrice * (1 - forecastVolatility) * 10) / 10,
        max: Math.round(centerPrice * (1 + forecastVolatility) * 10) / 10,
        predicted: true,
      });
    }
  }
  
  // 生成未来 10 天预测
  const lastPrice = actualPrices[actualPrices.length - 1];
  const futureTrend = trend === 'up' ? 0.015 : trend === 'down' ? -0.005 : 0;
  for (let i = 1; i <= 10; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    dates.push(date.toISOString().split('T')[0]);
    
    const projectedPrice = lastPrice * (1 + futureTrend * i / 10);
    const forecastWidth = 0.02 + i * 0.003; // 越远预测区间越宽
    
    actualPrices.push(NaN); // 未来价格未知
    forecastRanges.push({
      min: Math.round(projectedPrice * (1 - forecastWidth) * 10) / 10,
      max: Math.round(projectedPrice * (1 + forecastWidth) * 10) / 10,
      predicted: false,
    });
  }
  
  return { dates, actualPrices, forecastRanges };
}

// 初始化历史数据
Object.keys(mockPriceHistory).forEach(skuId => {
  const sku = allSKUs.find(s => s.id === skuId);
  if (sku) {
    const trend = sku.prediction.direction === 'up' ? 'up' : 
                  sku.prediction.direction === 'down' ? 'down' : 'neutral';
    const volatility = sku.prediction.direction === 'up' ? 0.03 : 0.025;
    const data = generateMockData(sku.basePrice, trend, volatility);
    mockPriceHistory[skuId].dates = data.dates;
    mockPriceHistory[skuId].actualPrices = data.actualPrices;
    mockPriceHistory[skuId].forecastRanges = data.forecastRanges;
  }
});

export const allSKUs: SKU[] = [
  {
    id: 'SKU_01',
    name: '山西安泽低硫主焦煤',
    description: '高利润弹性骨架煤',
    region: '山西·临汾',
    basePrice: 2150,
    prediction: {
      direction: 'up',
      deltaPercent: { min: 1.5, max: 2.5 },
      deltaPrice: { min: 32, max: 54 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_02',
    name: '山西吕梁柳林高硫主焦煤',
    description: '主流抗跌配煤',
    region: '山西·吕梁',
    basePrice: 1890,
    prediction: {
      direction: 'down',
      deltaPercent: { min: -0.8, max: -0.3 },
      deltaPrice: { min: -15, max: -6 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_03',
    name: '内蒙古甘其毛都口岸蒙5#原煤',
    description: '进口冲击风向标',
    region: '内蒙古·口岸',
    basePrice: 1420,
    prediction: {
      direction: 'up',
      deltaPercent: { min: 0.5, max: 1.2 },
      deltaPrice: { min: 7, max: 17 },
    },
    unlocked: false,
  },
  {
    id: 'SKU_04',
    name: '河北唐山二级冶金焦',
    description: '焦炭市场标杆',
    region: '河北·唐山',
    basePrice: 2580,
    prediction: {
      direction: 'neutral',
      deltaPercent: { min: -0.5, max: 0.5 },
      deltaPrice: { min: -13, max: 13 },
    },
    unlocked: false,
  },
  {
    id: 'SKU_05',
    name: '陕西榆林气化煤',
    description: '化工用煤指标',
    region: '陕西·榆林',
    basePrice: 980,
    prediction: {
      direction: 'down',
      deltaPercent: { min: -1.2, max: -0.5 },
      deltaPrice: { min: -12, max: -5 },
    },
    unlocked: false,
  },
];

export const mockReports: Record<string, AIReport> = {
  SKU_01: {
    skuId: 'SKU_01',
    skuName: '山西安泽低硫主焦煤',
    summary: '基于量化模型与NLP情报融合分析，未来一旬（10天）该煤种整体偏多，但需关注下游补库节奏变化。',
    conclusion: {
      direction: 'up',
      deltaPercent: { min: 1.5, max: 2.5 },
      deltaPrice: { min: 32, max: 54 },
    },
    battleFactors: [
      { name: '铁水产量', bullish: 35, bearish: 15 },
      { name: '下游库存', bullish: 20, bearish: 30 },
      { name: '进口预期', bullish: 15, bearish: 25 },
      { name: '政策因素', bullish: 25, bearish: 10 },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'quant',
        source: 'Mysteel',
        content: '247家样本钢厂的日均铁水产量为236.5万吨，周环比上升2.3万吨，开工率维持在87.5%的高位。',
        timestamp: '2024-02-15',
        polarity: 'bullish',
        weight: 0.35,
      },
      {
        id: 'e2',
        type: 'nlp',
        source: '山西省能源局',
        content: '安泽地区部分煤矿因安全检查产量受限，预计持续时间约7-10天。',
        timestamp: '2024-02-14',
        polarity: 'bullish',
        weight: 0.25,
      },
      {
        id: 'e3',
        type: 'quant',
        source: '汾渭能源',
        content: '110家洗煤厂开工率周环比下降3.2%，精煤供应偏紧。',
        timestamp: '2024-02-15',
        polarity: 'bullish',
        weight: 0.2,
      },
      {
        id: 'e4',
        type: 'nlp',
        source: '中国气象局',
        content: '未来10天晋南地区将迎来雨雪天气，影响煤炭运输。',
        timestamp: '2024-02-14',
        polarity: 'bearish',
        weight: -0.15,
      },
      {
        id: 'e5',
        type: 'quant',
        source: 'Mysteel',
        content: '247家钢厂的炼焦煤可用天数为12.5天，周环比增加0.8天，库存处于中等偏高水平。',
        timestamp: '2024-02-15',
        polarity: 'bearish',
        weight: -0.15,
      },
    ],
    recommendation: '建议在本周内适度增加采购力度，逢低补库至15天安全库存线以上，但避免过度屯货。',
    generatedAt: '2024-02-15 08:30:00',
  },
  SKU_02: {
    skuId: 'SKU_02',
    skuName: '山西吕梁柳林高硫主焦煤',
    summary: '受高硫煤配煤需求下降及港口库存累积影响，未来一旬价格承压，但下行空间有限。',
    conclusion: {
      direction: 'down',
      deltaPercent: { min: -0.8, max: -0.3 },
      deltaPrice: { min: -15, max: -6 },
    },
    battleFactors: [
      { name: '配煤需求', bullish: 15, bearish: 40 },
      { name: '港口库存', bullish: 10, bearish: 35 },
      { name: '进口煤价', bullish: 20, bearish: 25 },
      { name: '下游利润', bullish: 25, bearish: 20 },
    ],
    evidence: [
      {
        id: 'e1',
        type: 'quant',
        source: 'Mysteel',
        content: '日照港焦煤库存达到285万吨，周环比增加15万吨，库存压力明显。',
        timestamp: '2024-02-15',
        polarity: 'bearish',
        weight: -0.35,
      },
      {
        id: 'e2',
        type: 'nlp',
        source: '我的钢铁网',
        content: '近期高硫主焦煤出货不畅，部分贸易商开始降价促销。',
        timestamp: '2024-02-14',
        polarity: 'bearish',
        weight: -0.25,
      },
      {
        id: 'e3',
        type: 'quant',
        source: '汾渭能源',
        content: '吕梁地区煤矿开工率维持在75%左右，供应相对稳定。',
        timestamp: '2024-02-15',
        polarity: 'neutral',
        weight: 0.1,
      },
      {
        id: 'e4',
        type: 'nlp',
        source: '焦化企业调研',
        content: '部分焦化企业反馈高硫煤使用比例有所下降，对高硫主焦需求减弱。',
        timestamp: '2024-02-13',
        polarity: 'bearish',
        weight: -0.2,
      },
    ],
    recommendation: '建议随用随采，不宜建立大量库存，等待价格进一步回调后可适度增加采购。',
    generatedAt: '2024-02-15 08:30:00',
  },
};

export const getUnlockedSKUs = (user: User): SKU[] => {
  return allSKUs.filter(sku => user.unlockedSKUs.includes(sku.id));
};

export const getLockedSKUs = (user: User): SKU[] => {
  return allSKUs.filter(sku => !user.unlockedSKUs.includes(sku.id));
};
