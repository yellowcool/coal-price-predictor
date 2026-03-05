import json
import zipfile
import os

# XMind 8+ 格式的内容结构
content = {
    "rootTopic": {
        "id": "root",
        "title": "炼焦煤 AI 预测智能体\n核心输入特征全景字典（MVP 实战版）",
        "children": {
            "attached": [
                {
                    "id": "preface",
                    "title": "【前置声明】预测对象锁定",
                    "children": {
                        "attached": [
                            {
                                "id": "preface-note",
                                "title": "所有输入维度仅服务于预测以下三大核心基准 SKU 的\n「未来 1-2 周涨跌方向与幅度（Delta）」",
                                "children": {
                                    "attached": [
                                        {"id": "sku1", "title": "安泽低硫主焦煤\n（代表高端骨架煤，极高利润弹性）"},
                                        {"id": "sku2", "title": "吕梁柳林高硫主焦煤\n（代表主流配煤，极强抗跌性）"},
                                        {"id": "sku3", "title": "甘其毛都蒙 5#原煤/精煤\n（代表进口冲击，极度政策敏感）"}
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "id": "layer1",
                    "title": "第一层：量化基石特征\n（数值型，AI 算力主力区）",
                    "children": {
                        "attached": [
                            {
                                "id": "layer1-note",
                                "title": "数据必须通过 Mysteel 或汾渭能源 API 采购连续历史序列\n传统量化模型用来计算基准趋势的「硬通货」",
                                "children": {
                                    "attached": [
                                        {
                                            "id": "f1",
                                            "title": "1. 价格动量与结构\n（Target 的自身映射）",
                                            "children": {
                                                "attached": [
                                                    {
                                                        "id": "f1-1",
                                                        "title": "现货基准价动量（日/周/旬）",
                                                        "notes": "机制：连续阴跌后若跌幅收窄，极易触发下游抄底补库",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f1-1-1", "title": "过去 3 天涨跌幅比率"},
                                                                {"id": "f1-1-2", "title": "过去 5 天涨跌幅比率"},
                                                                {"id": "f1-1-3", "title": "过去 10 天涨跌幅比率"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f1-2",
                                                        "title": "核心跨品种价差（Spread）",
                                                        "notes": "机制：价差若突破历史 80% 分位数，说明低硫煤溢价见顶，高硫煤即将触发「替代性补涨」",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f1-2-1", "title": "安泽低硫价 - 柳林高硫价"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f1-3",
                                                        "title": "期现基差（Basis）",
                                                        "notes": "机制：若期货大幅升水（基差为负且绝对值大），期现套利资金将进场抢购现货交割，拉动现货现价上行",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f1-3-1", "title": "焦煤主力合约盘面收盘价 - 对应品质现货折算价"}
                                                            ]
                                                        }
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "id": "f2",
                                            "title": "2. 真实需求与购买力\n（决定价格天花板）",
                                            "children": {
                                                "attached": [
                                                    {
                                                        "id": "f2-note",
                                                        "title": "焦煤需求是绝对单向的，只看钢铁 - 焦化产业链的脸色",
                                                        "style": {"fontSize": 10}
                                                    },
                                                    {
                                                        "id": "f2-1",
                                                        "title": "247 家钢厂日均铁水产量",
                                                        "notes": "机制：炼焦煤唯一的刚性消耗指标。铁水产量环比上升，需求托底，价格难跌"
                                                    },
                                                    {
                                                        "id": "f2-2",
                                                        "title": "全国高炉开工率 / 盈亏平衡线占比",
                                                        "notes": "机制：决定钢厂的「容忍度」。若超过 50% 钢厂跌破现金流成本，必然引发大面积负反馈，强制打压焦炭/焦煤价格"
                                                    },
                                                    {
                                                        "id": "f2-3",
                                                        "title": "独立焦化厂吨焦平均利润",
                                                        "notes": "机制：焦化厂是直接买单方。若焦炭降价导致焦企深度亏损，焦企将主动「焖炉减产」，导致现货采购需求瞬间冰冻"
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "id": "f3",
                                            "title": "3. 核心库存水位\n（决定行情的爆发力与拐点）",
                                            "children": {
                                                "attached": [
                                                    {
                                                        "id": "f3-note",
                                                        "title": "库存不决定长期趋势，但决定短期涨跌的剧烈程度",
                                                        "style": {"fontSize": 10}
                                                    },
                                                    {
                                                        "id": "f3-1",
                                                        "title": "下游炼焦煤可用天数（247 家钢厂 + 独立焦企）",
                                                        "notes": "机制：最致命的博弈指标。库存跌破 10 天→恐慌性抢货（暴涨）；库存高于 16 天→采购部观望，煤矿必须降价出货"
                                                    },
                                                    {
                                                        "id": "f3-2",
                                                        "title": "环渤海四港炼焦煤总库存",
                                                        "notes": "机制：贸易商的蓄水池。库存高位且连续数周不降，贸易商资金链承压，极易发生踩踏式砸盘抛售"
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "id": "f4",
                                            "title": "4. 显性供给指标\n（决定价格地板）",
                                            "children": {
                                                "attached": [
                                                    {
                                                        "id": "f4-1",
                                                        "title": "110 家/230 家洗煤厂周度开工率",
                                                        "notes": "机制：原煤变精煤的阀门。洗煤厂开工率下降，直接导致市场可流通的高品质商品煤减少，支撑现货价格"
                                                    },
                                                    {
                                                        "id": "f4-2",
                                                        "title": "甘其毛都口岸日均通关车数",
                                                        "notes": "机制：针对蒙 5#煤的专属核心指标。通关 1000 车以上→国内同品质煤承压；骤降至 500 车以下→国内中高硫煤瞬间拉涨"
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                },
                {
                    "id": "layer2",
                    "title": "第二层：事件与情绪特征\n（文本型，大模型解析主阵地）",
                    "children": {
                        "attached": [
                            {
                                "id": "layer2-note",
                                "title": "咱们的护城河：通过定向爬虫抓取免费公开信息\n利用大模型（LLM）的 NLP 能力将其转化为带有权重的「情绪标签」\n解决传统量化模型对突发事件反应滞后的死穴",
                                "children": {
                                    "attached": [
                                        {
                                            "id": "f5",
                                            "title": "5. 政策与安监突发冲击\n（最强做多因子）",
                                            "children": {
                                                "attached": [
                                                    {
                                                        "id": "f5-source",
                                                        "title": "📡 抓取源",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f5-source-1", "title": "国家及晋蒙陕矿山安全监察局官网"},
                                                                {"id": "f5-source-2", "title": "重大会议限产通知"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f5-tags",
                                                        "title": "🏷️ 大模型提取标签",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f5-tags-1", "title": "[停产矿井产能级别]"},
                                                                {"id": "f5-tags-2", "title": "[预计停产时长]"},
                                                                {"id": "f5-tags-3", "title": "[影响煤种 (高硫/低硫)]"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f5-mech",
                                                        "title": "⚙️ 机制",
                                                        "notes": "一旦识别出「安泽县区域性停产整顿」，大模型将立刻赋予安泽低硫主焦煤极高的「看涨权重」，无论当时的铁水产量多么拉胯"
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "id": "f6",
                                            "title": "6. 物理物流阻断与气象灾害\n（短期脉冲因子）",
                                            "children": {
                                                "attached": [
                                                    {
                                                        "id": "f6-source",
                                                        "title": "📡 抓取源",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f6-source-1", "title": "中国气象局（主产区及口岸）"},
                                                                {"id": "f6-source-2", "title": "各省交警高速封路通告"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f6-tags",
                                                        "title": "🏷️ 大模型提取标签",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f6-tags-1", "title": "[暴雪/暴雨红色预警]"},
                                                                {"id": "f6-tags-2", "title": "[口岸冻车/拥堵封关]"},
                                                                {"id": "f6-tags-3", "title": "[主干线汽运受阻]"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f6-mech",
                                                        "title": "⚙️ 机制",
                                                        "notes": "物流阻断导致「坑口有煤出不来」，在下游库存偏低时，会瞬间引爆终端到厂价的恐慌性飙升"
                                                    }
                                                ]
                                            }
                                        },
                                        {
                                            "id": "f7",
                                            "title": "7. 宏观预期与情绪冰点\n（趋势提前量因子）",
                                            "children": {
                                                "attached": [
                                                    {
                                                        "id": "f7-source",
                                                        "title": "📡 抓取源",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f7-source-1", "title": "地方政府专项债发行公告"},
                                                                {"id": "f7-source-2", "title": "重点城市土拍流拍率"},
                                                                {"id": "f7-source-3", "title": "百年建筑网水泥发货量新闻"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f7-tags",
                                                        "title": "🏷️ 大模型提取标签",
                                                        "children": {
                                                            "attached": [
                                                                {"id": "f7-tags-1", "title": "[终端开工悲观]"},
                                                                {"id": "f7-tags-2", "title": "[基建资金断裂]"}
                                                            ]
                                                        }
                                                    },
                                                    {
                                                        "id": "f7-mech",
                                                        "title": "⚙️ 机制",
                                                        "notes": "钢材卖不出去的预期会提前半个月传导到焦煤现货市场。当大模型密集捕捉到「工地停工/烂尾」标签时，会提前下调远期（未来 3-6 周）的价格预测中枢"
                                                    }
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        ]
                    }
                }
            ]
        }
    },
    "sheetId": "sheet1",
    "sheetTitle": "炼焦煤 AI 预测特征全景"
}

# 创建 XMind 文件（ZIP 格式）
output_path = '/root/.openclaw/workspace/coal-price-predictor/xmind/炼焦煤 AI 预测核心输入特征全景.xmind'

# XMind 8+ 格式需要 content.json 和 meta.json
meta = {
    "creator": "OpenClaw AI Assistant",
    "template": "default",
    "timestamp": "2026-03-04T14:57:00Z"
}

# 创建 ZIP 文件
with zipfile.ZipFile(output_path, 'w', zipfile.ZIP_DEFLATED) as zf:
    zf.writestr('content.json', json.dumps(content, ensure_ascii=False, indent=2))
    zf.writestr('meta.json', json.dumps(meta, ensure_ascii=False, indent=2))

print(f"✅ XMind 文件已创建：{output_path}")
print(f"📦 文件大小：{os.path.getsize(output_path)} bytes")
