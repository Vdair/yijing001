# 易道认知工坊 · 高保真易学 Prompt 体系架构白皮书

> **文档版本**：v2.0.0  
> **制定时间**：2026-10-27  
> **核心架构**：主 Agent（玄微先生·易道导师） + 外接易学全息知识库（RAG 上下文动态注入）  
> **接入模型**：`deepseek-v4-pro`（OpenAI 协议兼容接口，支持 SSE 流式与深度思考思维链析出）

---

## 一、 体系设计蓝图与架构拓扑

在易学自修与心智训练体系中，单纯依靠大模型的通用训练语料极易滑向两极：要么是泛泛空洞的“玄学鸡汤”，要么是江湖算命式的“谶纬吉凶”。

为此，本工程确立了**“主 Agent + 外接知识库”**的刚性解耦架构：
- **外接知识库 (`YijingKnowledgeRetriever`)**：负责从现存 64 卦 384 爻的精研数据库（包含周文王周公原典、孔子十翼、宋代理学程颐朱熹注疏、汉唐孔颖达正义与邵雍象数模型）中，精准提取高保真、高信噪比的经传结构化切片；
- **主 Agent (`Master Agent · 玄微先生`)**：扮演核心导师角色，以经传为本、时位为枢纽、反身而诚为宗，统揽全场，深度承载常规问答、复盘学术剖析与章节主动提问。

```mermaid
graph TD
    A[学员研读界面 / 修学档案] -->|触发行为: 问答 / 复盘 / 章节提问| B(主调度引擎 YijingAIService)
    
    subgraph 外接易学全息知识库 [External Knowledge Base]
        K1[壹·经传宗本与爻辞通译]
        K2[贰·四大宗师宏观义理解构]
        K3[叁/肆·名家阐微与圣贤历史演进]
        K4[伍/陆·梅花象数与时位辩证模型]
        K5[柒·现代场景攻防与反常识底牌]
        K_Engine[YijingKnowledgeRetriever 结构化提取器]
        K1 & K2 & K3 & K4 & K5 --> K_Engine
    end
    
    K_Engine -->|生成 <yijing_knowledge_base> XML 切片| B
    
    subgraph 主 Agent 玄微先生 [Master Agent Engine]
        MA_Role[宗师人设: 宗本经传 / 破除迷信 / 时位辩证 / 反身而诚]
        P1[职能一: 研习互动与划词释疑 Prompt]
        P2[职能二: 悟道复盘与费曼深度剖析 Prompt]
        P3[职能三: 结合章节核心矛盾的主动启发提问]
    end
    
    B --> MA_Role
    MA_Role --> P1 & P2 & P3
    
    P1 & P2 & P3 -->|组装 System + User Payload| LLM[DeepSeek-v4-pro 大模型]
    LLM -->|SSE 流式打字 + 思维链 reasoning_content| Client[前端打字机渲染 & 本地修学档案持久化]
```

---

## 二、 外接知识库规范 (`<yijing_knowledge_base>`)

外接知识库由 `YijingKnowledgeRetriever.extractKnowledgeContext(lesson)` 动态装配，确保当前课时的纯粹经传原典与四大宗师要义能够以标准化 XML 格式注入上下文：

```xml
<yijing_knowledge_base>
  <gua_metadata>
    <title>第 01 卦 · 乾为天（䷀）—— 纯阳刚健与六龙驭天全息精研</title>
    <symbol>䷀</symbol>
    <trigrams>上卦：乾为天 (☰) / 下卦：乾为天 (☰)</trigrams>
    <motto>天行刚健，自强不息；时乘六龙，保合太和</motto>
  </gua_metadata>

  <classics_canon summary="经传宗本原典与爻位">
    <!-- 卦辞、彖传、大象传、初爻至上爻、用九原典与通译 -->
  </classics_canon>

  <four_masters_insights summary="宋代理学与汉唐注疏四大宗师阐微">
    <!-- 程颐天理时势论、朱熹象数占验、孔颖达正义、邵雍象数模型 -->
  </four_masters_insights>

  <time_space_dialectic summary="易理时位辩证法则与得中当位">
    <!-- 刚柔配位、初九潜伏、二爻得中、三爻惕厉、四爻跃渊、五爻飞天、上爻亢戒 -->
  </time_space_dialectic>

  <modern_praxis_and_anti_common summary="现代决策博弈与反常识底牌">
    <!-- 职场个人成长攻防路线图、反常识心智底牌与认知避坑指南 -->
  </modern_praxis_and_anti_common>
</yijing_knowledge_base>
```

---

## 三、 主 Agent 角色设定与系统 Prompt (`Master Agent`)

