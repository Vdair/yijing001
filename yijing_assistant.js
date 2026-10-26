/**
 * 易道认知工坊 · 东方现代精品助教系统 (Yijing Assistant)
 * 阶段一&二：AI 助教卡片伴读问答 + 划词轻气泡
 * 阶段三&四：底部悟道复盘 + 费曼通关认知骨架
 * 复习总览：修学复习册 (支持全部64卦档案回溯与导出)
 */
(function() {
  // 1. 创建右下角单一助教唤起球
  const trigger = document.createElement('div');
  trigger.className = 'yj-assistant-trigger';
  trigger.id = 'yjAssistantTrigger';
  trigger.innerHTML = `
    <div class="yj-avatar-mini">☯️</div>
    <span style="font-size:14px; font-weight:700;">易道助教</span>
  `;
  trigger.onclick = () => window.toggleAssistantPanel();
  document.body.appendChild(trigger);

  // 2. 划词点穴轻量气泡 (微型·不挡视线)
  const bubble = document.createElement('div');
  bubble.className = 'yj-selection-bubble';
  bubble.id = 'yjSelectionBubble';
  bubble.innerHTML = '<span>☯️ 问助教此句</span>';
  document.body.appendChild(bubble);

  // 3. 仿图4/图5：右侧精品伴学助教面板
  const panel = document.createElement('div');
  panel.className = 'yj-assistant-panel';
  panel.id = 'yjAssistantPanel';
  panel.innerHTML = `
    <!-- 助教卡片顶部头部 -->
    <div class="yj-panel-header">
      <div class="yj-coach-info">
        <div class="yj-coach-avatar">☯️</div>
        <div class="yj-coach-meta">
          <h3>玄微先生 · 易道助教</h3>
          <p>经传宗本 · 四大宗师义理陪练</p>
        </div>
      </div>
      <div class="yj-panel-tools">
        <button class="yj-tool-btn" onclick="clearCoachChat()" title="开启新话题">+ 新对话</button>
        <button class="yj-tool-btn" onclick="toggleAssistantPanel()" title="收起">✕</button>
      </div>
    </div>

    <!-- Tab 标签页 -->
    <div class="yj-panel-tabs">
      <div class="yj-tab-item active" id="tabChat" onclick="switchCoachTab('chat')">问答对话</div>
      <div class="yj-tab-item" id="tabNotes" onclick="switchCoachTab('notes')">本卦笔记</div>
    </div>

    <!-- 助教主体内容区 (仿图5) -->
    <div class="yj-panel-body" id="coachBodyChat">
      <h2 class="yj-welcome-title" id="coachWelcomeTitle">晚上好，今晚想弄懂什么？</h2>
      
      <!-- 针对当前卦象的经典启发提问卡簇 (对齐图4/图5) -->
      <div class="yj-prompts-list" id="coachPromptsList">
        <!-- 动态生成针对当前卦的高频启发问题 -->
      </div>

      <!-- 问答对话列表 -->
      <div class="yj-chat-container" id="coachChatContainer" style="display:none;"></div>
    </div>

    <!-- 本卦笔记历史列表 -->
    <div class="yj-panel-body" id="coachBodyNotes" style="display:none;">
      <div id="coachNotesContent"></div>
    </div>

    <!-- 底部带当前课时标示 + 输入栏 (对齐图4/图5) -->
    <div class="yj-panel-footer">
      <div class="yj-context-pill">
        <span>📄 已带上当前课时</span>
        <b id="coachContextGua" style="color:var(--gold);">《01 乾为天》</b>
      </div>
      <div class="yj-input-box">
        <textarea class="yj-input-field" id="coachInput" rows="1" placeholder="有什么不懂的，尽管问我..."></textarea>
        <button class="yj-send-btn" onclick="submitCoachQuestion()" title="发送">↑</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  // 划词监听：仅在面板未打开时才展示微气泡
  let curSelectedText = '';
  document.addEventListener('mouseup', function(e) {
    if (e.target.closest('#yjAssistantPanel') || e.target.closest('#yjSelectionBubble') || e.target.closest('#yjAssistantTrigger')) return;
    const sel = window.getSelection();
    const str = sel ? sel.toString().trim() : '';
    if (str && str.length >= 2) {
      curSelectedText = str;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      bubble.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
      bubble.style.top = (rect.top + window.scrollY) + 'px';
      bubble.style.display = 'flex';
    } else {
      bubble.style.display = 'none';
    }
  });

  bubble.addEventListener('click', function() {
    bubble.style.display = 'none';
    openPanelWithText(curSelectedText);
  });

  window.toggleAssistantPanel = function() {
    panel.classList.toggle('open');
    if (panel.classList.contains('open')) {
      syncCoachCurrentGua();
    }
  };

  function openPanelWithText(txt) {
    panel.classList.add('open');
    syncCoachCurrentGua();
    document.getElementById('coachInput').value = `请结合本卦义理，向我深度解读这句：“${txt}”`;
    document.getElementById('coachInput').focus();
  }

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

  // ==========================================================================
  // 底部两大独立阶段：悟道复盘 + 费曼通关认知骨架
  // ==========================================================================
  window.renderBottomAssistantStages = function() {
    const readerContent = document.getElementById('readerContent');
    if (!readerContent) return;

    const old = document.getElementById('yjStageCardWrap');
    if (old) old.remove();

    const cur = getCurrentLesson();
    if (!cur) return;

    const record = window.LearningVault ? window.LearningVault.getGuaRecord(cur.id) : { review: {}, feynman: { framework: {} } };
    const rev = record.review || {};
    const fey = record.feynman || { framework: {} };
    const fw = fey.framework || {};

    const wrap = document.createElement('div');
    wrap.className = 'yj-stage-card-wrap';
    wrap.id = 'yjStageCardWrap';
    wrap.innerHTML = `
      <!-- 阶段三：悟道复盘 -->
      <section class="yj-stage-card" id="stage3Card">
        <div class="yj-stage-header">
          <div>
            <span class="yj-stage-tag" style="background:var(--gold-light); color:var(--gold);">阶段三 · 悟道复盘</span>
            <h2>🧠 《${cur.title}》易道心智提炼与生命对齐</h2>
            <p>古圣人作易，“反身而诚”。读毕经传宗本与时位攻防，回答三问，将卦象凝练为属于您的个人认知算法。</p>
          </div>
          <button class="mentor-btn" onclick="saveStageReview()" style="padding:8px 16px; font-size:13.5px;">💾 保存复盘心得</button>
        </div>

        <div class="yj-review-grid">
          <div class="yj-review-item">
            <label>① 照镜子（生命印证）：回顾过往，你或身边哪次重大得失刚好踩准了本卦的顺逆节奏？</label>
            <textarea id="revQ1" rows="2" placeholder="在此写下切身经历的真实印证与得失反思...">${rev.q1 || ''}</textarea>
          </div>
          <div class="yj-review-item">
            <label>② 炼心法（认知跃迁）：如果总结一条关于本卦最“反常识”的现代处事心智底牌，会是什么？</label>
            <textarea id="revQ2" rows="2" placeholder="提炼出属于你的一句话核心心法法则...">${rev.q2 || ''}</textarea>
          </div>
          <div class="yj-review-item">
            <label>③ 知行合一（行动承诺）：在未来 7 天内，你将如何在某个具体的生活/工作微习惯中践行？</label>
            <textarea id="revQ3" rows="2" placeholder="写下可检验、可量化的具体行动微动作...">${rev.q3 || ''}</textarea>
          </div>
        </div>
        <div id="revSaveTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${rev.updated_at ? `上次保存时间：${rev.updated_at}` : '尚未保存复盘'}
        </div>
      </section>

      <!-- 阶段四：费曼通关骨架 -->
      <section class="yj-stage-card" id="stage4Card">
        <div class="yj-stage-header">
          <div>
            <span class="yj-stage-tag" style="background:var(--purple-light); color:var(--purple);">阶段四 · 费曼精研输出</span>
            <h2>📝 《${cur.title}》通关认知骨架与课后笔记</h2>
            <p>真正学会这一卦，必须穿透以下四大底层认知维度。详写笔记，系统将自动绑定并永久归档。</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="mentor-btn outline" onclick="fillAssistantTemplate()" style="padding:8px 14px; font-size:13px;">⚡ 一键注入骨架模板</button>
            <button class="mentor-btn" onclick="saveStageFeynman()" style="padding:8px 16px; font-size:13.5px;">🏆 提交保存笔记</button>
          </div>
        </div>

        <!-- 四维通关骨架网格 (卡片化) -->
        <div class="yj-framework-grid">
          <div class="yj-framework-box">
            <div class="yj-box-title">📌 1. 卦象时势核心判据</div>
            <div class="yj-box-desc">内外卦象数表征、当前所处大势（是龙困浅滩、日丽中天、还是险阻在前？）。</div>
            <textarea id="feyCoreTrend" placeholder="输入大势判断依据...">${fw.core_trend || ''}</textarea>
          </div>

          <div class="yj-framework-box">
            <div class="yj-box-title">⚡ 2. 核心爻变拐点攻防</div>
            <div class="yj-box-desc">哪一爻是吉凶转折关键枢纽？中正当位如何取舍？最凶险与最吉利之爻的攻防要诀。</div>
            <textarea id="feyKeyYao" placeholder="输入核心爻位转折攻防要诀...">${fw.key_yao_turn || ''}</textarea>
          </div>

          <div class="yj-framework-box">
            <div class="yj-box-title">🏢 3. 现实生活/商业案例映射</div>
            <div class="yj-box-desc">将古老卦象映射到现代商业竞争、团队管理或人际博弈中的典型推演。</div>
            <textarea id="feyRealCase" placeholder="输入真实场景演练...">${fw.real_case || ''}</textarea>
          </div>

          <div class="yj-framework-box">
            <div class="yj-box-title">🧘 4. 反常识易道心智底牌</div>
            <div class="yj-box-desc">颠覆直觉常态的一条深层心法（如：亢龙有悔为何不凶？潜伏如何不沦为躺平？）。</div>
            <textarea id="feyAntiCommon" placeholder="输入反常识底牌...">${fw.anti_common_rule || ''}</textarea>
          </div>
        </div>

        <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:14px; font-weight:800; color:var(--text-m);">📜 综合费曼自述全稿（用大白话向一个外行讲透此卦）：</label>
          <textarea id="feyFullText" class="mentor-textarea" rows="4" placeholder="在此用大白话向朋友通俗讲透这一卦的精髓...">${fey.full_text || ''}</textarea>
        </div>

        <div id="feySaveTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${fey.updated_at ? `上次保存时间：${fey.updated_at}` : '尚未保存笔记'}
        </div>
      </section>
    `;

    readerContent.appendChild(wrap);
  };

  window.saveStageReview = function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const q1 = document.getElementById('revQ1').value.trim();
    const q2 = document.getElementById('revQ2').value.trim();
    const q3 = document.getElementById('revQ3').value.trim();
    window.LearningVault.saveReview(cur.id, { q1, q2, q3 });
    document.getElementById('revSaveTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
    alert(`✅ 《${cur.title}》悟道复盘已成功归档并与本卦绑定！`);
  };

  window.fillAssistantTemplate = function() {
    const cur = getCurrentLesson();
    if (!cur) return;
    document.getElementById('feyCoreTrend').value = `【时势判据】本卦由${cur.upper || '上卦'}与${cur.lower || '下卦'}相叠，处于事物演进的典型关键周期。`;
    document.getElementById('feyKeyYao').value = `【关键拐点】六爻之中以九五/六五居中得正，三爻多凶危，需格外防范转折风险。`;
    document.getElementById('feyRealCase').value = `【实战案例】映射于当前团队项目或个人晋升转型中，需把握进退火候。`;
    document.getElementById('feyAntiCommon').value = `【反常识心法】不求一时之烈，而求周流不居、动合于时。`;
  };

  window.saveStageFeynman = function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const core_trend = document.getElementById('feyCoreTrend').value.trim();
    const key_yao_turn = document.getElementById('feyKeyYao').value.trim();
    const real_case = document.getElementById('feyRealCase').value.trim();
    const anti_common_rule = document.getElementById('feyAntiCommon').value.trim();
    const full_text = document.getElementById('feyFullText').value.trim();

    window.LearningVault.saveFeynman(cur.id, {
      framework: { core_trend, key_yao_turn, real_case, anti_common_rule },
      full_text: full_text
    });
    document.getElementById('feySaveTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
    alert(`🎉 《${cur.title}》费曼通关笔记已持久归档！可在修学复习册中随心温习。`);
  };

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

  function getFullLessonsList() {
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
