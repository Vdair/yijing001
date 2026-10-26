# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai_study_system.js')

part2 = r'''
  // 2. 问答历史与提交
  function getCurrentGua() {
    if (window.flatLessons && window.currentLessonIndex !== undefined) {
      return window.flatLessons[window.currentLessonIndex];
    }
    return null;
  }

  function renderStage12History() {
    const cur = getCurrentGua();
    if (!cur) return;
    document.getElementById('stage12GuaTitle').innerText = `${cur.symbol || '☯️'} ${cur.title}`;
    const record = window.LearningVault ? window.LearningVault.getGuaRecord(cur.id) : null;
    const box = document.getElementById('stage12ChatList');
    box.innerHTML = '';

    if (!record || !record.qa_history || record.qa_history.length === 0) {
      box.innerHTML = `
        <div class="layered-ai-card">
          <div style="font-weight:700; color:var(--gold);">☯️ 易道伴读导师</div>
          <div>您好！研读本卦时，可随时划选课文任意字句提问，或直接在下方输入叩问。问答内容将自动归档并与本卦永久绑定。</div>
        </div>
      `;
      return;
    }

    record.qa_history.forEach(item => {
      const u = document.createElement('div');
      u.className = 'layered-chat-item';
      u.innerHTML = `
        <div class="layered-user-bubble">
          ${item.quote ? `<div style="font-size:12px; opacity:0.8; margin-bottom:4px; border-bottom:1px dashed rgba(255,255,255,0.3); padding-bottom:2px;">“${item.quote}”</div>` : ''}
          ${item.question}
        </div>
        <div class="layered-ai-card">
          <div style="display:flex; gap:6px; margin-bottom:4px;">
            <span class="layered-ai-tag tag-school">🏛️ 经传与宗师注解</span>
            <span class="layered-ai-tag tag-stage">📐 时位辩证</span>
          </div>
          <div>${item.answer.replace(/\n/g, '<br>')}</div>
          <div style="font-size:11px; color:var(--text-faint); text-align:right;">${item.timestamp || ''}</div>
        </div>
      `;
      box.appendChild(u);
    });
    box.scrollTop = box.scrollHeight;
  }

  window.submitStage12QA = async function() {
    const input = document.getElementById('stage12Input');
    const q = input.value.trim();
    if (!q) return;
    const cur = getCurrentGua();
    if (!cur) return;

    const quoteEl = document.getElementById('selectionQuoteBox');
    const quoteText = quoteEl.style.display !== 'none' ? quoteEl.innerText.replace('【所选文段】：', '').replace(/[“”]/g, '').trim() : '';

    input.value = '';
    const answer = `【易道导师解密·${cur.title}】：\n古圣先贤作易，主在“因时顺理”。关于您的提问，本卦重在审察时位顺逆与阴阳盛衰之机。切忌孤立执拗于一爻之象，当以全卦主旨为纲，谨行敬身，动合中道。`;

    if (window.LearningVault) {
      window.LearningVault.appendQA(cur.id, {
        quote: quoteText,
        question: q,
        answer: answer
      });
    }
    renderStage12History();
  };
'''

with open(target, 'a', encoding='utf-8') as f:
    f.write(part2)

print("Part 2 追加成功！")
