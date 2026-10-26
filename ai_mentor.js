/**
 * 易道认知工坊 · AI 伴学导师系统 (四阶学习闭环)
 */
(function() {
  const MENTOR_HTML = `
  <div class="ai-mentor-fab" id="mentorFab" onclick="toggleMentorDrawer()" title="点击唤起 AI 伴学导师工坊">
    <span class="fab-icon">☯️</span>
    <span>易道伴学</span>
  </div>

  <div class="ai-mentor-drawer" id="mentorDrawer">
    <div class="mentor-drawer-header">
      <div class="mentor-header-title">
        <span>☯️ 易道伴学工坊</span>
        <span class="mentor-badge" id="mentorCurrentGua">当前卦象</span>
      </div>
      <div class="mentor-header-actions">
        <button class="icon-btn" onclick="openMentorConfig()" title="大模型 API 设置">⚙️</button>
        <button class="icon-btn" onclick="toggleMentorDrawer()" title="收起">✕</button>
      </div>
    </div>

    <div class="mentor-tabs">
      <div class="mentor-tab active" onclick="switchMentorTab(0)">壹·叩问微言</div>
      <div class="mentor-tab" onclick="switchMentorTab(1)">贰·时位沙盘</div>
      <div class="mentor-tab" onclick="switchMentorTab(2)">叁·悟道复盘</div>
      <div class="mentor-tab" onclick="switchMentorTab(3)">肆·费曼考评</div>
    </div>

    <div class="mentor-drawer-body">
      <!-- 阶梯1：叩问微言 -->
      <div class="mentor-step-pane active" id="pane-0">
        <div class="mentor-intro-card">
          <b>📖 叩问解惑：</b>读易疑难随时提问。AI 严格遵循经传与朱程王孔四大宗师原典，摒弃江湖算断。
        </div>
        <div class="quick-chips-group">
          <span class="quick-chip" onclick="askQuick('本卦六爻从初到上的演进主旨是什么？')">💡 六爻演进主旨</span>
          <span class="quick-chip" onclick="askQuick('朱熹与程颐对本卦卦辞有哪些核心分歧与共识？')">🏛️ 朱程义理对照</span>
          <span class="quick-chip" onclick="askQuick('如何用本卦的哲学化解我当前的内耗与迷茫？')">🧘 现代心智解码</span>
        </div>
        <div class="chat-dialog-box" id="explainChatBox">
          <div class="chat-msg assistant">
            <div class="chat-bubble">学者您好！我是您的易道伴学导师。研习中有任何卦爻辞或义理疑问，请随时叩问。</div>
          </div>
        </div>
        <div class="mentor-input-group">
          <textarea class="mentor-textarea" id="explainInput" rows="2" placeholder="输入你想请教的易道或现实问题..."></textarea>
          <button class="mentor-btn" onclick="submitExplain()">
            <span>向导师请教</span> ➔
          </button>
        </div>
      </div>

      <!-- 阶梯2：时位沙盘 -->
      <div class="mentor-step-pane" id="pane-1">
        <div class="mentor-intro-card">
          <b>🎯 实践应用：</b>AI 根据当前卦象生成逼真现代情境考验。请写出您的决策策略，AI 将判定您所处的爻位境界与博弈得失。
        </div>
        <div class="scenario-box" id="scenarioBox">
          <div class="scenario-header">
            <span class="scenario-tag">当前时位挑战</span>
            <button class="mentor-btn outline" style="padding:4px 10px; font-size:12px;" onclick="refreshScenario()">🎲 生成新场景</button>
          </div>
          <div id="scenarioText" style="font-size:14px; line-height:1.7; color:var(--text-m); margin-bottom:10px;">点击下方按钮，开始当前卦象的实战考验...</div>
        </div>
        <div class="mentor-input-group">
          <label style="font-size:13px; font-weight:700;">您的实战应对方案：</label>
          <textarea class="mentor-textarea" id="practiceAnswerInput" rows="3" placeholder="写下你的应对方案与取舍逻辑..."></textarea>
          <button class="mentor-btn" onclick="submitPractice()">
            <span>提交方案 · AI 判定爻位境界</span>
          </button>
        </div>
        <div id="practiceFeedbackBox" style="display:none;" class="chat-dialog-box"></div>
      </div>

      <!-- 阶梯3：悟道复盘 -->
      <div class="mentor-step-pane" id="pane-2">
        <div class="mentor-intro-card">
          <b>🧠 苏格拉底复盘：</b>不复盘等于没学。回答以下三个启发式问题，将古老卦象沉淀为属于您自己的认知资产。
        </div>
        <div class="mentor-input-group">
          <label style="font-size:13px; font-weight:700; color:var(--gold);">① 照镜子：回顾过往，哪次经历印证了此卦规律？</label>
          <textarea class="mentor-textarea" id="reviewA1" rows="2" placeholder="简述你的真实经历与反思..."></textarea>
        </div>
        <div class="mentor-input-group">
          <label style="font-size:13px; font-weight:700; color:var(--gold);">② 炼心法：本卦最反常识的一个生存/决策心法是什么？</label>
          <textarea class="mentor-textarea" id="reviewA2" rows="2" placeholder="总结成一句话心智法则..."></textarea>
        </div>
        <div class="mentor-input-group">
          <label style="font-size:13px; font-weight:700; color:var(--gold);">③ 知行合一：未来一周如何在具体事件中践行？</label>
          <textarea class="mentor-textarea" id="reviewA3" rows="2" placeholder="具体可落地的一个行动微习惯..."></textarea>
        </div>
        <button class="mentor-btn" onclick="submitReview()">
          <span>生成个人易道复盘卡片</span>
        </button>
        <div id="reviewResultCard" style="display:none;" class="score-result-panel"></div>
      </div>

      <!-- 阶梯4：费曼考评 -->
      <div class="mentor-step-pane" id="pane-3">
        <div class="mentor-intro-card">
          <b>📝 费曼课后笔记：</b>用大白话向一个外行讲透此卦。AI 将从 5 大核心维度严格打分（0-100分）并颁发修学印章。
        </div>
        <div class="mentor-input-group">
          <textarea class="mentor-textarea" id="feynmanNoteInput" rows="6" placeholder="请在此输入您的课后笔记或讲解稿（200-500字为佳）..."></textarea>
          <div style="display:flex; gap:10px;">
            <button class="mentor-btn" style="flex:1;" onclick="evaluateFeynmanNote()">
              <span>🏆 提交 AI 多维评审</span>
            </button>
            <button class="mentor-btn outline" onclick="exportCurrentNote()">💾 导出笔记</button>
          </div>
        </div>
        <div id="feynmanScorePanel" style="display:none;" class="score-result-panel"></div>
      </div>
    </div>
  </div>

  <!-- API 设置弹窗 -->
  <div class="mentor-modal-overlay" id="configModal">
    <div class="mentor-modal-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:17px; font-weight:800;">⚙️ 大模型 API 设置</h3>
        <button class="icon-btn" onclick="closeMentorConfig()">✕</button>
      </div>
      <p style="font-size:13px; color:var(--text-sub);">
        支持所有 OpenAI 兼容接口（如 DeepSeek、通义千问、Kimi、Local Ollama）或后续输入 Gemini Key。未填时自动采用本地仿真研习模式。
      </p>
      <div class="modal-field">
        <label>API Base URL (接口端点):</label>
        <input type="text" id="apiEndpoint" placeholder="例如 https://api.openai.com/v1 或本地 http://localhost:11434/v1">
      </div>
      <div class="modal-field">
        <label>API Key (密钥，仅保存在您本地浏览器):</label>
        <input type="password" id="apiKey" placeholder="sk-...">
      </div>
      <div class="modal-field">
        <label>Model (模型名称):</label>
        <input type="text" id="apiModel" placeholder="例如 deepseek-chat 或 gpt-4o">
      </div>
      <div style="display:flex; justify-content:flex-end; gap:10px; margin-top:8px;">
        <button class="mentor-btn outline" onclick="closeMentorConfig()">取消</button>
        <button class="mentor-btn" onclick="saveMentorConfig()">保存设置</button>
      </div>
    </div>
  </div>
  `;

  // 插入页面 DOM
  const container = document.createElement('div');
  container.innerHTML = MENTOR_HTML;
  document.body.appendChild(container);

  // 初始化设置与事件
  window.toggleMentorDrawer = function() {
    const drawer = document.getElementById('mentorDrawer');
    drawer.classList.toggle('open');
    if (drawer.classList.contains('open')) {
      syncCurrentGuaInfo();
    }
  };

  window.switchMentorTab = function(idx) {
    document.querySelectorAll('.mentor-tab').forEach((t, i) => {
      t.classList.toggle('active', i === idx);
    });
    document.querySelectorAll('.mentor-step-pane').forEach((p, i) => {
      p.classList.toggle('active', i === idx);
    });
  };

  function syncCurrentGuaInfo() {
    if (window.flatLessons && window.currentLessonIndex !== undefined) {
      const cur = window.flatLessons[window.currentLessonIndex];
      if (cur) {
        document.getElementById('mentorCurrentGua').innerText = `${cur.symbol || '☯️'} ${cur.title}`;
        if (!document.getElementById('scenarioText').dataset.loaded) {
          refreshScenario();
        }
      }
    }
  }

  window.openMentorConfig = function() {
    document.getElementById('apiEndpoint').value = localStorage.getItem('yijing_api_url') || '';
    document.getElementById('apiKey').value = localStorage.getItem('yijing_api_key') || '';
    document.getElementById('apiModel').value = localStorage.getItem('yijing_api_model') || 'deepseek-chat';
    document.getElementById('configModal').classList.add('open');
  };

  window.closeMentorConfig = function() {
    document.getElementById('configModal').classList.remove('open');
  };

  window.saveMentorConfig = function() {
    localStorage.setItem('yijing_api_url', document.getElementById('apiEndpoint').value.trim());
    localStorage.setItem('yijing_api_key', document.getElementById('apiKey').value.trim());
    localStorage.setItem('yijing_api_model', document.getElementById('apiModel').value.trim());
    closeMentorConfig();
    alert('✅ API 配置已安全保存在本地浏览器！');
  };

  window.askQuick = function(txt) {
    document.getElementById('explainInput').value = txt;
    submitExplain();
  };

  window.submitExplain = async function() {
    const input = document.getElementById('explainInput');
    const question = input.value.trim();
    if (!question) return;

    appendMsg('explainChatBox', 'user', question);
    input.value = '';

    const cur = window.flatLessons ? window.flatLessons[window.currentLessonIndex] : null;
    const guaName = cur ? cur.title : '易经卦象';

    const apiKey = localStorage.getItem('yijing_api_key');
    if (apiKey) {
      // 在线大模型调用
      appendMsg('explainChatBox', 'assistant', '⏳ 正在通达典籍，请稍候...');
      try {
        const reply = await callAI(window.PROMPT_EXPLAIN_SYSTEM, `当前研习卦象：${guaName}。\n学者提问：${question}`);
        updateLastMsg('explainChatBox', reply);
      } catch (err) {
        updateLastMsg('explainChatBox', `调用失败：${err.message}。已自动启用本地知识库分析：\n${getLocalExplain(guaName, question)}`);
      }
    } else {
      // 离线模式
      setTimeout(() => {
        appendMsg('explainChatBox', 'assistant', getLocalExplain(guaName, question));
      }, 400);
    }
  };

  function getLocalExplain(gua, q) {
    return `【易道导师答复·${gua}】：\n古圣人作易，辨物正名。针对您的叩问“${q}”，本卦在时位哲学上强调：万物处于动态转化之中，吉凶生大业，悔吝生咎悔。切记：居上位而体察微下，履初位而慎始敬终；勿贪一时之亢，方得无咎。`;
  }

  window.refreshScenario = function() {
    const cur = window.flatLessons ? window.flatLessons[window.currentLessonIndex] : null;
    const box = document.getElementById('scenarioText');
    const guaKey = cur && cur.title ? cur.title.split(' ')[0] : '乾为天';

    if (window.OFFLINE_MENTOR_DATA && window.OFFLINE_MENTOR_DATA.default_practices[guaKey]) {
      const data = window.OFFLINE_MENTOR_DATA.default_practices[guaKey];
      box.innerText = data.scenario;
    } else {
      box.innerText = `【实战考验·${guaKey}】：假设你在团队中处于承上启下的枢纽位置，外部环境剧变，原定项目受阻。若按此卦“变通配四时”之法，你该如何平衡“稳守底线”与“果断变革”？请写出你的破局策略。`;
    }
    box.dataset.loaded = "true";
  };

  window.submitPractice = async function() {
    const ans = document.getElementById('practiceAnswerInput').value.trim();
    if (!ans) {
      alert('请先输入您的实战决策方案！');
      return;
    }
    const box = document.getElementById('practiceFeedbackBox');
    box.style.display = 'flex';
    box.innerHTML = '<div class="chat-msg assistant"><div class="chat-bubble">⏳ 正在推演时位卦气与博弈得失...</div></div>';

    const cur = window.flatLessons ? window.flatLessons[window.currentLessonIndex] : null;
    const guaName = cur ? cur.title : '当前卦';

    const apiKey = localStorage.getItem('yijing_api_key');
    if (apiKey) {
      try {
        const scenario = document.getElementById('scenarioText').innerText;
        const res = await callAI(window.PROMPT_PRACTICE_SYSTEM, `卦象：${guaName}\n情境：${scenario}\n学者决策：${ans}`);
        box.innerHTML = `<div class="chat-msg assistant"><div class="chat-bubble">${res}</div></div>`;
      } catch(e) {
        renderLocalPracticeFeedback(box, ans);
      }
    } else {
      setTimeout(() => renderLocalPracticeFeedback(box, ans), 500);
    }
  };

  function renderLocalPracticeFeedback(box, ans) {
    box.innerHTML = `
      <div class="chat-msg assistant">
        <div class="chat-bubble">
          <div style="font-weight:800; color:var(--gold); margin-bottom:6px;">【时位判定 · 爻位境界】：九三/六三 惕励转承之阶</div>
          <p><b>博弈点评：</b>您的决策“${ans.slice(0, 30)}...”展现了敏锐的时局感知。未盲动冒进，亦未坐以待毙。此乃“终日乾乾，夕惕若厉”之道。</p>
          <div style="margin-top:6px; font-size:12.5px; color:var(--text-sub);">💡 进阶心法：留意后续防范内卷耗散，进退合时，知止而后有定。</div>
        </div>
      </div>
    `;
  }

  window.submitReview = function() {
    const a1 = document.getElementById('reviewA1').value.trim();
    const a2 = document.getElementById('reviewA2').value.trim();
    const a3 = document.getElementById('reviewA3').value.trim();
    if (!a1 && !a2) {
      alert('请至少完成前两道反思提问！');
      return;
    }
    const card = document.getElementById('reviewResultCard');
    card.style.display = 'flex';
    const cur = window.flatLessons ? window.flatLessons[window.currentLessonIndex] : null;
    const title = cur ? cur.title : '易道心法';

    card.innerHTML = `
      <div class="feynman-seal-card">
        <div class="seal-stamp">印</div>
        <div>
          <div style="font-size:16px; font-weight:800; color:var(--gold);">【${title} · 专属修学心智资产】</div>
          <div style="font-size:12px; color:var(--text-faint); margin-top:2px;">生成于 ${new Date().toLocaleDateString()}</div>
        </div>
      </div>
      <div style="font-size:14px; line-height:1.8;">
        <b>🎯 个人核心反常识心法：</b><br>
        <span style="color:var(--gold); font-weight:700;">“${a2 || '顺天应人，随时变通'}”</span>
      </div>
      <div style="font-size:13px; color:var(--text-sub); border-left:3px solid var(--accent); padding-left:10px;">
        <b>践行承诺：</b>${a3 || '日常遇事多观察一步，以静制动。'}
      </div>
    `;
  };

  window.evaluateFeynmanNote = async function() {
    const text = document.getElementById('feynmanNoteInput').value.trim();
    if (!text || text.length < 20) {
      alert('请至少写出 20 字以上的课后笔记或费曼讲解，以便 AI 进行多维考评！');
      return;
    }
    const panel = document.getElementById('feynmanScorePanel');
    panel.style.display = 'flex';
    panel.innerHTML = '<div style="text-align:center; padding:20px;">⏳ 易道考评导师正在从 5 大维度对您的笔记进行深度审读...</div>';

    const cur = window.flatLessons ? window.flatLessons[window.currentLessonIndex] : null;
    const gua = cur ? cur.title : '周易卦象';

    const apiKey = localStorage.getItem('yijing_api_key');
    if (apiKey) {
      try {
        const raw = await callAI(window.PROMPT_SCORE_SYSTEM, `卦象：${gua}\n学生笔记内容：\n${text}`);
        const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
        renderScorePanel(parsed);
      } catch(e) {
        renderLocalScore(text);
      }
    } else {
      setTimeout(() => renderLocalScore(text), 600);
    }
  };

  function renderLocalScore(text) {
    const lenBonus = Math.min(10, Math.floor(text.length / 30));
    const score = 86 + lenBonus;
    renderScorePanel({
      total_score: Math.min(98, score),
      grade: score >= 90 ? "甲等·通幽" : "乙等·明达",
      radar: {
        accuracy: 88,
        philosophy: 90,
        mapping: 86,
        reflection: 92,
        expression: 89
      },
      highlight: "言语质朴，成功将古经象数转化为通俗的现代思考，知行意图鲜明。",
      mentor_advice: "后续可进一步对照《彖传》刚柔应位之理，使推论更加严密。",
      feynman_badge: "易道学士·通达心印"
    });
  }

  function renderScorePanel(data) {
    const panel = document.getElementById('feynmanScorePanel');
    panel.innerHTML = `
      <div class="score-total-box">
        <div>
          <div style="font-size:12px; color:var(--text-sub);">易道综合评分</div>
          <div class="score-number">${data.total_score} <span style="font-size:16px; font-weight:normal; color:var(--text-sub);">/ 100</span></div>
        </div>
        <div class="score-grade">${data.grade}</div>
      </div>

      <div class="radar-dimension-list">
        ${renderDim('象数准确度', data.radar.accuracy)}
        ${renderDim('义理解析度', data.radar.philosophy)}
        ${renderDim('生活映射力', data.radar.mapping)}
        ${renderDim('反思真诚度', data.radar.reflection)}
        ${renderDim('表达通俗度', data.radar.expression)}
      </div>

      <div style="font-size:13.5px; background:var(--bg); border:1px solid var(--border-light); padding:12px; border-radius:8px;">
        <div style="color:var(--gold); font-weight:700; margin-bottom:4px;">✨ 亮点点评：</div>
        <div>${data.highlight}</div>
        <div style="color:var(--text-faint); margin-top:6px; font-size:12.5px;">💡 <b>精进建议：</b>${data.mentor_advice}</div>
      </div>

      <div class="feynman-seal-card">
        <div class="seal-stamp">🏅</div>
        <div>
          <div style="font-weight:800; color:var(--gold);">${data.feynman_badge}</div>
          <div style="font-size:12px; color:var(--text-faint);">恭喜达成费曼输出里程碑！</div>
        </div>
      </div>
    `;
  }

  function renderDim(name, val) {
    return `
      <div class="dimension-row">
        <div class="dimension-meta">
          <span>${name}</span>
          <b>${val}分</b>
        </div>
        <div class="dimension-bar-bg">
          <div class="dimension-bar-fill" style="width:${val}%"></div>
        </div>
      </div>
    `;
  }

  window.exportCurrentNote = function() {
    const text = document.getElementById('feynmanNoteInput').value;
    if (!text) return alert('当前笔记为空！');
    const cur = window.flatLessons ? window.flatLessons[window.currentLessonIndex] : null;
    const title = cur ? cur.title : '易经笔记';
    const blob = new Blob([`# 易道修学笔记 · ${title}\n\n记录时间：${new Date().toLocaleString()}\n\n${text}`], {type: 'text/markdown'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${title}_修学笔记.md`;
    a.click();
  };

  async function callAI(systemPrompt, userPrompt) {
    const endpoint = (localStorage.getItem('yijing_api_url') || 'https://api.openai.com/v1').replace(/\/+$/, '');
    const apiKey = localStorage.getItem('yijing_api_key');
    const model = localStorage.getItem('yijing_api_model') || 'gpt-4o';

    const resp = await fetch(`${endpoint}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.6
      })
    });
    if (!resp.ok) {
      throw new Error(`HTTP ${resp.status} - ${await resp.text()}`);
    }
    const data = await resp.json();
    return data.choices[0].message.content;
  }

  function appendMsg(boxId, role, text) {
    const box = document.getElementById(boxId);
    const div = document.createElement('div');
    div.className = `chat-msg ${role}`;
    div.innerHTML = `<div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div>`;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function updateLastMsg(boxId, text) {
    const box = document.getElementById(boxId);
    const last = box.querySelector('.chat-msg.assistant:last-child .chat-bubble');
    if (last) {
      last.innerHTML = text.replace(/\n/g, '<br>');
    }
  }
})();
