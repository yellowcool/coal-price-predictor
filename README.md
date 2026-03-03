# 煤价预测系统 (Coal Price Predictor)

单页面展示所有煤种价格趋势及未来 3 旬预测的个人工具。

![预览](./screenshot-full.png)

## ✨ 功能特性

- 📊 **全煤种一览** - 焦煤、肥煤、1/3 焦煤、瘦煤，单页面展示所有煤种
- 📈 **趋势可视化** - ECharts 图表展示 12 个月历史走势 + 未来 3 旬预测
- 💹 **价格详情** - 当前旬均价、上/中/下旬价格、最高/最低价
- 📉 **环比变化** - 涨跌幅百分比，快速判断价格趋势
- 📱 **响应式设计** - 桌面端 4 列、平板 2 列、移动端 1 列
- 🎨 **精美 UI** - 深蓝主题 + 卡片式设计 + 渐变效果

## 🚀 快速开始

### 环境要求

- Node.js 18+
- Python 3.11+

### 安装运行

```bash
# 克隆仓库
git clone https://github.com/yellowcool/coal-price-predictor.git
cd coal-price-predictor

# 启动后端（端口 5000）
cd backend
pip3 install flask
python3 app.py

# 启动前端（新终端，端口 3000）
cd frontend
npm install
npm run dev
```

访问 http://localhost:3000

## 📁 项目结构

```
coal-price-predictor/
├── backend/                    # Flask 后端
│   ├── app.py                  # 主应用 + API 路由
│   └── requirements.txt        # Python 依赖
├── frontend/                   # Vue 3 前端
│   ├── src/
│   │   ├── App.vue            # 主页面
│   │   ├── components/
│   │   │   └── CoalCard.vue   # 煤种卡片组件
│   │   ├── composables/       # 组合式 API
│   │   └── main.js            # 入口文件
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── README.md
└── SPEC.md                     # 详细规格说明
```

## 📊 API 接口

### GET /api/all-data

返回所有煤种的完整数据

```json
{
  "coalTypes": [
    {
      "id": "coking",
      "name": "焦煤",
      "currentPrice": 905,
      "prices": {
        "early": 900,
        "middle": 905,
        "late": 910
      },
      "high": 925,
      "low": 890,
      "change": 2.35,
      "history": [
        {"date": "2025-04", "price": 931},
        ...
      ],
      "forecast": [
        {"date": "2026-04-上旬", "price": 944},
        {"date": "2026-04-中旬", "price": 873},
        {"date": "2026-04-下旬", "price": 934}
      ]
    }
  ],
  "updateTime": "2026-03-03 10:00:00"
}
```

### GET /api/coal-types

返回煤种列表

```json
{
  "coalTypes": [
    {"id": "coking", "name": "焦煤"},
    {"id": "fat", "name": "肥煤"},
    {"id": "third_coking", "name": "1/3 焦煤"},
    {"id": "lean", "name": "瘦煤"}
  ]
}
```

## 🎨 设计规格

### 颜色方案

| 用途 | 颜色值 |
|------|--------|
| 主色调 | `#1E3A5F` 深蓝 |
| 强调色 | `#F59E0B` 琥珀 |
| 背景 | `#F8FAFC` 浅灰白 |
| 涨幅 | 绿色 |
| 跌幅 | 红色 |

### 煤种价格范围（模拟数据）

| 煤种 | 价格范围 (元/吨) |
|------|------------------|
| 焦煤 | 850-950 |
| 肥煤 | 900-1000 |
| 1/3 焦煤 | 800-900 |
| 瘦煤 | 750-850 |

## 🛠️ 技术栈

### 前端
- **Vue.js 3** - 渐进式框架
- **Vite** - 快速构建工具
- **ECharts** - 数据可视化图表
- **TailwindCSS** - 原子化 CSS
- **Axios** - HTTP 客户端

### 后端
- **Flask** - Python Web 框架

## 📝 注意事项

- 当前版本使用**模拟数据**，价格波动范围 ±5%
- 预测数据基于简单趋势外推，仅供参考
- 后续版本将接入真实数据源

## 📅 后续计划

- [ ] 接入真实煤价数据源
- [ ] 实现机器学习预测模型
- [ ] 添加数据导出功能（Excel）
- [ ] 多煤种对比功能
- [ ] 价格预警通知

## 📄 License

MIT

---

**作者**: yellowcool  
**GitHub**: https://github.com/yellowcool/coal-price-predictor
