# -*- coding: utf-8 -*-
"""
修复：
1. 助教面板打开时，正文自动右侧留出 460px 边距，杜绝遮挡文字；
2. 输入框区域具备清晰的背景、边框、投影和明确的区域标签信息，杜绝与背景混成一片。
"""
import os

css_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.css')

patch_css = r'''
/* ==========================================================================
   页面自适应推挤：助教面板打开时，课文正文向左缩进，绝不遮挡文字
   ========================================================================== */
.reader-container {
  transition: padding-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
}
body.assistant-open .reader-container {
  padding-right: 470px !important;
}
@media (max-width: 1100px) {
  body.assistant-open .reader-container {
    padding-right: 0 !important;
  }
}

/* ==========================================================================
   输入框区域立体化重塑：区域信息分明、边框清晰、拒绝与底色混杂
   ========================================================================== */
.yj-panel-footer {
  padding: 16px 20px 20px;
  background: var(--card) !important;
  border-top: 2px solid var(--border) !important;
  display: flex !important;
  flex-direction: column !important;
  gap: 10px !important;
  box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.05);
}

/* 区域信息提示条 */
.yj-context-pill {
  font-size: 12.5px !important;
  font-weight: 700 !important;
  color: var(--text-m) !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  background: var(--bg) !important;
  padding: 6px 12px !important;
  border-radius: 8px !important;
  border: 1px solid var(--border) !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* 输入框立体卡片外框 */
.yj-input-box {
  display: flex !important;
  align-items: flex-end !important;
  background: var(--bg) !important;
  border: 1.8px solid var(--border) !important;
  border-radius: 14px !important;
  padding: 10px 14px !important;
  gap: 10px !important;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.04) !important;
  transition: all 0.2s ease !important;
}
.yj-input-box:focus-within {
  border-color: var(--gold) !important;
  background: var(--card) !important;
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15), inset 0 1px 2px rgba(0,0,0,0.02) !important;
}
.yj-input-field {
  flex: 1 !important;
  background: transparent !important;
  border: none !important;
  outline: none !important;
  color: var(--text-m) !important;
  font-size: 14.5px !important;
  line-height: 1.5 !important;
  resize: none !important;
  min-height: 38px !important;
  max-height: 100px !important;
  font-family: inherit !important;
}
.yj-input-field::placeholder {
  color: var(--text-faint) !important;
  font-size: 13.5px !important;
}

.yj-send-btn {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #f59e0b 0%, #b45309 100%) !important;
  color: #fff !important;
  border: none !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-size: 16px !important;
  cursor: pointer !important;
  flex-shrink: 0 !important;
  box-shadow: 0 3px 8px rgba(180, 83, 9, 0.3) !important;
  transition: transform 0.15s, filter 0.15s !important;
}
.yj-send-btn:hover {
  filter: brightness(1.1) !important;
  transform: scale(1.06) !important;
}
'''

with open(css_path, 'a', encoding='utf-8') as f:
    f.write(patch_css)

print("yijing_assistant.css 补丁成功追加！")
