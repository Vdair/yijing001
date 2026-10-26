# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.js')

part4 = r'''
  // ==========================================================================
  // 修学复习册弹窗 (修复图1空白背景问题，构建全景64卦矩阵卡片)
  // ==========================================================================
  const vaultModalHtml = `
  <div class="yj-vault-overlay" id="yjVaultOverlay">
    <div class="yj-vault-modal">
      <div class="yj-vault-header">
        <div>
          <h2 style="font-size:20px; font-weight:800; color:var(--text-m); display:flex; align-items:center; gap:8px;">
            <span>📜 易道修学复习册</span>
            <span style="font-size:12px; font-weight:normal; background:var(--gold-light); color:var(--gold); padding:2px 8px; border-radius:99px;">六十四卦个人档案库</span>
          </h2>
          <p style="font-size:13px; color:var(--text-sub); margin-top:4px;">
            此处记录了您在每一卦沉淀的伴读叩问、悟道心法与费曼通关笔记。点击任意卦象即可无缝跳转温习。
          </p>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="mentor-btn outline" onclick="exportVaultMarkdown()" style="padding:7px 14px; font-size:13px;">📥 导出个人研习全集 (MD)</button>
          <button class="icon-btn" onclick="closeVaultModal()" style="font-size:16px;">✕</button>
        </div>
      </div>
      <div class="yj-vault-body">
        <div class="yj-vault-summary-bar">
          <span id="vaultStatsSummary">📊 统计加载中...</span>
          <span style="font-size:12px; color:var(--text-faint);">💡 建议每周选 1~2 卦进行复盘深化</span>
        </div>
        <div class="yj-vault-grid" id="yjVaultGrid"></div>
      </div>
    </div>
  </div>
  `;
  const vContainer = document.createElement('div');
  vContainer.innerHTML = vaultModalHtml;
  document.body.appendChild(vContainer);

  window.openVaultModal = function() {
    document.getElementById('yjVaultOverlay').classList.add('open');
    renderVaultGrid();
  };

  window.closeVaultModal = function() {
    document.getElementById('yjVaultOverlay').classList.remove('open');
  };

  function renderVaultGrid() {
    const grid = document.getElementById('yjVaultGrid');
    grid.innerHTML = '';
    const statsEl = document.getElementById('vaultStatsSummary');
    if (!window.LearningVault) return;

    const stats = window.LearningVault.getStats();
    statsEl.innerHTML = `已累计沉淀：<b style="color:var(--gold);">${stats.reviewedCount}</b> 篇复盘 · <b style="color:var(--purple);">${stats.noteCount}</b> 篇费曼笔记 · <b style="color:var(--blue);">${stats.totalQA}</b> 次伴读叩问`;

    const all = window.LearningVault.getAllRecords();

    // 确保从全局 flatLessons 或 COURSE 中拉取所有课程卡片
    const lessons = window.flatLessons || [];
    if (lessons.length === 0) {
      grid.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-sub);">课程数据加载中，请稍候重试...</div>';
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
          <span style="font-size:16px; font-weight:800; color:var(--text-m);">${lesson.symbol || '☯️'} ${lesson.title}</span>
          <span style="font-size:11px; color:var(--text-faint);">${rec && rec.updated_at ? rec.updated_at.slice(0, 10) : '未研读'}</span>
        </div>
        <div style="font-size:12px; color:var(--text-sub); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
          ${lesson.motto || '洁静精微，极深研几'}
        </div>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
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
  }

  window.exportVaultMarkdown = function() {
    const all = window.LearningVault ? window.LearningVault.getAllRecords() : {};
    let md = '# 易道认知工坊 · 个人修学与卦象心智复习全集\n\n导出时间：' + new Date().toLocaleString() + '\n\n---\n\n';
    for (let id in all) {
      const rec = all[id];
      md += `## ☯️ 卦象档案：${id}\n\n`;
      if (rec.review) {
        md += `### 【阶段三·悟道复盘】\n- **生命印证**：${rec.review.q1 || '无'}\n- **反常识心法**：${rec.review.q2 || '无'}\n- **行动承诺**：${rec.review.q3 || '无'}\n\n`;
      }
      if (rec.feynman) {
        const fw = rec.feynman.framework || {};
        md += `### 【阶段四·费曼通关笔记】\n- **1. 卦象时势核心判据**：${fw.core_trend || ''}\n- **2. 核心爻变拐点攻防**：${fw.key_yao_turn || ''}\n- **3. 现实生活/商业案例映射**：${fw.real_case || ''}\n- **4. 反常识易道心智底牌**：${fw.anti_common_rule || ''}\n\n**自述讲解全稿**：\n${rec.feynman.full_text || ''}\n\n`;
      }
      md += '---\n\n';
    }
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `易道修学全集_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  // 钩住 loadLesson：换课时自动渲染底部两大独立阶段
  const origLoadLesson = window.loadLesson;
  window.loadLesson = function(idx) {
    if (origLoadLesson) origLoadLesson(idx);
    setTimeout(() => {
      window.renderBottomAssistantStages();
      if (document.getElementById('yjAssistantPanel').classList.contains('open')) {
        syncCoachCurrentGua();
      }
    }, 120);
  };

  setTimeout(() => {
    window.renderBottomAssistantStages();
  }, 400);
})();
'''

with open(target, 'a', encoding='utf-8') as f:
    f.write(part4)

print("yijing_assistant.js Part 4 追加完成，完整总引擎就绪！")
