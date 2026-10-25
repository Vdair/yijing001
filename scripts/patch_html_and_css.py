# -*- coding: utf-8 -*-
"""
脚本：更新 index.html 渲染逻辑和 lesson.css 富文本排版样式
"""
import os

base_dir = r'c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001'
html_path = os.path.join(base_dir, 'index.html')
css_path = os.path.join(base_dir, 'lesson.css')

# 1. 更新 index.html 支持 full_rich_html
html_code = open(html_path, encoding='utf-8').read()

target_block = """      // 组合完整页面
      content.innerHTML = `
        <div class="lesson-header">"""

replacement_block = """      // 优先渲染全息大课版本
      if (lesson.full_rich_html) {
        content.innerHTML = `
          <div class="lesson-header">
            <div class="header-top">
              <div class="gua-symbol-badge">${lesson.symbol || '☯️'}</div>
              <div class="header-meta">
                <h1>${lesson.title}</h1>
                <div class="motto">${lesson.motto || ''} · 所属篇章：${lesson.partTitle}</div>
              </div>
            </div>
            <div class="header-tags">
              <span class="pill-tag">⏱️ 建议研读 25 分钟</span>
              ${lesson.upper ? `<span class="pill-tag" style="background:var(--gold-light); color:var(--gold);">上卦：${lesson.upper}</span>` : ''}
              ${lesson.lower ? `<span class="pill-tag" style="background:var(--purple-light); color:var(--purple);">下卦：${lesson.lower}</span>` : ''}
              <span class="pill-tag" style="background:var(--accent-light); color:var(--accent);">阶梯主题：${lesson.topicTitle}</span>
            </div>
            ${verticalLadderHtml}
          </div>
          ${lesson.full_rich_html}
        `;
        content.scrollTop = 0;
        document.getElementById('btnPrev').disabled = (idx === 0);
        document.getElementById('btnNext').disabled = (idx === flatLessons.length - 1);
        const isDone = completedLessons.has(lesson.id);
        const btnDone = document.getElementById('btnDone');
        btnDone.innerHTML = isDone ? '✓ 已掌握 (点击取消)' : '○ 标记已掌握 (空格)';
        btnDone.style.background = isDone ? 'var(--gold)' : 'var(--accent)';
        renderSidebar(document.getElementById('searchInput').value);
        return;
      }

      // 组合常规页面
      content.innerHTML = `
        <div class="lesson-header">"""

if target_block in html_code:
    html_code = html_code.replace(target_block, replacement_block)
    
# 增强 scrollToYao 兼容
old_scroll = """    function scrollToYao(cardId) {
      const el = document.getElementById(cardId);"""

new_scroll = """    function scrollToYao(cardId) {
      const posMap = {'yao-card-0': 'yao-card-初九', 'yao-card-1': 'yao-card-九二', 'yao-card-2': 'yao-card-九三', 'yao-card-3': 'yao-card-九四', 'yao-card-4': 'yao-card-九五', 'yao-card-5': 'yao-card-上九'};
      const el = document.getElementById(cardId) || document.getElementById(posMap[cardId]);"""

if old_scroll in html_code:
    html_code = html_code.replace(old_scroll, new_scroll)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html_code)
print('index.html patched successfully!')

# 2. 追加富文本样式到 lesson.css
css_append = """

/* ── 全息大课富文本排版增强 ── */
.sub-sec-title {
  font-size: 20px;
  font-weight: 800;
  color: var(--gold);
  margin: 22px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px solid var(--border-light);
}
.yao-sub-title {
  font-size: 18.5px;
  font-weight: 800;
  color: var(--text-m);
  margin: 18px 0 8px 0;
  padding: 8px 14px;
  background: var(--border-light);
  border-left: 4px solid var(--gold);
  border-radius: 4px;
  transition: all 0.3s;
}
.classic-quote {
  background: var(--bg);
  border-left: 4px solid var(--accent);
  padding: 14px 18px;
  margin: 12px 0;
  border-radius: 6px;
  font-size: 16.5px;
  line-height: 1.85;
}
.classic-quote p { margin-bottom: 6px; }
.classic-quote p:last-child { margin-bottom: 0; }
.classic-list {
  padding-left: 24px;
  margin: 12px 0;
  font-size: 16px;
  line-height: 1.85;
}
.classic-list li { margin-bottom: 8px; }
.num-item {
  font-size: 16px;
  line-height: 1.85;
  margin: 10px 0;
  padding: 6px 12px;
  background: var(--card-hover);
  border-radius: 6px;
}
.normal-p {
  font-size: 16px;
  line-height: 1.85;
  margin: 10px 0;
  color: var(--text-m);
}
.step-section {
  border-left: 4px solid var(--gold);
}
.step-section.section-idx-1 { border-left-color: var(--blue); }
.step-section.section-idx-2 { border-left-color: var(--purple); }
.step-section.section-idx-3 { border-left-color: var(--accent); }
.step-section.section-idx-4 { border-left-color: var(--gold); }
.step-section.section-idx-5 { border-left-color: var(--blue); }
.step-section.section-idx-6 { border-left-color: var(--danger); }
"""

css_code = open(css_path, encoding='utf-8').read()
if '.sub-sec-title' not in css_code:
    with open(css_path, 'a', encoding='utf-8') as f:
        f.write(css_append)
    print('lesson.css patched successfully!')
else:
    print('lesson.css already contains styles.')
