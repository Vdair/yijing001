# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai_study_system.js')

part4 = r'''
  // 4. 复习档案总览弹窗 (Review Vault)
  const vaultModalHtml = `
  <div class="vault-modal-overlay" id="vaultModal">
    <div class="vault-modal-window">
      <div class="vault-window-header">
        <div>
          <span style="font-size:18px; font-weight:800; color:var(--text-m);">📜 易道修学复习册 · 个人卦象心智档案</span>
          <div style="font-size:12px; color:var(--text-sub);" id="vaultStats">已沉淀：0 篇复盘 / 0 篇费曼笔记</div>
        </div>
        <div style="display:flex; gap:10px;">
          <button class="mentor-btn outline" onclick="exportVaultMarkdown()">📥 导出个人研习全集 (Markdown)</button>
          <button class="icon-btn" onclick="closeVaultModal()">✕</button>
        </div>
      </div>
      <div class="vault-window-body" id="vaultListContainer"></div>
    </div>
  </div>
  `;
  const vDiv = document.createElement('div');
  vDiv.innerHTML = vaultModalHtml;
  document.body.appendChild(vDiv);

  window.openVaultModal = function() {
    document.getElementById('vaultModal').classList.add('open');
    renderVaultList();
  };

  window.closeVaultModal = function() {
    document.getElementById('vaultModal').classList.remove('open');
  };

  function renderVaultList() {
    const list = document.getElementById('vaultListContainer');
    list.innerHTML = '';
    const statsEl = document.getElementById('vaultStats');
    if (!window.LearningVault) return;

    const stats = window.LearningVault.getStats();
    statsEl.innerText = `已沉淀：${stats.reviewedCount} 篇复盘 · ${stats.noteCount} 篇费曼笔记 · ${stats.totalQA} 次伴读叩问`;

    const all = window.LearningVault.getAllRecords();

    if (window.flatLessons) {
      window.flatLessons.forEach((lesson, idx) => {
        const rec = all[lesson.id];
        const hasRev = rec && rec.review && (rec.review.q1 || rec.review.q2);
        const hasFey = rec && rec.feynman && rec.feynman.full_text;
        const qaCount = rec && rec.qa_history ? rec.qa_history.length : 0;

        const card = document.createElement('div');
        card.className = 'vault-gua-card';
        card.onclick = () => {
          closeVaultModal();
          if (window.loadLesson) window.loadLesson(idx);
        };
        card.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:18px; font-weight:800; color:var(--gold);">${lesson.symbol || '☯️'} ${lesson.title}</span>
            <span style="font-size:11px; color:var(--text-faint);">${rec && rec.updated_at ? rec.updated_at.slice(0, 10) : '未研习'}</span>
          </div>
          <div style="font-size:12.5px; color:var(--text-sub);">
            ${lesson.motto || '洁静精微，见微知著'}
          </div>
          <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:4px;">
            <span class="layered-ai-tag" style="background:${hasRev ? 'var(--gold-light)' : 'var(--border-light)'}; color:${hasRev ? 'var(--gold)' : 'var(--text-faint)'};">
              ${hasRev ? '✓ 已复盘' : '○ 未复盘'}
            </span>
            <span class="layered-ai-tag" style="background:${hasFey ? 'var(--purple-light)' : 'var(--border-light)'}; color:${hasFey ? 'var(--purple)' : 'var(--text-faint)'};">
              ${hasFey ? '✓ 费曼通关' : '○ 费曼待填'}
            </span>
            ${qaCount > 0 ? `<span class="layered-ai-tag" style="background:var(--blue-light); color:var(--blue);">${qaCount}条叩问</span>` : ''}
          </div>
        `;
        list.appendChild(card);
      });
    }
  }

  window.exportVaultMarkdown = function() {
    const all = window.LearningVault.getAllRecords();
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

  // 5. 挂钩原 loadLesson 流程，保证换课时自动渲染底部阶段
  const origLoadLesson = window.loadLesson;
  window.loadLesson = function(idx) {
    if (origLoadLesson) origLoadLesson(idx);
    setTimeout(() => {
      window.renderBottomStages();
    }, 100);
  };

  // 页面初次加载时触发一次
  setTimeout(() => {
    window.renderBottomStages();
  }, 300);
})();
'''

with open(target, 'a', encoding='utf-8') as f:
    f.write(part4)

print("Part 4 追加完成，完整 ai_study_system.js 已就绪！")
