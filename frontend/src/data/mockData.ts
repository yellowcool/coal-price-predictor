import { SKU, AIReport, User, PriceHistory, BattleFactor, EvidenceItem } from '../types';

export const mockUser: User = {
  id: 'user_001',
  name: '演示用户',
  unlockedSKUs: ['SKU_01', 'SKU_02', 'SKU_03', 'SKU_04', 'SKU_05', 'SKU_06', 'SKU_07'],
};

export const allSKUs: SKU[] = [
  {
    id: 'SKU_01',
    name: '山西安泽低硫主焦煤',
    description: '钢焦链条基准主焦煤',
    region: '山西安泽',
    basePrice: 2150,
    prediction: {
      direction: 'up',
      deltaPercent: { min: 1.5, max: 2.6 },
      deltaPrice: { min: 32, max: 56 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_02',
    name: '山西吕梁高硫主焦煤',
    description: '焦化配煤高硫主焦煤',
    region: '山西吕梁',
    basePrice: 1890,
    prediction: {
      direction: 'down',
      deltaPercent: { min: -0.9, max: -0.3 },
      deltaPrice: { min: -17, max: -6 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_03',
    name: '内蒙古东胜动力煤',
    description: '港口电煤常用品种',
    region: '内蒙古鄂尔多斯',
    basePrice: 1420,
    prediction: {
      direction: 'neutral',
      deltaPercent: { min: -0.4, max: 0.5 },
      deltaPrice: { min: -6, max: 7 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_04',
    name: '河北唐山二级冶金焦',
    description: '焦炭市场跟踪基准品',
    region: '河北唐山',
    basePrice: 2570,
    prediction: {
      direction: 'up',
      deltaPercent: { min: 0.7, max: 1.4 },
      deltaPrice: { min: 18, max: 36 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_05',
    name: '陕西榆林气化煤',
    description: '化工端重点气化煤种',
    region: '陕西榆林',
    basePrice: 1020,
    prediction: {
      direction: 'down',
      deltaPercent: { min: -1.3, max: -0.6 },
      deltaPrice: { min: -13, max: -6 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_06',
    name: '山西临汾瘦煤',
    description: '主焦瘦焦配比常用品种',
    region: '山西临汾',
    basePrice: 1760,
    prediction: {
      direction: 'neutral',
      deltaPercent: { min: -0.5, max: 0.6 },
      deltaPrice: { min: -9, max: 11 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_07',
    name: '新疆哈密长焰煤',
    description: '西北区域长焰煤代表',
    region: '新疆哈密',
    basePrice: 1560,
    prediction: {
      direction: 'up',
      deltaPercent: { min: 0.9, max: 1.8 },
      deltaPrice: { min: 14, max: 28 },
    },
    unlocked: true,
  },
  {
    id: 'SKU_08',
    name: '宁夏灵武洗中块',
    description: '区域洗选中块煤',
    region: '宁夏灵武',
    basePrice: 1210,
    prediction: {
      direction: 'down',
      deltaPercent: { min: -0.7, max: -0.2 },
      deltaPrice: { min: -8, max: -3 },
    },
    unlocked: false,
  },
];

type Trend = 'up' | 'down' | 'neutral';

function makePriceHistory(skuId: string, basePrice: number, trend: Trend): PriceHistory {
  const dates: string[] = [];
  const actualPrices: number[] = [];
  const forecastRanges: { min: number; max: number; predicted: boolean }[] = [];

  const today = new Date();
  const totalPastDays = 90;
  const futureDays = 10;
  const historyDays = totalPastDays + 1;
  const chunkSize = 10;
  const chunkCount = Math.ceil(historyDays / chunkSize);

  const chunkDirections: number[] = [];
  for (let c = 0; c < chunkCount; c += 1) {
    const alternating = c % 2 === 0 ? 1 : -1;
    const bias = trend === 'up' ? 0.35 : trend === 'down' ? -0.35 : 0;
    const randomBias = (Math.random() - 0.5) * 0.6;
    const score = alternating + bias + randomBias;
    chunkDirections.push(score >= 0 ? 1 : -1);
  }

  const recentStart = Math.max(0, chunkCount - 3);
  const recent = chunkDirections.slice(recentStart);
  if (recent.length >= 2 && recent.every((item) => item === recent[0])) {
    const pivot = Math.max(0, chunkCount - 2);
    chunkDirections[pivot] = -chunkDirections[pivot];
  }

  const chunkMeta = chunkDirections.map((direction) => {
    const startOffset = (Math.random() - 0.5) * 0.007;
    const endOffset = startOffset + direction * (0.004 + Math.random() * 0.0045);
    return {
      direction,
      startOffset,
      endOffset,
      widthBase: 0.016 + Math.random() * 0.01,
      noiseAmp: 0.0014 + Math.random() * 0.0008,
    };
  });

  for (let i = totalPastDays; i >= 0; i--) {
    const dayIndex = totalPastDays - i;
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));

    const trendFactor = trend === 'up' ? 0.0019 : trend === 'down' ? -0.0015 : 0;
    const drift = dayIndex * trendFactor;
    const cycle = Math.sin(dayIndex / 5) * 0.009 + Math.cos(dayIndex / 13) * 0.006;
    const noise = (Math.random() - 0.5) * 0.016;
    const price = basePrice * (1 + drift + cycle + noise);
    const rounded = Math.round(price * 10) / 10;
    actualPrices.push(rounded);

    const chunkIndex = Math.floor(dayIndex / chunkSize);
    const chunkStart = chunkIndex * chunkSize;
    const chunkLength = Math.min(chunkSize, historyDays - chunkStart);
    const withinChunk = dayIndex - chunkStart;
    const t = chunkLength <= 1 ? 1 : withinChunk / (chunkLength - 1);
    const meta = chunkMeta[chunkIndex];
    const localWave = Math.sin((withinChunk + 1) * 1.15) * meta.noiseAmp;
    const centerOffset = meta.startOffset + (meta.endOffset - meta.startOffset) * t + localWave;
    const center = rounded * (1 + centerOffset);
    const width = meta.widthBase + Math.abs(Math.cos((dayIndex + 1) / 6)) * 0.002 + Math.random() * 0.0025;

    forecastRanges.push({
      min: Math.round(center * (1 - width) * 10) / 10,
      max: Math.round(center * (1 + width) * 10) / 10,
      predicted: true,
    });
  }

  const lastKnown = actualPrices[actualPrices.length - 1] || basePrice;
  for (let i = 1; i <= futureDays; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d.toISOString().slice(0, 10));

    actualPrices.push(Number.NaN);

    const forward = trend === 'up' ? 0.0015 * i : trend === 'down' ? -0.0012 * i : 0;
    const wave = Math.sin(i / 2) * 0.002;
    const center = lastKnown * (1 + forward + wave);
    const width = 0.014 + i * 0.0014;
    forecastRanges.push({
      min: Math.round(center * (1 - width) * 10) / 10,
      max: Math.round(center * (1 + width) * 10) / 10,
      predicted: false,
    });
  }

  return {
    skuId,
    dates,
    actualPrices,
    forecastRanges,
    winRate: trend === 'up' ? 0.85 : trend === 'down' ? 0.78 : 0.82,
  };
}

export const mockPriceHistory: Record<string, PriceHistory> = {};

allSKUs.forEach((sku) => {
  mockPriceHistory[sku.id] = makePriceHistory(sku.id, sku.basePrice, sku.prediction.direction);
});

interface ReportSeed {
  summary: string;
  recommendation: string;
  battleFactors: BattleFactor[];
  evidence: Omit<EvidenceItem, 'id'>[];
}

const reportSeeds: Record<string, ReportSeed> = {
  SKU_01: {
    summary: '主产地供应偏紧，焦钢端刚需稳定，未来一旬价格中枢有上移概率。',
    recommendation: '建议保持正常补库节奏，逢回调分批补入。',
    battleFactors: [
      { name: '高炉开工', bullish: 34, bearish: 16 },
      { name: '洗煤厂库存', bullish: 28, bearish: 18 },
      { name: '进口煤替代', bullish: 14, bearish: 26 },
      { name: '政策与安监', bullish: 25, bearish: 12 },
    ],
    evidence: [
      { type: 'quant', source: '钢联高炉样本', content: '高炉日均铁水产量环比小幅回升。', timestamp: '2026-03-01', polarity: 'bullish', weight: 0.34 },
      { type: 'nlp', source: '山西煤矿调研', content: '部分矿区检修导致阶段性供应偏紧。', timestamp: '2026-03-02', polarity: 'bullish', weight: 0.24 },
      { type: 'quant', source: '港口到港监测', content: '进口替代增量有限，短期难完全缓解供给压力。', timestamp: '2026-03-03', polarity: 'bearish', weight: -0.18 },
      { type: 'nlp', source: '终端采购反馈', content: '终端招标节奏平稳，补库需求维持。', timestamp: '2026-03-03', polarity: 'bullish', weight: 0.2 },
    ],
  },
  SKU_02: {
    summary: '港口库存偏高且终端配煤倾向下移，未来一旬价格重心仍有下探压力。',
    recommendation: '建议按需采购，等待库存消化后再扩大采购量。',
    battleFactors: [
      { name: '港口库存', bullish: 12, bearish: 36 },
      { name: '终端配煤需求', bullish: 16, bearish: 33 },
      { name: '到港成本', bullish: 21, bearish: 24 },
      { name: '运力与物流', bullish: 20, bearish: 18 },
    ],
    evidence: [
      { type: 'quant', source: '港口库存日报', content: '主要港口库存连续两周回升。', timestamp: '2026-03-01', polarity: 'bearish', weight: -0.35 },
      { type: 'nlp', source: '焦企采购访谈', content: '部分焦企下调高硫煤配比。', timestamp: '2026-03-02', polarity: 'bearish', weight: -0.22 },
      { type: 'quant', source: '运价指数', content: '运价波动收敛，物流扰动减弱。', timestamp: '2026-03-03', polarity: 'neutral', weight: 0.08 },
      { type: 'nlp', source: '贸易商盘面反馈', content: '现货让利成交增多，报价重心下移。', timestamp: '2026-03-03', polarity: 'bearish', weight: -0.19 },
    ],
  },
  SKU_03: {
    summary: '供需双向都缺乏强驱动，未来一旬价格大概率维持窄幅震荡。',
    recommendation: '建议按日耗滚动采购，不宜追涨杀跌。',
    battleFactors: [
      { name: '电厂日耗', bullish: 22, bearish: 21 },
      { name: '坑口发运', bullish: 19, bearish: 18 },
      { name: '港口库存', bullish: 20, bearish: 20 },
      { name: '气象因素', bullish: 16, bearish: 17 },
    ],
    evidence: [
      { type: 'quant', source: '电厂负荷监测', content: '沿海电厂日耗维持季节性区间。', timestamp: '2026-03-01', polarity: 'neutral', weight: 0.02 },
      { type: 'quant', source: '坑口调度数据', content: '矿区外运节奏稳定，供应弹性中性。', timestamp: '2026-03-02', polarity: 'neutral', weight: 0.03 },
      { type: 'nlp', source: '港口市场访谈', content: '市场观望情绪较浓，报价波动有限。', timestamp: '2026-03-03', polarity: 'neutral', weight: 0.01 },
      { type: 'nlp', source: '气象通告', content: '短期天气扰动有限，对运输影响较小。', timestamp: '2026-03-03', polarity: 'neutral', weight: 0.01 },
    ],
  },
  SKU_04: {
    summary: '焦炭供给边际收紧，钢厂补库需求尚可，未来一旬偏强运行。',
    recommendation: '建议锁定阶段性资源，控制高位追涨节奏。',
    battleFactors: [
      { name: '焦化开工率', bullish: 30, bearish: 16 },
      { name: '钢厂补库', bullish: 27, bearish: 18 },
      { name: '环保扰动', bullish: 23, bearish: 14 },
      { name: '下游利润', bullish: 16, bearish: 20 },
    ],
    evidence: [
      { type: 'quant', source: '焦企开工样本', content: '部分焦企检修导致有效供给收缩。', timestamp: '2026-03-01', polarity: 'bullish', weight: 0.29 },
      { type: 'quant', source: '钢厂库存天数', content: '钢厂焦炭库存天数小幅下滑。', timestamp: '2026-03-02', polarity: 'bullish', weight: 0.24 },
      { type: 'nlp', source: '环保督查信息', content: '区域环保预期提升，影响局部发运。', timestamp: '2026-03-03', polarity: 'bullish', weight: 0.18 },
      { type: 'nlp', source: '利润跟踪', content: '下游利润改善有限，压制上行斜率。', timestamp: '2026-03-03', polarity: 'bearish', weight: -0.12 },
    ],
  },
  SKU_05: {
    summary: '化工端需求边际走弱，坑口销售承压，未来一旬偏弱运行。',
    recommendation: '建议短单为主，优先消化库存后再择机补货。',
    battleFactors: [
      { name: '甲醇开工', bullish: 13, bearish: 32 },
      { name: '坑口库存', bullish: 17, bearish: 30 },
      { name: '运费成本', bullish: 20, bearish: 18 },
      { name: '替代能源', bullish: 12, bearish: 25 },
    ],
    evidence: [
      { type: 'quant', source: '化工行业周报', content: '部分下游装置检修，原料采购放缓。', timestamp: '2026-03-01', polarity: 'bearish', weight: -0.31 },
      { type: 'quant', source: '矿区库存监测', content: '坑口可售库存小幅累积。', timestamp: '2026-03-02', polarity: 'bearish', weight: -0.24 },
      { type: 'nlp', source: '运输反馈', content: '运费平稳，未形成明显成本支撑。', timestamp: '2026-03-03', polarity: 'neutral', weight: 0.05 },
      { type: 'nlp', source: '终端替代跟踪', content: '替代能源使用比例阶段性提升。', timestamp: '2026-03-03', polarity: 'bearish', weight: -0.16 },
    ],
  },
  SKU_06: {
    summary: '供给和需求均未出现单边信号，未来一旬预计震荡整理。',
    recommendation: '建议以稳为主，维持安全库存区间。',
    battleFactors: [
      { name: '煤矿开工', bullish: 21, bearish: 20 },
      { name: '焦化需求', bullish: 19, bearish: 21 },
      { name: '库存结构', bullish: 18, bearish: 18 },
      { name: '政策信号', bullish: 15, bearish: 14 },
    ],
    evidence: [
      { type: 'quant', source: '矿区日度产量', content: '矿区产量波动不大，整体平稳。', timestamp: '2026-03-01', polarity: 'neutral', weight: 0.03 },
      { type: 'quant', source: '焦化厂采购频次', content: '采购节奏与上周基本持平。', timestamp: '2026-03-02', polarity: 'neutral', weight: 0.02 },
      { type: 'nlp', source: '市场访谈', content: '贸易商对后市分歧较大，报价区间窄。', timestamp: '2026-03-03', polarity: 'neutral', weight: 0.01 },
      { type: 'nlp', source: '政策观察', content: '近期政策以稳预期为主，对现货扰动有限。', timestamp: '2026-03-03', polarity: 'neutral', weight: 0.01 },
    ],
  },
  SKU_07: {
    summary: '区域电煤补库与发运约束并存，未来一旬价格有温和上行动力。',
    recommendation: '建议提前锁量，避免旺季前被动追价。',
    battleFactors: [
      { name: '电煤补库', bullish: 31, bearish: 14 },
      { name: '铁路发运', bullish: 24, bearish: 19 },
      { name: '港口倒挂', bullish: 22, bearish: 17 },
      { name: '终端库存', bullish: 19, bearish: 21 },
    ],
    evidence: [
      { type: 'quant', source: '电厂库存周报', content: '库存去化延续，补库需求抬升。', timestamp: '2026-03-01', polarity: 'bullish', weight: 0.3 },
      { type: 'quant', source: '铁路请车数据', content: '重点线路发运效率略低于月均。', timestamp: '2026-03-02', polarity: 'bullish', weight: 0.2 },
      { type: 'nlp', source: '港口贸易反馈', content: '低价资源减少，询盘重心抬升。', timestamp: '2026-03-03', polarity: 'bullish', weight: 0.18 },
      { type: 'nlp', source: '终端采购策略', content: '终端仍保持按需采购，限制过快上行。', timestamp: '2026-03-03', polarity: 'bearish', weight: -0.12 },
    ],
  },
};

const makeReport = (skuId: string, seed: ReportSeed): AIReport => {
  const sku = allSKUs.find((item) => item.id === skuId);
  if (!sku) {
    throw new Error(`未找到 SKU: ${skuId}`);
  }

  return {
    skuId,
    skuName: sku.name,
    summary: seed.summary,
    conclusion: {
      direction: sku.prediction.direction,
      deltaPercent: { ...sku.prediction.deltaPercent },
      deltaPrice: { ...sku.prediction.deltaPrice },
    },
    battleFactors: seed.battleFactors,
    evidence: seed.evidence.map((item, index) => ({
      id: `${skuId}_e${index + 1}`,
      ...item,
    })),
    recommendation: seed.recommendation,
    generatedAt: '2026-03-05 09:30:00',
  };
};

export const mockReports: Record<string, AIReport> = Object.fromEntries(
  Object.entries(reportSeeds).map(([skuId, seed]) => [skuId, makeReport(skuId, seed)]),
);

export const getUnlockedSKUs = (user: User): SKU[] => {
  return allSKUs.filter((sku) => user.unlockedSKUs.includes(sku.id));
};

export const getLockedSKUs = (user: User): SKU[] => {
  return allSKUs.filter((sku) => !user.unlockedSKUs.includes(sku.id));
};
