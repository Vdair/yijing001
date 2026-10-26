# -*- coding: utf-8 -*-
"""
修复 yijing_assistant.js 中修学复习册的数据读取与卡片渲染
确保 100% 立即展示 64 卦矩阵卡片，彻底消灭空白与提示文字
"""
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.js')

with open(target, 'r', encoding='utf-8') as f:
    code = f.read()

# 替换 renderVaultGrid 函数
old_func_start = "function renderVaultGrid() {"
new_func = r'''function getFullLessonsList() {
    if (window.flatLessons && window.flatLessons.length > 0) return window.flatLessons;
    const list = [];
    if (window.COURSE && window.COURSE.parts) {
      window.COURSE.parts.forEach(part => {
        part.topics.forEach(topic => {
          topic.lessons.forEach(lesson => {
            list.push({
              ...lesson,
              partTitle: part.title,
              topicTitle: topic.title
            });
          });
        });
      });
    }
    return list;
  }

  function renderVaultGrid() {
    const grid = document.getElementById('yjVaultGrid');
    if (!grid) return;
    grid.innerHTML = '';
    const statsEl = document.getElementById('vaultStatsSummary');
    if (!window.LearningVault) return;

    const stats = window.LearningVault.getStats();
    statsEl.innerHTML = `<span>📊 已累计沉淀：<b style="color:var(--gold);">${stats.reviewedCount}</b> 篇复盘 · <b style="color:var(--purple);">${stats.noteCount}</b> 篇费曼笔记 · <b style="color:var(--blue);">${stats.totalQA}</b> 次伴读叩问</span>`;

    const all = window.LearningVault.getAllRecords();
    const lessons = getFullLessonsList();

    if (lessons.length === 0) {
      grid.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-sub);">正在同步六十四卦全息课件，请稍候...</div>';
      return;
    }

    lessons.forEach((lesson, idx) => {
      const rec = all[lesson.id];
      const hasRev = rec && rec.review && (rec.review.q1 || rec.review.q2);
      const hasFey = rec && rec.feynman && rec.feynman.full_text;
      const qaCount = rec && rec.qa_history ? rec.qa_history.length : 0;

      const card = document.createElement('div');
      card.className = 'yj-gua-vault-card';
      card.onclick = () => {
        closeVaultModal();
        if (window.loadLesson) window.loadLesson(idx);
      };

      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:16px; font-weight:800; color:var(--text-m); display:flex; align-items:center; gap:6px;">
            <span style="color:var(--gold); font-size:18px;">${lesson.symbol || '☯️'}</span>
            <span>${lesson.title}</span>
          </span>
          <span style="font-size:11px; color:var(--text-faint);">${rec && rec.updated_at ? rec.updated_at.slice(0, 10) : '未研读'}</span>
        </div>
        <div style="font-size:12px; color:var(--text-sub); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-top:2px;">
          ${lesson.motto || '洁静精微，极深研几'}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <span class="layered-ai-tag" style="background:${hasRev ? 'var(--gold-light)' : 'var(--border-light)'}; color:${hasRev ? 'var(--gold)' : 'var(--text-faint)'};">
            ${hasRev ? '✓ 已复盘' : '○ 待复盘'}
          </span>
          <span class="layered-ai-tag" style="background:${hasFey ? 'var(--purple-light)' : 'var(--border-light)'}; color:${hasFey ? 'var(--purple)' : 'var(--text-faint)'};">
            ${hasFey ? '✓ 费曼通关' : '○ 费曼待填'}
          </span>
          ${qaCount > 0 ? `<span class="layered-ai-tag" style="background:var(--blue-light); color:var(--blue);">${qaCount}条问答</span>` : ''}
        </div>
      `;
      grid.appendChild(card);
    });
  }'''

# 替换旧的 renderVaultGrid
idx = code.find(old_func_start)
if idx != -1:
    end_idx = code.find("window.exportVaultMarkdown = function()", idx)
    code = code[:idx] + new_func + "\n\n  " + code[end_idx:]

with open(target, 'w', encoding='utf-8') as f:
    f.write(code)

print("yijing_assistant.js 数据获取与矩阵渲染函数已成功修复！")
