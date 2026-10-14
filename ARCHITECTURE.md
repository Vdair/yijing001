# 易经知识库架构与数据工程规范 (ARCHITECTURE.md)

## 1. 项目定位与核心使命
本项目是专为**周易/六爻算命智能体 (Agent)**、**大语言模型 (LLM)** 以及 **RAG 向量检索系统**量身打造的高结构化易经知识底座。
- **纯粹性**: 本项目仅专注于**数据存储、清洗、标准化、分块切片与结构化定义**，不耦合前端小程序界面。
- **AI 友好度**: 所有产出数据保证是机器可快速读取（Machine-Readable）、自包含、语义丰富且零噪声的结构化知识集。

---

## 2. 数据工程流水线与目录分层架构

遵循业界经典的数仓分层设计（Bronze -> Silver -> Gold）：

```
易经知识库/
├── README.md                      # 项目总览与工作指引
├── ARCHITECTURE.md                # 架构与数据工程设计规范 (当前文档)
├── schemas/                       # 强类型数据契约与校验规范
│   ├── gua_schema.json            # 64 卦聚合标准 JSON Schema
│   └── chunk_schema.json          # AI 向量检索与分块切片 Schema
├── data/
│   ├── 01_raw/                    # [Bronze] 原始层：未经任何处理的原始快照
│   │   ├── guaInterpretation_raw.json
│   │   └── guaData_raw.json
│   ├── 02_cleaned/                # [Silver] 清洗层：去噪、去版权外链、修复格式的标准全量 JSON
│   │   ├── 64gua_complete_cleaned.json
│   │   └── rules_core_cleaned.json
│   ├── 03_knowledge_base/         # [Gold] 知识资产层：面向 AI 业务逻辑直接使用的原子文件
│   │   ├── 64gua/                 # 64 个独立卦象文件 (01_qian.json ~ 64_weiji.json)
│   │   └── dimensions/            # 维度化专题数据（如 career.json, love.json, wealth.json 等）
│   ├── 04_ai_chunks/              # [Gold-RAG] 向量检索专用层：JSONL 格式的细粒度语义切片
│   │   ├── chunks_all.jsonl       # 全量分块（带意图标签与关键词）
│   │   └── chunks_by_dimension/   # 按预测领域隔离的分块
│   └── 05_rules_dict/             # [Rules] 象数理推理字典：八宫、六亲、六神、世应等规则集
│       ├── bagong_shiying.json    # 八宫归属与世应爻位对照表
│       ├── liuqin_liushen.json    # 六亲六神起法与五行生克规则
│       └── najia_table.json       # 京房纳甲天干地支对照表
├── scripts/                       # 自动化处理流水线脚本 (Python)
│   ├── 01_extract_from_repo.py    # 从 Git/Raw 提取并转换初始格式
│   ├── 02_clean_data.py           # 深度文本清洗与字段原子化
│   ├── 03_validate_schema.py      # 强契约校验（确保 0 坏数据）
│   └── 04_generate_ai_chunks.py   # 生成 LLM/Embedding 专用 Chunk
└── docs/                          # 设计文档与使用示例
    ├── source_mapping.md          # 数据源对比核实报告
    └── prompt_recipes.md          # 针对大模型 Prompt 注入的使用指南
```

---

## 3. 数据清洗与加工准则 (Data Cleansing Rules)

在 Silver -> Gold 过程中，严格执行以下 5 项清洗清洗标准：

1. **剔除网络抓取噪声**:
   - 过滤文本中残留的 `未经允许不得转载：易学界...`、`周易第XX卦...` 等网页导航/SEO 占位符。
   - 移除 HTML 转义符（如 `&nbsp;`, `&#038;`, `&raquo;` 等）并还原为标点或空格。
2. **文本正规化**:
   - 标点符号统一使用全角中文标点。
   - 消除多余的连续空格和换行符，保持文本段落紧凑。
3. **复合文本原子化**:
   - 对张铭仁解卦等一长串包含“运势：... 疾病：... 寻人：...”的复合文本，使用正则精准提取拆解为独立的字典键值对。
4. **变卦信息结构化**:
   - 原文爻辞中夹带的 `九二爻动变得周易第13卦：天火同人...` 文本，拆分出变卦的 `target_gua_id: 13` 和变卦语义解读。
5. **象数理规则数据化**:
   - 将原本分散在 JavaScript 算法逻辑中的纳甲、世应、六亲、六神映射，提炼为静态规则 JSON，便于大模型以少量 Few-shot 规则完成精准推演。

---

## 4. AI 极速读取与使用模式

为确保外部大模型系统/Agent 能以最低延迟、最小 Token 成本调取知识库，设计三种读取场景：

### 场景 A：单卦全量注入 (Agent 工具调用)
- **读取路径**: `data/03_knowledge_base/64gua/{id:02d}_{pinyin}.json`
- **特点**: 单文件仅 ~6KB~8KB，单次读取即可获取该卦的卦象、卦爻辞、六大流派解读，无需加载全库 500KB+ 数据。

### 场景 B：基于问卦意图的精准 RAG 向量检索
- **读取路径**: `data/04_ai_chunks/chunks_all.jsonl`
- **特点**: 每个 Chunk 严格控制在 150~350 字符，附带 `intent_tags`（如 `["经商", "投资", "财运"]`）和 `school`。用户问“我最近想开店做生意占得乾卦九二”，向量检索可直达 `乾卦·九二·财运` 与 `乾卦·经商`，精准度大幅超越粗粒度全文检索。

### 场景 C：六爻逻辑推理与排盘解释
- **读取路径**: `data/05_rules_dict/`
- **特点**: 提供纳甲、六亲、世应纯数据字典，AI 可以直接结合当前起卦的年月日时（日辰月建）进行六亲吉凶推断。

---

## 5. 后续执行阶段规划

1. **阶段 1（前置准备，当前完成）**:
   - 完成两处数据源对比核查；
   - 确定 Git 仓库数据源完整且高度匹配；
   - 建立完备的项目框架与规范（Schemas / Architecture / Readme）。
2. **阶段 2（数据抽取与深层清洗）**:
   - 运行抽取脚本将 JS 结构转入 `01_raw/`；
   - 编写清洗逻辑，去除噪音并拆分复合字段至 `02_cleaned/`；
   - 运行 Schema 校验，确保 64 卦 384 爻数据零遗漏、零畸形。
3. **阶段 3（资产构建与分块切片）**:
   - 生成 64 卦独立 JSON/Markdown；
   - 生成面向向量库与 RAG 系统的 JSONL 切片与标签集；
   - 整理六爻象数规则字典。
4. **阶段 4（质量自验与交付）**:
   - 验证单卦读取速度、Token 开销与 AI 解读适配度。
