# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.js')

part2 = r'''
  // 获取当前正在研读的卦象信息
  function getCurrentLesson() {
    if (window.flatLessons && window.currentLessonIndex !== undefined) {
      return window.flatLessons[window.currentLessonIndex];
    }
    return null;
  }

  // 同步助教当前课时状态
  function syncCoachCurrentGua() {
    const cur = getCurrentLesson();
    if (!cur) return;
    document.getElementById('coachContextGua').innerText = `《${cur.symbol || '☯️'} ${cur.title}》`;
    document.getElementById('coachWelcomeTitle').innerText = `研读《${cur.title}》，想弄懂什么？`;

    // 动态生成贴合本卦的 5 大启发提问卡 (对齐图4/图5)
    const promptList = document.getElementById('coachPromptsList');
    const prompts = [
      `用一个现代职场或商业例子，向我解释《${cur.title}》的演进`,
      `《${cur.title}》里最核心、最具转折意义的爻位拐点是哪一个？`,
      `这一卦最容易被现代人误解或滥用的地方在哪里？`,
      `朱熹象占与程颐名理在《${cur.title}》上的核心共识是什么？`,
      `模拟实战决策：如果我当前正处于本卦局势，第一步该怎么做？`
    ];

    promptList.innerHTML = '';
    prompts.forEach(p => {
      const card = document.createElement('div');
      card.className = 'yj-prompt-card';
      card.innerText = p;
      card.onclick = () => {
        document.getElementById('coachInput').value = p;
        submitCoachQuestion();
      };
      promptList.appendChild(card);
    });

    renderCoachChatHistory();
  }

  window.clearCoachChat = function() {
    document.getElementById('coachChatContainer').style.display = 'none';
    document.getElementById('coachPromptsList').style.display = 'flex';
    document.getElementById('coachWelcomeTitle').style.display = 'block';
  };

  window.switchCoachTab = function(tab) {
    document.getElementById('tabChat').classList.toggle('active', tab === 'chat');
    document.getElementById('tabNotes').classList.toggle('active', tab === 'notes');
    document.getElementById('coachBodyChat').style.display = tab === 'chat' ? 'flex' : 'none';
    document.getElementById('coachBodyNotes').style.display = tab === 'notes' ? 'flex' : 'none';
    if (tab === 'notes') renderCoachNotes();
  };

  function renderCoachNotes() {
    const cur = getCurrentLesson();
    const box = document.getElementById('coachNotesContent');
    if (!cur || !window.LearningVault) return;
    const rec = window.LearningVault.getGuaRecord(cur.id);
    const rev = rec.review || {};
    const fey = rec.feynman || {};
    const fw = fey.framework || {};

    box.innerHTML = `
      <div style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:14px;">
        <div style="font-weight:800; color:var(--gold); margin-bottom:6px;">🧠 悟道复盘心法：</div>
        <div style="font-size:13.5px; color:var(--text-m); line-height:1.6;">${rev.q2 || '（本卦底部尚未提交复盘心法）'}</div>
      </div>
      <div style="background:var(--card); border:1px solid var(--border); border-radius:12px; padding:16px;">
        <div style="font-weight:800; color:var(--purple); margin-bottom:6px;">📝 费曼通关笔记概览：</div>
        <div style="font-size:13px; color:var(--text-sub); line-height:1.6;">
          <b>时势判据：</b>${fw.core_trend || '待录入'}<br>
          <b>关键拐点：</b>${fw.key_yao_turn || '待录入'}<br>
          <b>反常识心法：</b>${fw.anti_common_rule || '待录入'}
        </div>
      </div>
    `;
  }

  function renderCoachChatHistory() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const rec = window.LearningVault.getGuaRecord(cur.id);
    const chatBox = document.getElementById('coachChatContainer');
    chatBox.innerHTML = '';

    if (rec.qa_history && rec.qa_history.length > 0) {
      document.getElementById('coachPromptsList').style.display = 'none';
      document.getElementById('coachWelcomeTitle').style.display = 'none';
      chatBox.style.display = 'flex';

      rec.qa_history.forEach(item => {
        chatBox.innerHTML += `
          <div class="yj-msg-bubble yj-msg-user">${item.question}</div>
          <div class="yj-msg-bubble yj-msg-ai">
            <div style="font-size:11.5px; font-weight:800; color:var(--gold); margin-bottom:4px;">☯️ 玄微助教 · 义理点拨</div>
            <div>${item.answer.replace(/\n/g, '<br>')}</div>
          </div>
        `;
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    }
  }

  window.submitCoachQuestion = function() {
    const input = document.getElementById('coachInput');
    const q = input.value.trim();
    if (!q) return;
    const cur = getCurrentLesson();
    if (!cur) return;

    input.value = '';
    document.getElementById('coachPromptsList').style.display = 'none';
    document.getElementById('coachWelcomeTitle').style.display = 'none';
    const chatBox = document.getElementById('coachChatContainer');
    chatBox.style.display = 'flex';

    chatBox.innerHTML += `<div class="yj-msg-bubble yj-msg-user">${q}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    // 严谨学术风助教回答
    const answer = `【经传义理宗本·${cur.title}】：\n研易之要，在于明体达用。针对您的叩问，本卦揭示的核心在于主客时位的辩证转化：处顺境不可骄逸（亢龙之诫），居坎阻当明贞定（险不失信）。不取江湖妄断之语，当以修己应务为实。`;

    setTimeout(() => {
      chatBox.innerHTML += `
        <div class="yj-msg-bubble yj-msg-ai">
          <div style="font-size:11.5px; font-weight:800; color:var(--gold); margin-bottom:4px;">☯️ 玄微助教 · 义理点拨</div>
          <div>${answer.replace(/\n/g, '<br>')}</div>
        </div>
      `;
      chatBox.scrollTop = chatBox.scrollHeight;
      if (window.LearningVault) {
        window.LearningVault.appendQA(cur.id, { question: q, answer: answer });
      }
    }, 300);
  };
'''

with open(target, 'a', encoding='utf-8') as f:
    f.write(part2)

print("yijing_assistant.js Part 2 追加成功！")
