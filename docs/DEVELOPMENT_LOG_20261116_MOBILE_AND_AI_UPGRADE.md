# 易道认知工坊 · 大模型双轨架构升级、资费极限优化与移动端全屏响应式实录 (2026-11-16)

> **版本**：v3.2 · 极速省流 AI 架构 & 移动端全屏响应式版  
> **日期**：2026年11月16日  
> **状态**：✅ 学习进度强持久化 + 智谱 GLM-5.3-Flash 极速低成本中继 + 4 大 AI 场景 100% 验证 + 移动端全屏响应式适配全部竣工并推送  

---

## 🎯 任务背景与核心痛点

1. **学习进度与掌握状态存储痛点**：
   - 用户在课件端点击「✓ 标记已掌握」后，页面刷新或切换时未能稳定在本地与云端数据层完成双向同步。
2. **Kimi API 研习成本痛点**：
   - 仅学习单章课件产生约 6 元 API 费用，亟需优化高频长上下文调用时的资费结构，寻找高性价比平替方案。
3. **API Key 资产安全与工程解耦**：
   - 杜绝 API Key 硬编码在前端代码或提交至 Git 仓库，确保密钥私有化且能支持本地与云端多场景灵活运行。
4. **移动端（手机屏幕）阅读体验亟待升级**：
   - 原界面重度面向 PC 桌面大屏设计，在 iPhone / Android 等主流手机屏幕（375px~430px）下存在顶栏挤压、侧边栏占满、助教弹窗横向溢出与软键盘遮挡等问题，急需系统化响应式改造。

---

## 🛠️ 今日核心技术突破与工程架构

```mermaid
flowchart TD
    subgraph S1["1. 存储持久化与进度闭环"]
        A1["点击『标记已掌握』"] --> A2["Local Vault 增量更新"]
        A2 --> A3["Python 后台 POST /api/vault/save"]
        A3 --> A4["跨页面广播 yijing_mastered_changed"]
    end

    subgraph S2["2. AI 双轨架构与资费极限优化"]
        B1["智谱 GLM-5.3-Flash 接入"] --> B2["Prompt 缓存命中 (0.23元/M)"]
        B2 --> B3["轻量思考 low 模式 + 4096 max_tokens"]
        B3 --> B4["私有 config/local_ai_keys.json 隔离"]
        B4 --> B5["4大核心业务场景 100% 自动化全通"]
    end

    subgraph S3["3. 移动端手机全屏响应式工程"]
        C1["iOS 安全区域 env(safe-area-inset)"] --> C2["侧滑抽屉 Sidebar + 毛玻璃遮罩"]
        C2 --> C3["大字单列流 + 六爻天梯垂直化"]
        C3 --> C4["玄微助教 Bottom Sheet 底部抽屉"]
        C4 --> C5["移动端专属快捷功能 Action Sheet"]
    end
```

---

## 🚀 交付成果明细

### 1. 掌握状态多端强一致性同步
- **端到端持久化闭环**：在 `index.html` 与 `learn.html` 中增强 `toggleCurrentDone` 与 `syncMasteredStateFromVault`；
- **增量通信机制**：掌握状态变更时，触发全局广播并经由 `sync_vault_server.py` 同步写入本地持久化存储，保障刷新与重启数据不丢失。

### 2. 大模型极速省流与安全解耦架构
- **双模型动态热切换引擎**：
  - 在 `yijing_ai_service.js` 与 `yijing_assistant.js` 中构建统一的多供应商抽象适配器，保留 **Moonshot Kimi**，默认启用 **智谱 GLM-5.3-Flash**；
  - 资费由原先约 20~100元/M 降至 **缓存命中 0.23元/M tokens**（资费降幅达 98%）。
- **智谱深度思考机制调优**：
  - 针对 GLM 模型的思考链特性，统一配置 `thinking: { type: 'enabled', level: 'low' }`，并将 `max_tokens` 提升至 4096，彻底解决由于思考耗尽 token 导致正文截断为 0 字的问题。
- **本地服务协议健全化**：
  - `sync_vault_server.py` 升级至 HTTP/1.1，普通 JSON 响应强制附加 `Content-Length`，根除浏览器 fetch 挂起假死；
  - 密钥统一收拢至本地私有配置文件 `config/local_ai_keys.json`（受 `.gitignore` 保护）。
- **4 大核心场景全链路自动化验证**（经由 `verify_all_ai_scenarios.js` 验证）：
  1. 连通性探测 (`testConnection`)：✅ 毫秒级响应；
  2. 玄微伴读对话流 (`answerQuestion`)：✅ 完整输出易道心法法则；
  3. 划词边读边思师承评估 (`evaluateInlineThink`)：✅ 三维点穴点评精准返回；
  4. 阶段三悟道复盘与费曼多维诊断 (`analyzeReviewAndFeynman`)：✅ 结构化多维诊断全通。

### 3. 移动端手机全屏响应式系统落地
- **视口与 iOS 安全区标准对接**：
  - 引入 `viewport-fit=cover, interactive-widget=resizes-content`，键盘弹起时智能贴合内容区；
  - 底部操作栏（`标记已掌握`、翻页键等）自适应贴合 `env(safe-area-inset-bottom)`。
- **顶栏与快捷行动抽屉（Action Sheet）**：
  - 顶栏精简至 56px，移动端新增「✨ 功能」按钮，一键从底部唤起 3D生态圈、决策图谱、认知手册、修学档案与助教等入口。
- **侧边栏手势抽屉化**：
  - 在移动端全面转为 `position: fixed` 的侧滑抽屉（84vw 宽），配有半透明毛玻璃全屏遮罩，选课后自动关闭。
- **正文大字单列流与六爻天梯垂直化**：
  - 字体放大至 17.5px+，字行距舒展；
  - 六爻天梯从桌面横排解构为单列垂直排布，触控高度均 $\ge 44\text{px}$，防误触。
- **玄微助教升级为 Bottom Sheet 底部抽屉**：
  - 手机端从底部滑出占屏 86dvh 的仿原生底部抽屉，配备顶部下拉手柄（Handle）；
  - 修学档案 (Vault) 弹窗在移动端针对 4 个 Tab 启用横向滑动条，文本域自适应缩放。

---

## 📊 验证与 Git 提交索引

- `ed77f86`: `feat(mobile): implement full-viewport responsive layout, bottom-sheet assistant, and mobile drawer navigation`
- `cf197d2`: `feat(mobile): fine-tune mobile vault modal and update static cache versions`
