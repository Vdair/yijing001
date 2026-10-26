# -*- coding: utf-8 -*-
"""
全面重塑 yijing_assistant.css：
1. 彻底解决浅色模式下深色字+深色底的严重可读性问题；
2. 遮罩层改为现代轻盈微模糊，拒绝死黑厚重感；
3. 对齐图4/图5现代高级清新质感。
"""
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.css')

css_content = r'''/* ==========================================================================
   易道认知工坊 · 现代自修伴学高对比度主题系统 (Light/Dark 自适应)
   ========================================================================== */

/* 1. 浮动助教胶囊按钮 (清爽明亮·自适应浅色) */
.yj-assistant-trigger {
  position: fixed;
  right: 28px;
  bottom: 28px;
  background: var(--card);
  border: 1.5px solid var(--gold);
  color: var(--text-m);
  border-radius: 99px;
  padding: 9px 18px 9px 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12), 0 0 10px rgba(240, 180, 41, 0.15);
  z-index: 800;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}
.yj-assistant-trigger:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.18), 0 0 16px rgba(240, 180, 41, 0.25);
  background: var(--card-hover);
}
.yj-avatar-mini {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

/* 2. 划词点穴轻量气泡 */
.yj-selection-bubble {
  position: absolute;
  z-index: 1000;
  background: var(--card);
  color: var(--gold);
  border: 1.5px solid var(--gold);
  border-radius: 99px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  display: none;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  transform: translate(-50%, -120%);
  user-select: none;
}
.yj-selection-bubble:hover {
  background: var(--gold-light);
  transform: translate(-50%, -125%) scale(1.05);
}

/* 3. 伴学助教面板 (仿图4/图5浅色清新大卡片) */
.yj-assistant-panel {
  position: fixed;
  top: 76px;
  right: -480px;
  width: 440px;
  max-width: calc(100vw - 32px);
  height: calc(100vh - 100px);
  background: var(--side);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: -10px 16px 40px rgba(0, 0, 0, 0.12);
  z-index: 850;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: right 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}
.yj-assistant-panel.open {
  right: 24px;
}

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
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}
.yj-coach-meta h3 {
  font-size: 15.5px;
  font-weight: 800;
  color: var(--text-m);
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
  background: var(--bg);
  border: 1px solid var(--border);
  color: var(--text-m);
  padding: 5px 10px;
  border-radius: 8px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}
.yj-tool-btn:hover {
  border-color: var(--gold);
  color: var(--gold);
}

.yj-panel-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg);
  padding: 0 18px;
  gap: 20px;
}
.yj-tab-item {
  padding: 12px 4px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text-sub);
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  transition: all 0.2s;
}
.yj-tab-item.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}

.yj-panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  background: var(--side);
}
.yj-welcome-title {
  font-size: 22px;
  font-weight: 800;
  color: var(--text-m);
  margin: 12px 0 18px;
  letter-spacing: 0.5px;
}

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
  padding: 13px 16px;
  font-size: 13.5px;
  color: var(--text-m);
  line-height: 1.55;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.yj-prompt-card:hover {
  border-color: var(--gold);
  background: var(--card-hover);
  transform: translateX(3px);
}
.yj-prompt-card::after {
  content: '➔';
  font-size: 12px;
  color: var(--text-faint);
}
.yj-prompt-card:hover::after {
  color: var(--gold);
}

.yj-chat-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
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
}

.yj-panel-footer {
  padding: 14px 18px;
  background: var(--card);
  border-top: 1px solid var(--border-light);
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.yj-context-pill {
  font-size: 12px;
  color: var(--text-sub);
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
  border-radius: 12px;
  padding: 8px 12px;
  gap: 8px;
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
}
.yj-send-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
}

/* ==========================================================================
   4. 正文底部两大独立阶段 (悟道复盘 + 费曼骨架)
   ========================================================================== */
.yj-stage-card-wrap {
  margin-top: 48px;
  margin-bottom: 40px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.yj-stage-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 30px 34px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.yj-stage-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid var(--border-light);
  padding-bottom: 14px;
}
.yj-stage-tag {
  font-size: 12px;
  font-weight: 800;
  padding: 3px 10px;
  border-radius: 99px;
  display: inline-block;
  margin-bottom: 6px;
}
.yj-stage-header h2 {
  font-size: 21px;
  font-weight: 800;
  color: var(--text-m);
}
.yj-stage-header p {
  font-size: 13.5px;
  color: var(--text-sub);
  margin-top: 4px;
}

.yj-review-grid {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.yj-review-item {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
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
  padding-top: 8px;
  color: var(--text-m);
  font-size: 14px;
  line-height: 1.6;
  resize: vertical;
  outline: none;
  font-family: inherit;
}

.yj-framework-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
@media (max-width: 960px) {
  .yj-framework-grid { grid-template-columns: 1fr; }
}
.yj-framework-box {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  transition: border-color 0.2s;
}
.yj-framework-box:focus-within {
  border-color: var(--accent);
}
.yj-box-title {
  font-size: 14px;
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
  padding-top: 6px;
  color: var(--text-m);
  font-size: 13.5px;
  line-height: 1.6;
  resize: vertical;
  min-height: 70px;
  outline: none;
  font-family: inherit;
}

/* ==========================================================================
   5. 修学复习册 (彻底修复遮罩太深、深字深底与加载失败问题)
   ========================================================================== */
.yj-vault-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  /* 现代轻量通透遮罩：绝非 0.75 纯黑！ */
  background: rgba(15, 23, 42, 0.28);
  backdrop-filter: blur(5px);
  z-index: 2000;
  display: none;
  align-items: center;
  justify-content: center;
}
.yj-vault-overlay.open {
  display: flex;
}
.yj-vault-modal {
  width: 960px;
  max-width: 92vw;
  height: 84vh;
  /* 严格使用自适应卡片底色（浅色模式下为纯白/浅灰，文字清晰对比度极高） */
  background: var(--side);
  border: 1px solid var(--border);
  border-radius: 18px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}
.yj-vault-header {
  padding: 20px 26px;
  background: var(--card);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.yj-vault-body {
  flex: 1;
  overflow-y: auto;
  padding: 22px 26px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--bg);
}
.yj-vault-summary-bar {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13.5px;
  color: var(--text-m);
}
.yj-vault-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 14px;
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
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
}
.layered-ai-tag {
  font-size: 11px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 7px;
  border-radius: 4px;
}
'''

with open(target, 'w', encoding='utf-8') as f:
    f.write(css_content)

print(f"yijing_assistant.css 全新高对比度样式已写入完成！")
