# 易道认知工坊 · 卦象修学档案本地存储库 (Learning Vault)

本目录为学员在《易道认知工坊》研习过程中所沉淀的个人认知资产库。
档案与六十四卦各章节**严格唯一绑定**，仅承载且聚焦于以下四大核心来源：

## 📦 四大核心来源架构

| 模块序号 | 来源名称 | 存储维度与内容 | 对应字段 |
| :--- | :--- | :--- | :--- |
| **01** | **伴读问答对话** | 按对话维度保存学员发起的每一次提问与玄微助教的义理点拨 | `dialogues: [{ id, timestamp, question, answer }]` |
| **02** | **课时专属笔记** | 针对当前章节的心得随笔、爻位批注、灵感记录 | `notes: [{ id, timestamp, title, content }]` |
| **03** | **悟道复盘心法** | 生命印证（照镜子）、反常识心智底牌（炼心法）、知行合一承诺 | `review: { q1_mirror, q2_mindset, q3_action, updated_at }` |
| **04** | **费曼通关输出** | 四维通关骨架（时势判据、拐点攻防、实战案例、反常识底牌）与通俗自述稿 | `feynman: { framework: {...}, full_text, updated_at }` |

## 💾 存储与同步机制

1. **浏览器即时持久化**：使用 `localStorage['yijing_study_vault_v2']` 实现每次输入/编辑的秒级自动持久化。
2. **项目级文件归档**：
   - 单卦 JSON 归档：`data/learning_vault/{gua_id}.json`（方便 Git 版本管理与差异对比）。
   - 全局汇总归档：`data/learning_vault/all_vault.json`。
   - 个人研习全集 Markdown 导出：支持一键导出为纯文本 Markdown 笔记本。
3. **本地同步服务**：可通过 `scripts/sync_vault_server.py` 启动轻量服务，前端一键自动 POST 同步落盘到本目录。
