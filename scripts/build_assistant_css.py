# -*- coding: utf-8 -*-
"""
生成全新高保真易道助教系统样式表 yijing_assistant.css
对齐现代精品教学应用质感（图4/图5结构改造），融入东方雅致审美
"""
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.css')

css_content = r'''/* ==========================================================================
   易道认知工坊 · 东方现代自修伴学系统 (Yijing Assistant Design System)
   ========================================================================== */

/* 1. 浮动唤起助教球 (精炼雅致·无重叠) */
.yj-assistant-trigger {
  position: fixed;
  right: 28px;
  bottom: 32px;
  background: linear-gradient(135deg, #1f2937 0%, #111827 100%);
  border: 1px solid rgba(240, 180, 41, 0.4);
  color: #f3f4f6;
  border-radius: 99px;
  padding: 10px 18px 10px 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 0 15px rgba(240, 180, 41, 0.2);
  z-index: 900;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.yj-assistant-trigger:hover {
  transform: translateY(-2px) scale(1.02);
  border-color: var(--gold);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(240, 180, 41, 0.35);
}
.yj-avatar-mini {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: radial-gradient(circle, #f59e0b 0%, #b45309 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}

/* 2. 划词点穴轻量气泡 (微气泡·绝对不挡文字) */
.yj-selection-bubble {
  position: absolute;
  z-index: 1000;
  background: #111827;
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.5);
  border-radius: 99px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  display: none;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.45);
  transform: translate(-50%, -120%);
  transition: all 0.15s ease;
  user-select: none;
}
.yj-selection-bubble:hover {
  background: #1f2937;
  transform: translate(-50%, -125%) scale(1.05);
}

/* 3. 伴学助教面板 (仿图4/图5精品卡片化设计·右侧半悬浮) */
.yj-assistant-panel {
  position: fixed;
  top: 74px;
  right: -480px;
  width: 440px;
  max-width: calc(100vw - 32px);
  height: calc(100vh - 96px);
  background: var(--side);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: -12px 16px 40px rgba(0, 0, 0, 0.35);
  z-index: 950;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.yj-assistant-panel.open {
  right: 24px;
}

/* 助教卡片顶部头部 (对齐图4/图5) */
.yj-panel-header {
  padding: 16px 20px;
  background: var(--card);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.yj-coach-info {
  display: flex;
  align-items: center;
  gap: 12px;
}
.yj-coach-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow: 0 4px 10px rgba(245, 158, 11, 0.25);
}
.yj-coach-meta h3 {
  font-size: 16px;
  font-weight: 800;
  color: var(--text-m);
  margin-bottom: 2px;
}
.yj-coach-meta p {
  font-size: 12px;
  color: var(--text-sub);
}
.yj-panel-tools {
  display: flex;
  align-items: center;
  gap: 8px;
}
.yj-tool-btn {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-sub);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.yj-tool-btn:hover {
  background: var(--border-light);
  color: var(--text-m);
  border-color: var(--gold);
}

/* 助教面板 Tab 切换 */
.yj-panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg);
  padding: 0 16px;
  gap: 20px;
}
.yj-tab-item {
  padding: 12px 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-sub);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.yj-tab-item.active {
  color: var(--text-m);
  border-bottom-color: var(--accent);
}

/* 助教面板主体内容区 */
.yj-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

/* 呼吸感引导大标题 (对齐图5：晚上好，今晚想弄懂什么？) */
.yj-welcome-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--text-m);
  margin: 16px 0 20px;
  font-family: "PingFang SC", "Songti SC", "SimSun", serif;
  letter-spacing: 0.5px;
}

/* 经典启发问答卡片列表 (对齐图4/图5卡片簇) */
.yj-prompts-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;
}
.yj-prompt-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 13.5px;
  color: var(--text-m);
  line-height: 1.5;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.yj-prompt-card:hover {
  border-color: var(--gold);
  background: var(--card-hover);
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.yj-prompt-card::after {
  content: '➔';
  font-size: 12px;
  color: var(--text-faint);
  transition: color 0.2s;
}
.yj-prompt-card:hover::after {
  color: var(--gold);
}

/* 对话历史列表 */
.yj-chat-container {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.yj-msg-bubble {
  max-width: 90%;
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 14px;
  line-height: 1.7;
}
.yj-msg-user {
  align-self: flex-end;
  background: var(--accent);
  color: #fff;
  border-bottom-right-radius: 2px;
}
.yj-msg-ai {
  align-self: flex-start;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text-m);
  border-bottom-left-radius: 2px;
  box-shadow: var(--shadow);
}

/* 底部当前上下文标示 + 输入栏 (对齐图4/图5底部) */
.yj-panel-footer {
  padding: 14px 18px;
  background: var(--card);
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.yj-context-pill {
  font-size: 11.5px;
  color: var(--text-faint);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--bg);
  padding: 4px 10px;
  border-radius: 6px;
  border: 1px solid var(--border-light);
  width: fit-content;
}
.yj-input-box {
  display: flex;
  align-items: flex-end;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 8px 12px;
  gap: 8px;
  transition: border-color 0.2s;
}
.yj-input-box:focus-within {
  border-color: var(--gold);
}
.yj-input-field {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-m);
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  font-family: inherit;
  max-height: 90px;
}
.yj-send-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}
.yj-send-btn:hover {
  filter: brightness(1.15);
  transform: scale(1.05);
}

/* ==========================================================================
   4. 正文底部两大独立阶段 (阶段三 · 悟道复盘 & 阶段四 · 费曼通关骨架)
   ========================================================================== */
.yj-stage-card-wrap {
  margin-top: 54px;
  display: flex;
  flex-direction: column;
  gap: 36px;
}

.yj-stage-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 18px;
  padding: 32px 36px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.yj-stage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 16px;
}
.yj-stage-tag {
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 99px;
  letter-spacing: 0.5px;
  display: inline-block;
  margin-bottom: 8px;
}
.yj-stage-header h2 {
  font-size: 22px;
  font-weight: 900;
  color: var(--text-m);
}
.yj-stage-header p {
  font-size: 14px;
  color: var(--text-sub);
  margin-top: 4px;
}

/* 阶段三：苏格拉底三问阶梯输入 */
.yj-review-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.yj-review-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.yj-review-item label {
  font-size: 14px;
  font-weight: 800;
  color: var(--gold);
}
.yj-review-item textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-top: 1px dashed var(--border-light);
  padding-top: 10px;
  color: var(--text-m);
  font-size: 14.5px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

/* 阶段四：通关认知四维骨架 (卡片化网格) */
.yj-framework-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 18px;
}
@media (max-width: 960px) {
  .yj-framework-grid { grid-template-columns: 1fr; }
}
.yj-framework-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: border-color 0.2s;
}
.yj-framework-box:focus-within {
  border-color: var(--accent);
}
.yj-box-title {
  font-size: 14.5px;
  font-weight: 800;
  color: var(--text-m);
  display: flex;
  align-items: center;
  gap: 6px;
}
.yj-box-desc {
  font-size: 12px;
  color: var(--text-faint);
  line-height: 1.5;
}
.yj-framework-box textarea {
  width: 100%;
  background: transparent;
  border: none;
  border-top: 1px dashed var(--border-light);
  padding-top: 8px;
  color: var(--text-m);
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  min-height: 75px;
  outline: none;
  font-family: inherit;
}

/* ==========================================================================
   5. 修学复习册 (修复图1空白背景·典雅卡片总览)
   ========================================================================== */
.yj-vault-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: none;
  align-items: center;
  justify-content: center;
}
.yj-vault-overlay.open {
  display: flex;
}
.yj-vault-modal {
  width: 940px;
  max-width: 92vw;
  height: 82vh;
  background: var(--side);
  border: 1px solid var(--border);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 24px 64px rgba(0,0,0,0.6);
  overflow: hidden;
}
.yj-vault-header {
  padding: 22px 28px;
  background: var(--card);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.yj-vault-body {
  flex: 1;
  overflow-y: auto;
  padding: 24px 28px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.yj-vault-summary-bar {
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: 12px;
  padding: 14px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13.5px;
  color: var(--text-sub);
}
.yj-vault-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}
.yj-gua-vault-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
.yj-gua-vault-card:hover {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: var(--shadow);
}
'''

with open(target, 'w', encoding='utf-8') as f:
    f.write(css_content)

print(f"yijing_assistant.css 写入成功！字符数：{len(css_content)}")