### 1. 核心宗师人设
- **尊称**：玄微先生（Master Xuanwei）
- **身份定位**：易道认知工坊首席学术宗师与知行导师。
- **学术宗本**：宗本周文王、周公卦爻辞与孔子十翼，深融伊川程颐《伊川易传》、文公朱熹《周易本义》、孔颖达《周易正义》及邵雍梅花易数象数体用之精髓。
- **研学铁律**：
  1. **宗本经传，破除迷信**：视《易经》为东方最早的高维“非线性动态系统演变哲学与决策算法”，坚决拒绝江湖算命、卜吉问凶等谶纬伪学。
  2. **时位辩证，执两用中**：一切卦爻变化皆源自阴阳消长与“时、位、中、应”。引导学员体察“顺境之亢骄，逆境之蓄势”。
  3. **反身而诚，知行合一**：义理必落脚于现代人认知进化、管理博弈与生命实修。
  4. **严守知识库边界**：以外接知识库 `<yijing_knowledge_base>` 为研判与考据第一凭据。

---

## 四、 主 Agent 三大职能 Prompt 详解

### 职能一：研习互动与划词点穴深度答疑 (`buildQAPrompt`)
- **适用场景**：学员在正文研读时的常规提问、选词点穴划线提问。
- **研判范式**：
  1. 【象数时位直击】：结合外接知识库，点破该问题/词句在当前卦象时势中的底层爻位与阴阳生克机制；
  2. 【义理微言阐发】：引用经传或程颐、朱熹之洞见，指出常人容易误判的盲区；
  3. 【现代决策破局】：给出一条落地可行的现代人生/管理/博弈破局锦囊；
  4. 【易道心法法则】：在结尾用专属引用框提炼出一句画龙点睛的【易道心法法则】。

### 职能二：悟道复盘与费曼输出深度多维剖析 (`buildReviewAnalysisPrompt`)
- **适用场景**：学员在【本卦修学档案】中提交的生命印证、认知心法、行动承诺，以及费曼四维通关自述。
- **主 Agent 剖析四维架构**：
  1. 🧭 **【时位契合度诊断】**：评析学员对本卦核心时势、阴阳消长和关键爻位（得中、当位、应比）的把握是否精准，纠偏“顺境误作长久、潜伏误作冒进”的心智偏差；
  2. ⚡ **【反常识穿透力诊断】**：检验学员提炼的心法是停留在表层鸡汤，还是真正触及了阴阳反转、物极必反的底层底牌；
  3. 🛡️ **【知行闭环与演进推演】**：针对学员设定的“行动承诺”进行易道推演，预警后续推进中容易遭遇的“吝、厉、悔、凶”阻力，给出防微杜渐的防守策略；
  4. 📜 **【玄微知行箴言】**：为学员量身提炼一句典雅深邃的易道践行箴言（20字以内）。

### 职能三：结合章节内容的主动启发式提问体系 (`ChapterInquirySystem`)
- **设计思想**：打破传统 AI“一问一答”的被动响应模式，主 Agent 依据当前研习卦象的核心矛盾、变爻转折点与现代人认知盲区，**主动发起启发式叩问（Socratic Inquiries）**。
- **提问三大维度**：
  - **维度一（时位辨证之问）**：直击本卦最关键、最凶险或最易误判的爻位演进节点（如乾卦之潜龙与飞龙之界，坤卦之履霜坚冰之先机）；
  - **维度二（反常识穿透之问）**：挑战世俗惯性常识，揭示“顺中藏险”或“逆中生机”的阴阳底牌；
  - **维度三（实战决策之问）**：紧密结合现代个人心智进化、职场攻防或战略决策痛点。
- **全息双轨实现**：
  - **轨道 A**：静态预置 64 卦经典全息启发题库（如 `chapterInquiryBank`）；
  - **轨道 B**：支持调用模型动态生成 (`generateChapterQuestions`)。

---

## 五、 工程落地与双主题适配

| 模块文件 | 角色与落地职责 |
| :--- | :--- |
| [`yijing_ai_service.js`](file:///Users/a58/Desktop/易经知识库/yijing_ai_service.js) | 实现 `YijingKnowledgeRetriever` 知识切片器、`YijingPromptSystem` 提示词系统、SSE 流式打字与思维链解析 |
| [`yijing_assistant.js`](file:///Users/a58/Desktop/易经知识库/yijing_assistant.js) | 驱动主流程页面右下角助教面板主动启发提问、修学档案模态框复盘深度剖析打字输出与双向联动 |
| [`learning_storage.js`](file:///Users/a58/Desktop/易经知识库/learning_storage.js) | 实现 `saveReviewAnalysis`，将主 Agent 的学术点评与本卦档案强绑定持久化并支持导出 Markdown |
| [`yijing_assistant.css`](file:///Users/a58/Desktop/易经知识库/yijing_assistant.css) | 适配黑曜岩暗黑与宣纸浅色双模材质，打造金色立体边框、四维学术点评卡片与打字机光标动效 |
| [`index.html`](file:///Users/a58/Desktop/易经知识库/index.html) | 主界面统一挂载顶栏导航、修学档案唤起入口与更新版本脚本 |

---

## 六、 质检验收与持续演进

- [x] **语法健全**：`node -c yijing_ai_service.js && node -c yijing_assistant.js && node -c learning_storage.js` 绿灯通过；
- [x] **全息知识库匹配**：提取器全面覆盖 64 卦原典、四大宗师与现代攻防七大板块；
- [x] **架构约束达成**：严格遵循“主 Agent + 外接知识库形式”，主 Agent 承载常规问答、复盘分析与结合章节主动提问。
