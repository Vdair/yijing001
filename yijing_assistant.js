/**
 * 易道认知工坊 · 东方现代精品助教系统 & 专属修学档案库 (Yijing Assistant & Vault)
 * 严格与当前卦象绑定，仅包含四大核心来源：
 * （1）对话问答：按对话维度存储提问与助教解答
 * （2）课时笔记：针对该卦象的心得笔记与增删改查
 * （3）悟道复盘：易道心智提炼（生命印证/反常识心法/知行合一）
 * （4）费曼输出：四维通关认知骨架与通俗自述全稿
 */

(function() {
  let activeVaultGuaId = null;
  let activeVaultTab = 'dialogues'; // dialogues | notes | review | feynman

  // 全局通用文本框高度自适应核心函数 (支持文字删除精准回缩、单行还原、超限滚动)
  window.adjustTextareaHeight = function(el, maxHeight = 120) {
    if (!el) return;
    const minH = 28;
    if (!el.value || !el.value.trim()) {
      el.style.height = minH + 'px';
      el.style.overflowY = 'hidden';
      return;
    }
    // 强制先坍缩至 0px，彻底清除上一帧残留高度，准确计算删除文字后最新的 scrollHeight
    el.style.height = '0px';
    const scrollH = el.scrollHeight;
    const targetH = Math.max(minH, scrollH);
    if (targetH > maxHeight) {
      el.style.height = maxHeight + 'px';
      el.style.overflowY = 'auto';
    } else {
      el.style.height = targetH + 'px';
      el.style.overflowY = 'hidden';
    }
  };

  // 获取当前正文研习课时 (6层多维度安全兜底，确保永不返回 null)
  function getCurrentLesson() {
    // 1. 优先读取全局显式绑定的 currentLesson
    if (window.currentLesson) return window.currentLesson;

    // 2. 读取全局 flatLessons 与当前索引
    if (window.flatLessons && window.flatLessons.length > 0) {
      if (typeof window.currentLessonIndex === 'number' && window.flatLessons[window.currentLessonIndex]) {
        return window.flatLessons[window.currentLessonIndex];
      }
    }

    // 3. 从 DOM 探测当前高亮的课程项 id
    try {
      const activeItem = document.querySelector('.lesson-item.active');
      if (activeItem && activeItem.getAttribute('data-id')) {
        const activeId = activeItem.getAttribute('data-id');
        const all = getFullLessonsList();
        const found = all.find(l => l.id === activeId);
        if (found) return found;
      }
    } catch(e) {}

    // 4. 从 localStorage 尝试读取上次研习索引
    try {
      const lastIdx = localStorage.getItem('yijing_last_idx');
      const all = getFullLessonsList();
      if (lastIdx !== null && all && all[parseInt(lastIdx, 10)]) {
        return all[parseInt(lastIdx, 10)];
      }
    } catch(e) {}

    // 5. 从全部课时中返回乾卦或第 1 课
    const full = getFullLessonsList();
    if (full && full.length > 0) {
      const qian = full.find(l => l.id === 'lesson-01_乾为天') || full[0];
      return qian;
    }

    // 6. 虚拟兜底对象，保证绝不返回 null
    return {
      id: 'lesson-01_乾为天',
      title: '乾为天',
      navTitle: '第 01 卦 · 乾为天',
      lines: [1, 1, 1, 1, 1, 1],
      binary: '111111'
    };
  }

  // 获取全部课时列表
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

  // ==========================================================================
  // 1. 浮动助教唤起球与划词点穴轻量气泡
  // ==========================================================================
  const trigger = document.createElement('div');
  trigger.className = 'yj-assistant-trigger';
  trigger.id = 'yjAssistantTrigger';
  trigger.innerHTML = `
    <div class="yj-avatar-mini">☯️</div>
    <span style="font-size:14px; font-weight:700;">易道助教</span>
  `;
  trigger.onclick = () => window.toggleAssistantPanel();
  document.body.appendChild(trigger);

  const bubble = document.createElement('div');
  bubble.className = 'yj-selection-bubble';
  bubble.id = 'yjSelectionBubble';
  bubble.innerHTML = `
    <button class="yj-bubble-action" id="bubbleBtnAsk" title="向玄微助教请教本句">
      <span>💬 问助教</span>
    </button>
    <div class="yj-bubble-divider"></div>
    <button class="yj-bubble-action" id="bubbleBtnNote" title="将划线内容一键存入本卦笔记">
      <span>📝 记笔记</span>
    </button>
    <div class="yj-bubble-divider"></div>
    <button class="yj-bubble-action" id="bubbleBtnCopy" title="复制选中文本">
      <span id="bubbleCopyLabel">📋 复制</span>
    </button>
  `;
  document.body.appendChild(bubble);

  let currentSelectedText = '';

  // 划词操作事件绑定
  document.getElementById('bubbleBtnAsk').onclick = (e) => {
    e.stopPropagation();
    bubble.style.display = 'none';
    if (currentSelectedText) {
      window.openAssistantWithQuery(`请结合本卦时位义理，精要解析这句经文：“${currentSelectedText}”`, false);
    }
  };

  document.getElementById('bubbleBtnNote').onclick = (e) => {
    e.stopPropagation();
    bubble.style.display = 'none';
    const textToRecord = currentSelectedText;
    if (textToRecord) {
      // 打开本卦档案的笔记面板并预填
      window.openVaultModal('notes');
      setTimeout(() => {
        window.showAddNoteModal();
        const tInput = document.getElementById('newNoteTitle');
        const cInput = document.getElementById('newNoteContent');
        if (tInput) tInput.value = `研读摘录 · ${textToRecord.slice(0, 16)}...`;
        if (cInput) {
          cInput.value = `【经文/爻辞摘录】：\n“${textToRecord}”\n\n【我的体悟】：\n`;
          cInput.focus();
          cInput.setSelectionRange(cInput.value.length, cInput.value.length);
        }
      }, 100);
    }
  };

  document.getElementById('bubbleBtnCopy').onclick = (e) => {
    e.stopPropagation();
    if (!currentSelectedText) return;
    const copyLabel = document.getElementById('bubbleCopyLabel');
    const text = currentSelectedText;

    const doSuccess = () => {
      copyLabel.innerHTML = '✓ 已复制';
      setTimeout(() => {
        bubble.style.display = 'none';
        copyLabel.innerHTML = '📋 复制';
      }, 700);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(doSuccess).catch(() => {
        fallbackCopy(text);
        doSuccess();
      });
    } else {
      fallbackCopy(text);
      doSuccess();
    }
  };

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch(e) {}
    ta.remove();
  }

  // 划词监听
  document.addEventListener('mouseup', function(e) {
    // 如果点击在气泡内部，不重新计算
    if (bubble.contains(e.target)) return;

    setTimeout(() => {
      const selection = window.getSelection();
      const text = selection ? selection.toString().trim() : '';

      if (text.length >= 2 && text.length <= 350) {
        currentSelectedText = text;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // 避免在视口外显示
        const left = Math.max(120, Math.min(window.innerWidth - 120, rect.left + rect.width / 2));
        const top = rect.top + window.scrollY - 10;

        bubble.style.left = `${left}px`;
        bubble.style.top = `${top}px`;
        bubble.style.display = 'flex';
      } else {
        bubble.style.display = 'none';
        currentSelectedText = '';
      }
    }, 80);
  });

  // 页面滚动或点击空白时自动隐藏气泡
  window.addEventListener('scroll', function() {
    if (bubble.style.display === 'flex') {
      bubble.style.display = 'none';
    }
  }, { passive: true });

  document.addEventListener('mousedown', function(e) {
    if (!bubble.contains(e.target)) {
      bubble.style.display = 'none';
    }
  });

  // ==========================================================================
  // 2. 右侧伴学助教面板 (轻量问答与快捷引导)
  // ==========================================================================
  const panel = document.createElement('div');
  panel.className = 'yj-assistant-panel';
  panel.id = 'yjAssistantPanel';
  panel.innerHTML = `
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

    <div class="yj-panel-tabs">
      <div class="yj-tab-item active" id="tabChat" onclick="switchCoachTab('chat')">问答对话</div>
      <div class="yj-tab-item" id="tabNotes" onclick="openVaultModal('notes')">📜 本卦修学档案 ↗</div>
    </div>

    <div class="yj-panel-body" id="coachBodyChat">
      <h2 class="yj-welcome-title" id="coachWelcomeTitle">小友 今天想了解些什么呢？</h2>
      <div class="yj-prompts-list" id="coachPromptsList"></div>
      <div class="yj-chat-container" id="coachChatContainer" style="display:none;"></div>
    </div>

    <div class="yj-panel-footer">
      <div class="yj-input-wrapper">
        <textarea id="coachInput" rows="1" placeholder="向玄微助教请教本卦微言大义... (Enter 发送，Shift+Enter 换行)"></textarea>
        <button class="yj-send-btn" id="coachSendBtn" onclick="submitCoachQuestion()">发问</button>
      </div>
    </div>
  `;
  document.body.appendChild(panel);

  window.toggleAssistantPanel = function() {
    const p = document.getElementById('yjAssistantPanel');
    if (!p) return;
    p.classList.toggle('open');
    if (p.classList.contains('open')) {
      syncCoachCurrentGua();
    }
  };

  window.openAssistantWithQuery = function(q, autoSubmit = false) {
    const p = document.getElementById('yjAssistantPanel');
    if (p && !p.classList.contains('open')) {
      p.classList.add('open');
    }
    syncCoachCurrentGua();
    const input = document.getElementById('coachInput');
    if (input) {
      input.value = q;
      // 立即自适应撑开高度，完整展现内容
      if (typeof window.adjustTextareaHeight === 'function') {
        window.adjustTextareaHeight(input, 120);
      }
      input.focus();
      try {
        input.setSelectionRange(input.value.length, input.value.length);
      } catch(e) {}

      if (autoSubmit) {
        window.submitCoachQuestion();
      }
    }
  };

  function syncCoachCurrentGua() {
    const cur = getCurrentLesson();
    if (!cur) return;

    const titleEl = document.getElementById('coachWelcomeTitle');
    if (titleEl) {
      titleEl.innerHTML = `
        <div style="font-size:18px; font-weight:800; color:var(--text-main); margin-bottom:6px; letter-spacing:0.5px;">小友 今天想了解些什么呢？</div>
        <div style="font-size:12px; color:var(--gold); font-weight:600; display:flex; align-items:center; gap:6px;">
          <span>研习《${cur.navTitle || cur.title}》</span>
          <span style="opacity:0.6;">·</span>
          <span>结合本卦时位启发叩问：</span>
        </div>
      `;
    }

    const pList = document.getElementById('coachPromptsList');
    if (pList) {
      let inquiries = [];
      if (window.YijingPromptSystem) {
        inquiries = window.YijingPromptSystem.getChapterPresetInquiries(cur);
      }
      if (!inquiries || inquiries.length === 0) {
        inquiries = [
          `请用一句话点透《${cur.title}》的底层时势矛盾与吉凶转折点。`,
          `在现代职场或商业博弈中，如何应用《${cur.title}》的核心攻防策略？`,
          `程颐与朱熹对《${cur.title}》的核心义理有什么最精彩的分歧与阐微？`
        ];
      }

      pList.innerHTML = inquiries.map((q, idx) => `
        <div class="yj-prompt-btn" onclick="openAssistantWithQuery('${escapeHtml(q).replace(/'/g, "\\'")}', true)">
          <span style="display:flex; align-items:flex-start; gap:8px;">
            <span style="color:var(--gold); font-weight:800; font-size:13px;">${idx + 1}.</span>
            <span style="line-height:1.45; font-size:13px;">${escapeHtml(q)}</span>
          </span>
          <span style="opacity:0.6; margin-left:6px; color:var(--gold);">→</span>
        </div>
      `).join('');
    }
    renderCoachChatHistory();
  }
  window.syncCoachCurrentGua = syncCoachCurrentGua;

  function renderCoachChatHistory() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const rec = window.LearningVault.getGuaRecord(cur.id, cur);
    const chatBox = document.getElementById('coachChatContainer');
    if (!chatBox) return;
    chatBox.innerHTML = '';

    if (rec.dialogues && rec.dialogues.length > 0) {
      document.getElementById('coachPromptsList').style.display = 'none';
      document.getElementById('coachWelcomeTitle').style.display = 'none';
      chatBox.style.display = 'flex';

      rec.dialogues.forEach(item => {
        chatBox.innerHTML += `
          <div class="yj-msg-bubble yj-msg-user">${item.question}</div>
          <div class="yj-msg-bubble yj-msg-ai">
            <div style="font-size:11.5px; font-weight:800; color:var(--gold); margin-bottom:4px;">☯️ 玄微先生 · 易道开示</div>
            <div>${item.answer.replace(/\n/g, '<br>')}</div>
          </div>
        `;
      });
      chatBox.scrollTop = chatBox.scrollHeight;
    } else {
      document.getElementById('coachPromptsList').style.display = 'flex';
      document.getElementById('coachWelcomeTitle').style.display = 'block';
      chatBox.style.display = 'none';
    }
  }

  window.clearCoachChat = function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    if (confirm(`确定清空《${cur.title}》的伴读问答记录吗？`)) {
      window.LearningVault.clearDialogues(cur.id);
      renderCoachChatHistory();
      renderVaultContent();
    }
  };

  // 辅助转义函数
  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // 展开/收起思维链
  window.toggleThinkingBox = function(boxId) {
    const box = document.getElementById(boxId);
    if (!box) return;
    const content = box.querySelector('.yj-thinking-content');
    if (!content) return;
    content.style.display = content.style.display === 'block' ? 'none' : 'block';
  };

  window.submitCoachQuestion = function() {
    const input = document.getElementById('coachInput');
    if (!input) return;
    const q = input.value.trim();
    if (!q) {
      input.focus();
      return;
    }
    const cur = getCurrentLesson() || {
      id: 'lesson-01_乾为天',
      title: '乾为天',
      navTitle: '第 01 卦 · 乾为天'
    };

    input.value = '';
    if (typeof window.adjustTextareaHeight === 'function') {
      window.adjustTextareaHeight(input, 120);
    } else {
      input.style.height = '24px';
      input.style.overflowY = 'hidden';
    }
    document.getElementById('coachPromptsList').style.display = 'none';
    document.getElementById('coachWelcomeTitle').style.display = 'none';
    const chatBox = document.getElementById('coachChatContainer');
    chatBox.style.display = 'flex';

    chatBox.innerHTML += `<div class="yj-msg-bubble yj-msg-user">${escapeHtml(q)}</div>`;
    chatBox.scrollTop = chatBox.scrollHeight;

    const thinkId = 'think_' + Date.now();
    const contentId = 'content_' + Date.now();

    chatBox.innerHTML += `
      <div class="yj-msg-bubble yj-msg-ai">
        <div style="font-size:11.5px; font-weight:800; color:var(--gold); margin-bottom:4px; display:flex; align-items:center; gap:6px;">
          <span>☯️ 玄微先生 · 易道开示</span>
        </div>
        <div class="yj-thinking-box" id="${thinkId}" style="display:none;">
          <div class="yj-thinking-toggle" onclick="toggleThinkingBox('${thinkId}')">
            <span>🧠 易道推演思考中...</span>
            <span style="font-size:10px;">▼</span>
          </div>
          <div class="yj-thinking-content"></div>
        </div>
        <div id="${contentId}" class="yj-typing-cursor"></div>
      </div>
    `;
    chatBox.scrollTop = chatBox.scrollHeight;

    const thinkBox = document.getElementById(thinkId);
    const thinkContent = thinkBox ? thinkBox.querySelector('.yj-thinking-content') : null;
    const contentBox = document.getElementById(contentId);

    // 主 Agent + 外接知识库 SSE 流式输出
    if (window.YijingAIService) {
      window.YijingAIService.answerQuestion({
        question: q,
        lessonMeta: cur,
        onReasoning: (chunk, fullReasoning) => {
          if (thinkBox && thinkContent) {
            thinkBox.style.display = 'flex';
            thinkContent.innerText = fullReasoning;
          }
        },
        onContent: (chunk, fullContent) => {
          if (contentBox) {
            contentBox.innerHTML = fullContent.replace(/\n/g, '<br>');
            chatBox.scrollTop = chatBox.scrollHeight;
          }
        },
        onDone: ({ content }) => {
          if (contentBox) contentBox.classList.remove('yj-typing-cursor');
          if (thinkBox) {
            const toggle = thinkBox.querySelector('.yj-thinking-toggle span');
            if (toggle) toggle.innerText = '🧠 易道推演过程 (点击展开)';
          }
          if (window.LearningVault) {
            window.LearningVault.appendDialogue(cur.id, q, content, cur);
            renderVaultContent();
          }
        },
        onError: (err) => {
          if (contentBox) {
            contentBox.classList.remove('yj-typing-cursor');
            contentBox.innerHTML = `<span style="color:var(--danger, #f85149); font-size:12px;">⚠️ 助教连线微恙，已为您切换宗师典籍直解：</span><br>${generateAiAnswer(cur, q).replace(/\n/g, '<br>')}`;
          }
        }
      });
    } else {
      setTimeout(() => {
        const answer = generateAiAnswer(cur, q);
        if (contentBox) {
          contentBox.classList.remove('yj-typing-cursor');
          contentBox.innerHTML = answer.replace(/\n/g, '<br>');
        }
        if (window.LearningVault) {
          window.LearningVault.appendDialogue(cur.id, q, answer, cur);
          renderVaultContent();
        }
      }, 300);
    }
  };

  function generateAiAnswer(lesson, question) {
    const title = lesson.title || '本卦';
    if (question.includes('职场') || question.includes('商业') || question.includes('实战')) {
      return `【经传实战阐微·${title}】：\n易道贵在随时变易。在现代管理与博弈中，本卦所训诫的重在识别“主客位势”。处优势当戒亢骄、藏锋蓄势（如潜龙、需候）；处逆境当辨几先、居险不移其信。切忌以主观期许硬碰客观大势，须明中正进退之道。`;
    } else if (question.includes('程颐') || question.includes('朱熹')) {
      return `【名家宗微比照·${title}】：\n伊川程颐重在以易言理，强调“人事与心德修养”，视本卦爻变为君子涉世之准绳；文公朱熹则兼取象数卜筮之原旨，主张“虚心以观象，因事而求理”。二儒相参，方见体用不二之妙。`;
    }
    return `【经传义理宗本·${title}】：\n研易之要，在于明体达用。针对您的叩问，本卦揭示的核心在于主客时位的辩证转化：处顺境不可骄逸（亢龙之诫），居坎阻当明贞定（险不失信）。不取江湖妄断之语，当以修己应务为实。`;
  }

  // ==========================================================================
  // 3. 模态框重构：专属修学档案库 (强绑定当前卦象四大核心来源)
  // ==========================================================================
  const vaultModalHtml = `
  <div class="yj-vault-overlay" id="yjVaultOverlay" onclick="if(event.target===this) closeVaultModal()">
    <div class="yj-vault-modal">
      <!-- 头部：当前绑定卦象信息 + 高级设计感操作按钮 -->
      <div class="yj-vault-header">
        <div class="yj-vault-badge-group">
          <div class="yj-vault-gua-icon" id="vaultGuaIcon">䷀</div>
          <div class="yj-vault-header-title">
            <div class="yj-vault-title-row">
              <span class="yj-vault-title-text" id="vaultGuaTitle">第 01 卦 · 乾为天</span>
              <span class="yj-vault-scope-tag">本卦专属修学档案</span>
            </div>
            <div class="yj-vault-desc-row">
              <span>当前研习章节</span>
              <span>·</span>
              <span>切换查看其他卦：</span>
              <select id="vaultGuaSelector" class="yj-gua-picker-select" onchange="switchVaultGua(this.value)">
                <!-- 动态填充 68 课 -->
              </select>
            </div>
          </div>
        </div>

        <div class="yj-vault-actions">
          <button class="yj-btn-outline" onclick="openMindMapModal()" style="border-color:#4caf50; color:#81c784;" title="查看 64 卦心智算法全息图谱">
            <span>🧠 决策图谱</span>
          </button>
          <button class="yj-btn-outline" onclick="openMasterCompendiumPrintView()" style="border-color:#9b59b6; color:#ba68c8;" title="汇编导出《我的周易认知手册》(典藏版)">
            <span>📚 认知手册</span>
          </button>
          <button class="yj-btn-gold" onclick="syncCurrentGuaToProject()" title="将本卦档案持久化写入项目 data/learning_vault/ 目录">
            <span>💾 保存并写入项目</span>
          </button>
          <button class="yj-btn-outline" onclick="exportCurrentGuaMarkdown()" title="导出本卦纯文本 Markdown 笔记本">
            <span>📥 导出本卦 (MD)</span>
          </button>
          <button class="yj-btn-close" onclick="closeVaultModal()" title="关闭弹窗">✕</button>
        </div>
      </div>

      <!-- 四大专属来源导航 Tab -->
      <div class="yj-vault-tabs-bar">
        <div class="yj-vtab-item active" id="vtabDialogues" onclick="switchVaultTab('dialogues')">
          <span>💬 伴读对话</span>
          <span class="yj-vtab-count" id="countDialogues">0</span>
        </div>
        <div class="yj-vtab-item" id="vtabNotes" onclick="switchVaultTab('notes')">
          <span>📝 课时笔记</span>
          <span class="yj-vtab-count" id="countNotes">0</span>
        </div>
        <div class="yj-vtab-item" id="vtabReview" onclick="switchVaultTab('review')">
          <span>🧠 悟道复盘</span>
          <span class="yj-vtab-count" id="statusReview">待提炼</span>
        </div>
        <div class="yj-vtab-item" id="vtabFeynman" onclick="switchVaultTab('feynman')">
          <span>🏆 费曼输出</span>
          <span class="yj-vtab-count" id="statusFeynman">待通关</span>
        </div>
      </div>

      <!-- 主体内容工作区（仅包含这四个部分） -->
      <div class="yj-vault-body-content" id="vaultBodyContent">
        
        <!-- (1) 对话问答流 -->
        <div class="yj-vault-pane active" id="paneDialogues">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:13px; color:var(--text-sub);">按对话维度沉淀的师徒问答与义理点拨：</span>
            <button class="yj-tool-btn" onclick="clearCoachChat()">清空对话记录</button>
          </div>
          <div class="yj-dialogue-list" id="vaultDialogueList"></div>
          
          <!-- 弹窗内快速提问条 (内容高度自适应，上限限制可滑动) -->
          <div class="yj-input-wrapper" style="margin-top:10px;">
            <textarea id="vaultQuickQInput" rows="1" placeholder="在此快速向助教发问，对话将直接归档至本卦... (Enter 发送，Shift+Enter 换行)"></textarea>
            <button class="yj-send-btn" onclick="submitVaultQuickQuestion()">发问并归档</button>
          </div>
        </div>

        <!-- (2) 专属课时笔记 -->
        <div class="yj-vault-pane" id="paneNotes">
          <div class="yj-notes-topbar">
            <span style="font-size:13px; color:var(--text-sub);">针对本章节的心得随笔与爻象灵感批注：</span>
            <button class="yj-btn-gold" style="padding:6px 14px; font-size:12.5px;" onclick="showAddNoteModal()">+ 写新笔记</button>
          </div>

          <!-- 新建/编辑笔记折叠框 -->
          <div id="addNoteBox" style="display:none; background:var(--bg); border:1px solid var(--border); border-radius:12px; padding:16px; margin-bottom:14px; flex-direction:column; gap:10px;">
            <input type="text" id="newNoteTitle" placeholder="笔记主题（如：九三爻处世反思、乾卦大势总结）" style="width:100%; padding:8px 12px; border-radius:8px; border:1px solid var(--border); background:var(--card); color:var(--text-m); font-size:14px; outline:none; box-sizing:border-box;">
            <textarea id="newNoteContent" rows="4" placeholder="写下你的研习心得、灵感触动或实战感悟..." style="width:100%; padding:10px 12px; border-radius:8px; border:1px solid var(--border); background:var(--card); color:var(--text-m); font-size:13.5px; outline:none; resize:vertical; box-sizing:border-box;"></textarea>
            <div style="display:flex; justify-content:flex-end; gap:8px;">
              <button class="yj-tool-btn" onclick="document.getElementById('addNoteBox').style.display='none'">取消</button>
              <button class="yj-btn-gold" style="padding:6px 14px;" onclick="saveNewNote()">保存笔记</button>
            </div>
          </div>

          <div class="yj-notes-grid" id="vaultNotesGrid"></div>
        </div>

        <!-- (3) 悟道复盘 -->
        <div class="yj-vault-pane" id="paneReview">
          <div style="font-size:13px; color:var(--text-sub); margin-bottom:4px;">
            古圣人作易“反身而诚”。回答三问，将卦象凝练为属于您的个人处事心智算法：
          </div>
          
          <div class="yj-vault-inner-card">
            <div style="font-size:14px; font-weight:800; color:var(--gold);">① 照镜子（生命印证）</div>
            <div style="font-size:12.5px; color:var(--text-sub);">回顾过往，你或身边哪次重大得失刚好踩准了本卦的顺逆节奏？</div>
            <textarea id="vRevQ1" rows="3" placeholder="写下切身经历的真实印证与得失反思..."></textarea>
          </div>

          <div class="yj-vault-inner-card">
            <div style="font-size:14px; font-weight:800; color:var(--gold);">② 炼心法（认知跃迁）</div>
            <div style="font-size:12.5px; color:var(--text-sub);">如果总结一条关于本卦最“反常识”的现代处世心智底牌，会是什么？</div>
            <textarea id="vRevQ2" rows="3" placeholder="提炼出属于你的一句话核心心法法则..."></textarea>
          </div>

          <div class="yj-vault-inner-card">
            <div style="font-size:14px; font-weight:800; color:var(--gold);">③ 知行合一（行动承诺）</div>
            <div style="font-size:12.5px; color:var(--text-sub);">在未来 7 天内，你将如何在某个具体的生活/工作微动作中践行？</div>
            <textarea id="vRevQ3" rows="3" placeholder="写下可检验、可量化的具体践行微动作..."></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:8px;">
            <span id="vRevSaveStatus" style="font-size:12.5px; color:var(--text-faint);">尚未修改保存</span>
            <div style="display:flex; gap:10px;">
              <button class="yj-btn-outline" style="border-color:var(--gold); color:var(--gold); font-weight:700;" onclick="requestMasterAgentReviewAnalysis()">✨ 提请玄微先生 · 易道深度剖析</button>
              <button class="yj-btn-gold" onclick="saveVaultReview()">💾 保存悟道复盘</button>
            </div>
          </div>

          <!-- 玄微先生复盘深度学术点评卡片 -->
          <div class="yj-review-analysis-card" id="vRevAnalysisCard" style="display:none;">
            <div class="yj-analysis-header">
              <div class="yj-analysis-title">
                <span>☯️</span>
                <span>玄微先生 · 易道学术多维深度比对诊断</span>
              </div>
              <span id="vRevAnalysisTime" style="font-size:12px; color:var(--text-faint);"></span>
            </div>
            <div class="yj-analysis-body" id="vRevAnalysisContent"></div>
            <div class="yj-analysis-actions">
              <button class="yj-tool-btn" onclick="copyAnalysisContent()">📋 复制点评</button>
              <button class="yj-tool-btn" style="color:var(--gold); border-color:var(--gold);" onclick="openCoachFromReview()">💬 转向助教继续深谈</button>
            </div>
          </div>
        </div>

        <!-- (4) 费曼学习输出 -->
        <div class="yj-vault-pane" id="paneFeynman">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
            <span style="font-size:13px; color:var(--text-sub);">穿透四大底层认知维度，向一个外行讲透此卦：</span>
            <button class="yj-btn-outline" style="padding:5px 12px; font-size:12px;" onclick="fillVaultFeynmanTemplate()">⚡ 注入参考骨架模板</button>
          </div>

          <!-- 四维骨架 -->
          <div class="yj-framework-grid">
            <div class="yj-framework-box">
              <div class="yj-box-title">📌 1. 卦象时势核心判据</div>
              <div class="yj-box-desc">内外卦象数表征、当前所处大势（是龙困浅滩、还是如日中天？）。</div>
              <textarea id="vFeyCoreTrend" rows="3" placeholder="输入大势判断依据..."></textarea>
            </div>
            <div class="yj-framework-box">
              <div class="yj-box-title">⚡ 2. 核心爻变拐点攻防</div>
              <div class="yj-box-desc">哪一爻是吉凶转折关键枢纽？最凶险与最吉利之爻的攻防要诀。</div>
              <textarea id="vFeyKeyYao" rows="3" placeholder="输入核心爻位转折攻防要诀..."></textarea>
            </div>
            <div class="yj-framework-box">
              <div class="yj-box-title">🏢 3. 现实生活/商业案例映射</div>
              <div class="yj-box-desc">将卦象映射到现代商业竞争、团队管理或人际博弈中的典型推演。</div>
              <textarea id="vFeyRealCase" rows="3" placeholder="输入真实场景演练..."></textarea>
            </div>
            <div class="yj-framework-box">
              <div class="yj-box-title">🧘 4. 反常识易道心智底牌</div>
              <div class="yj-box-desc">颠覆直觉常态的一条深层心法（如：亢龙有悔为何不凶？）。</div>
              <textarea id="vFeyAntiCommon" rows="3" placeholder="输入反常识心智底牌..."></textarea>
            </div>
          </div>

          <div class="yj-vault-inner-card" style="margin-top:12px;">
            <div style="font-size:14px; font-weight:800; color:var(--purple, #a855f7);">📜 综合费曼自述全稿（通俗易懂向外行讲透本卦）</div>
            <textarea id="vFeyFullText" rows="4" placeholder="在此用大白话向朋友通俗讲透这一卦的精髓与现代启示..."></textarea>
          </div>

          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; flex-wrap:wrap; gap:8px;">
            <span id="vFeySaveStatus" style="font-size:12.5px; color:var(--text-faint);">尚未修改保存</span>
            <div style="display:flex; gap:10px;">
              <button class="yj-btn-outline" style="border-color:var(--gold); color:var(--gold); font-weight:700;" onclick="requestMasterAgentReviewAnalysis()">✨ 提请玄微先生 · 结合费曼深入剖析</button>
              <button class="yj-btn-gold" onclick="saveVaultFeynman()">🏆 提交保存费曼通关笔记</button>
            </div>
          </div>
        </div>

      </div>

      <!-- 底部统计与状态栏 -->
      <div class="yj-vault-footer">
        <span id="vaultFooterStatus">☯️ 易道认知工坊 · 正在连接本地项目自动落盘服务...</span>
        <div style="display:flex; align-items:center; gap:8px;">
          <span id="vaultSyncBadge" style="font-size:12px; padding:3px 8px; border-radius:6px; background:var(--bg); border:1px solid var(--border); color:var(--gold); cursor:pointer;" onclick="testVaultSync()" title="点击检测本地项目落盘服务">🟡 检测服务</span>
          <button class="yj-tool-btn" onclick="syncCurrentGuaToProject()" style="border-color:var(--gold); color:var(--gold); font-size:12px;">💾 立即落盘</button>
        </div>
      </div>
    </div>
  </div>
  `;

  const vContainer = document.createElement('div');
  vContainer.innerHTML = vaultModalHtml;
  document.body.appendChild(vContainer);

  // 打开模态框（强绑定当前卦象）
  window.openVaultModal = function(defaultTab = 'dialogues') {
    const cur = getCurrentLesson();
    const curId = cur ? cur.id : 'lesson-01_乾为天';
    activeVaultGuaId = curId;
    activeVaultTab = defaultTab;

    populateGuaSelector(curId);
    renderVaultHeader();
    switchVaultTab(defaultTab);

    document.getElementById('yjVaultOverlay').classList.add('open');
  };

  window.closeVaultModal = function() {
    document.getElementById('yjVaultOverlay').classList.remove('open');
  };

  function populateGuaSelector(selectedId) {
    const sel = document.getElementById('vaultGuaSelector');
    if (!sel) return;
    sel.innerHTML = '';
    const lessons = getFullLessonsList();
    lessons.forEach(l => {
      const opt = document.createElement('option');
      opt.value = l.id;
      opt.innerText = `${l.symbol || '☯️'} ${l.title}`;
      if (l.id === selectedId) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  window.switchVaultGua = function(guaId) {
    activeVaultGuaId = guaId;
    renderVaultHeader();
    renderVaultContent();
  };

  function getGuaMetaById(guaId) {
    const lessons = getFullLessonsList();
    return lessons.find(l => l.id === guaId) || { id: guaId, title: guaId, symbol: '☯️' };
  }

  function renderVaultHeader() {
    const meta = getGuaMetaById(activeVaultGuaId);
    const titleEl = document.getElementById('vaultGuaTitle');
    const iconEl = document.getElementById('vaultGuaIcon');
    if (titleEl) titleEl.innerText = meta.title || activeVaultGuaId;
    if (iconEl) iconEl.innerText = meta.symbol || '☯️';
  }

  window.switchVaultTab = function(tabName) {
    activeVaultTab = tabName;
    ['dialogues', 'notes', 'review', 'feynman'].forEach(t => {
      const tabEl = document.getElementById('vtab' + capitalize(t));
      const paneEl = document.getElementById('pane' + capitalize(t));
      if (tabEl) tabEl.classList.toggle('active', t === tabName);
      if (paneEl) paneEl.classList.toggle('active', t === tabName);
    });
    renderVaultContent();
  };

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function renderVaultContent() {
    if (!activeVaultGuaId || !window.LearningVault) return;
    const meta = getGuaMetaById(activeVaultGuaId);
    const rec = window.LearningVault.getGuaRecord(activeVaultGuaId, meta);

    // 更新计数徽章
    const dCount = (rec.dialogues || []).length;
    const nCount = (rec.notes || []).length;
    const hasRev = rec.review && ((rec.review.items && rec.review.items.some(i => i.answer)) || rec.review.q1_mirror || rec.review.q2_mindset || rec.review.q3_action);
    const hasFey = rec.feynman && (rec.feynman.full_text || (rec.feynman.framework && rec.feynman.framework.core_trend));

    document.getElementById('countDialogues').innerText = dCount;
    document.getElementById('countNotes').innerText = nCount;
    document.getElementById('statusReview').innerText = hasRev ? '✓ 已复盘' : '待提炼';
    document.getElementById('statusFeynman').innerText = hasFey ? '✓ 已通关' : '待通关';

    // 1. 渲染对话问答流
    const dList = document.getElementById('vaultDialogueList');
    if (dList) {
      if (!rec.dialogues || rec.dialogues.length === 0) {
        dList.innerHTML = `
          <div class="yj-vault-empty">
            <div class="yj-vault-empty-icon">💬</div>
            <div style="font-weight:700;">《${meta.title}》尚无伴读问答记录</div>
            <div style="font-size:12.5px;">在下方快速发问，或在正文研习时随时唤起右下角玄微助教解惑。</div>
          </div>
        `;
      } else {
        dList.innerHTML = '';
        rec.dialogues.forEach((d, idx) => {
          dList.innerHTML += `
            <div class="yj-dialogue-card">
              <div class="yj-dialogue-q">
                <span style="color:var(--gold); font-size:16px;">👤</span>
                <div style="flex:1;">
                  <div style="font-size:11.5px; color:var(--text-faint); margin-bottom:2px;">问答 #${idx + 1} · ${d.timestamp}</div>
                  <div>${d.question}</div>
                </div>
              </div>
              <div class="yj-dialogue-a">
                <span style="font-size:16px;">☯️</span>
                <div style="flex:1;">
                  <div style="font-size:11.5px; font-weight:800; color:var(--gold); margin-bottom:4px;">玄微助教 · 义理点拨</div>
                  <div>${d.answer.replace(/\n/g, '<br>')}</div>
                </div>
              </div>
            </div>
          `;
        });
        dList.scrollTop = dList.scrollHeight;
      }
    }

    // 2. 渲染专属笔记流
    const nGrid = document.getElementById('vaultNotesGrid');
    if (nGrid) {
      if (!rec.notes || rec.notes.length === 0) {
        nGrid.innerHTML = `
          <div class="yj-vault-empty" style="grid-column: 1 / -1;">
            <div class="yj-vault-empty-icon">📝</div>
            <div style="font-weight:700;">《${meta.title}》尚未添加专属研习笔记</div>
            <div style="font-size:12.5px;">点击右上角「+ 写新笔记」记录当下爻象灵感与心得批注。</div>
          </div>
        `;
      } else {
        nGrid.innerHTML = '';
        rec.notes.forEach(note => {
          nGrid.innerHTML += `
            <div class="yj-note-card">
              <div class="yj-note-title">
                <span>${note.title || '随堂心得'}</span>
                <button class="icon-btn" onclick="deleteVaultNote('${note.id}')" title="删除笔记" style="color:var(--text-faint); font-size:14px;">🗑️</button>
              </div>
              <div class="yj-note-content">${note.content}</div>
              <div class="yj-note-footer">
                <span>🕒 ${note.timestamp}</span>
                <span style="color:var(--gold);">本卦笔记</span>
              </div>
            </div>
          `;
        });
      }
    }

    // 3. 渲染悟道复盘
    const rev = rec.review || {};
    if (rev.items && rev.items.length > 0) {
      document.getElementById('vRevQ1').value = rev.items[0] ? rev.items[0].answer : (rev.q1_mirror || '');
      document.getElementById('vRevQ2').value = rev.items[1] ? rev.items[1].answer : (rev.q2_mindset || '');
      document.getElementById('vRevQ3').value = rev.items[2] ? rev.items[2].answer : (rev.q3_action || '');
    } else {
      document.getElementById('vRevQ1').value = rev.q1_mirror || '';
      document.getElementById('vRevQ2').value = rev.q2_mindset || '';
      document.getElementById('vRevQ3').value = rev.q3_action || '';
    }
    document.getElementById('vRevSaveStatus').innerText = rev.updated_at ? `上次保存：${rev.updated_at}` : '尚未保存复盘';

    // 3.1 渲染玄微先生易道深度学术点评
    const analysisCard = document.getElementById('vRevAnalysisCard');
    const analysisBody = document.getElementById('vRevAnalysisContent');
    const analysisTime = document.getElementById('vRevAnalysisTime');
    if (analysisCard && analysisBody) {
      if (rev.ai_analysis && rev.ai_analysis.content) {
        analysisCard.style.display = 'flex';
        analysisBody.innerHTML = window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(rev.ai_analysis.content) : rev.ai_analysis.content.replace(/\n/g, '<br>');
        if (analysisTime) analysisTime.innerText = rev.ai_analysis.updated_at ? `剖析于 ${rev.ai_analysis.updated_at}` : '';
      } else {
        analysisCard.style.display = 'none';
        analysisBody.innerHTML = '';
      }
    }

    // 4. 渲染费曼输出
    const fey = rec.feynman || {};
    const fw = fey.framework || {};
    document.getElementById('vFeyCoreTrend').value = fw.core_trend || '';
    document.getElementById('vFeyKeyYao').value = fw.key_yao_turn || '';
    document.getElementById('vFeyRealCase').value = fw.real_case || '';
    document.getElementById('vFeyAntiCommon').value = fw.anti_common_rule || '';
    document.getElementById('vFeyFullText').value = fey.full_text || '';
    document.getElementById('vFeySaveStatus').innerText = fey.updated_at ? `上次保存：${fey.updated_at}` : '尚未通关';

    // 同步底部状态
    document.getElementById('vaultFooterStatus').innerText = `☯️ 《${meta.title}》档案库：${dCount} 轮对话 · ${nCount} 条笔记 · 复盘与费曼双向持久化中`;
  }

  window.submitVaultQuickQuestion = function() {
    const input = document.getElementById('vaultQuickQInput');
    const q = input.value.trim();
    if (!q || !activeVaultGuaId) return;
    const meta = getGuaMetaById(activeVaultGuaId);
    input.value = '';
    input.style.height = 'auto';
    input.style.overflowY = 'hidden';

    const dList = document.getElementById('vaultDialogueList');
    const emptyEl = dList ? dList.querySelector('.yj-vault-empty') : null;
    if (emptyEl) emptyEl.remove();

    const contentId = 'v_dlg_content_' + Date.now();
    if (dList) {
      dList.innerHTML += `
        <div class="yj-dialogue-card">
          <div class="yj-dialogue-q">
            <span style="color:var(--gold); font-size:16px;">👤</span>
            <div style="flex:1;">
              <div style="font-size:11.5px; color:var(--text-faint); margin-bottom:2px;">实时问答 · ${new Date().toLocaleTimeString()}</div>
              <div>${escapeHtml(q)}</div>
            </div>
          </div>
          <div class="yj-dialogue-a">
            <span style="font-size:16px;">☯️</span>
            <div style="flex:1;">
              <div style="font-size:11.5px; font-weight:800; color:var(--gold); margin-bottom:4px;">玄微先生 · 易道开示</div>
              <div id="${contentId}" class="yj-typing-cursor"></div>
            </div>
          </div>
        </div>
      `;
      dList.scrollTop = dList.scrollHeight;
    }

    const contentBox = document.getElementById(contentId);

    if (window.YijingAIService) {
      window.YijingAIService.answerQuestion({
        question: q,
        lessonMeta: meta,
        onContent: (chunk, fullContent) => {
          if (contentBox) {
            contentBox.innerHTML = fullContent.replace(/\n/g, '<br>');
            if (dList) dList.scrollTop = dList.scrollHeight;
          }
        },
        onDone: ({ content }) => {
          if (contentBox) contentBox.classList.remove('yj-typing-cursor');
          window.LearningVault.appendDialogue(activeVaultGuaId, q, content, meta);
          renderVaultContent();
        },
        onError: (err) => {
          if (contentBox) {
            contentBox.classList.remove('yj-typing-cursor');
            const fallback = generateAiAnswer(meta, q);
            contentBox.innerHTML = fallback.replace(/\n/g, '<br>');
            window.LearningVault.appendDialogue(activeVaultGuaId, q, fallback, meta);
            renderVaultContent();
          }
        }
      });
    } else {
      setTimeout(() => {
        const answer = generateAiAnswer(meta, q);
        if (contentBox) {
          contentBox.classList.remove('yj-typing-cursor');
          contentBox.innerHTML = answer.replace(/\n/g, '<br>');
        }
        window.LearningVault.appendDialogue(activeVaultGuaId, q, answer, meta);
        renderVaultContent();
      }, 300);
    }
  };

  // 笔记操作
  window.showAddNoteModal = function() {
    const box = document.getElementById('addNoteBox');
    box.style.display = box.style.display === 'none' ? 'flex' : 'none';
    if (box.style.display === 'flex') {
      document.getElementById('newNoteTitle').focus();
    }
  };

  window.saveNewNote = function() {
    const title = document.getElementById('newNoteTitle').value.trim();
    const content = document.getElementById('newNoteContent').value.trim();
    if (!content) {
      alert('请写下笔记内容再保存哦！');
      return;
    }
    const meta = getGuaMetaById(activeVaultGuaId);
    window.LearningVault.addNote(activeVaultGuaId, title, content, meta);
    document.getElementById('newNoteTitle').value = '';
    document.getElementById('newNoteContent').value = '';
    document.getElementById('addNoteBox').style.display = 'none';
    renderVaultContent();
  };

  window.deleteVaultNote = function(noteId) {
    if (confirm('确定删除这条笔记吗？')) {
      window.LearningVault.deleteNote(activeVaultGuaId, noteId);
      renderVaultContent();
    }
  };

  // 悟道复盘保存
  window.saveVaultReview = function() {
    if (!activeVaultGuaId) return;
    const q1 = document.getElementById('vRevQ1').value.trim();
    const q2 = document.getElementById('vRevQ2').value.trim();
    const q3 = document.getElementById('vRevQ3').value.trim();
    const meta = getGuaMetaById(activeVaultGuaId);

    const prevRec = window.LearningVault.getGuaRecord(activeVaultGuaId, meta);
    const prevItems = (prevRec.review && prevRec.review.items) ? [...prevRec.review.items] : [];
    if (prevItems.length > 0) {
      if (prevItems[0]) prevItems[0].answer = q1;
      if (prevItems[1]) prevItems[1].answer = q2;
      if (prevItems[2]) prevItems[2].answer = q3;
    }

    window.LearningVault.saveReview(activeVaultGuaId, {
      items: prevItems,
      q1_mirror: q1,
      q2_mindset: q2,
      q3_action: q3
    }, meta);

    // 同步到正文底部的复盘输入框
    const r0 = document.getElementById('revQ_0');
    const r1 = document.getElementById('revQ_1');
    const r2 = document.getElementById('revQ_2');
    if (r0) r0.value = q1;
    if (r1) r1.value = q2;
    if (r2) r2.value = q3;

    renderVaultContent();
    alert(`✅ 《${meta.title}》悟道复盘已成功归档并持久化！`);
  };

  // 费曼输出模版填充与保存
  window.fillVaultFeynmanTemplate = function() {
    const meta = getGuaMetaById(activeVaultGuaId);
    document.getElementById('vFeyCoreTrend').value = `【时势判据】${meta.title}处于事物演进的关键周期，内外卦相生相克，阴阳消长显明。`;
    document.getElementById('vFeyKeyYao').value = `【关键拐点】六爻之中以九五/六五居中得位，三爻居内外卦之际多凶危，需格外防范转折风险。`;
    document.getElementById('vFeyRealCase').value = `【实战案例】映射于当前团队项目博弈或个人关键成长决策中，把握进退火候，不急功近利。`;
    document.getElementById('vFeyAntiCommon').value = `【反常识心法】不求一时之烈，而求周流不居、动合于时、居安思危。`;
    document.getElementById('vFeyFullText').value = `用大白话来讲，《${meta.title}》告诉我们：任何事物的发展都有其内在节律，当处于顺境时不自傲，处于逆境时不丧志，抓住核心拐点顺势而为，方能转危为安。`;
  };

  window.saveVaultFeynman = function() {
    if (!activeVaultGuaId) return;
    const core_trend = document.getElementById('vFeyCoreTrend').value.trim();
    const key_yao_turn = document.getElementById('vFeyKeyYao').value.trim();
    const real_case = document.getElementById('vFeyRealCase').value.trim();
    const anti_common_rule = document.getElementById('vFeyAntiCommon').value.trim();
    const full_text = document.getElementById('vFeyFullText').value.trim();
    const meta = getGuaMetaById(activeVaultGuaId);

    window.LearningVault.saveFeynman(activeVaultGuaId, {
      framework: { core_trend, key_yao_turn, real_case, anti_common_rule },
      full_text: full_text
    }, meta);

    // 同步到正文底部费曼输入框
    const fc = document.getElementById('feyCoreTrend');
    const fk = document.getElementById('feyKeyYao');
    const fr = document.getElementById('feyRealCase');
    const fa = document.getElementById('feyAntiCommon');
    const ff = document.getElementById('feyFullText');
    if (fc) fc.value = core_trend;
    if (fk) fk.value = key_yao_turn;
    if (fr) fr.value = real_case;
    if (fa) fa.value = anti_common_rule;
    if (ff) ff.value = full_text;

    renderVaultContent();
    alert(`🎉 《${meta.title}》费曼通关笔记已持久归档！`);
  };

  // ==========================================================================
  // 主 Agent 玄微先生：悟道复盘与费曼输出深度易道剖析
  // ==========================================================================
  window.requestMasterAgentReviewAnalysis = async function() {
    if (!activeVaultGuaId) return;
    const meta = getGuaMetaById(activeVaultGuaId);

    // 1. 抓取当前表单数据
    const q1 = document.getElementById('vRevQ1').value.trim();
    const q2 = document.getElementById('vRevQ2').value.trim();
    const q3 = document.getElementById('vRevQ3').value.trim();

    const core_trend = document.getElementById('vFeyCoreTrend').value.trim();
    const key_yao_turn = document.getElementById('vFeyKeyYao').value.trim();
    const real_case = document.getElementById('vFeyRealCase').value.trim();
    const anti_common_rule = document.getElementById('vFeyAntiCommon').value.trim();
    const full_text = document.getElementById('vFeyFullText').value.trim();

    const hasAnyContent = q1 || q2 || q3 || core_trend || key_yao_turn || real_case || anti_common_rule || full_text;
    if (!hasAnyContent) {
      alert('请先在【悟道复盘】或【费曼通关】中写下至少一条心得感悟，玄微先生方能为您点穴辨正！');
      return;
    }

    // 自动切换到复盘标签以查看剖析卡片
    switchVaultTab('review');

    const card = document.getElementById('vRevAnalysisCard');
    const body = document.getElementById('vRevAnalysisContent');
    const timeEl = document.getElementById('vRevAnalysisTime');

    if (card && body) {
      card.style.display = 'flex';
      body.classList.add('yj-typing-cursor');
      body.innerHTML = '正在调取当前卦象全息经传原典与四大宗师阐微，玄微先生易道推演剖析中...';
      if (timeEl) timeEl.innerText = '正在生成点评...';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const reviewData = { q1_mirror: q1, q2_mindset: q2, q3_action: q3 };
    const feynmanData = {
      framework: { core_trend, key_yao_turn, real_case, anti_common_rule },
      full_text: full_text
    };

    if (window.YijingAIService) {
      try {
        await window.YijingAIService.analyzeReviewAndFeynman({
          lessonMeta: meta,
          reviewData,
          feynmanData,
          onContent: (chunk, fullContent) => {
            if (body) {
              body.innerHTML = window.formatMasterAnalysisHtml(fullContent);
            }
          },
          onDone: ({ content }) => {
            if (body) {
              body.classList.remove('yj-typing-cursor');
              body.innerHTML = window.formatMasterAnalysisHtml(content);
            }
            const nowTime = new Date().toLocaleString();
            if (timeEl) timeEl.innerText = `剖析于 ${nowTime}`;

            // 保存到档案
            window.LearningVault.saveReviewAnalysis(activeVaultGuaId, content, meta);
            // 同时在对话流记录一条互动
            window.LearningVault.appendDialogue(
              activeVaultGuaId,
              `【提请复盘深度剖析】研习《${meta.title}》专属反思与费曼自述`,
              content,
              meta
            );
            renderVaultContent();
          },
          onError: (err) => {
            if (body) {
              body.classList.remove('yj-typing-cursor');
              body.innerHTML = `<span style="color:var(--danger, #f85149);">⚠️ 宗师连线微恙，请检查网络或配置：${err.message || err}</span>`;
            }
          }
        });
      } catch (e) {
        if (body) body.classList.remove('yj-typing-cursor');
      }
    } else {
      setTimeout(() => {
        if (body) {
          body.classList.remove('yj-typing-cursor');
          const mock = `【玄微先生·易道学术多维诊断】：\n\n1. 🗣️【费曼大白话通俗度诊断】：\n【大白话脱水评级】：⭐⭐⭐⭐☆ 4.5/5.0\n能以通俗语言讲透大要，唯需注意将“得中得位”等词汇进一步转译为现代决策分寸。\n\n2. 💡【生活/商业比喻神似度辨正】：\n比喻形象贴切，能较好反映阴阳互动之妙，唯需注意不可执迷于物象本身。\n\n3. 🔍【爻位转折攻防与认知盲区】：\n极易在三爻处于转折交界时产生急躁浮动。\n\n4. 🎯【玄微点穴专属追问探针】：\n【玄微追问探针】：身处多方利益博弈漩涡中，你当如何在坚守底线的同时留出圆通余地？\n\n5. 📜【玄微知行箴言】：\n知进退存亡而不失其正者，其唯君子乎！`;
          body.innerHTML = window.formatMasterAnalysisHtml(mock);
          window.LearningVault.saveReviewAnalysis(activeVaultGuaId, mock, meta);
          renderVaultContent();
        }
      }, 500);
    }
  };

  window.copyAnalysisContent = function() {
    const body = document.getElementById('vRevAnalysisContent');
    if (!body || !body.innerText) return;
    navigator.clipboard.writeText(body.innerText).then(() => {
      alert('📋 玄微先生深度点评已复制到剪贴板！');
    }).catch(() => {
      alert('复制失败，请手动划选复制。');
    });
  };

  window.openCoachFromReview = function() {
    const meta = getGuaMetaById(activeVaultGuaId);
    closeVaultModal();
    openAssistantWithQuery(`针对您刚才对我在《${meta.title}》复盘中的点评，我想进一步请教：在接下来的知行践行中，我最该提防的隐蔽盲区是什么？`);
  };

  // 针对玄微点穴专属追问探针开启深度对答 (阶段三核心交互)
  window.askMasterAboutProbe = function(probeText) {
    const cur = getCurrentLesson();
    const title = cur ? cur.title : '当前卦';
    closeVaultModal();
    const query = `【针对玄微先生点穴追问】：先生在《${title}》费曼自述中指出的专属追问探针：“${probeText}”。我深入反思后的理解与困惑是：`;
    openAssistantWithQuery(query, false);
  };

  // 格式化玄微先生多维学术点评渲染视图 (阶段三：通俗度评级、比喻辨正、盲区探针卡片与箴言横幅)
  window.formatMasterAnalysisHtml = function(content) {
    if (!content) return '';
    let text = content;

    // 1. 提取【玄微追问探针】
    let probeHtml = '';
    const probeRegex = /(?:【玄微追问探针】|玄微追问探针)[：:]\s*([^\n\r<]+)/;
    const probeMatch = text.match(probeRegex);
    if (probeMatch && probeMatch[1]) {
      const probeClean = probeMatch[1].replace(/[*_`]/g, '').trim();
      const safeAttr = probeClean.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
      probeHtml = `
        <div class="yj-probe-card">
          <div class="yj-probe-header">
            <span class="yj-probe-title">🎯 玄微点穴专属追问探针</span>
            <span class="yj-probe-badge">认知深度跃迁</span>
          </div>
          <div class="yj-probe-content">“${escapeHtml(probeClean)}”</div>
          <button class="yj-probe-btn" onclick="window.askMasterAboutProbe('${safeAttr}')">
            💬 针对此追问即刻叩问玄微先生 ➔
          </button>
        </div>
      `;
    }

    // 2. 基础转义
    let safe = escapeHtml(text);

    // 3. 强调大白话脱水评级
    safe = safe.replace(/(【大白话脱水评级】[：:]?\s*)([^\n<]+)/g, '<span class="yj-feynman-score-tag">$1<strong>$2</strong></span>');

    // 4. 维度大标题样式
    safe = safe.replace(/(\d+[\.、]\s*【[^】]+】[：:]?)/g, '<div class="yj-analysis-dim-title">$1</div>');

    // 5. 知行箴言突出展示
    safe = safe.replace(/(【玄微知行箴言】[：:]?\s*)([^\n<]+)/g, '<div class="yj-motto-banner"><span class="yj-motto-tag">📜 知行箴言</span><div class="yj-motto-text">“$2”</div></div>');

    let html = safe.replace(/\n/g, '<br>');
    if (probeHtml) {
      html += probeHtml;
    }
    return html;
  };

  // 持久化写入项目文件 (双轨保障：优先无感落盘 + 离线另存兜底)
  window.syncCurrentGuaToProject = async function() {
    if (!activeVaultGuaId || !window.LearningVault) return;
    const meta = getGuaMetaById(activeVaultGuaId);
    const rec = window.LearningVault.getGuaRecord(activeVaultGuaId, meta);

    // 1. 优先调用本地落盘服务直接写入项目目录
    const syncRes = await window.LearningVault.syncToProjectFile(activeVaultGuaId, rec);
    if (syncRes && syncRes.success) {
      alert(`🟢 成功自动落盘！\n已将本卦档案与玄微先生点评实时写入项目磁盘：\n1. data/learning_vault/${activeVaultGuaId}.json\n2. data/learning_vault/${activeVaultGuaId}.md\n3. data/learning_vault/index.json`);
      renderVaultContent();
      return;
    }

    // 2. 服务离线时降级为浏览器文件另存
    const jsonStr = JSON.stringify(rec, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${activeVaultGuaId}.json`;
    a.click();
    alert(`💾 本卦档案 JSON 已下载！\n已自动生成标准结构文件【${activeVaultGuaId}.json】。\n提示：在终端执行 ./start_vault.sh 即可开启免下载秒级自动落盘！`);
  };

  // 导出 Markdown
  window.exportCurrentGuaMarkdown = function() {
    if (!activeVaultGuaId || !window.LearningVault) return;
    const meta = getGuaMetaById(activeVaultGuaId);
    const md = window.LearningVault.exportGuaMarkdown(activeVaultGuaId);
    const blob = new Blob([md], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${activeVaultGuaId}_修学档案.md`;
    a.click();
  };

  // 阶段二：周易上经前10卦与八纯卦标杆矩阵专属教学配置与费曼脚手架库
  const LESSON_CUSTOM_CONFIGS = {
  "p0-01": {
    "level": 1,
    "levelLabel": "认知筑基 · 启蒙级",
    "badgeClass": "level-1",
    "reviewCount": 2,
    "inlineCount": 5,
    "scenarioTitle": "向零基础朋友讲透底层世界观",
    "scenarioPrompt": "假想你的朋友完全没接触过《易经》，请用 3 分钟大白话向他讲明白《第一课 · 天地之象》的核心逻辑。严禁堆砌文言术语，必须用日常语言或生动生活比喻！",
    "coreHints": [
      "易经以“象、数、理、占”为四梁八柱，重在取象比类与顺应节律，绝非宿命论迷信。",
      "乾健（生生不息、刚中守正）与坤顺（厚德载物、含章可贞）为易经生化之母，阴阳互根。",
      "三才之道（天时、地利、人和）提醒我们：在客观现实与大势之间，找准属于人的主动抉择点。"
    ],
    "scaffolds": [
      {
        "title": "💡 生活具象比喻",
        "desc": "比如：把阴阳三才比作现代物理的二元能量与三维空间……",
        "insert": "【生活比喻】：比如用……来打比方，它就像……"
      },
      {
        "title": "🗣️ 核心大白话转译",
        "desc": "去掉古文术语，讲清楚最受用的 1 个底层思维认知",
        "insert": "【大白话核心】：抛开复杂术语，古人想告诉我们的其实是……"
      },
      {
        "title": "🔍 外行困惑排查",
        "desc": "如果朋友追问“这到底是不是算命迷信”，你如何破除误解？",
        "insert": "【外行盲区破除】：常人最大的误区在于……，但实际上它是……"
      }
    ]
  },
  "p0-02": {
    "level": 1,
    "levelLabel": "认知筑基 · 启蒙级",
    "badgeClass": "level-1",
    "reviewCount": 2,
    "inlineCount": 4,
    "scenarioTitle": "向合作伙伴讲透错综复杂的立体视角",
    "scenarioPrompt": "假想你正在处理一起多方利益冲突，请用大白话向伙伴讲透“错卦看底线、综卦换立场、互卦察暗流”的全息心法。",
    "coreHints": [
      "错卦（阴阳全反）是系统的对立面与潜藏底线；综卦（头脚颠倒）是对手眼中的第一视角。",
      "互卦揭示事态中间阶段不可见的暗流演化与核心动机。",
      "单一静态看问题必生执念，立体转动卦象才能看清全局博弈。"
    ],
    "scaffolds": [
      {
        "title": "💡 换位思考比喻",
        "desc": "类比无人机多机位巡检或旋转观察一个几何魔方……",
        "insert": "【立体视界比喻】：看一件事情就像看魔方，如果你只盯着自己这一面……"
      },
      {
        "title": "🗣️ 大白话决策锦囊",
        "desc": "讲透遇到分歧时如何用综卦瞬间换位思考",
        "insert": "【大白话核心锦囊】：当你搞不懂对手为什么抵触时，站在他的位置颠倒过来看……"
      },
      {
        "title": "🔍 盲区破除",
        "desc": "常人最容易陷在自己的主观得失里打转",
        "insert": "【常见盲区破除】：大部分人谈判破裂，是因为他们误以为自己的利益就是全宇宙的中心……"
      }
    ]
  },
  "p0-03": {
    "level": 1,
    "levelLabel": "认知筑基 · 启蒙级",
    "badgeClass": "level-1",
    "reviewCount": 2,
    "inlineCount": 4,
    "scenarioTitle": "向身边朋友讲透时位辩证与得中法则",
    "scenarioPrompt": "假想你的朋友正因为职务升降或面子纠结不已，请用 3 分钟大白话向他讲透“时位”与“得中远胜于得位”的心智解脱法则。",
    "coreHints": [
      "“吉凶悔吝生乎动”，行动的时机（时）与所处的位置（位）决定了事情的能量反馈。",
      "“得中”关乎分寸与内在定力，远胜于机械僵化的名分职务（得位）。",
      "邵雍“以物观物”：剥离自我的傲慢与偏见，客观顺应规律本身。"
    ],
    "scaffolds": [
      {
        "title": "💡 时位动态比喻",
        "desc": "类比高铁在不同路段的限速或冲浪选手等浪的时机……",
        "insert": "【时位比喻】：做事情就像冲浪，浪没来的时候你拼命划水只能累死……"
      },
      {
        "title": "🗣️ 大白话解脱锦囊",
        "desc": "讲明白为什么名头地位不重要、做对当下的分寸才重要",
        "insert": "【大白话核心锦囊】：虚名和职位都是外在空壳，真正决定胜负的是你有没有踩在节奏点上……"
      },
      {
        "title": "🔍 盲区自检",
        "desc": "身处逆位时怨天尤人、身处顺位时骄狂自满",
        "insert": "【心态盲区破除】：人在位置不好时最容易自怨自艾，但易经告诉我们守中就能逢凶化吉……"
      }
    ]
  },
  "p0-04": {
    "level": 1,
    "levelLabel": "认知筑基 · 启蒙级",
    "badgeClass": "level-1",
    "reviewCount": 2,
    "inlineCount": 4,
    "scenarioTitle": "向初学者厘清周易经传体系与义理精髓",
    "scenarioPrompt": "假想朋友问你：“读易经到底该看卦爻辞占卜，还是看孔子十翼义理？”请用 3 分钟大白话帮他建立清晰的研读知识脉络。",
    "coreHints": [
      "经（卦爻辞，伏羲文王周公）如骨架代码；传（十翼，孔子及后儒）如操作系统哲学解读。",
      "程颐义理（寻理推势）与朱熹象数（直观感应）体用一源，互为表里。",
      "破除玄虚：学易不是求神问卜，而是借古人建立的高维心智模型来反省与决策。"
    ],
    "scaffolds": [
      {
        "title": "💡 经传关系比喻",
        "desc": "把经比作底层物理定律或原始代码，把传比作文艺复兴的思想注解……",
        "insert": "【经传关系比喻】：周易的‘经’就像一套底层代码，而孔子的‘传’就像最好的使用手册……"
      },
      {
        "title": "🗣️ 大白话学习指引",
        "desc": "告诉外行普通人如何读懂易经而不掉坑",
        "insert": "【大白话核心建议】：初学者切记不要去死背占卜套路，抓住义理当中的处世心法……"
      },
      {
        "title": "🔍 伪科学误区破除",
        "desc": "破除江湖术士装神弄鬼的玄学障壁",
        "insert": "【打破玄学迷信】：江湖术士把它包装成宿命论，其实易经讲的是动态变化中的‘人定胜天’……"
      }
    ]
  },
  "lesson-01_乾为天": {
    "level": 2,
    "levelLabel": "乾健标杆 · 统领级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向职场/创业朋友讲透六龙驭天与防亢之道",
    "scenarioPrompt": "假想你的朋友刚取得一项重大业绩突破、正雄心勃勃准备大扩张，请用 3 分钟大白话向他讲透《乾为天》六龙递进的节奏感，重点提醒“潜蓄、夕惕与防亢”的底线。",
    "coreHints": [
      "“天行健，君子以自强不息”。刚健不仅是勇往直前，更是持久恒定的定力与内省。",
      "初九“潜龙勿用”是积蓄势能；九三“夕惕若厉”是跨界跃升期的最高戒备；九五“飞龙在天”需大人相助。",
      "上九“亢龙有悔，穷之灾也”：峰顶即是悬崖，学会主动让出聚光灯与利益，方能保合太和。"
    ],
    "scaffolds": [
      {
        "title": "💡 事业周期比喻",
        "desc": "把六爻比作一个产品从研发demo（潜龙）、内测发布（见龙）、破圈验证（夕惕）到市场霸主（飞龙）的周期……",
        "insert": "【生命周期打比方】：《乾为天》就像一家企业从地下车库做产品，到纳斯达克敲钟的完整六个台阶……"
      },
      {
        "title": "🗣️ 刚健避坑锦囊",
        "desc": "讲透为什么不能一味硬刚，以及适时低调的价值",
        "insert": "【大白话避坑锦囊】：真正的刚强不是跟谁都硬碰硬，而是在低谷忍得住寂寞、在巅峰懂得让利退后一步……"
      },
      {
        "title": "🔍 亢龙死穴自检",
        "desc": "警惕人在风光时最容易滋生的狂妄与失控",
        "insert": "【最致命的亢满死穴】：人最容易死在刚拿到融资或刚升职的高光期，以为全凭自己本事，听不进反面意见……"
      }
    ]
  },
  "lesson-02_坤为地": {
    "level": 2,
    "levelLabel": "坤顺标杆 · 承载级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向幕后中坚或二把手讲透厚德载物与含章可贞",
    "scenarioPrompt": "假想你的朋友担任团队二把手或核心后台支柱，因工作多被前台抢了风头而心生委屈、甚至想抢功夺权。请用 3 分钟大白话向他讲透《坤为地》的厚土承载法则与“含章”长生智慧。",
    "coreHints": [
      "“地势坤，君子以厚德载物”。坤道主顺承、包容，以无私托举成就万物生长。",
      "初六“履霜坚冰至”：见微知著，在最初细微的异常信号中体察系统性风险暗流。",
      "六三“含章可贞”是职场高阶修行，功成不必在我；上六“龙战于野”警告阴盛争阳必遭双输。"
    ],
    "scaffolds": [
      {
        "title": "💡 底层操作系统比喻",
        "desc": "把坤卦比作操作系统的内核或沃土，花草享受阳光，土壤提供养分……",
        "insert": "【生活角色打比方】：坤卦在现实中就像大地土壤或者电脑的底层操作系统，所有APP都在上面跑，你看不见它，但它支撑一切……"
      },
      {
        "title": "🗣️ 含章处事锦囊",
        "desc": "讲明白为什么把基本盘做扎实比抢镜头强十倍",
        "insert": "【大白话处事锦囊】：做幕后千万别耐不住寂寞去跟一把手抢聚光灯，把你掌管的盘子做成不可替代的托底基石，所有人都离不开你……"
      },
      {
        "title": "🔍 争强反噬自检",
        "desc": "警惕居下位者心浮气躁、强行出头导致的惨败",
        "insert": "【最易摔跤的盲区】：误以为“顺承”就是窝囊软弱，在羽翼未丰时跟老大争功夺利，最后落得两败俱伤……"
      }
    ]
  },
  "lesson-03_水雷屯": {
    "level": 3,
    "levelLabel": "草创深水 · 破局级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向创业团队或转型期朋友讲透草创破局之道",
    "scenarioPrompt": "假想你的朋友刚开始自主创业或开拓未知新业务，眼前千头万绪、资源匮乏、寸步难行。请用 3 分钟大白话向他讲透《水雷屯》的“盘桓扎根与经纶法则”，帮他消除焦虑、稳步突围。",
    "coreHints": [
      "屯是“水在雷上”，萌芽破土遇寒之象。草创万事开头难是天道定律，切忌盲目速胜。",
      "初九“磐桓，利建侯”：初期核心任务是寻找志同道合的同盟者、深扎根据地，而非急于铺张大干。",
      "六三“即鹿无虞”警告：在缺乏向导认知时盲目追逐利益诱惑，必陷泥潭，及时止步方为上策。"
    ],
    "scaffolds": [
      {
        "title": "💡 破土幼苗比喻",
        "desc": "类比种子在坚硬冻土里拼命拱破外壳，根系先往下扎深……",
        "insert": "【创业破局打比方】：屯卦就像早春冻土里的一颗种子，外面冰天雪地，头上顶着坚硬石头，急着冒头会被冻死，得先往下扎根……"
      },
      {
        "title": "🗣️ 初创生存锦囊",
        "desc": "讲清楚创业初期最该干的 3 件事：找盟友、守现金、打小胜仗",
        "insert": "【大白话生存锦囊】：别去幻想一鸣惊人，初期活下来的唯一法则是：找对懂行的向导、招募靠谱合伙人、在一个极小切口扎下根据地……"
      },
      {
        "title": "🔍 盲目追猎盲区",
        "desc": "警惕没有专业向导指引便在陌生赛道盲目狂奔耗尽子弹",
        "insert": "【最危险的初创死穴】：看到别人赚钱就眼红跟风，在没有专业认知向导（PMF未验证）的情况下杀进深山老林，最后弹尽粮绝……"
      }
    ]
  },
  "lesson-04_山水蒙": {
    "level": 2,
    "levelLabel": "认知启蒙 · 开窍级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向团队导师或带新人的朋友讲透启发式启蒙",
    "scenarioPrompt": "假想你的朋友因为带新人带不动、或者辅导孩子几近抓狂，抱怨“天天教怎么都教不会”。请用 3 分钟大白话向他讲透《山水蒙》的“启发时机与心智开窍法”。",
    "coreHints": [
      "山下出泉为蒙。泉水初生迷惘不知去向。启蒙不是强行灌水，而是引导泉水顺势成渠。",
      "“匪我求童蒙，童蒙求我”：教育的第一铁律在于求学者的真实痛感与主动诉求，被动填鸭只会适得其反。",
      "上九“击蒙，利御寇”：惩戒的唯一正当性在于帮其抵御无知与心智盗贼，绝非宣泄管理者的傲慢与情绪。"
    ],
    "scaffolds": [
      {
        "title": "💡 山泉引水比喻",
        "desc": "把启蒙比作疏导初生山泉，泉水撞石头才知回头，顺势开槽水自流……",
        "insert": "【教人带新打比方】：蒙卦就像山里刚冒出来的一汪泉水，到处乱淌。教人就像修水渠，你得等他撞了石头想找路，引一下他就通了……"
      },
      {
        "title": "🗣️ 启发开窍锦囊",
        "desc": "讲明白“不愤不启、不悱不发”的现代管理实战诀窍",
        "insert": "【大白话带人锦囊】：收起你好为人师的冲动，先让他自己试错摸索，等他卡在瓶颈急得满头大汗来敲门问你时，给一句核心指点……"
      },
      {
        "title": "🔍 暴躁打压自检",
        "desc": "反省把新人的无知当成愚蠢、情绪失控口出恶言的内耗行为",
        "insert": "【最易踩雷的管理盲区】：新手做不好就劈头盖脸痛骂一顿，把严肃纪律（御寇）搞成了个人情绪施暴（为寇），新人彻底丧失探索欲……"
      }
    ]
  },
  "lesson-05_水天需": {
    "level": 3,
    "levelLabel": "周期穿越 · 耐受级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向身处行业寒冬或求职瓶颈的朋友讲透耐受待时",
    "scenarioPrompt": "假想你的朋友身处资本寒冬或求职空窗期，简历屡屡碰壁，整日焦虑失眠。请用 3 分钟大白话向他讲透《水天需》中“饮食宴乐与战略耐受”的穿越周期智慧，帮他稳住心神。",
    "coreHints": [
      "“云上于天，需；君子以饮食宴乐”。大雨在天上酝酿，急躁毫无意义，照顾好日常身心是第一战略。",
      "九二“需于沙，小有言，终吉”：周期低谷中必有外界非议与怀疑，守住定力不随之起舞。",
      "上六“不速之客三人来，敬之终吉”：周期反转的转机往往以计划外的意外形式到来，谦逊接纳外部变数方能破局。"
    ],
    "scaffolds": [
      {
        "title": "💡 机场大雾比喻",
        "desc": "类比机场突遇暴雨大雾停飞，盲目硬飞必坠毁，在候机室吃面休息等待放晴……",
        "insert": "【穿越周期打比方】：需卦就像你赶飞机遇到大暴雨大雾，机场全封了。这时候谁硬要起飞谁就机毁人亡，明智的做法是在餐厅踏实吃面喝咖啡……"
      },
      {
        "title": "🗣️ 熬过寒冬锦囊",
        "desc": "讲透如何在低谷期管好现金流、锻炼身体、深度内省充电",
        "insert": "【大白话生存锦囊】：别去盲目跟大盘逆着干，把生活开支压到最低，吃饱睡足跑跑步，把基本功打牢，只要你不死，熬死对手你就赢了……"
      },
      {
        "title": "🔍 慌乱出牌盲区",
        "desc": "警惕在低谷期因为耐不住寂寞而病急乱投医、孤注一掷梭哈",
        "insert": "【黎明前最致命的陷阱】：因为受不了闲话碎语，耐不住性子在周期最底部盲目押上全副身家，结果倒在了黎明破晓前的一秒钟……"
      }
    ]
  },
  "lesson-06_天水讼": {
    "level": 2,
    "levelLabel": "契约博弈 · 防止级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向陷入合作纠纷或利益争端的商务伙伴讲透止讼心法",
    "scenarioPrompt": "假想你的两位创业伙伴正因股权利益争得面红耳赤、准备打官司散伙。请用 3 分钟大白话向他们讲透《天水讼》中“作事谋始与中吉终凶”的止讼博弈法则，劝他们各退一步重归理性。",
    "coreHints": [
      "天往上走、水往下流，违行生讼。一切争端与反目，根源都在早期“作事谋始”时缺乏清晰规则约定。",
      "“中吉终凶”：争讼不可长，见好就收、适时妥协方为吉；硬拼到底即便赢得判决也必耗尽资源。",
      "九二“不克讼归而逋”、九四“安贞吉”：主动认输撤退、割让次要利益，往往保全了更大的生存根基。"
    ],
    "scaffolds": [
      {
        "title": "💡 背道而驰比喻",
        "desc": "把天水讼比作被一根绳子拴在一起却开往相反方向的两辆车，死踩油门只会车毁人亡……",
        "insert": "【利益纠纷打比方】：天水讼就像天往上飘、水往下淌，两头牛拉着同一辆车往相反方向使劲，硬拽下去只能把车架子拉散……"
      },
      {
        "title": "🗣️ 止讼和解锦囊",
        "desc": "讲明白为什么打官司没有赢家，各退一步快速翻篇去抓新业务才是真聪明",
        "insert": "【大白话和解锦囊】：官司一旦打起来，时间、律师费和精力能把两边都拖死。各退一步签个和解补充协议，把精力留给挣钱，才是大格局……"
      },
      {
        "title": "🔍 谋始漏洞排查",
        "desc": "指出当初因为面子没签清楚协议的教训，今后如何“先小人后君子”",
        "insert": "【所有反目的根源】：当初合作时不好意思谈钱、谈退出，用‘兄弟感情’代替合同，结果现在全爆雷了。往后办事一定先小人后君子……"
      }
    ]
  },
  "lesson-07_地水师": {
    "level": 2,
    "levelLabel": "危机领军 · 严律级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向一线业务管理者讲透地水师的严正兵法与治众之道",
    "scenarioPrompt": "假想你的朋友刚提拔为业务团队一把手，面临一场艰巨的攻坚战，但团队人心涣散、多头插手。请用 3 分钟大白话向他讲透《地水师》的“带兵军律与长子帅师”法则。",
    "coreHints": [
      "“地中有水，师；君子以容民畜众”。兵藏于农，战时惊涛骇浪，平时靠宽厚仁义凝聚人心蓄水。",
      "初六“师出以律，否臧凶”：开拔第一天必须立下铁的纪律与赏罚机制，纪律不严必遭溃败。",
      "六五“长子帅师，弟子舆尸”：前线指挥官必须拥有绝对决断权，严防后方多头外行干预战局。"
    ],
    "scaffolds": [
      {
        "title": "💡 地下暗河比喻",
        "desc": "把团队比作地下的暗水，平时蓄在土里滋养万物，战时聚成水龙头喷射灭火……",
        "insert": "【带队打仗打比方】：师卦就像地底下藏着一条大河，平时看不见，打仗时抽出来就是千军万马。关键是平时你得给足关怀把水蓄满……"
      },
      {
        "title": "🗣️ 领军权责锦囊",
        "desc": "讲透战时指挥权必须定于一尊、赏罚分明的硬道理",
        "insert": "【大白话带队锦囊】：平时待兄弟要宽厚（容民），一旦进入战时状态，纪律必须像铁一样硬（以律）。最核心的：前线只能听总指挥一个人的号令……"
      },
      {
        "title": "🔍 多头指挥死穴",
        "desc": "警惕老板、投资人各插一手瞎指挥把队伍带翻",
        "insert": "【战时最致命败因】：后方一群不懂业务的管理层各发一道指令，搞得前线士兵无所适从（弟子舆尸），最后打了败仗谁都不承担责任……"
      }
    ]
  },
  "lesson-08_水地比": {
    "level": 2,
    "levelLabel": "生态合伙 · 向心级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向寻求合伙结盟的商务负责人讲透生态依附法则",
    "scenarioPrompt": "假想你的朋友正在拓展商业联盟或寻找战略合伙人，苦于对方态度摇摆、患得患失。请用 3 分钟大白话向他讲透《水地比》的“水土相融与王用三驱”结盟智慧。",
    "coreHints": [
      "水在地上，相亲相融，无丝毫缝隙。比卦讲的是建立联盟生态与向心凝聚力的最高法则。",
      "“不宁方来，后夫凶”：格局重塑期，动作敏捷迅速结盟者掌控主导权，犹豫观望的“后夫”必遭边缘化淘汰。",
      "九五“显比，王用三驱，失前禽”：最高明的合伙与招商是舍逆取顺、来者包容去者不追，不设防方为大格局。"
    ],
    "scaffolds": [
      {
        "title": "💡 水渗泥土比喻",
        "desc": "类比水渗入大地泥土，彼此交融融为一体，谁也离不开谁……",
        "insert": "【结盟合作打比方】：水地比就像水渗进泥土里，没有半点架子和缝隙。真正的战略合作不是表面签协议，是业务和利益像水土一样交融……"
      },
      {
        "title": "🗣️ 开放生态锦囊",
        "desc": "讲明白利他与开放分享是凝聚生态的最强磁场",
        "insert": "【大白话结盟锦囊】：找盟友手脚要快（防止后夫凶），拿出真金白银的核心利益分给对方；想来的热情相拥，想走的体面放手（王用三驱），你的局自然越来越大……"
      },
      {
        "title": "🔍 排他控制盲区",
        "desc": "警惕小农意识、总想靠霸王条款锁死对方的窄路思维",
        "insert": "【合作中最招人烦的毛病】：总想着占尽便宜、防贼一样防着合作方，搞严苛的排他控制，最后把有实力的盟友全逼到了竞争对手阵营……"
      }
    ]
  },
  "lesson-09_风天小畜": {
    "level": 2,
    "levelLabel": "微力蓄势 · 柔克刚级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向弱势小微团队讲透以柔制刚的微力破局策略",
    "scenarioPrompt": "假想你的朋友开了一家小微公司，正面临巨头夹缝求生、资源捉襟见肘的窘境。请用 3 分钟大白话向他讲透《风天小畜》中“密云不雨与以柔克刚”的生存智慧。",
    "coreHints": [
      "小畜者，微力以蓄庞然大物。面对体量巨大的强者，正面硬刚必碎，学会以柔克刚、慢慢渗透。",
      "“密云不雨”是保护机制：能量尚未积聚充盈时，切不可强行开打决战，耐心修补内部短板（懿文德）。",
      "六四“有孚，血去惕出”：弱者生存的核心护城河是“极致的信用与不可替代的专业服务”，化解外部敌意。"
    ],
    "scaffolds": [
      {
        "title": "💡 微风聚云比喻",
        "desc": "把小畜比作天空中轻轻吹拂的微风，风虽小，却能把万里浮云慢慢聚成降雨层……",
        "insert": "【弱者生存打比方】：小畜卦就像微风吹拂苍穹，微风吹不翻大卡车，但它能慢慢把云层聚在一起。弱小团队不要逞强，先把身边的小事聚成势……"
      },
      {
        "title": "🗣️ 夹缝生存锦囊",
        "desc": "讲透不碰巨头主力赛道、做深极致利基市场的策略",
        "insert": "【大白话破局锦囊】：别去跟大厂拼价格拼烧钱，在巨头看不上、干不好的细分垂直领域把体验和服务做绝（有孚），靠绝对口碑活下来……"
      },
      {
        "title": "🔍 盲目膨胀盲区",
        "desc": "警惕赚了第一桶金就盲目加杠杆开战导致“既雨既处”的反噬",
        "insert": "【最容易摔死的坑】：刚赚了点小钱就飘了，以为自己能改写行业格局，盲目扩张打广告，结果一下被巨头一巴掌拍死在沙滩上……"
      }
    ]
  },
  "lesson-10_天泽履": {
    "level": 2,
    "levelLabel": "如履薄冰 · 礼法规矩级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向高压职场人讲透天泽履的伴君自保与规矩智慧",
    "scenarioPrompt": "假想你的朋友刚调任到要求极高、喜怒无常的高层领导身边工作，伴君如伴虎、如履薄冰。请用 3 分钟大白话向他讲透《天泽履》的“履虎尾不咥人”秘诀，教他既保安全又赢信任。",
    "coreHints": [
      "天在上、泽在下，尊卑有序、各安其位。履卦讲的是在极度危险复杂的环境下如何靠“知分寸、守礼法”化险为夷。",
      "踩了老虎尾巴为什么不被咬？态度和悦谦逊（兑），行为合乎规矩天理（乾），行正道则威势不能伤。",
      "六三警示：独眼偏要逞强、跛足偏要疾行，自身实力不足却狂妄挑衅规则权威，必遭灭顶之灾。"
    ],
    "scaffolds": [
      {
        "title": "💡 冰上芭蕾比喻",
        "desc": "把天泽履比作在薄冰上跳芭蕾或驯兽师面对猛虎，步步踩准节奏与规矩……",
        "insert": "【伴君如伴虎打比方】：天泽履就像在薄冰上踩着探戈，或者驯兽师钻进老虎笼子。老虎咬不咬你，全看你懂不懂它的习性规矩，分寸差一寸都是命……"
      },
      {
        "title": "🗣️ 高压自保锦囊",
        "desc": "讲明白“事事有回应、件件有着落、态度极谦逊、行动极合规”的防弹法则",
        "insert": "【大白话职场锦囊】：伺候强势挑剔的领导，脸上带笑（和悦）、嘴巴要严、办事严格按章程走，不该抢的风头半点不沾，老虎挑不出毛病就只能重用你……"
      },
      {
        "title": "🔍 逞强越权自检",
        "desc": "警惕自作聪明搞越级汇报或公然践踏公司红线",
        "insert": "【踩地雷的典型表现】：自恃有点小聪明就瞧不起规则，越级汇报、私自替领导拿主意（武人为于大君），最后成了杀鸡儆猴的祭旗炮灰……"
      }
    ]
  },
  "lesson-29_坎为水": {
    "level": 3,
    "levelLabel": "极度逆境 · 深水重险级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向遭遇连续打击或深陷人生低谷的朋友讲透行险脱困心法",
    "scenarioPrompt": "假想你的朋友创业失败、债务缠身、又遭逢家庭变故，多重危机接踵而至，情绪跌入谷底。请用 3 分钟大白话向他讲透八纯卦《坎为水》中“水流不滞、行险不失其信”的绝处逢生之法。",
    "coreHints": [
      "“水洊至，习坎；君子以常德行，习教事”。一重险阻接着一重险阻，行险是宇宙常态，抱怨只会加剧下沉。",
      "水的至高哲学：遇到深坑便把坑填平，遇到顽石便绕道流淌；虽曲折万千，但奔赴大海的信念（不失其信）从不动摇。",
      "六四“樽酒簋贰，用缶，纳约自牖”：至暗困厄时刻抛弃虚饰排场，用极简的真诚从最细微的缝隙撬动转机。"
    ],
    "scaffolds": [
      {
        "title": "💡 激流脱困比喻",
        "desc": "把坎卦比作掉入急流旋涡，越瞎扑腾沉得越快，顺着水流找浮木才能活命……",
        "insert": "【绝境求生打比方】：坎卦就像一个人掉进了瀑布底下的深潭旋涡，你死命往上扑腾只会把力气耗光。水性好的人知道屏住呼吸潜下去，顺着暗流浮出水面……"
      },
      {
        "title": "🗣️ 绝境熬活锦囊",
        "desc": "讲透至暗时刻如何把生活节奏过规律，从小事做起，不失本心",
        "insert": "【大白话脱困锦囊】：接受当下的倒霉处境，别总想着一夜翻盘。按时吃饭睡觉把身体养硬朗（常德行），把债务一笔笔理清，真诚面对债主，只要人不垮，水终究能流出峡谷……"
      },
      {
        "title": "🔍 铤而走险盲区",
        "desc": "警惕急于翻本去借高利贷、赌博导致越陷越深的万劫不复死局",
        "insert": "【最致命的二次塌方】：身陷绝境时最容易听信‘偏门快钱’去赌一把，结果一脚踩空，彻底沦为‘置于丛棘，三岁不得’的死局……"
      }
    ]
  },
  "lesson-30_离为火": {
    "level": 3,
    "levelLabel": "重明丽天 · 依附自持级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向青年才俊或面临平台选择的创作者讲透依附与长青之道",
    "scenarioPrompt": "假想你的朋友才华出众、心高气傲，正纠结于“是独立单干还是借助大平台”，同时总被内心的焦虑浮躁所折磨。请用 3 分钟大白话向他讲透八纯卦《离为火》的“附丽借力与修柔止燥”法。",
    "coreHints": [
      "“离，丽也；日月丽乎天，百谷草木丽乎土”。火无实体，必须依附于柴薪才能发光。才华必须依附优质平台才能变现与长青。",
      "卦辞强调“畜牝牛吉”：火性最暴烈干燥，极易自焚焚人；唯有修养如母牛般温和谦柔的品德，方能驾驭炽热的才华。",
      "九四“突如其来，焚如死如”警示：靠机巧爆红的虚火如骤起的火苗，来得急去得快，终成灰烬。"
    ],
    "scaffolds": [
      {
        "title": "💡 奥运火炬比喻",
        "desc": "把才华比作火苗，必须有结实的火炬枪和持续的高品质燃气支撑……",
        "insert": "【才华与平台打比方】：离卦就像奥运火炬上的烈火，火光再夺目，也全靠背后的气瓶和火炬管撑着。气瓶一关，火瞬间就灭了……"
      },
      {
        "title": "🗣️ 持续发光锦囊",
        "desc": "讲明白找准好平台、脾气变温和、做长期内容输出的法则",
        "insert": "【大白话长青锦囊】：承认自己需要好的平台和团队托底，收敛起文人傲气和暴脾气（畜牝牛），把精力放在持续产出有温度、能照亮别人的真正价值上……"
      },
      {
        "title": "🔍 暴冲自焚死穴",
        "desc": "警惕沉迷短平快网红流量暴冲暴跌，脾气暴躁焚毁合作伙伴信任",
        "insert": "【才华横溢者的死穴】：自命不凡，稍不如意就掀桌子；或者靠猎奇炒作爆冲一波流量，结果像九四一样‘焚如死如’，把自己的职业声誉全烧光了……"
      }
    ]
  },
  "lesson-51_震为雷": {
    "level": 2,
    "levelLabel": "惊雷动荡 · 临危不丧级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向遭遇突发危机或组织巨震的业务领军者讲透定海神针心法",
    "scenarioPrompt": "假想你的朋友经营的企业遭遇行业黑天鹅突袭，核心骨干跳槽、客户流失、全员人心惶惶。请用 3 分钟大白话向他讲透八纯卦《震为雷》的“恐惧修省与不丧匕鬯”，帮他稳住军心。",
    "coreHints": [
      "“洊雷，震；君子以恐惧修省”。两雷相叠，天下震动。外部危机如晴天霹雳，正是全面排查内部漏洞的最佳契机。",
      "“震来虩虩，笑言哑哑”：初遇惊雷敬畏害怕是人之常情，但迅捷反思修补短板后，便能从容谈笑、化危为机。",
      "“震惊百里，不丧匕鬯”是最高定力：越是地动山摇，领袖手里握着的祭祀酒器（核心战略与信念）越不能洒出一滴。"
    ],
    "scaffolds": [
      {
        "title": "💡 晴天霹雳打比方",
        "desc": "把突发危机比作突然打炸雷，弱者抱头乱窜，大将在雷声中稳端酒杯从容指挥……",
        "insert": "【突发危机打比方】：震卦就像大晴天突然头顶炸了个焦雷，胆小的人当场吓尿了裤子，真正的领袖在雷声里端稳手中的酒杯，看清雷往哪边打……"
      },
      {
        "title": "🗣️ 稳住军心锦囊",
        "desc": "讲透危机来临第一步不是发脾气甩锅，而是领头人保持绝对镇定自若",
        "insert": "【大白话领袖锦囊】：黑天鹅砸下来，全员都在看老板的脸。你的手稳、你的微笑，就是最强的定海神针。立刻排查漏洞修补短板（恐惧修省），危机就是拉开与对手差距的拐点……"
      },
      {
        "title": "🔍 慌乱失态死穴",
        "desc": "警惕老板当着全员面惊慌失措、自乱阵脚引发崩盘踩踏",
        "insert": "【危机中最致命的昏招】：自己先被雷吓破了胆，在全员群里歇斯底里发脾气甩锅，把原本可控的外部震荡变成了内部全线踩踏叛逃……"
      }
    ]
  },
  "lesson-52_艮为山": {
    "level": 2,
    "levelLabel": "止定内明 · 动静有节级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向被内卷焦虑裹挟、身心俱疲的朋友讲透知止与定力智慧",
    "scenarioPrompt": "假想你的朋友深陷内卷漩涡，身兼数职、天天熬夜打卡，身心严重透支却停不下来。请用 3 分钟大白话向他讲透八纯卦《艮为山》的“动静不失其时与思不出其位”，教他学会优雅的知止暂停。",
    "coreHints": [
      "“兼山，艮；君子以思不出其位”。两山巍然矗立，互不相犯。守住本分与能力圈边界，是抵御外界浮躁噪音的最强壁垒。",
      "“时止则止，时行则行，动静不失其时，其道光明”：止不是死寂僵化，而是为了下一次更精准的出发而蓄力。",
      "“艮其背，不获其身；行其庭，不见其人”：将注意力从外在攀比与虚名中抽离，回到内心纯粹宁静。"
    ],
    "scaffolds": [
      {
        "title": "💡 高山与刹车比喻",
        "desc": "把艮卦比作大山岿然不动，或跑车的高性能刹车系统，刹车灵才敢跑极速……",
        "insert": "【内卷自救打比方】：艮卦就像两座大山并排立在那里，山下哪怕刮台风，山体连晃都不晃一下；也像跑车的刹车系统，越是顶级的赛车，刹车越得灵敏……"
      },
      {
        "title": "🗣️ 知止暂停锦囊",
        "desc": "讲明白学会果断对杂事说“不”、给心灵按暂停键的减法心法",
        "insert": "【大白话减法锦囊】：关掉那些让你焦虑的群聊，对能力圈之外的烂事坚决说不（思不出其位）。该停的时候果断停下来睡个好觉，会刹车的人才能跑完人生长跑……"
      },
      {
        "title": "🔍 停滞内疚盲区",
        "desc": "破除现代人“一旦闲下来就充满负罪感”的心智病毒",
        "insert": "【最容易内耗的心智陷阱】：以为天天瞎忙才叫上进，把无意义的体力透支当成奋斗，在该刹车时硬踩油门，最后整部机器直接报废……"
      }
    ]
  },
  "lesson-57_巽为风": {
    "level": 2,
    "levelLabel": "润物无声 · 柔顺渗透级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向推动组织变革或做品牌渗透的负责人讲透柔顺渗透之道",
    "scenarioPrompt": "假想你的朋友正在公司推行一套全新的工作法或制度，遭到老员工的软抵抗，他打算强行下令罚款通报。请用 3 分钟大白话向他讲透八纯卦《巽为风》的“随风潜入与申命行事”，帮他掌握润物细无声的落地艺术。",
    "coreHints": [
      "“随风，巽；君子以申命行事”。微风相随，无孔不入。变革与教化不可靠暴风骤雨，而靠连绵不绝的温和渗透。",
      "“重巽以申命”：制度要想深入人心，必须通过多频次、跨场景、真诚平等的反复沟通，使之化为下意识的文化本能。",
      "九五“先庚三日，后庚三日”：变革前充分推演利益博弈（先庚），变革后持续跟踪复盘配套（后庚），方能无初有终。"
    ],
    "scaffolds": [
      {
        "title": "💡 春风化雨比喻",
        "desc": "把管理推行比作春天柔和的微风，风虽轻柔，漫山遍野的树木不知不觉全发芽了……",
        "insert": "【推动变革打比方】：巽卦就像春夜里的微风，‘随风潜入夜，润物细无声’。狂风只会吹断树枝引起反弹，微风却能吹进每个人的领口和心坎里……"
      },
      {
        "title": "🗣️ 柔性落地锦囊",
        "desc": "讲透一对一谈心、树立典型示范、反复解释初衷的落地招数",
        "insert": "【大白话管理锦囊】：把冰冷的惩罚通告收起来，找几个威望高的老员工坐下来喝茶深聊（深入），耐心解释新制度能给他们带来什么好处（申命），让习惯一点点改变……"
      },
      {
        "title": "🔍 急于求成死穴",
        "desc": "警惕以为发个通知、扣几笔罚款就算推行成功的官僚粗暴心态",
        "insert": "【最容易翻车的做法】：简单粗暴下一道死命令限期执行，不管大家的实际难处，最后激起全员暗中消极怠工，制度沦为废纸……"
      }
    ]
  },
  "lesson-58_兑为泽": {
    "level": 2,
    "levelLabel": "丽泽相悦 · 朋友讲习级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向想要提升商务谈判力或改善人际沟通的朋友讲透真悦底牌",
    "scenarioPrompt": "假想你的朋友在商务沟通中总觉得吃力，要么过于僵硬死板谈崩，要么毫无原则地一味讨好赔笑脸。请用 3 分钟大白话向他讲透八纯卦《兑为泽》中“朋友讲习与和兑自尊”的沟通法宝。",
    "coreHints": [
      "“丽泽，兑；君子以朋友讲习”。两座大泽相依互润，永不干涸。人际交往与同道研学的本质是智慧的相互滋养与彼此成就。",
      "初九“和兑，吉”：由内而外的真诚、坦荡与善意，让人如沐春风，这是最具感染力的高阶亲和力。",
      "六三“来兑，凶”警示：曲意逢迎、卑躬屈膝讨好别人，不仅换不来真正的订单与友谊，反而自贬身价遭人轻视。"
    ],
    "scaffolds": [
      {
        "title": "💡 连通湖泊比喻",
        "desc": "把兑卦比作两条连在一起的清澈大湖，水体相互补益滋养，天旱也不见底……",
        "insert": "【高段位社交打比方】：兑卦就像两座相连的湖泊，你给我注水，我给你通水，大家在一起彼此滋养、共同涨水。单打独斗的孤水早就干涸了……"
      },
      {
        "title": "🗣️ 阳光沟通锦囊",
        "desc": "讲明白带着帮客户解决问题的利他心沟通，有原则有温度地谈判",
        "insert": "【大白话沟通锦囊】：谈判时真诚看着对方眼睛，带着利他心帮他算账解决痛点（和兑）；不卑不亢、守住原则底线，彼此舒舒服服把事情办成……"
      },
      {
        "title": "🔍 谄媚讨好盲区",
        "desc": "警惕把和悦当成了跪舔迎合，失去专业底线",
        "insert": "【最掉价的社交误区】：以为搞好关系就是拍马屁、送大礼、底线一让再让（来兑），对方表面笑纳，心里其实把你当成软柿子捏……"
      }
    ]
  },
  "lesson-11_地天泰": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《地天泰》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《地天泰》所揭示的现实情境（天地交泰 · 阴阳和合之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“天地交，泰；后以财成天地之道，辅相天地之宜，以左右民。”，指明了本卦的立身与治事格局。",
      "上卦为坤地，下卦为乾天。常理天在上有地在下，古人却反置“地在上、天在下”。这是因为天属纯阳，阳气清轻必然向上腾升；地属纯阴，阴气重浊必然向下沉降。如此一来，天气上升、地气下沉，阴阳二气在天地中央迎面相……",
      "本卦自下而上为“安泰盛世”六阶经纶：初九志同道合连带同进（拔茅连茹以其汇征吉）；九二包容旷达跨越天堑（包荒用冯河不暇遗朋亡）；九三居安思危平陂相生（无平不陂无往不复）；六四翩翩下顾共享繁荣（翩翩不富以……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《地天泰》的天地交泰 · 阴阳和合之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-12_天地否": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《天地否》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《天地否》所揭示的现实情境（天高地远 · 闭塞不通之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“天地不交，否；君子以俭德辟难，不可荣以禄。”，指明了本卦的立身与治事格局。",
      "上卦为乾天，下卦为坤地。表面看天居天位、地居地位，实则天之阳气拼命往上飞，地之阴气拼命往下坠。两者各奔东西、背道而驰，天地阴阳二气永不交感，导致长天冷漠、大地冰封，万物闭塞绝迹，君臣离心离德！故古人命……",
      "本卦自下而上为“否极泰来”六阶坚守：初六独善其身收敛锋芒（拔茅连茹贞吉）；六二拒绝同流阿附权贵（包承小人吉大人否亨）；六三身居不当中饱私囊（包羞愧悔）；九四奉天承命拨乱反正（有命无咎畴离祉）；九五居安……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《天地否》的天高地远 · 闭塞不通之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-13_天火同人": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《天火同人》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《天火同人》所揭示的现实情境（天下火明 · 大同世界之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“天与火，同人；君子以类族辨物。”，指明了本卦的立身与治事格局。",
      "上卦为乾天，下卦为离火。《大象传》曰：“天与火，同人；君子以类族辨物。”火的光焰向上腾飞，与高阔苍天同放光明。离火照澈天下毫无私蔽，乾天博大涵盖一切族群，象征全人类跨越狭隘门户、志同道合天下为公。故古……",
      "本卦自下而上为“聚同化异”六阶境界：初九走出小圈子以公心待人（同人于门无咎）；六二圈子狭隘结党营私（同人于宗吝）；九三心存猜忌伏兵草莽（伏戎于莽三岁不兴）；九四认清形势及时撤防（乘其墉不能攻吉）；九五……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《天火同人》的天下火明 · 大同世界之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-14_火天大有": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《火天大有》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《火天大有》所揭示的现实情境（红日当空 · 普照四海之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“火在天上，大有；君子以遏恶扬善，顺天休命。”，指明了本卦的立身与治事格局。",
      "上卦为离火（烈日昭昭），下卦为乾天（清空万仞）。《大象传》曰：“火在天上，大有；君子以遏恶扬善，顺天休命。”正午的艳阳高悬在万里晴空的正顶，毫无遮拦地将阳光与温暖洒向大地山川，万物无不受其滋养与恩赐。……",
      "本卦自下而上为“富有保泰”六阶戒骄：初九富而不骄杜绝祸患（无交害匪咎艰则无咎）；九二器大包容承担重任（大车以载有攸往无咎）；九三位高权重敬献天子（公用亨于天子小人害也）；九四戒除虚荣不矜其盛（匪其彭无……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《火天大有》的红日当空 · 普照四海之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-15_地山谦": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《地山谦》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《地山谦》所揭示的现实情境（地藏崇山 · 谦德无双之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“地中有山，谦；君子以裒多益寡，称物平施。”，指明了本卦的立身与治事格局。",
      "上卦为坤地（广袤平原），下卦为艮山（巍峨崇山）。《大象传》曰：“地中有山，谦；君子以裒多益寡，称物平施。”一座万仞高耸的大山，竟然谦卑地深藏在广阔平坦的大地泥土之下！明明有拔地倚天的雄厚实力，却在外表……",
      "本卦自下而上为“谦逊化境”六阶修为：初六卑以自牧甘居人后（谦谦君子卑以自牧）；六二发自内心声誉远播（鸣谦贞吉）；九三劳苦功高深藏若虚（劳谦君子有终吉）；六四适度彰显合规施为（无不利撝谦）；六五以德服人……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《地山谦》的地藏崇山 · 谦德无双之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-16_雷地豫": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《雷地豫》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《雷地豫》所揭示的现实情境（春雷破土 · 欣欣向荣之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“雷出地奋，豫；先王以作乐崇德，殷荐之上帝，以配祖考。”，指明了本卦的立身与治事格局。",
      "上卦为震雷，下卦为坤地。《大象传》曰：“雷出地奋，豫；先王以作乐崇德。”春雷破土而出，大地万物感应春气而舒展苏醒，天地之间洋溢着蓬勃欢悦与欢欣鼓舞。古人作乐崇德、以乐声安抚万民，故命此卦为“豫”（欢悦……",
      "本卦自下而上为“安豫知止”六阶防怠：初六得意忘形自招祸端（鸣豫凶）；六二坚定如石不受诱惑（介于石不终日贞吉）；六三迟疑观望错失先机（盱豫悔迟有悔）；九四独当一面群心归附（由豫大有得朋盍簪）；六五沉溺安……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《雷地豫》的春雷破土 · 欣欣向荣之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-17_泽雷随": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《泽雷随》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《泽雷随》所揭示的现实情境（泽中雷伏 · 随顺自然之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽中有雷，随；君子以向晦入宴息。”，指明了本卦的立身与治事格局。",
      "上卦为兑泽，下卦为震雷。《大象传》曰：“泽中有雷，随；君子以向晦入宴息。”秋日雷电敛藏潜伏在大泽深水之中，随顺四时节律而休眠止息。君子日出而作、日落而归随顺天道，与时推移、因势利导，故命此卦为“随”（……",
      "本卦自下而上为“借势随顺”六阶智慧：初九打破门第顺应变化（官有渝贞吉出门交有功）；六二见小失大贪恋眼前（系小子失丈夫）；六三舍弃小局依附远略（系丈夫失小子求有得）；九四顺势有获谨守底线（随有获贞凶有孚……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《泽雷随》的泽中雷伏 · 随顺自然之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-18_山风蛊": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《山风蛊》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《山风蛊》所揭示的现实情境（风阻山下 · 腐败革新之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山下有风，蛊；君子以振民育德。”，指明了本卦的立身与治事格局。",
      "上卦为艮山，下卦为巽风。《大象传》曰：“山下有风，蛊；君子以振民育德。”微风吹到大山脚下被高山拦截，气流长期停滞不通，导致山谷阴暗潮湿、物久生蠹虫（蛊）。象征旧体制积弊已久、出现腐化；此时非痛下决心改……",
      "本卦自下而上为“除弊除乱”六阶担当：初六继承家业革除积弊（干父之蛊有子考无咎）；六二柔顺化解遗留隐患（干母之蛊不可贞）；九三用力虽过终得大吉（干父之蛊小有悔无大咎）；六四因循苟且自取其辱（裕父之蛊往见……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《山风蛊》的风阻山下 · 腐败革新之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-19_地泽临": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《地泽临》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《地泽临》所揭示的现实情境（厚地俯泽 · 亲临化育之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽上有地，临；君子以教思无穷，容保民无疆。”，指明了本卦的立身与治事格局。",
      "上卦为坤地，下卦为兑泽。《大象传》曰：“泽上有地，临；君子以教思无穷，容保民无疆。”大地高居其上俯瞰汪泽，大泽润泽地底，二阳爻自下而上昂扬破土。君王亲临视察、以博大德行化育天下万民，故命此卦为“临”（……",
      "本卦自下而上为“巡临治世”六阶经纶：初九以诚相感同心并进（咸临贞吉）；九二威严有加吉无不利（咸临吉无不利）；六三甜言蜜语当知忧患（甘临无攸利既忧之无咎）；六四至诚接纳亲临一线（至临无咎）；六五大智若愚……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《地泽临》的厚地俯泽 · 亲临化育之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-20_风地观": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《风地观》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《风地观》所揭示的现实情境（风行大地 · 瞻仰风化之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“风行地上，观；先王以省方，观民设教。”，指明了本卦的立身与治事格局。",
      "上卦为巽风，下卦为坤地。《大象传》曰：“风行地上，观；先王以省方，观民设教。”和风吹拂广袤大地，无远弗届、润泽草木。万民仰望风动草偃，如祭祀大典洗净双手肃穆瞻仰。象征内省反思与对外示范，故命此卦为“观……",
      "本卦自下而上为“内观省察”六阶眼界：初六鼠目寸光童蒙浅见（童观小人无咎君子吝）；六二门缝窥探见识狭窄（窥观利女贞）；六三权衡进退立身有方（观我生进退）；六四洞察大势为国干城（观国之光利用宾于王）；九五……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《风地观》的风行大地 · 瞻仰风化之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-21_火雷噬嗑": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《火雷噬嗑》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《火雷噬嗑》所揭示的现实情境（雷动电彻 · 咬合去障之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“雷电，噬嗑；先王以明罚敕法。”，指明了本卦的立身与治事格局。",
      "上卦为离火（闪电光明），下卦为震雷（雷霆威严）。《大象传》曰：“雷电，噬嗑；先王以明罚敕法。”雷声轰鸣伴随电光照彻天地，如同上下牙齿咬合咀嚼口中硬物、咬碎隔膜方得通畅。象征社会制度中必须以法纪明断是非……",
      "本卦自下而上为“严明法度”六阶治理：初九微受惩戒小惩大诫（履校灭趾无咎）；六二用刑得当顺应正理（噬肤灭鼻无咎）；六三遇到硬骨遭人反感（噬腊肉遇毒小吝无咎）；九四披荆斩棘得获正义（噬干胏得金矢利艰贞吉）……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《火雷噬嗑》的雷动电彻 · 咬合去障之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-22_山火贲": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《山火贲》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《山火贲》所揭示的现实情境（夕照群山 · 文饰归真之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山下有火，贲；君子以明庶政，无敢折狱。”，指明了本卦的立身与治事格局。",
      "上卦为艮山，下卦为离火（落日夕阳）。《大象传》曰：“山下有火，贲；君子以明庶政，无敢折狱。”西下的夕阳落入崇山峻岭脚下，火红余晖将千山万壑渲染得五彩斑斓、秀丽动人。文饰虽美，然而夕阳终将隐没，大山终将……",
      "本卦自下而上为“文质彬彬”六阶洗礼：初九舍弃虚华脚踏实地（贲其趾舍车而徒）；六二修饰仪容依附君子（贲其须与上兴也）；九三光鲜亮丽坚守正道（贲如濡如永贞吉）；六四回归本真素马白驹（贲如皤如白马翰如）；六……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《山火贲》的夕照群山 · 文饰归真之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-23_山地剥": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《山地剥》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《山地剥》所揭示的现实情境（山侵于地 · 剥落待复之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山附地上，剥；上以厚下，安宅。”，指明了本卦的立身与治事格局。",
      "上卦为艮山，下卦为坤地。《大象传》曰：“山附地上，剥；上以厚下，安宅。”巍峨高山高耸在大地之上，历经亿万年风吹雨打、地气侵蚀，山体土石不断向下剥落坍塌，五阴逼迫一阳。统治者若剥削下层百姓，则基盘崩塌高……",
      "本卦自下而上为“剥极待生”六阶存续：初六床腿受损基盘动摇（剥床以足蔑贞凶）；六二侵蚀中层伤筋动骨（剥床以辨蔑贞凶）；六三虽在小人群不随恶行（剥之无咎失上下也）；六四灾难临头大祸迫眉（剥床以肤凶）；六五……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《山地剥》的山侵于地 · 剥落待复之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-24_地雷复": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《地雷复》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《地雷复》所揭示的现实情境（冬至一阳 · 生机复归之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“雷在地中，复；先王以至日闭关，商旅不行，后不省方。”，指明了本卦的立身与治事格局。",
      "上卦为坤地，下卦为震雷。《大象传》曰：“雷在地中，复；先王以至日闭关。”时值冬至严寒，天地表面万物凋零萧杀，然而在万丈冻土的地心深处，第一缕春雷地热（一阳初生）已然悄悄复苏萌动！生命的力量在最沉寂的深……",
      "本卦自下而上为“生机回归”六阶护持：初九过而能改微步回归（不远复无祗悔元吉）；六二见贤思齐休美而归（休复之吉以下仁也）；六三屡错屡改频频复归（频复厉无咎）；六四特立独行孤守正道（中行独复以从道也）；六……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《地雷复》的冬至一阳 · 生机复归之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-25_天雷无妄": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《天雷无妄》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《天雷无妄》所揭示的现实情境（天命昭昭 · 纯真无妄之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“天下雷行，物与无妄；先王以茂对时，育万物。”，指明了本卦的立身与治事格局。",
      "上卦为乾天，下卦为震雷。《大象传》曰：“天下雷行，物与无妄；先王以茂对时，育万物。”苍天之下春雷阵阵，万物随顺天时自然萌发生长，毫无半点人为造作与伪饰狡黠。遵循大自然本来规律，不搞投机取巧，方得天佑；……",
      "本卦自下而上为“纯真守正”六阶规诫：初九怀揣纯真勇往直前（无妄往吉得志也）；九二不计功利顺理成章（不耕获不菑畬利用攸往）；六三飞来横祸无妄之灾（无妄之灾行人得牛邑人之灾）；九四坚守原则不随俗浮沉（可贞……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《天雷无妄》的天命昭昭 · 纯真无妄之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-26_山天大畜": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《山天大畜》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《山天大畜》所揭示的现实情境（崇山蓄天 · 弘大储养之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“天在山中，大畜；君子以多识前言往行，以畜其德。”，指明了本卦的立身与治事格局。",
      "上卦为艮山，下卦为乾天。《大象传》曰：“天在山中，大畜；君子以多识前言往行，以畜其德。”浩瀚无边的万里晴天，竟然包容深藏在重重高山崇峦的怀抱之中！以山之厚实沉静，阻留蓄养长天的无尽刚健原力。象征一个人……",
      "本卦自下而上为“蓄养能量”六阶格局：初九面对险阻及时止步（有厉利已）；九二审时度势卸轮停步（舆说輹不犯灾也）；九三与贤同行良马追逐（良马逐利艰贞）；六四防患未然未雨绸缪（童牛之牿元吉）；六五刚柔相济去……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《山天大畜》的崇山蓄天 · 弘大储养之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-27_山雷颐": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《山雷颐》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《山雷颐》所揭示的现实情境（动止相宜 · 颐养身心之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山下有雷，颐；君子以慎言语，节饮食。”，指明了本卦的立身与治事格局。",
      "上卦为艮山（上止），下卦为震雷（下动）。《大象传》曰：“山下有雷，颐；君子以慎言语，节饮食。”全卦上下两阳爻如嘴唇，中间四阴爻如口腔牙齿。下颌运动、上颌静止，如口中咀嚼食物吸收营养；人活于世，言语从口……",
      "本卦自下而上为“养生养德”六阶修行：初九贪婪羡慕失其灵性（舍尔灵龟观我朵颐凶）；六二颠倒法则求助于下（颠颐拂经于丘颐）；六三纵欲无度自绝生机（拂颐贞凶十年勿用）；六四登高俯瞰虎视眈眈（颠颐吉虎视眈眈其……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《山雷颐》的动止相宜 · 颐养身心之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-28_泽风大过": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《泽风大过》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《泽风大过》所揭示的现实情境（泽漫大木 · 绝境担当之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽灭木，大过；君子以独立不惧，遁世无闷。”，指明了本卦的立身与治事格局。",
      "上卦为兑泽（深水洪涝），下卦为巽木（大树栋梁）。《大象传》曰：“泽灭木，大过；君子以独立不惧，遁世无闷。”滔天的大水彻底淹没了森林大树，中间四阳爻阳刚过盛，上下两阴爻极其薄弱，如同房梁两头受力过重即将……",
      "本卦自下而上为“危局力挽”六阶胆魄：初六慎之又慎垫以白茅（藉用白茅无咎）；九二枯木逢春老夫少妻（枯杨生稊老夫得其女妻）；九三不堪重负梁折柱断（栋桡凶不可以有辅也）；九四中流砥柱栋梁高隆（栋隆吉不桡乎下……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《泽风大过》的泽漫大木 · 绝境担当之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-31_泽山咸": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《泽山咸》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《泽山咸》所揭示的现实情境（山泽相通 · 心有灵犀之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山上有泽，咸；君子以虚受人。”，指明了本卦的立身与治事格局。",
      "上卦为兑泽（少女和悦），下卦为艮山（少男谦逊）。山顶汇聚汪泽，少男谦卑低头在少女之下，山泽气流相通、心灵不期而遇。《大象传》曰：“山上有泽，咸；君子以虚受人。”无心之感，至诚相照；君子虚怀若谷容纳他人……",
      "本卦自下而上为“心智相感”六阶渐进：初六感应于足趾心念初动（咸其拇）；六二感应于小腿稍有盲动（咸其腓凶居吉）；九三随波逐流毫无主见（咸其股执其随往吝）；九四诚意正心朋从尔思（贞吉悔亡朋从尔思）；九五感……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《泽山咸》的山泽相通 · 心有灵犀之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-32_雷风恒": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《雷风恒》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《雷风恒》所揭示的现实情境（雷动风行 · 恒久有道之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“雷风，恒；君子以立不易方。”，指明了本卦的立身与治事格局。",
      "上卦为震雷，下卦为巽风。雷声隆隆而微风顺应，雷风相伴相生、亿万年运化而不失其序。《大象传》曰：“雷风，恒；君子以立不易方。”宇宙恒常不在于僵死静止，而在于运动中的动态平衡；君子立身天地之间坚守原则方向……",
      "本卦自下而上为“持之以恒”六阶定力：初六急功近利追求过深（浚恒贞凶始求深也）；九二中庸自守悔恨消除（悔亡能久中也）；九三缺乏定力四处碰壁（不恒其德或承之羞）；九四求非其所徒劳无功（田无禽久非其位）；六……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《雷风恒》的雷动风行 · 恒久有道之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-33_天山遁": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《天山遁》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《天山遁》所揭示的现实情境（天高山隐 · 远害归隐之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“天下有山，遁；君子以远小人，不恶而严。”，指明了本卦的立身与治事格局。",
      "上卦为乾天，下卦为艮山。大山虽高万仞，然而苍天高远无限，山体终究追赶不上长天，两者越离越远。二阴爻自下滋长，小人得势逼迫君子；君子顺应天道高洁退隐，避开纷争蓄养大德，故命此卦为“遁”（dùn，适时退隐……",
      "本卦自下而上为“进退有度”六阶避险：初六逃避不及陷入险境（遁尾厉勿用有攸往）；六二执守原则固若金汤（执之用黄牛之革）；九三情丝牵绊拖泥带水（系遁有疾厉畜臣妾吉）；九四割舍私爱决绝退隐（好遁君子吉小人否……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《天山遁》的天高山隐 · 远害归隐之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-34_雷天大壮": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《雷天大壮》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《雷天大壮》所揭示的现实情境（雷震长天 · 盛大慎动之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“雷在天上，大壮；君子以非礼弗履。”，指明了本卦的立身与治事格局。",
      "上卦为震雷，下卦为乾天。云天之上雷霆万钧，阳气充沛至极、声势赫赫。四阳爻自下而上阳刚正大，然而刚健过甚最易滋生狂妄自负；君子非礼弗履、克制莽撞冲动，故命此卦为“大壮”（刚壮盛大、止于猛进）。……",
      "本卦自下而上为“戒骄用壮”六阶克制：初九盲目自信刚愎自用（壮于趾征凶）；九二中道自守前程安稳（贞吉以中也）；九三羊撞篱笆进退维谷（小人用壮君子用罔羝羊触藩）；九四打破藩篱豁然开朗（藩决不羸壮于大舆之輹……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《雷天大壮》的雷震长天 · 盛大慎动之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-35_火地晋": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《火地晋》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《火地晋》所揭示的现实情境（日照大地 · 旭日东升之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“明出地上，晋；君子以自昭明德。”，指明了本卦的立身与治事格局。",
      "上卦为离火（红日），下卦为坤地（广袤原野）。《大象传》曰：“明出地上，晋；君子以自昭明德。”一轮朝阳破晓而出跃出地平线，霞光万道普照万里大地。象征才能显耀、君臣相得、步步晋升，故命此卦为“晋”（晋升跃……",
      "本卦自下而上为“康庄晋阶”六阶风骨：初六起步受挫泰然处之（晋如摧如贞吉裕无咎）；六二忧思深远得蒙皇恩（晋如愁如贞吉受兹介福）；六三深得人心众志成城（众允悔亡志上行也）；九四贪恋权位如同硕鼠（鼫鼠贞厉位……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《火地晋》的日照大地 · 旭日东升之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-36_地火明夷": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《地火明夷》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《地火明夷》所揭示的现实情境（太阳入地 · 韬光养晦之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“明入地中，明夷；君子以莅众，用晦而明。”，指明了本卦的立身与治事格局。",
      "上卦为坤地，下卦为离火。烈日沉入地表之下，黑夜笼罩万物，天地陷入无边黑暗。《大象传》曰：“明入地中，明夷；君子以莅众，用晦而明。”当昏君当道、世道浑浊时，贤良智者若张扬才能必遭屠戮残害，唯有深藏若虚、……",
      "本卦自下而上为“暗夜坚守”六阶心智：初九收敛羽翼忍饥挨饿（垂其翼于飞君子于行主人有言）；六二膝盖受伤借马脱险（明夷于左股用拯马壮吉）；九三除恶务尽不可操切（明夷于南狩得其大首不可疾贞）；六四洞察内幕脱……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《地火明夷》的太阳入地 · 韬光养晦之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-37_风火家人": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《风火家人》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《风火家人》所揭示的现实情境（风从火出 · 齐家治世之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“风自火出，家人；君子以言有物而行有恒。”，指明了本卦的立身与治事格局。",
      "上卦为巽风，下卦为离火。火燃烧升腾带动空气流动生出微风，风助火势火生风威，内外呼应协同。《大象传》曰：“风自火出，家人；君子以言有物而行有恒。”由内而外修身、齐家、治国、平天下，立言有据言行一致，故命……",
      "本卦自下而上为“家道齐整”六阶治家：初六防患未然严立家规（闲有家悔亡）；六二操持内务柔顺持家（无攸遂在中馈贞吉）；九三严厉管教虽过犹吉（家人嗃嗃悔厉吉妇子嘻嘻终吝）；六四勤俭持家财源亨通（富家大吉顺在……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《风火家人》的风从火出 · 齐家治世之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-38_火泽睽": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《火泽睽》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《火泽睽》所揭示的现实情境（火上泽下 · 求同存异之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“上火下泽，睽；君子以同而异。”，指明了本卦的立身与治事格局。",
      "上卦为离火（火性上炎），下卦为兑泽（水性下渗）。《大象传》曰：“上火下泽，睽；君子以同而异。”水火背道而驰、互不相通，两相背离甚至相互猜忌。然而大千世界和而不同，智者不强求一致，而在背离中寻求互补与默……",
      "本卦自下而上为“化解分歧”六阶智慧：初九任其自去马逸自归（丧马勿逐自复见恶人无咎）；九二小巷相遇因陋就简（遇主于巷未失道也）；六三身陷冤屈终得昭雪（见舆曳其牛掣其人天且劓）；九四形单影只得逢知己（睽孤……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《火泽睽》的火上泽下 · 求同存异之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-39_水山蹇": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《水山蹇》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《水山蹇》所揭示的现实情境（高山绝壑 · 进退维谷之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山上有水，蹇；君子以反身修德。”，指明了本卦的立身与治事格局。",
      "上卦为坎水（大河险滩），下卦为艮山（高耸险峰）。前有惊涛骇浪，后有崇山峻岭，跋山涉水步履艰难（蹇）。《大象传》曰：“山上有水，蹇；君子以反身修德。”面对无法硬冲的绝境，智者绝不盲目送死，而是止步反思、……",
      "本卦自下而上为“险境反省”六阶进退：初六前有险阻知难而退（往蹇来誉宜待也）；六二王臣奔波非为私利（王臣蹇蹇匪躬之故）；九三盲目冒进折返为安（往蹇来反内喜之也）；六四寻求同道连带结盟（往蹇来连当位实也）……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《水山蹇》的高山绝壑 · 进退维谷之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-40_雷水解": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《雷水解》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《雷水解》所揭示的现实情境（春雷破冰 · 万物化解之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“雷雨作，解；君子以赦过宥罪。”，指明了本卦的立身与治事格局。",
      "上卦为震雷，下卦为坎水。《大象传》曰：“雷雨作，解；君子以赦过宥罪。”初春春雷阵阵伴随甘霖降下，冰封的大地与江河瞬间冰雪消融。寒冬过去生机勃发，所有险阻冰释前嫌，君子赦免罪过宽容待人，故命此卦为“解”……",
      "本卦自下而上为“纾困释怀”六阶转机：初六安宁无事休养生息（刚柔之际义无咎也）；九二射杀狐狸得获正道（田获三狐得黄矢）；六三德不配位致寇招祸（负且乘致寇至）；九四解脱私心诚交良友（解而拇朋至斯孚）；六五……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《雷水解》的春雷破冰 · 万物化解之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-41_山泽损": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《山泽损》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《山泽损》所揭示的现实情境（深泽培山 · 损己利人之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山下有泽，损；君子以惩忿窒欲。”，指明了本卦的立身与治事格局。",
      "上卦为艮山，下卦为兑泽。《大象传》曰：“山下有泽，损；君子以惩忿窒欲。”大泽水汽蒸腾滋润高山，深泽沉潜泥沙堆高山峰。损下以益上，克制个人膨胀的欲望与愤怒，以有限之自我换取无限之境界，故命此卦为“损”（……",
      "本卦自下而上为“克己损益”六阶舍得：初九迅速协助适可而止（已事遄往酌损之）；九二守正为本不损自益（利贞征凶弗损益之）；六三减少纷扰精诚专一（三人行则损一人一人行则得其友）；六四去除旧疾喜从天降（损其疾……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《山泽损》的深泽培山 · 损己利人之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-42_风雷益": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《风雷益》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《风雷益》所揭示的现实情境（风狂雷迅 · 丰盛利益之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“风雷，益；君子以见善则迁，有过则改。”，指明了本卦的立身与治事格局。",
      "上卦为巽风，下卦为震雷。《大象传》曰：“风雷，益；君子以见善则迁，有过则改。”春雷阵阵配合狂风大作，风助雷威雷助风势，激荡天地化育万物。损上以益下，君王让利于万民，百姓富足则天下安定，故命此卦为“益”……",
      "本卦自下而上为“广施恩泽”六阶大业：初九趁势而为大展宏图（利用为大作元吉）；九二顺天应人天赐大福（或益之十朋之龟永贞吉）；六三利用危困磨砺心志（益之用凶事中行告公用圭）；六四居中协调迁都大吉（中行告公……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《风雷益》的风狂雷迅 · 丰盛利益之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-43_泽天夬": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《泽天夬》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《泽天夬》所揭示的现实情境（泽悬于天 · 刚决果断之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽上于天，夬；君子以施禄及下，居德则忌。”，指明了本卦的立身与治事格局。",
      "上卦为兑泽，下卦为乾天。深渊汪洋大水悬挂在苍天之顶，水库蓄满即将决堤奔涌而出。五阳爻刚健上推，仅剩顶部一阴爻；代表正义之师果断决绝裁决小人，决堤放水雷厉风行，故命此卦为“夬”（guài，决断、裁断、决……",
      "本卦自下而上为“雷厉决断”六阶魄力：初九力量薄弱切莫逞强（壮于前趾往不胜为咎）；九二严密戒备防患未然（惕号莫夜有戎勿恤）；九三忍辱负重暗中谋定（壮于頄有凶君子夬夬若濡有愠无咎）；九四进退维谷失去听从（……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《泽天夬》的泽悬于天 · 刚决果断之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-44_天风姤": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《天风姤》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《天风姤》所揭示的现实情境（风吹天下 · 不期而遇之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“天下有风，姤；后以施命诰四方。”，指明了本卦的立身与治事格局。",
      "上卦为乾天，下卦为巽风。《大象传》曰：“天下有风，姤；后以施命诰四方。”微风吹拂苍茫天下，无微不至穿透万物。底层初生一阴爻，象征弱小之物在不经意间破土相逢；防微杜渐防止恶习暗中蔓延，故命此卦为“姤”（……",
      "本卦自下而上为“偶遇慎微”六阶警策：初六及时刹车制止恶萌（系于金柅贞吉柔道牵也）；九二藏而不露防范小人（包有鱼无咎不利宾）；九三虽处窘境未受侵害（臀无肤其行次且无大咎）；九四脱离群众失去民心（包无鱼起……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《天风姤》的风吹天下 · 不期而遇之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-45_泽地萃": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《泽地萃》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《泽地萃》所揭示的现实情境（水聚于地 · 人才荟萃之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽上于地，萃；君子以除戎器，戒不虞。”，指明了本卦的立身与治事格局。",
      "上卦为兑泽，下卦为坤地。《大象传》曰：“泽上于地，萃；君子以除戎器，戒不虞。”千万条溪流汇聚于大泽湖泊之中，大泽滋养着大地泥土。江河汇聚、人才聚集、宗庙聚族，群英荟萃欣欣向荣，故命此卦为“萃”（cuì……",
      "本卦自下而上为“群英汇聚”六阶凝聚：初六诚心未定容易迷失（有孚不终乃乱乃萃）；六二心怀虔敬感动上天（引吉无咎孚乃利用禴）；六三徘徊孤立应当主动（萃如嗟嗟无攸利往无咎）；九四功高盖主大吉无咎（大吉无咎位……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《泽地萃》的水聚于地 · 人才荟萃之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-46_地风升": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《地风升》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《地风升》所揭示的现实情境（地中出木 · 步步高升之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“地中生木，升；君子以顺德，积小以高大。”，指明了本卦的立身与治事格局。",
      "上卦为坤地，下卦为巽木。《大象传》曰：“地中生木，升；君子以顺德，积小以高大。”大地泥土深处的树木嫩芽破土而出，日复一日默默向上生长，终成参天大树。顺应天地德行，积蓄微小而成博大，故命此卦为“升”（升……",
      "本卦自下而上为“稳步跃升”六阶阶梯：初六深受赏识自信高升（允升大吉上合志也）；六二心存至诚微物享祭（孚乃利用禴春享之义）；六三一马平川畅通无阻（升虚邑无所疑也）；六四登堂入室王祭岐山（王用亨于岐山顺事……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《地风升》的地中出木 · 步步高升之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-47_泽水困": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《泽水困》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《泽水困》所揭示的现实情境（泽无滴水 · 困境涅槃之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽无水，困；君子以致命遂志。”，指明了本卦的立身与治事格局。",
      "上卦为兑泽，下卦为坎水。《大象传》曰：“泽无水，困；君子以致命遂志。”水本该在湖泽之中，然而泉水全部渗漏到湖底深渊之下，湖面干涸龟裂、寸草不生。处于山穷水尽、孤立无援之大绝境；君子舍身取义、在至暗时刻……",
      "本卦自下而上为“逆境涅槃”六阶升华：初六意志沉沦陷入幽谷（臀困于株木入于幽谷三岁不觌）；六二困于享受朱衣降临（困于酒食朱绂方来利用享祀）；六三进退失据自断退路（困于石据于蒺藜入室不见妻）；九四徐徐而来……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《泽水困》的泽无滴水 · 困境涅槃之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-48_水风井": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《水风井》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《水风井》所揭示的现实情境（木桶汲泉 · 源头活水之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“木上有水，井；君子以劳民劝相。”，指明了本卦的立身与治事格局。",
      "上卦为坎水，下卦为巽木。《大象传》曰：“木上有水，井；君子以劳民劝相。”木制的水桶深入地下寒泉，辘轳运转清泉源源不断被汲引到地面。水井千古不移其所、甘泉供天下人汲饮而永不干涸枯竭；修身治学当如挖井，不……",
      "本卦自下而上为“清泉修养”六阶深挖：初六井底污泥不堪饮用（井泥不食旧井无禽）；六二陶罐破漏弃于深沟（井谷射鲋瓮敝漏）；六三淘洗干净无人来汲（井渫不食为我心恻可用汲）；六四砌砖整修沉淀内功（井甃无咎修井……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《水风井》的木桶汲泉 · 源头活水之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-49_泽火革": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《泽火革》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《泽火革》所揭示的现实情境（水火交战 · 顺天变革之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽中有火，革；君子以治历明时。”，指明了本卦的立身与治事格局。",
      "上卦为兑泽（水），下卦为离火。《大象传》曰：“泽中有火，革；君子以治历明时。”水与火同处一处，水能熄灭烈火，烈火能煮干大泽，两者势不两立爆发天翻地覆的根本变革。汤武革命顺天应人，破旧立新重整乾坤，故命……",
      "本卦自下而上为“制度变革”六阶攻坚：初九时机未到稳固守正（巩用黄牛之革不可以有为）；六二时机成熟果断出征（巳日革之征吉行有嘉）；九三三番推敲谋定而动（革言三就又何之矣）；九四破除天命人心大顺（改命吉信……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《泽火革》的水火交战 · 顺天变革之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-50_火风鼎": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《火风鼎》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《火风鼎》所揭示的现实情境（燃木成火 · 铸鼎定乾坤之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“木上有火，鼎；君子以正位凝命。”，指明了本卦的立身与治事格局。",
      "上卦为离火，下卦为巽木。《大象传》曰：“木上有火，鼎；君子以正位凝命。”以木柴助燃火焰，烹煮调和五味佳肴。鼎为古代国家至高无上之重器，去旧为革、取新为鼎，象征安邦定国、立国承运化育人才，故命此卦为“鼎……",
      "本卦自下而上为“重器鼎新”六阶造化：初六鼎足翻倒倒出残渣（鼎颠趾利出否得妾以子）；九二鼎中饱满小人眼红（鼎有实我仇有疾不我能即）；九三鼎耳受损行路受阻（鼎耳革其行塞雉膏不食方雨亏悔）；九四担当过重折足……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《火风鼎》的燃木成火 · 铸鼎定乾坤之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-53_风山渐": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《风山渐》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《风山渐》所揭示的现实情境（山生乔木 · 循序渐进之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山上有木，渐；君子以居贤德善俗。”，指明了本卦的立身与治事格局。",
      "上卦为巽风（树木），下卦为艮山。《大象传》曰：“山上有木，渐；君子以居贤德善俗。”高耸的大山之上长有一棵大树，微风吹拂，大树顺应四时扎根岩层、缓缓拔高长成参天大树。如同鸿雁迁徙按部就班，女子出嫁六礼备……",
      "本卦自下而上为“渐进成器”六阶步调：初六初入江湖微有浮议（鸿渐于干小子厉有言无咎）；六二从容安歇欢聚饮食（鸿渐于磐饮食衎衎不素饱也）；九三盲目远征脱离正道（鸿渐于陆夫征不复妇孕不育）；六四巧妙栖身安于……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《风山渐》的山生乔木 · 循序渐进之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-54_雷泽归妹": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《雷泽归妹》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《雷泽归妹》所揭示的现实情境（雷动泽上 · 戒急躁进之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽上有雷，归妹；君子以永终知敝。”，指明了本卦的立身与治事格局。",
      "上卦为震雷（长男），下卦为兑泽（少女）。大泽之上惊雷大作，少女迷恋长男，情窦初开急于婚嫁。《大象传》曰：“泽上有雷，归妹；君子以永终知敝。”仅凭一时冲动激情盲目结合，违背正常礼义程序，终局必然走向破败……",
      "本卦自下而上为“急情之戒”六阶审视：初六甘为偏房跛能勉行（归妹以娣跛能履吉相承也）；六二坚守贞操甘居寂寞（眇能视利幽人之贞）；六三贪图名分反遭嫌弃（归妹以须反归以娣）；九四延期等待静候良缘（归妹愆期迟……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《雷泽归妹》的雷动泽上 · 戒急躁进之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-55_雷火丰": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《雷火丰》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《雷火丰》所揭示的现实情境（雷电交驰 · 盛极必衰之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“雷电皆至，丰；君子以折狱致刑。”，指明了本卦的立身与治事格局。",
      "上卦为震雷，下卦为离火。《大象传》曰：“雷电皆至，丰；君子以折狱致刑。”雷声轰鸣电光照耀，天地大明、万物丰硕浩瀚如日中天。然而烈日升到正顶必将西斜，盛极之时暗藏倾覆之危机；处丰大之时当居安思危，故命此……",
      "本卦自下而上为“丰盛保泰”六阶权衡：初九结交贤朋平分秋色（遇其配主虽旬无咎）；六二黑云蔽日正午见斗（丰其蔀日中见斗往得疑疾有孚发若）；九三阴翳遮蔽折断右臂（丰其沛日中见沬折其右肱）；九四重云消散遇见明……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《雷火丰》的雷电交驰 · 盛极必衰之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-56_火山旅": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《火山旅》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《火山旅》所揭示的现实情境（山野烈火 · 羁旅漂泊之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山上有火，旅；君子以明慎用刑而不留狱。”，指明了本卦的立身与治事格局。",
      "上卦为离火，下卦为艮山。《大象传》曰：“山上有火，旅；君子以明慎用刑而不留狱。”高山之上燃烧起野火，随风蔓延、过而不留。游子背井离乡客居异域，人情淡薄处处羁绊；在异乡必须低调谦逊、慎言慎行，故命此卦为……",
      "本卦自下而上为“异乡立足”六阶自持：初六斤斤计较自招灾祸（旅琐琐斯其所取灾）；六二安身立命深得帮扶（旅即次怀其资得童仆贞）；九三骄傲蛮横焚烧旅舍（旅焚其次丧其童仆贞厉）；九四虽得盘缠未安其心（旅于处得……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《火山旅》的山野烈火 · 羁旅漂泊之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-59_风水涣": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《风水涣》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《风水涣》所揭示的现实情境（春风掠水 · 冰解涣散之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“风行水上，涣；先王以享于上帝，立庙。”，指明了本卦的立身与治事格局。",
      "上卦为巽风，下卦为坎水。《大象传》曰：“风行水上，涣；先王以享于上帝，立庙。”暖洋洋的春风拂过浩荡江面，吹散了千里浮冰，波澜泛起冰消雪融。人心涣散隔阂之时，当立宗庙、祭神灵凝聚共同信仰，化散为聚、涉大……",
      "本卦自下而上为“破冰聚心”六阶经纶：初六借助强援脱离困境（用拯马壮吉顺也）；六二奔赴机台消除悔恨（涣奔其机悔亡得愿也）；六三舍弃私心大公无私（涣其躬无悔志在外也）；六四散除朋党重组大局（涣其群元吉光大……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《风水涣》的春风掠水 · 冰解涣散之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-60_水泽节": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《水泽节》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《水泽节》所揭示的现实情境（大泽聚水 · 节制有度之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽上有水，节；君子以制数度，议德行。”，指明了本卦的立身与治事格局。",
      "上卦为坎水，下卦为兑泽。《大象传》曰：“泽上有水，节；君子以制数度，议德行。”江河流水汇聚于大泽湖泊之中，湖泊有其固定的容量与堤坝边界；水少则枯竭，水满则泛滥，唯有节制得当方能碧波荡漾。人生与制度皆须……",
      "本卦自下而上为“度数节制”六阶分寸：初六闭门自守洞悉通塞（不出户庭知通塞也）；六二错失良机大祸临头（不出门庭凶失时极也）；六三放纵无度叹息悔恨（不节若则嗟若谁咎也）；六四安然守节承接天命（安节之亨承上……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《水泽节》的大泽聚水 · 节制有度之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-61_风泽中孚": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《风泽中孚》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《风泽中孚》所揭示的现实情境（风抚清泽 · 至诚通天之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“泽上有风，中孚；君子以议狱缓死。”，指明了本卦的立身与治事格局。",
      "上卦为巽风，下卦为兑泽。全卦外实内虚，上下各两阳爻护卫中间两阴爻，如母鸟孵卵、雏鸟破壳。《大象传》曰：“泽上有风，中孚；君子以议狱缓死。”清风拂过大泽泛起层层波澜，至诚无私的信义感动天地飞禽走兽。心中……",
      "本卦自下而上为“至诚感应”六阶品格：初六专心致志不受动摇（虞吉有他不燕也）；九二鹤鸣幽谷子声相应（鸣鹤在阴其子和之中心愿也）；六三进退失据心神大乱（得敌或鼓或罢或泣或歌）；六四明月将圆超越私党（月几望……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《风泽中孚》的风抚清泽 · 至诚通天之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-62_雷山小过": {
    "level": 2,
    "levelLabel": "时位精研 · 标杆级",
    "badgeClass": "level-2",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《雷山小过》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《雷山小过》所揭示的现实情境（高山飞雷 · 敬慎微过之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“山上有雷，小过；君子以行过乎恭，丧过乎哀，用过乎俭。”，指明了本卦的立身与治事格局。",
      "上卦为震雷，下卦为艮山。中间两阳爻、上下各两阴爻，如飞鸟振翅之形。高山之顶惊雷炸响，雷声极近逼人。《大象传》曰：“山上有雷，小过；君子以行过乎恭，丧过乎哀，用过乎俭。”小事可以稍过分寸以示敬慎（如礼貌……",
      "本卦自下而上为“敬慎适度”六阶平衡：初六羽翼未丰盲目高飞（飞鸟以凶不可如何也）；六二退求其次顺应尊长（过其祖遇其妣不及其君）；九三防备不严自遭杀戮（弗过防之或戕之凶）；九四刚柔相济审慎行事（无咎弗过遇……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《雷山小过》的高山飞雷 · 敬慎微过之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-63_水火既济": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《水火既济》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《水火既济》所揭示的现实情境（水火相融 · 功成圆满之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“水在火上，既济；君子以思患而预防之。”，指明了本卦的立身与治事格局。",
      "上卦为坎水，下卦为离火。《大象传》曰：“水在火上，既济；君子以思患而预防之。”水在锅炉之上，火在灶膛之下，水得火之加热烹饪成佳肴，火得水之节制不至燎原。全卦六爻全部当位（阴居阴位、阳居阳位），阴阳水火……",
      "本卦自下而上为“守成防变”六阶警策：初九刹车减速浸湿尾巴（曳其轮濡其尾无咎）；六二失落头巾切莫强求（妇丧其茀勿逐七日得）；九三征伐外敌历经三年（高宗伐鬼方三年克之小人勿用）；六四严密防漏整日警惕（濡有……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《水火既济》的水火相融 · 功成圆满之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  },
  "lesson-64_火水未济": {
    "level": 3,
    "levelLabel": "深水辩证 · 进阶级",
    "badgeClass": "level-3",
    "reviewCount": 3,
    "inlineCount": 2,
    "scenarioTitle": "向朋友讲透《火水未济》的核心处事底牌与避险智慧",
    "scenarioPrompt": "假想你的朋友完全没接触过周易，正面临类似《火水未济》所揭示的现实情境（火炎水润 · 生生不息之象）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！",
    "coreHints": [
      "《大象传》点穴：“火在水上，未济；君子以慎辨物居方。”，指明了本卦的立身与治事格局。",
      "上卦为离火，下卦为坎水。《大象传》曰：“火在水上，未济；君子以慎辨物居方。”火性炎上拼命往长空飞升，水性润下拼命往地底流淌，水火背道而驰无法相交。全卦六爻全部失位（阴居阳位、阳居阴位），代表事业尚未成……",
      "本卦自下而上为“永恒探索”六阶新篇：初六小狐涉水浸湿尾巴（濡其尾吝不知极也）；九二刹紧车轮坚守正道（曳其轮贞吉中以行正也）；六三未济涉险求索前路（未济征凶利涉大川）；九四历尽艰险伐定大局（贞吉悔亡震用……"
    ],
    "scaffolds": [
      {
        "title": "💡 现实打个比方",
        "desc": "把《火水未济》的火炎水润 · 生生不息之象映射为生活、职场或商业中的具体生动案例",
        "insert": "【生活/业务比方】：这一卦在现实中就像……，看似……，其实……"
      },
      {
        "title": "🗣️ 大白话核心锦囊",
        "desc": "抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律",
        "insert": "【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……"
      },
      {
        "title": "🔍 避坑盲区自检",
        "desc": "人在这个阶段最容易自以为是地犯什么低级错误？",
        "insert": "【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……"
      }
    ]
  }
};

  // 难易度自适应评估模型：根据课时类型与深浅自适应问题数量与费曼情境
  function getLessonAdaptiveConfig(lessonId, lesson) {
    if (!lessonId) lessonId = '';

    // 优先匹配标杆卦矩阵专属定制配置
    if (LESSON_CUSTOM_CONFIGS[lessonId]) {
      const custom = LESSON_CUSTOM_CONFIGS[lessonId];
      return {
        level: custom.level || 2,
        levelLabel: custom.levelLabel || '时位精研 · 标杆级',
        badgeClass: custom.badgeClass || (custom.level === 3 ? 'level-3' : custom.level === 1 ? 'level-1' : 'level-2'),
        reviewCount: custom.reviewCount || 3,
        inlineCount: custom.inlineCount || 2,
        scenarioTitle: custom.scenarioTitle,
        scenarioPrompt: custom.scenarioPrompt,
        coreHints: custom.coreHints || [],
        scaffolds: custom.scaffolds || []
      };
    }

    // Level 1: 认知底座与入门导读课通用后备 (p0-01 ~ p0-04)
    if (lessonId.startsWith('p0-') || lessonId.startsWith('intro-')) {
      return {
        level: 1,
        levelLabel: '认知筑基 · 启蒙级',
        badgeClass: 'level-1',
        reviewCount: 2,
        inlineCount: 1,
        scenarioTitle: '向零基础朋友讲透底层世界观',
        scenarioPrompt: `假想你的朋友完全没接触过《易经》，请用 3 分钟大白话向他讲明白《${lesson ? lesson.title : '本课'}》的核心逻辑。严禁堆砌文言术语，必须用日常语言或生动生活比喻！`,
        coreHints: [
          '易经以“象、数、理、占”为四梁八柱，重在取象比类与顺应节律，绝非宿命论迷信。',
          '乾健（生生不息、刚中守正）与坤顺（厚德载物、含章可贞）为易经生化之母，阴阳互根。',
          '三才之道（天时、地利、人和）提醒我们：在客观现实与大势之间，找准属于人的主动抉择点。'
        ],
        scaffolds: [
          { title: '💡 生活具象比喻', desc: '比如：把阴阳三才比作现代物理的二元能量与三维空间……', insert: '【生活比喻】：比如用……来打比方，它就像……' },
          { title: '🗣️ 核心大白话转译', desc: '去掉古文术语，讲清楚最受用的 1 个底层思维认知', insert: '【大白话核心】：抛开复杂术语，古人想告诉我们的其实是……' },
          { title: '🔍 外行困惑排查', desc: '如果朋友追问“这到底是不是算命迷信”，你如何破除误解？', insert: '【外行盲区破除】：常人最大的误区在于……，但实际上它是……' }
        ]
      };
    }

    // Level 3: 深度辩证与复杂交变卦通用后备
    const complexGuas = ['lesson-23_山地剥', 'lesson-24_地雷复', 'lesson-18_山风蛊', 'lesson-29_坎为水', 'lesson-30_离为火', 'lesson-63_水火既济', 'lesson-64_火水未济'];
    if (complexGuas.includes(lessonId)) {
      return {
        level: 3,
        levelLabel: '深水辩证 · 进阶级',
        badgeClass: 'level-3',
        reviewCount: 3,
        inlineCount: 2,
        scenarioTitle: '向团队或朋友讲透逆境危机与绝处逢生',
        scenarioPrompt: `假想你的伙伴正面临重大的转折阵痛，请用大白话向他讲透《${lesson ? lesson.title : '本卦'}》中的物极必反与生克制化。`,
        coreHints: [
          '“极深研几，穷则变，变则通，通则久”。逆境深水卦中吉凶并非单向演进。',
          '面对剥极、险陷（坎）、败坏（蛊）等深水局势，防守重于进攻，“硕果不食”正孕育剥极而复的新生。',
          '把握核心变爻枢纽，在临界点果断刹车或顺势化解，方能绝处逢生。'
        ],
        scaffolds: [
          { title: '⚡ 真实困局比喻', desc: '类比现代商业周期见顶、组织内耗或职业瓶颈期……', insert: '【实战场景比喻】：这种情况在现实中就像……' },
          { title: '💡 反直觉破局法', desc: '大白话讲清楚为什么顺境藏凶、险中反而孕育生机', insert: '【反常识破局心法】：一般人会盲目……，但高手的底牌是……' },
          { title: '🎯 关键临界点提醒', desc: '告诉他走到哪一步必须踩刹车或必须当机立断', insert: '【生死临界提醒】：最致命的转折点在于……，切记不可……' }
        ]
      };
    }

    // Level 2: 经典标杆卦象常规后备
    return {
      level: 2,
      levelLabel: '时位精研 · 标杆级',
      badgeClass: 'level-2',
      reviewCount: 3,
      inlineCount: 2,
      scenarioTitle: '用大白话向朋友讲透本卦做人做事底牌',
      scenarioPrompt: `假想你的朋友完全没读过周易，请用 3 分钟大白话向他讲透《${lesson ? lesson.title : '本卦'}》最受用的人生/职场处事智慧。`,
      coreHints: [
        '六爻以二、五爻居中为贵；初爻潜心蓄力，三爻终日乾乾戒慎，上爻戒满止亢。',
        '“得中”远胜于机械的“得位”，动静相宜，依时而动方为吉道。',
        '将卦爻象数与现代真实处事博弈相印证，内求身心定力，外应时代变局。'
      ],
      scaffolds: [
        { title: '💡 现实打个比方', desc: '把卦象爻位映射为一个人或业务从初创到鼎盛的生命周期', insert: '【生活/职场比方】：这一卦在生活中就像……' },
        { title: '🗣️ 大白话处事锦囊', desc: '不提专业卦辞爻名，把古人的避坑心得提炼为通俗锦囊', insert: '【大白话核心锦囊】：古人其实是给出了一个关键法则：……' },
        { title: '🔍 避坑盲区自检', desc: '人在这个阶段最容易犯什么低级错误？', insert: '【最易摔跤的盲区】：身处这个阶段，常人最容易误判的是……' }
      ]
    };
  }

  // 标杆矩阵正文穿插【边读边思 · 驻足小探问】精研题库 (阶段二全量覆盖)
  const INLINE_THINK_BANK = {
  "p0-01": [
    {
      "sectionKeyword": "起源",
      "tag": "起源觉察 · 边读边思",
      "question": "“近取诸身，远取诸物”。反观你近期的生理体能信号（如睡眠、紧绷度）与周遭工作环境、人际氛围，它们之间是否呈现某种全息同构？如果用一种自然物象来形容你当下的心境与处境，你会选什么？",
      "hint": "💡 玄微先生点穴启发：身心与境遇同构，内焦则外困，神定则境安。学易的第一步是恢复对自身生理与微观环境的敏锐觉知，观物即是观心。"
    },
    {
      "sectionKeyword": "极简算法",
      "tag": "三才模型 · 边读边思",
      "question": "读到“三才之道（初爻为地，中爻为人，上爻为天）”，停下来想一想：在你当前负责的一项重要工作或个人目标中，属于客观不可动的“地道（现实基础/组织约束）”和时代大势的“天道”分别是什么？身处中间的你，当前最该在哪一点发力？",
      "hint": "💡 玄微先生点穴启发：地道是看得见摸得着的资源配称、现金流或底层交付能力；天道是不可逆的行业周期、监管与用户心理演化。人在其中，既不能脱离地皮起高楼，也不能妄图逆天而行。人道的发力点在于“顺天应人”，在客观约束中做出最高胜率的行为抉择。"
    },
    {
      "sectionKeyword": "八卦全息原型",
      "tag": "八大原力 · 边读边思",
      "question": "在乾（纯阳自驱）、坤（包容承载）、震（破土冲锋）、巽（润物渗透）、坎（履险求通）、离（洞察启明）、艮（止步风控）、兑（和悦沟通）中，审视你当前的性格或团队，哪一种原力严重过剩？哪一种原力极其匮乏？",
      "hint": "💡 玄微先生点穴启发：常人多犯“偏执一端”之误。冲锋破局过猛（震）而无止步风控（艮）必致翻车；一味默默承载（坤）而无创始意志（乾）易陷被动。知己之短，方知借势互补。"
    },
    {
      "sectionKeyword": "双螺旋",
      "tag": "节气时序 · 边读边思",
      "question": "文王后天八卦从“震东（春生破土）”流转到“离南（夏至极明）”、“兑西（秋收悦赏）”与“坎北（冬藏蓄力）”。把你手头最重要的业务代入后天时序，它当前处于哪一个节气？你当下的动作是拔苗助长，还是合拍顺时？",
      "hint": "💡 玄微先生点穴启发：不合时宜的努力是灾难。在“坎冬”盲目大扩张必然冻毙，在“震春”贪恋安逸必定颗粒无收。知时顺势，顺时而动，方能事半功倍。"
    },
    {
      "sectionKeyword": "万物类象",
      "tag": "动力学取象 · 边读边思",
      "question": "“见动知震，见险知坎，见止知艮”。在你近期经历的事件中，有没有遇到一件表面看似是好事（和悦之兑），但其底层动力学实际上暗藏险坑（深陷之坎）？你是如何穿透表象识别其本质动力学的？",
      "hint": "💡 玄微先生点穴启发：外行被事物外在的名词和承诺所迷惑，易学家看穿底层能量动力学。甜言蜜语背后若是失控的深渊，那便是“兑外坎内”。透过表象看动力学，方能不被表象蒙蔽。"
    }
  ],
  "p0-02": [
    {
      "sectionKeyword": "为什么单卦",
      "tag": "复杂系统 · 边读边思",
      "question": "单卦三爻表征单一自然原力，而重卦六爻表征复杂系统相遇与互动。面对你手头的一个棘手矛盾，如果把它拆解为“系统 A”与“系统 B”的互动，矛盾的焦点究竟是出在输入输出，还是底层规则的冲突？",
      "hint": "💡 玄微先生点穴启发：单一力量没有吉凶，两相碰撞方生变数。读懂重卦，就是把生活从“非黑即白”升级为“系统动力学”的高维视角。"
    },
    {
      "sectionKeyword": "相对论",
      "tag": "内外博弈 · 边读边思",
      "question": "“内卦决定你能守多久，外卦决定你能走多远”。审视你当前的项目或职业状态，你的“内卦（团队实力、心智定力、底层现金流）”是否稳固？外部的“外卦（客场环境、市场大势）”又在施加怎样的引力？",
      "hint": "💡 玄微先生点穴启发：地天泰内刚外柔，天地否内弱外傲。内部不稳而急于向外扩张，必成天地否之困局；内固根本而外示谦逊，方为地天泰之通途。"
    },
    {
      "sectionKeyword": "全息四维",
      "tag": "全息视界 · 边读边思",
      "question": "“错卦看底线，综卦换立场，互卦察暗流”。面对当前与你有利益分歧的一位合作方或竞争对手，如果把他的视界头脚颠倒 180 度（综卦视角），他眼中最焦虑的风险是什么？",
      "hint": "💡 玄微先生点穴启发：常人习惯执着于自己的主观得失（本卦），但高手总能在谈判桌前瞬间切换到综卦视角。对手的激烈防御往往源于他背后的脆弱或被动，看穿他的综卦，破局的真正筹码才会浮现。"
    },
    {
      "sectionKeyword": "三步解构法",
      "tag": "破局解构 · 边读边思",
      "question": "面对任何一个未知时局，按照“1. 看物理反应 ➔ 2. 看内外国策 ➔ 3. 查隐藏互卦”三步法，挑一个你最近看不懂的行业或人际事件，试着用这三步做一个极简推演，你发现了什么新线索？",
      "hint": "💡 玄微先生点穴启发：透过三步解构法，一切纷繁芜杂的现象都能被抽丝剥茧。掌握这套算法，世间无不可读之时局。"
    }
  ],
  "p0-03": [
    {
      "sectionKeyword": "时空相对论",
      "tag": "爻位阶梯 · 边读边思",
      "question": "初爻潜伏、二爻破土、三爻危地、四爻试错、五爻尊位、上爻退隐。对照这一人生与业务阶梯，你当前正处在哪一个爻位？在这个爻位上，最不该做的自杀式动作是什么？",
      "hint": "💡 玄微先生点穴启发：初爻勿用而妄动必折，三爻夹层而张扬必遭忌，上爻登峰而贪权必亢坠。认清自己的爻位，就拿到了避坑护身符。"
    },
    {
      "sectionKeyword": "得中",
      "tag": "中道超越 · 边读边思",
      "question": "“得位不如得中”。回顾最近的一次纠结或争议，你是在执着于“我的名分、面子、头衔或形式正确（得位）”，还是顺应了事情当前最平衡中庸的客观节奏（得中）？",
      "hint": "💡 玄微先生点穴启发：得位常关乎外在虚名与权力，而得中关乎内在时机的把握与分寸感。位不当而能守中，往往能逢凶化吉；居尊位而失中，最易滋生骄狂亢坠之险。"
    },
    {
      "sectionKeyword": "乘、承、比、应",
      "tag": "人际网络 · 边读边思",
      "question": "在“承（顺从支持）、乘（越权凌驾）、比（邻近协同）、应（遥相呼应）”的人际协同中，审视你与直属上级和核心搭档的关系，当前是“柔承刚”（吉），还是不自觉地陷入了“柔乘刚”（越位生隙）？",
      "hint": "💡 玄微先生点穴启发：职场博弈最忌“乘刚”，以弱凌强、不尊位分，必引反噬；反之，以柔承刚，辅佐成就大局，反而能建立不可替代的信任基石。"
    },
    {
      "sectionKeyword": "以物观物",
      "tag": "反观破我执 · 边读边思",
      "question": "邵雍云：“以我观物者，情也，偏也；以物观物者，性也，公也。”当下最让你烦恼或焦虑的一件事，如果彻底拿掉“我的委屈、我的预期、我的面子”，纯粹从事物本身的客观因果律来看，它的真相究竟是什么？",
      "hint": "💡 玄微先生点穴启发：破除我执，世界清凉。痛苦往往不是事件本身带来的，而是“我认为应该如何”的妄念造成的。以物观物，解法自现。"
    }
  ],
  "p0-04": [
    {
      "sectionKeyword": "经与传的边界",
      "tag": "经传演进 · 边读边思",
      "question": "孔子作《十翼》，使《周易》从占卜卜筮手册跃迁为人道哲学与心智模型。在你的认知中，过去是否也曾将易经误解为神秘算命？理解了经传分野后，你认为易经对现代人最大的实用价值何在？",
      "hint": "💡 玄微先生点穴启发：卜以决疑，易以断事；不占而已矣，玩辞而自得。易经是决策心法，而非宿命锁链。"
    },
    {
      "sectionKeyword": "十翼",
      "tag": "十翼导图 · 边读边思",
      "question": "《大象传》教人“效法天地立法建制”，《系辞传》教人“穷理尽性知宇宙大道”，《序卦传》揭示“事物相生演进链”。在这些视角中，哪一种最能启发你当下的领导力或业务架构？",
      "hint": "💡 玄微先生点穴启发：大象传是最高级的管理学，每一卦都在回答“身为管理者或君子，面对这种天象格局该如何行动”。"
    },
    {
      "sectionKeyword": "元亨利贞",
      "tag": "四德闭环 · 边读边思",
      "question": "程颐将“元亨利贞”定义为“发端元 ➔ 资源聚亨 ➔ 公平利 ➔ 坚守固贞”的四阶商业与生命闭环。检视你目前主导的一个项目，是否只注重了前期的冲劲（元）和热闹（亨），却在分配机制（利）或风险底线（贞）上留下了隐患？",
      "hint": "💡 玄微先生点穴启发：无贞则元不固，无利则亨不长。四德缺一不可，唯有走完四德闭环，事物方能具备穿越周期的长青生命力。"
    },
    {
      "sectionKeyword": "中正",
      "tag": "执中守衡 · 边读边思",
      "question": "“中往往重于正”。在现实复杂利益博弈中，坚持机械的形式教条（死守教条之正），与顺应时势执中守权（行圆融之中），你曾在何时因为过于死板而吃过亏？",
      "hint": "💡 玄微先生点穴启发：知经知权，方为大智。君子贞而不谅，不拘小信以成大器。"
    }
  ],
  "lesson-01_乾为天": [
    {
      "sectionKeyword": "小象传",
      "tag": "时位攻防 · 边读边思",
      "question": "从初九“潜龙勿用”到九二“见龙在田”、九三“夕惕若厉”，人往往在取得初步成效时最易滋生浮躁。回想你的经历，哪次在“见”之后急于求成而遭遇了波折？",
      "hint": "💡 玄微先生点穴启发：二爻见龙初试锋芒，最容易让人误以为天下我有。但三爻处于重卦交界，内卦之极，危机四伏。“终日乾乾，夕惕若厉”不是懦弱，而是为了在暴风雨来临前深筑护城河。"
    },
    {
      "sectionKeyword": "亢龙有悔",
      "tag": "亢满之防 · 边读边思",
      "question": "“亢龙有悔，穷之灾也”。为什么纯阳刚健行至最高处，反而潜藏着最大危机？身处业务高光期或管理高位时，当如何主动“分权让利”以避其亢？",
      "hint": "💡 玄微先生点穴启发：纯阳无阴则孤阳不生。飞龙在天依赖群龙相助，一旦高居绝顶而失去基层呼应，便是亢龙。明智者在巅峰主动退一步、让出聚光灯、培育后辈，方能“保合太和，乃利贞”。"
    }
  ],
  "lesson-02_坤为地": [
    {
      "sectionKeyword": "大象传",
      "tag": "履霜坚冰 · 边读边思",
      "question": "“初六，履霜，坚冰至”。在日常业务或团队协作中，微小的摩擦与异常往往预示着不可逆的系统性危机。回想你的经历，曾敏锐捕捉到过哪一次“微霜”信号？如果当时未能重视，最终演变出了怎样的“坚冰”？",
      "hint": "💡 玄微先生点穴启发：阴始凝也，驯致其道至坚冰也。常人习惯等待坚冰封冻才仓皇应对，易道高人见微知著，在降霜初起便已完成风险预案或方向微调。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "含章可贞 · 边读边思",
      "question": "六三“含章可贞，以时发也”。身处配角、二把手或幕后支持位时，为何“不居首功、含蓄包容”反而能获得最持久的掌控力与生命力？急于显山露水为何最易招致反噬？",
      "hint": "💡 玄微先生点穴启发：坤道主顺、主蓄。含章者，胸有锦绣而不张扬；以时发者，待时机成熟才水到渠成。若居下位而争阳刚之权，终致上六“龙战于野，其血玄黄”的阴阳双输残局。"
    }
  ],
  "lesson-03_水雷屯": [
    {
      "sectionKeyword": "大象传",
      "tag": "草创盘桓 · 边读边思",
      "question": "初九“磐桓，利居贞，利建侯”。面对全新项目立项或创业草创时，我们常犯“盲目蛮干”或“过度焦虑不敢迈步”两个极端。你在经历从 0 到 1 时，是如何通过物色同盟、建立根据地来度过“盘桓期”的？",
      "hint": "💡 玄微先生点穴启发：屯者，物之始生也，天地草昧之时。草木破土前必先向下扎根。“磐桓”不是踟蹰不前，而是在未成熟的环境中构建合法性、招揽核心同盟、深挖护城河。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "即鹿无虞 · 边读边思",
      "question": "六三“即鹿无虞，惟入于林中，君子几不如舍，往吝”。在开拓新业务或探索新赛道时，当缺少熟悉地形的“向导（专业认知/顾问）”，明知追逐猎物会迷失在密林深处，你是否有果断止步舍弃的勇气？",
      "hint": "💡 玄微先生点穴启发：贪恋猎物诱惑而缺少专业向导，最终必深陷泥潭。识时务的止损与放弃，是草创期最稀缺的高阶理智。舍之，方能留存火种。"
    }
  ],
  "lesson-04_山水蒙": [
    {
      "sectionKeyword": "大象传",
      "tag": "启蒙契机 · 边读边思",
      "question": "卦辞云：“匪我求童蒙，童蒙求我；初筮告，再三渎，渎则不告。”作为管理者或导师，为什么“主动说教”往往劳而无功，唯有等对方撞墙产生真实求知渴望时指点才最有效？",
      "hint": "💡 玄微先生点穴启发：圣人治蒙，重在“感应”。心扉未开而强行灌输，非但不能解惑，反滋生厌烦。必待其心中发疑、主动叩门，此时一语点穴，方能震碎迷执。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "治蒙边界 · 边读边思",
      "question": "上九“击蒙，不利为寇，利御寇”。面对下属犯错或新手偏离正道，严厉纪律与苛刻惩戒的边界何在？如何确保你的严厉是“抵御其心智盲区”，而不是管理者自身情绪发泄的“施暴为寇”？",
      "hint": "💡 玄微先生点穴启发：上九居蒙之极，过刚则伤情。治蒙之严厉，目的在于帮其设立行为边界与防火墙（御寇），而非宣泄权力欲与傲慢（为寇）。得其底线，宽猛相济。"
    }
  ],
  "lesson-05_水天需": [
    {
      "sectionKeyword": "大象传",
      "tag": "耐守待时 · 边读边思",
      "question": "九二“需于沙，小有言，终吉”。当你制定了长期战略，但外界客观周期尚未到来、身边充斥着怀疑甚至冷嘲热讽时，你如何像站在沙滩上一样耐住流沙碎语，不因浮躁而提前出牌？",
      "hint": "💡 玄微先生点穴启发：需者，待也。坎水在前，不可强渡。九二刚健居中，处在由郊向沙的过渡带，虽受闲言碎语（小有言），但守住心性定力，终吉无咎。最可怕的不是等待，而是在等待中自乱阵脚。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "接纳机变 · 边读边思",
      "question": "上六“入于穴，有不速之客三人来，敬之终吉”。耐守待时到最后阶段，转机往往并非以我们设想的优雅方式到来，甚至可能伴随着意外闯入者。你如何看待“计划外的不速之客”并化被动为主动？",
      "hint": "💡 玄微先生点穴启发：周期见底反转之时，必有非线性扰动。深陷地穴时，不速之客带来了外部变数与破局能量。恭敬接纳、借力打力，方是穿越周期的终极收官。"
    }
  ],
  "lesson-06_天水讼": [
    {
      "sectionKeyword": "大象传",
      "tag": "作事谋始 · 边读边思",
      "question": "《大象传》曰：“天与水违行，讼；君子以作事谋始。”天往上行，水往下流，方向完全相反。回想你曾经卷入的一次争吵、合作破裂或合同纠纷，哪一点是因为在最初“作事谋始”阶段缺乏清晰界定而埋下的雷？",
      "hint": "💡 玄微先生点穴启发：上天下水，目标志向相背，必然生讼。世间所有的官司与反目，根子都在开始时基于“面子与感情”模糊了利益与退出机制。善谋始者，先小人后君子，丑话说在前头，方能长久。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "止讼知退 · 边读边思",
      "question": "九二“不克讼，归而逋”与九四“复即命渝，安贞吉”。在现实争议中，为什么“打赢了官司反而输掉了全部身家和声誉”？何时认输撤退反而是一种保全自身的高维智慧？",
      "hint": "💡 玄微先生点穴启发：讼不可成也，不利涉大川。与势大力沉者争讼，明知不敌却硬拼是匹夫之勇。退避三舍、割让局部利益以保全核心团队，胜过将全副身家押上胜负未卜的诉讼绞肉机。"
    }
  ],
  "lesson-07_地水师": [
    {
      "sectionKeyword": "大象传",
      "tag": "容民畜众 · 边读边思",
      "question": "《大象传》曰：“地中有水，师；君子以容民畜众。”水藏于地下，平时润泽万物，战时聚成惊涛。带团队打硬仗之前，你在日常管理中是如何通过关怀利益、包容差异来凝聚人心基本盘的？",
      "hint": "💡 玄微先生点穴启发：兵出于农，力蓄于民。战时军令如山、所向披靡，靠的不是临时的鸡血恐吓，而是平时深厚的“蓄水之功”。得民心者得军心，日常宽以容民，临难方能一呼百应。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "权责归一 · 边读边思",
      "question": "六五“田有禽，利执言，无咎。长子帅师，弟子舆尸，贞凶”。重大项目攻坚或危机处理时，最忌讳“多头指挥、外行干预”。你是否经历过因管理层意见不一、指挥权分散而导致的溃败？",
      "hint": "💡 玄微先生点穴启发：帅师者唯有一人。长子威重老成，授以全权则号令严明；若任由多名弟子各自为政、干预前线，哪怕是运回尸体的惨败（舆尸）。危难时刻，权责清晰统一是组织的第一生命线。"
    }
  ],
  "lesson-08_水地比": [
    {
      "sectionKeyword": "大象传",
      "tag": "生态盟约 · 边读边思",
      "question": "卦辞曰：“吉。原筮，元永贞，无咎。不宁方来，后夫凶。”在行业格局未定、寻找盟友或建立战略合作的关键期，为什么动作慢了、最后才来的“后夫”会落得凶险被动的结局？",
      "hint": "💡 玄微先生点穴启发：比者，亲辅也，水地相融之象。生态构建遵循马太效应，先行者互签盟约、共享红利；犹豫不决、瞻前顾后的“后夫”，只能面临被孤立和边缘化的残酷结局。合作重在及早相通。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "舍逆取顺 · 边读边思",
      "question": "九五“显比，王用三驱，失前禽，邑人不诫，吉”。古人田猎三面围合、让出一面任由飞禽奔逃。在商业合作或人脉拓展中，为什么最高级的招商引资和合伙不是“死缠烂打、强制捆绑”，而是“来者包容、去者不追”？",
      "hint": "💡 玄微先生点穴启发：王用三驱，舍逆取顺也。强制捆绑只会引来怨怼与二心。光明磊落地展示诚意，尊重对方的自由选择，留下者皆是真心相随的同盟，方能成就不设防的超级生态。"
    }
  ],
  "lesson-09_风天小畜": [
    {
      "sectionKeyword": "大象传",
      "tag": "蓄力待发 · 边读边思",
      "question": "卦辞曰：“密云不雨，自我西郊。”乌云密布却没有降雨，预示着能量积攒尚未达到饱和。当你有一个极为宏大的愿景，但当下人财物力皆处于“小畜”微弱状态时，如何抑制急于证明自己的冲动，踏实修饰文德？",
      "hint": "💡 玄微先生点穴启发：小畜以柔蓄刚，巽风在乾天之上，势单力薄。雨之所以不下，是阴阳交合之气尚未充盈。此时强行蛮干无异于飞蛾扑火，唯有“懿文德”，从最基础的产品打磨、流程优化做起，以静制动。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "微力以制刚 · 边读边思",
      "question": "六四“有孚，血去惕出，无咎”。作为唯一的阴爻，处在五位刚健阳爻的包围中，如何以最真诚纯粹的信誉（有孚），化解猜忌、消弭血光之灾，实现以柔克刚？",
      "hint": "💡 玄微先生点穴启发：以弱御强，最忌机巧伪诈。弱小者面对庞大巨头或强势上级，唯有把“诚信与不可替代的专业服务”做到极致，消除对方的戒心与恐惧，方能“血去惕出”，安然立足。"
    }
  ],
  "lesson-10_天泽履": [
    {
      "sectionKeyword": "大象传",
      "tag": "如履薄冰 · 边读边思",
      "question": "卦辞曰：“履虎尾，不咥人，亨。”踩到老虎尾巴，老虎却不咬人。在面对拥有生杀大权的强势人物、极度挑剔的核心客户或严苛红线时，守规矩、懂礼法如何成为保护你的防弹衣？",
      "hint": "💡 玄微先生点穴启发：履者，礼也。兑泽在下和悦顺从，乾天在上刚健威严。踩在老虎尾巴上而不被咬，核心在于“和悦应刚”，心怀敬畏而不谄媚，知进知退而不越位。礼节不是繁文缛节，而是生死存亡的安全协议。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "自知避险 · 边读边思",
      "question": "六三“眇能视，跛能履，履虎尾咥人，凶；武人为于大君”。独眼却自以为看得很清，瘸腿却硬要大步疾驰。你曾见过谁因为“高估自身实力、逞一时意气”而触犯规则，最终招致严厉制裁？",
      "hint": "💡 玄微先生点穴启发：六三以阴居阳，志刚而才弱，是全卦唯一的凶爻。眼盲不知前方凶险，腿跛不知步履维艰，却妄图以武夫之勇挑衅天威，焉能不被虎咬？自知之明是履道的第一防线。"
    }
  ],
  "lesson-29_坎为水": [
    {
      "sectionKeyword": "大象传",
      "tag": "重险不滞 · 边读边思",
      "question": "《大象传》曰：“水洊至，习坎；君子以常德行，习教事。”一重险阻接着一重险阻。当你遭遇多重危机接踵而至时，为什么抱怨和对抗只会加剧沉沦，而像流水一样“水流而不盈，行险而不失其信”才是脱困之道？",
      "hint": "💡 玄微先生点穴启发：坎者，陷也。双水重叠，险阻不断。流水的智慧在于：遇到深坑便把坑填满，遇到巨石便绕道而行，不论遭遇何种曲折，奔向大海的信念（不失其信）从不改变。常德行者，以日常习惯抵御外部无常。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "极简求通 · 边读边思",
      "question": "六四“樽酒簋贰，用缶，纳约自牖，终无咎”。一尊薄酒、两盘粗菜、用瓦罐盛装，从窗户缝隙递进去。在人生最窘迫困厄的至暗时刻，如何舍弃虚伪排场，以最极简的诚意与极微小的缝隙（纳约自牖）连接贵人、迎来转机？",
      "hint": "💡 玄微先生点穴启发：深陷险陷之时，外在资源匮乏至极。此时不可打肿脸充胖子，唯有一片赤诚如清水，从不起眼的侧门/窗户（自牖）切入。大道至简，真诚最能击穿重重防备。"
    }
  ],
  "lesson-30_离为火": [
    {
      "sectionKeyword": "大象传",
      "tag": "依附中正 · 边读边思",
      "question": "彖传曰：“离，丽也；日月丽乎天，百谷草木丽乎土。重明以丽乎正，乃化成天下。”火没有实体，必须依附于木柴才能燃烧发光。你当前的才华与精力，正依附于怎样的事业平台或价值信念之上？依附之物是否纯正长青？",
      "hint": "💡 玄微先生点穴启发：离者，附丽也。火虽明艳，脱离柴火则瞬间熄灭。才华横溢之人最容易自命不凡，却不知没有平台与时代大势的承载，才华便一文不值。择善而栖、依附中正之平台，方能继明照四方。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "防范躁烈 · 边读边思",
      "question": "九三“日昃之离，不鼓缶而歌，则大耋之嗟，凶”与九四“突如其来，焚如，死如，弃如”。才华横溢之人在面对衰退时容易怨天尤人，在顺遂时又容易急躁冒进。你如何平衡内心的野心烈火，避免因燥热伤人伤己？",
      "hint": "💡 玄微先生点穴启发：火性烈而躁，极明之后必是夕阳残照（日昃之离）。九四刚暴无依，如骤然窜起的火苗，烧得快灭得更快。明智者当效仿“畜牝牛吉”，修养如母牛般温顺柔和的内在定力，涵养光明。"
    }
  ],
  "lesson-51_震为雷": [
    {
      "sectionKeyword": "大象传",
      "tag": "恐惧修省 · 边读边思",
      "question": "《大象传》曰：“洊雷，震；君子以恐惧修省。”当突如其来的危机、审计审查或重大变故如同惊雷炸响时，弱者被吓得魂不附体，强者为何将其视为“检视自身系统漏洞、全面修省”的最佳机缘？",
      "hint": "💡 玄微先生点穴启发：震者，动也，惊雷百里。天之震怒，在警醒万物。恐惧是人类进化出的最高防御机制，但关键在于“恐而后修”。趁着惊雷的警醒，把平日麻木不仁的疏漏、侥幸心理全面清除，方能迎来“笑言哑哑”的重生。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "从容自持 · 边读边思",
      "question": "卦辞曰：“震惊百里，不丧匕鬯。”雷声震动百里，主祭之人手握祭器却从容不失、祭酒不洒。在公司发生重大动荡、全员恐慌时，作为核心骨干或领军人，你的从容自若如何成为整艘大船的定海神针？",
      "hint": "💡 玄微先生点穴启发：临大事而不慌，受大震而不乱。匕鬯者，宗庙祭祀之神器，象征组织的核心使命与基本盘。外部狂风暴雨电闪雷鸣，内心深处始终手稳心定。领头人的一个微笑与从容，胜过一万张安抚通告。"
    }
  ],
  "lesson-52_艮为山": [
    {
      "sectionKeyword": "大象传",
      "tag": "知止静笃 · 边读边思",
      "question": "《大象传》曰：“兼山，艮；君子以思不出其位。”山外有山，连绵矗立，巍然止定。在信息轰炸、诱惑无穷的现代商业社会，为什么“思不出其位、专注自身边界”是抵抗内卷的最强护城河？",
      "hint": "💡 玄微先生点穴启发：艮者，止也。人之所以痛苦焦虑，皆因妄念丛生、身在此而心在彼。两山相重，界限分明。守住当下的本分，不去觊觎能力圈之外的浮华虚名，在自己的山头扎深三千尺，方能巍峨不可撼动。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "动静有节 · 边读边思",
      "question": "彖传曰：“艮，止也。时止则止，时行则行，动静不失其时，其道光明。”艮卦并不提倡死寂僵化，而是强调动静分寸。回顾你过去的重大决策，哪次是因为在该踩刹车时猛踩油门、或该出击时迟疑止步而留下了遗憾？",
      "hint": "💡 玄微先生点穴启发：止其所当止，非不行也。如同开车，会踩刹车的人才配开快车。市场过热时果断止贪，身心透支时果断止劳，时机成熟时如脱兔出击。动静皆合乎天理节奏，方是大光明。"
    }
  ],
  "lesson-57_巽为风": [
    {
      "sectionKeyword": "大象传",
      "tag": "申命行事 · 边读边思",
      "question": "《大象传》曰：“随风，巽；君子以申命行事。”微风吹拂，无孔不入，连绵不绝。在推动企业制度落地或家庭教育沟通时，为什么“简单粗暴的强制命令”往往遭遇反弹，而“反复温和阐释（申命）”却能春风化雨？",
      "hint": "💡 玄微先生点穴启发：巽者，入也，柔顺而深透。风之力量不在于狂暴摧折，而在于连绵不绝。申者，重申也。高明的管理者从不指望一次大会就能改变人心，而是像风一样，在日常细微处反复强调、躬身践行，使制度真正融入文化基因。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "审慎决断 · 边读边思",
      "question": "九五“贞吉，悔亡，无不利。无初有终，先庚三日，后庚三日，吉”。在推行重大变革前，先推演三天，变革落实后，再跟踪复盘三天。你是否有过变革前仓促宣布、事后缺少跟踪评估而导致政策烂尾的惨痛教训？",
      "hint": "💡 玄微先生点穴启发：巽顺并不等于无主见的随波逐流。九五刚健居尊，行变更（庚者更也）之事。“先庚三日”考察变革前因与利益博弈，“后庚三日”落实配套防范与反馈调整。周全周密，始能无初有终。"
    }
  ],
  "lesson-58_兑为泽": [
    {
      "sectionKeyword": "大象传",
      "tag": "朋比讲习 · 边读边思",
      "question": "《大象传》曰：“丽泽，兑；君子以朋友讲习。”两泽相连，水体相互补益滋润，永不干涸。你是否有属于自己的“认知同频研学圈”？在同侪切磋讲习中，你曾获得过哪些一个人闭门造车永远无法悟出的认知突破？",
      "hint": "💡 玄微先生点穴启发：兑者，悦也，说也。单泽易涸，双泽相承。真正的喜悦源于同道者之间的真诚交流与智慧碰撞。讲习者，讲其所未闻，习其所未熟。在彼此镜照中发现认知盲区，实现精神生命的彼此滋养。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "和而不流 · 边读边思",
      "question": "初九“和兑，吉”与六三“来兑，凶”。在社交商务往来中，基于内心中正的“和悦包容”与缺乏原则底线的“逢迎谄媚”界限何在？为什么曲意逢迎最终只会自贬身价、招致鄙视？",
      "hint": "💡 玄微先生点穴启发：君子和而不同，周而不比。初九和兑，心无杂念，以诚待人，自然和悦大吉；六三来兑，为求私利而卑躬屈膝，主动迎合取悦他人，失却了自尊底线，必招其辱。悦人者，必先自重自立。"
    }
  ],
  "lesson-11_地天泰": [
    {
      "sectionKeyword": "大象传",
      "tag": "地天泰格局 · 边读边思",
      "question": "泰卦“小往大来，天地交泰”，九三“无平不陂，无往不复”，身处大好盛世时，如何预设底线以防断崖下跌？",
      "hint": "💡 玄微先生点穴启发：上卦为坤地，下卦为乾天。常理天在上有地在下，古人却反置“地在上、天在下”。这是因为天属纯阳，阳气清轻必然向上腾升；地属纯阴，阴气重浊必然向下沉降。如此一来，天气上升、地气下沉，阴阳二气在天地中央迎面相逢、交汇相融！天降甘霖大地滋生，上下同心。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "地天泰时位 · 边读边思",
      "question": "初九“拔茅茹以其汇，征吉”，在顺风发展周期，为什么抱团作战、协同推进远胜于单打独斗？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“安泰盛世”六阶经纶：初九志同道合连带同进（拔茅连茹以其汇征吉）；九二包容旷达跨越天堑（包荒用冯河不暇遗朋亡）；九三居安思危平陂相生（无平不陂无往不复）；六四翩翩下顾共享繁荣（翩翩不富以其邻）；六五屈己下嫁共成大业（帝乙归妹以。"
    }
  ],
  "lesson-12_天地否": [
    {
      "sectionKeyword": "大象传",
      "tag": "天地否格局 · 边读边思",
      "question": "否卦“大往小来，上下不交”，初六“拔茅茹以其汇，贞吉亨”，组织劣币驱逐良币时，君子当如何守正抱团？",
      "hint": "💡 玄微先生点穴启发：上卦为乾天，下卦为坤地。表面看天居天位、地居地位，实则天之阳气拼命往上飞，地之阴气拼命往下坠。两者各奔东西、背道而驰，天地阴阳二气永不交感，导致长天冷漠、大地冰封，万物闭塞绝迹，君臣离心离德！故古人命此卦为“否”（pǐ，闭塞、否塞、天地不通。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "天地否时位 · 边读边思",
      "question": "六二“包承，小人吉，大人否亨”，面对不良职场潜规则，如何在表面包容的同时内心绝不妥协？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“否极泰来”六阶坚守：初六独善其身收敛锋芒（拔茅连茹贞吉）；六二拒绝同流阿附权贵（包承小人吉大人否亨）；六三身居不当中饱私囊（包羞愧悔）；九四奉天承命拨乱反正（有命无咎畴离祉）；九五居安思危其亡其亡（休否大人吉其亡其亡系于苞桑。"
    }
  ],
  "lesson-13_天火同人": [
    {
      "sectionKeyword": "大象传",
      "tag": "天火同人格局 · 边读边思",
      "question": "同人卦“同人于野，亨”，为何真正伟大的跨界合作与同盟必须突破亲疏远近的狭隘圈子？",
      "hint": "💡 玄微先生点穴启发：上卦为乾天，下卦为离火。《大象传》曰：“天与火，同人；君子以类族辨物。”火的光焰向上腾飞，与高阔苍天同放光明。离火照澈天下毫无私蔽，乾天博大涵盖一切族群，象征全人类跨越狭隘门户、志同道合天下为公。故古人取此“天光火耀同明于世”之象而命之曰“。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "天火同人时位 · 边读边思",
      "question": "九三“伏戎于莽，升其高陵，三岁不兴”，由于缺乏互信而处处设防、猜忌内耗，组织会付出何等惨痛代价？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“聚同化异”六阶境界：初九走出小圈子以公心待人（同人于门无咎）；六二圈子狭隘结党营私（同人于宗吝）；九三心存猜忌伏兵草莽（伏戎于莽三岁不兴）；九四认清形势及时撤防（乘其墉不能攻吉）；九五先经波折终成大同（同人先号啕而后笑大师克。"
    }
  ],
  "lesson-14_火天大有": [
    {
      "sectionKeyword": "大象传",
      "tag": "火天大有格局 · 边读边思",
      "question": "大有卦“火在天上，顺天休命”，在获得巨大财富、资源与声望时，如何遏制人性的贪婪与狂妄？",
      "hint": "💡 玄微先生点穴启发：上卦为离火（烈日昭昭），下卦为乾天（清空万仞）。《大象传》曰：“火在天上，大有；君子以遏恶扬善，顺天休命。”正午的艳阳高悬在万里晴空的正顶，毫无遮拦地将阳光与温暖洒向大地山川，万物无不受其滋养与恩赐。象征极度丰盛富足、受天下归附，故古人命此。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "火天大有时位 · 边读边思",
      "question": "九三“公用亨于天子，小人弗克”，占有巨额资源后，为什么将利益向全社会或组织底层分享是保全自我的唯一法门？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“富有保泰”六阶戒骄：初九富而不骄杜绝祸患（无交害匪咎艰则无咎）；九二器大包容承担重任（大车以载有攸往无咎）；九三位高权重敬献天子（公用亨于天子小人害也）；九四戒除虚荣不矜其盛（匪其彭无咎）；六五以柔制刚诚信服众（厥孚交如威如。"
    }
  ],
  "lesson-15_地山谦": [
    {
      "sectionKeyword": "大象传",
      "tag": "地山谦格局 · 边读边思",
      "question": "谦卦“地中有山，六爻皆吉”，初六“谦谦君子，用涉大川”，现代人如何在展现硬核实力的同时内藏高山而不招妒？",
      "hint": "💡 玄微先生点穴启发：上卦为坤地（广袤平原），下卦为艮山（巍峨崇山）。《大象传》曰：“地中有山，谦；君子以裒多益寡，称物平施。”一座万仞高耸的大山，竟然谦卑地深藏在广阔平坦的大地泥土之下！明明有拔地倚天的雄厚实力，却在外表毫无张扬夸耀，虚怀若谷平易近人。故古人命。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "地山谦时位 · 边读边思",
      "question": "九三“劳谦君子，有终吉”，立下汗马功劳之后，为什么最容易摔跤？如何化解“功高震主”的隐患？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“谦逊化境”六阶修为：初六卑以自牧甘居人后（谦谦君子卑以自牧）；六二发自内心声誉远播（鸣谦贞吉）；九三劳苦功高深藏若虚（劳谦君子有终吉）；六四适度彰显合规施为（无不利撝谦）；六五以德服人适时行令（不富以其邻利用侵伐）；上六自我。"
    }
  ],
  "lesson-16_雷地豫": [
    {
      "sectionKeyword": "大象传",
      "tag": "雷地豫格局 · 边读边思",
      "question": "豫卦象征“和乐与未雨绸缪”，初六“鸣豫，凶”，刚刚小有成就就迫不及待宣扬享乐，为什么是组织走向衰亡的致命信号？",
      "hint": "💡 玄微先生点穴启发：上卦为震雷，下卦为坤地。《大象传》曰：“雷出地奋，豫；先王以作乐崇德。”春雷破土而出，大地万物感应春气而舒展苏醒，天地之间洋溢着蓬勃欢悦与欢欣鼓舞。古人作乐崇德、以乐声安抚万民，故命此卦为“豫”（欢悦安豫、未雨绸缪）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "雷地豫时位 · 边读边思",
      "question": "六二“介于石，不终日，贞吉”，面对狂热的泡沫与群体狂欢，如何保持“冷眼旁观、见微知著”的清醒定力？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“安豫知止”六阶防怠：初六得意忘形自招祸端（鸣豫凶）；六二坚定如石不受诱惑（介于石不终日贞吉）；六三迟疑观望错失先机（盱豫悔迟有悔）；九四独当一面群心归附（由豫大有得朋盍簪）；六五沉溺安乐病在骨髓（贞疾恒不死）；上六冥顽沉迷及。"
    }
  ],
  "lesson-17_泽雷随": [
    {
      "sectionKeyword": "大象传",
      "tag": "泽雷随格局 · 边读边思",
      "question": "随卦“随时变易，元亨利贞”，卦辞强调“君子以向晦入宴息”，现代人如何在快节奏内卷中顺应身心起伏节律？",
      "hint": "💡 玄微先生点穴启发：上卦为兑泽，下卦为震雷。《大象传》曰：“泽中有雷，随；君子以向晦入宴息。”秋日雷电敛藏潜伏在大泽深水之中，随顺四时节律而休眠止息。君子日出而作、日落而归随顺天道，与时推移、因势利导，故命此卦为“随”（随顺潮流、随时而变）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "泽雷随时位 · 边读边思",
      "question": "初九“官有渝，从正吉，出门交有功”，当既定计划遭遇外部大势剧变时，如何迅速放下沉没成本择善而从？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“借势随顺”六阶智慧：初九打破门第顺应变化（官有渝贞吉出门交有功）；六二见小失大贪恋眼前（系小子失丈夫）；六三舍弃小局依附远略（系丈夫失小子求有得）；九四顺势有获谨守底线（随有获贞凶有孚在道以明）；九五诚心归正大德大吉（孚于嘉。"
    }
  ],
  "lesson-18_山风蛊": [
    {
      "sectionKeyword": "大象传",
      "tag": "山风蛊格局 · 边读边思",
      "question": "蛊卦象征“积弊滋生与拨乱反正”，初六“干父之蛊，有子，考无咎”，承接烂摊子时，如何体面纠偏前人的战略失误？",
      "hint": "💡 玄微先生点穴启发：上卦为艮山，下卦为巽风。《大象传》曰：“山下有风，蛊；君子以振民育德。”微风吹到大山脚下被高山拦截，气流长期停滞不通，导致山谷阴暗潮湿、物久生蠹虫（蛊）。象征旧体制积弊已久、出现腐化；此时非痛下决心改革不可，故命此卦为“蛊”（整饬弊乱、革故。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "山风蛊时位 · 边读边思",
      "question": "九三“干父之蛊，小有悔，无大咎”，面对陈年痼疾进行大刀阔斧改革时，为什么适度矫枉过正是必须承担的阵痛？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“除弊除乱”六阶担当：初六继承家业革除积弊（干父之蛊有子考无咎）；六二柔顺化解遗留隐患（干母之蛊不可贞）；九三用力虽过终得大吉（干父之蛊小有悔无大咎）；六四因循苟且自取其辱（裕父之蛊往见吝）；六五广纳贤才继承遗愿（干父之蛊用誉。"
    }
  ],
  "lesson-19_地泽临": [
    {
      "sectionKeyword": "大象传",
      "tag": "地泽临格局 · 边读边思",
      "question": "临卦“刚浸而长，至于八月有凶”，处于上升成长通道时，为何圣人却预警“好景不常、八月即衰”？",
      "hint": "💡 玄微先生点穴启发：上卦为坤地，下卦为兑泽。《大象传》曰：“泽上有地，临；君子以教思无穷，容保民无疆。”大地高居其上俯瞰汪泽，大泽润泽地底，二阳爻自下而上昂扬破土。君王亲临视察、以博大德行化育天下万民，故命此卦为“临”（亲临视察、自上而下关怀）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "地泽临时位 · 边读边思",
      "question": "初九“咸临，贞吉”，上位管理者亲临一线视察时，如何用真诚感化团队而非流于形式主义作秀？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“巡临治世”六阶经纶：初九以诚相感同心并进（咸临贞吉）；九二威严有加吉无不利（咸临吉无不利）；六三甜言蜜语当知忧患（甘临无攸利既忧之无咎）；六四至诚接纳亲临一线（至临无咎）；六五大智若愚知人善任（知临大君之宜吉）；上六敦厚笃实。"
    }
  ],
  "lesson-20_风地观": [
    {
      "sectionKeyword": "大象传",
      "tag": "风地观格局 · 边读边思",
      "question": "观卦“盥而不荐，有孚颙若”，最高境界的领导力为何是无言的品德感召，而非喋喋不休的微观管理？",
      "hint": "💡 玄微先生点穴启发：上卦为巽风，下卦为坤地。《大象传》曰：“风行地上，观；先王以省方，观民设教。”和风吹拂广袤大地，无远弗届、润泽草木。万民仰望风动草偃，如祭祀大典洗净双手肃穆瞻仰。象征内省反思与对外示范，故命此卦为“观”（观察内照、示范风化）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "风地观时位 · 边读边思",
      "question": "初六“童观，小人无咎，君子吝”，缺乏全局战略视野的底层“管窥蠡测”，对管理者而言为何是致命短板？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“内观省察”六阶眼界：初六鼠目寸光童蒙浅见（童观小人无咎君子吝）；六二门缝窥探见识狭窄（窥观利女贞）；六三权衡进退立身有方（观我生进退）；六四洞察大势为国干城（观国之光利用宾于王）；九五审视平生无愧天地（观我生君子无咎）；上九。"
    }
  ],
  "lesson-21_火雷噬嗑": [
    {
      "sectionKeyword": "大象传",
      "tag": "火雷噬嗑格局 · 边读边思",
      "question": "噬嗑卦“颐中有物，利用狱”，面对团队内部公然破坏规则的害群之马，为什么优柔寡断等同于自掘坟墓？",
      "hint": "💡 玄微先生点穴启发：上卦为离火（闪电光明），下卦为震雷（雷霆威严）。《大象传》曰：“雷电，噬嗑；先王以明罚敕法。”雷声轰鸣伴随电光照彻天地，如同上下牙齿咬合咀嚼口中硬物、咬碎隔膜方得通畅。象征社会制度中必须以法纪明断是非、雷霆手段剔除阻隔恶瘤，故古人命此卦为“。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "火雷噬嗑时位 · 边读边思",
      "question": "初九“履校灭趾，无咎”，在犯错初期施行轻微惩戒，为何是保护员工不至于铸成大错的最佳善举？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“严明法度”六阶治理：初九微受惩戒小惩大诫（履校灭趾无咎）；六二用刑得当顺应正理（噬肤灭鼻无咎）；六三遇到硬骨遭人反感（噬腊肉遇毒小吝无咎）；九四披荆斩棘得获正义（噬干胏得金矢利艰贞吉）；六五处事公平赏罚分明（噬干肉得黄金贞厉。"
    }
  ],
  "lesson-22_山火贲": [
    {
      "sectionKeyword": "大象传",
      "tag": "山火贲格局 · 边读边思",
      "question": "贲卦“山下有火，文饰修辞”，初九“舍车而徒”，在缺乏资本包装的起步期，为什么注重内功远胜于虚假排场？",
      "hint": "💡 玄微先生点穴启发：上卦为艮山，下卦为离火（落日夕阳）。《大象传》曰：“山下有火，贲；君子以明庶政，无敢折狱。”西下的夕阳落入崇山峻岭脚下，火红余晖将千山万壑渲染得五彩斑斓、秀丽动人。文饰虽美，然而夕阳终将隐没，大山终将归于朴实灰黛；真正的文明并非喧嚣造作，而。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "山火贲时位 · 边读边思",
      "question": "六四“白马翰如，求婚媾”，在利益诱惑与真挚初心之间，如何守住纯粹真实的本心？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“文质彬彬”六阶洗礼：初九舍弃虚华脚踏实地（贲其趾舍车而徒）；六二修饰仪容依附君子（贲其须与上兴也）；九三光鲜亮丽坚守正道（贲如濡如永贞吉）；六四回归本真素马白驹（贲如皤如白马翰如）；六五丘园礼贤薄物见诚（贲于丘园束帛戋戋吉）。"
    }
  ],
  "lesson-23_山地剥": [
    {
      "sectionKeyword": "大象传",
      "tag": "山地剥格局 · 边读边思",
      "question": "剥卦“五阴剥一阳”，上九“硕果不食，君子得舆，小人剥庐”，在系统全面下行的周期，如何保住最后的认知火种？",
      "hint": "💡 玄微先生点穴启发：上卦为艮山，下卦为坤地。《大象传》曰：“山附地上，剥；上以厚下，安宅。”巍峨高山高耸在大地之上，历经亿万年风吹雨打、地气侵蚀，山体土石不断向下剥落坍塌，五阴逼迫一阳。统治者若剥削下层百姓，则基盘崩塌高堂必覆；唯有厚待下层夯实底座，方能稳如泰。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "山地剥时位 · 边读边思",
      "question": "初六“剥床以足”，当底层危机刚露苗头时，为什么绝大多数管理者都会视而不见从而贻误战机？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“剥极待生”六阶存续：初六床腿受损基盘动摇（剥床以足蔑贞凶）；六二侵蚀中层伤筋动骨（剥床以辨蔑贞凶）；六三虽在小人群不随恶行（剥之无咎失上下也）；六四灾难临头大祸迫眉（剥床以肤凶）；六五如鱼贯入宠遇无私（贯鱼以宫人宠终无尤）；。"
    }
  ],
  "lesson-24_地雷复": [
    {
      "sectionKeyword": "大象传",
      "tag": "地雷复格局 · 边读边思",
      "question": "复卦“冬至一阳生，七日来复”，卦辞“先王以至日闭关，商旅不行”，触底反弹的初阳之气微弱时，为何必须静养？",
      "hint": "💡 玄微先生点穴启发：上卦为坤地，下卦为震雷。《大象传》曰：“雷在地中，复；先王以至日闭关。”时值冬至严寒，天地表面万物凋零萧杀，然而在万丈冻土的地心深处，第一缕春雷地热（一阳初生）已然悄悄复苏萌动！生命的力量在最沉寂的深渊中重新回归，万象更新生生不息，故古人命。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "地雷复时位 · 边读边思",
      "question": "初九“不远复，无祗悔，元吉”，在认知迭代中，怎样建立以天为单位的快速自我纠偏回路？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“生机回归”六阶护持：初九过而能改微步回归（不远复无祗悔元吉）；六二见贤思齐休美而归（休复之吉以下仁也）；六三屡错屡改频频复归（频复厉无咎）；六四特立独行孤守正道（中行独复以从道也）；六五敦厚守正无怨无悔（敦复无悔中以自考）；。"
    }
  ],
  "lesson-25_天雷无妄": [
    {
      "sectionKeyword": "大象传",
      "tag": "天雷无妄格局 · 边读边思",
      "question": "无妄卦“天下雷行，物与无妄”，初九“无妄，往吉”，做事纯任赤子之心、不计功利算计，为什么反而能成大事？",
      "hint": "💡 玄微先生点穴启发：上卦为乾天，下卦为震雷。《大象传》曰：“天下雷行，物与无妄；先王以茂对时，育万物。”苍天之下春雷阵阵，万物随顺天时自然萌发生长，毫无半点人为造作与伪饰狡黠。遵循大自然本来规律，不搞投机取巧，方得天佑；心怀妄念必然招致反噬，故命此卦为“无妄”。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "天雷无妄时位 · 边读边思",
      "question": "六二“不耕获，不菑畬，则利有攸往”，为什么戒除急功近利、专注当下耕耘是破除焦虑的最佳心法？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“纯真守正”六阶规诫：初九怀揣纯真勇往直前（无妄往吉得志也）；九二不计功利顺理成章（不耕获不菑畬利用攸往）；六三飞来横祸无妄之灾（无妄之灾行人得牛邑人之灾）；九四坚守原则不随俗浮沉（可贞无咎固有之也）；九五无心之过勿药而愈（无。"
    }
  ],
  "lesson-26_山天大畜": [
    {
      "sectionKeyword": "大象传",
      "tag": "山天大畜格局 · 边读边思",
      "question": "大畜卦“刚健笃实，辉光日新”，初九“有厉利已”，在大势未明时，为什么主动遏制出击冲动是最高智慧？",
      "hint": "💡 玄微先生点穴启发：上卦为艮山，下卦为乾天。《大象传》曰：“天在山中，大畜；君子以多识前言往行，以畜其德。”浩瀚无边的万里晴天，竟然包容深藏在重重高山崇峦的怀抱之中！以山之厚实沉静，阻留蓄养长天的无尽刚健原力。象征一个人心胸极其博大，能博采历代先贤言行、厚积薄。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "山天大畜时位 · 边读边思",
      "question": "六四“童牛之牿，元吉”，在恶习与风险尚处于幼角时期，如何建立制度防患于未然？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“蓄养能量”六阶格局：初九面对险阻及时止步（有厉利已）；九二审时度势卸轮停步（舆说輹不犯灾也）；九三与贤同行良马追逐（良马逐利艰贞）；六四防患未然未雨绸缪（童牛之牿元吉）；六五刚柔相济去其凶残（豶豕之牙吉）；上九胸藏万象通道大。"
    }
  ],
  "lesson-27_山雷颐": [
    {
      "sectionKeyword": "大象传",
      "tag": "山雷颐格局 · 边读边思",
      "question": "颐卦“自求口实，观其自养”，初九“舍尔灵龟，观我朵颐，凶”，丢弃自身优势盲目艳羡他人，为何必招致失败？",
      "hint": "💡 玄微先生点穴启发：上卦为艮山（上止），下卦为震雷（下动）。《大象传》曰：“山下有雷，颐；君子以慎言语，节饮食。”全卦上下两阳爻如嘴唇，中间四阴爻如口腔牙齿。下颌运动、上颌静止，如口中咀嚼食物吸收营养；人活于世，言语从口出（当慎言防祸），饮食从口入（当节食养体。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "山雷颐时位 · 边读边思",
      "question": "六四“颠颐吉，虎视眈眈，其欲逐逐”，上位者为了造福团队，如何展现出如猛虎般雷厉风行的资源争取魄力？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“养生养德”六阶修行：初九贪婪羡慕失其灵性（舍尔灵龟观我朵颐凶）；六二颠倒法则求助于下（颠颐拂经于丘颐）；六三纵欲无度自绝生机（拂颐贞凶十年勿用）；六四登高俯瞰虎视眈眈（颠颐吉虎视眈眈其欲逐逐）；六五依附贤能居中守静（拂经居贞。"
    }
  ],
  "lesson-28_泽风大过": [
    {
      "sectionKeyword": "大象传",
      "tag": "泽风大过格局 · 边读边思",
      "question": "大过卦“栋桡，本末弱”，初六“藉用白茅，无咎”，身处承载极端重压的危机期，为何极度的谨慎细致是唯一保命法则？",
      "hint": "💡 玄微先生点穴启发：上卦为兑泽（深水洪涝），下卦为巽木（大树栋梁）。《大象传》曰：“泽灭木，大过；君子以独立不惧，遁世无闷。”滔天的大水彻底淹没了森林大树，中间四阳爻阳刚过盛，上下两阴爻极其薄弱，如同房梁两头受力过重即将弯折断裂（栋桡）。处于历史罕见的非常之巨。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "泽风大过时位 · 边读边思",
      "question": "九三“栋桡，凶”，刚愎自用、拒绝外部支撑的刚直之人，为何最容易在压力峰值期折断？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“危局力挽”六阶胆魄：初六慎之又慎垫以白茅（藉用白茅无咎）；九二枯木逢春老夫少妻（枯杨生稊老夫得其女妻）；九三不堪重负梁折柱断（栋桡凶不可以有辅也）；九四中流砥柱栋梁高隆（栋隆吉不桡乎下也）；九五老妇少男华而不实（枯杨生华老妇。"
    }
  ],
  "lesson-31_泽山咸": [
    {
      "sectionKeyword": "大象传",
      "tag": "泽山咸格局 · 边读边思",
      "question": "咸卦“山上有泽，无心之感”，初六“咸其拇”，人际沟通初期的微小试探，如何不转化为浮躁的盲动？",
      "hint": "💡 玄微先生点穴启发：上卦为兑泽（少女和悦），下卦为艮山（少男谦逊）。山顶汇聚汪泽，少男谦卑低头在少女之下，山泽气流相通、心灵不期而遇。《大象传》曰：“山上有泽，咸；君子以虚受人。”无心之感，至诚相照；君子虚怀若谷容纳他人，故命此卦为“咸”（感应、心心相印）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "泽山咸时位 · 边读边思",
      "question": "九四“贞吉悔亡，憧憧往来，朋从尔思”，充满功利私心的算计交往，为什么反而会失去天下真心朋友？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“心智相感”六阶渐进：初六感应于足趾心念初动（咸其拇）；六二感应于小腿稍有盲动（咸其腓凶居吉）；九三随波逐流毫无主见（咸其股执其随往吝）；九四诚意正心朋从尔思（贞吉悔亡朋从尔思）；九五感应于背脊笃定如山（咸其脢无悔）；上六舌灿。"
    }
  ],
  "lesson-32_雷风恒": [
    {
      "sectionKeyword": "大象传",
      "tag": "雷风恒格局 · 边读边思",
      "question": "恒卦“立不易方，久于其道”，初六“浚恒，贞凶”，刚开始做一件事就强求长期结果，为什么是浅尝辄止的根源？",
      "hint": "💡 玄微先生点穴启发：上卦为震雷，下卦为巽风。雷声隆隆而微风顺应，雷风相伴相生、亿万年运化而不失其序。《大象传》曰：“雷风，恒；君子以立不易方。”宇宙恒常不在于僵死静止，而在于运动中的动态平衡；君子立身天地之间坚守原则方向，故命此卦为“恒”（持之以恒、恒常久远）。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "雷风恒时位 · 边读边思",
      "question": "九二“悔亡”，身处易变的环境中，如何以守中之道应对外界的风云变幻？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“持之以恒”六阶定力：初六急功近利追求过深（浚恒贞凶始求深也）；九二中庸自守悔恨消除（悔亡能久中也）；九三缺乏定力四处碰壁（不恒其德或承之羞）；九四求非其所徒劳无功（田无禽久非其位）；六五顺应常道妇人之吉（恒其德贞妇人吉夫子凶。"
    }
  ],
  "lesson-33_天山遁": [
    {
      "sectionKeyword": "大象传",
      "tag": "天山遁格局 · 边读边思",
      "question": "遁卦“天山相阻，顺势隐退”，初六“遁尾，厉”，撤退落后被动挨打时，如何以静制动化险为夷？",
      "hint": "💡 玄微先生点穴启发：上卦为乾天，下卦为艮山。大山虽高万仞，然而苍天高远无限，山体终究追赶不上长天，两者越离越远。二阴爻自下滋长，小人得势逼迫君子；君子顺应天道高洁退隐，避开纷争蓄养大德，故命此卦为“遁”（dùn，适时退隐、远走高飞）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "天山遁时位 · 边读边思",
      "question": "九三“系遁，有疾厉，畜臣妾吉”，撤退时割舍不下眼前利益与私情羁绊，会付出何等惨烈代价？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“进退有度”六阶避险：初六逃避不及陷入险境（遁尾厉勿用有攸往）；六二执守原则固若金汤（执之用黄牛之革）；九三情丝牵绊拖泥带水（系遁有疾厉畜臣妾吉）；九四割舍私爱决绝退隐（好遁君子吉小人否）；九五从容隐退受人敬仰（嘉遁贞吉志正也。"
    }
  ],
  "lesson-34_雷天大壮": [
    {
      "sectionKeyword": "大象传",
      "tag": "雷天大壮格局 · 边读边思",
      "question": "大壮卦“刚以动，止于礼”，初九“壮于趾，征凶”，刚刚掌握一点微小权力就急于展现锋芒，为何必遭横祸？",
      "hint": "💡 玄微先生点穴启发：上卦为震雷，下卦为乾天。云天之上雷霆万钧，阳气充沛至极、声势赫赫。四阳爻自下而上阳刚正大，然而刚健过甚最易滋生狂妄自负；君子非礼弗履、克制莽撞冲动，故命此卦为“大壮”（刚壮盛大、止于猛进）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "雷天大壮时位 · 边读边思",
      "question": "九三“小人用壮，君子用罔；羝羊触藩，赢其角”，盲目死磕硬碰硬的“公羊思维”，在现代管理中有多大危害？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“戒骄用壮”六阶克制：初九盲目自信刚愎自用（壮于趾征凶）；九二中道自守前程安稳（贞吉以中也）；九三羊撞篱笆进退维谷（小人用壮君子用罔羝羊触藩）；九四打破藩篱豁然开朗（藩决不羸壮于大舆之輹）；六五化刚为柔宽大待人（丧羊于易无悔）。"
    }
  ],
  "lesson-35_火地晋": [
    {
      "sectionKeyword": "大象传",
      "tag": "火地晋格局 · 边读边思",
      "question": "晋卦“顺而丽乎大明”，初六“晋如摧如，贞吉”，晋升路上遭遇挫折打压时，如何保持宽宏大度而不自乱方寸？",
      "hint": "💡 玄微先生点穴启发：上卦为离火（红日），下卦为坤地（广袤原野）。《大象传》曰：“明出地上，晋；君子以自昭明德。”一轮朝阳破晓而出跃出地平线，霞光万道普照万里大地。象征才能显耀、君臣相得、步步晋升，故命此卦为“晋”（晋升跃进、欣欣向荣）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "火地晋时位 · 边读边思",
      "question": "六二“晋如愁如，贞吉；受兹介福，于其王母”，在没有后台背景时，如何靠品格正道赢得顶级贵人赏识？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“康庄晋阶”六阶风骨：初六起步受挫泰然处之（晋如摧如贞吉裕无咎）；六二忧思深远得蒙皇恩（晋如愁如贞吉受兹介福）；六三深得人心众志成城（众允悔亡志上行也）；九四贪恋权位如同硕鼠（鼫鼠贞厉位不当也）；六五不计得失阔步向前（失得勿恤。"
    }
  ],
  "lesson-36_地火明夷": [
    {
      "sectionKeyword": "大象传",
      "tag": "地火明夷格局 · 边读边思",
      "question": "明夷卦“光明受损，晦明韬光”，初九“明夷于飞，垂其翼”，看清大势逆转的第一时间，为何应当果断自抑远走？",
      "hint": "💡 玄微先生点穴启发：上卦为坤地，下卦为离火。烈日沉入地表之下，黑夜笼罩万物，天地陷入无边黑暗。《大象传》曰：“明入地中，明夷；君子以莅众，用晦而明。”当昏君当道、世道浑浊时，贤良智者若张扬才能必遭屠戮残害，唯有深藏若虚、韬光养晦以待天明，故命此卦为“明夷”（y。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "地火明夷时位 · 边读边思",
      "question": "六二“明夷，夷于左股，用拯马壮，吉”，身受重伤陷入绝境时，如何借助外力迅速止血脱险？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“暗夜坚守”六阶心智：初九收敛羽翼忍饥挨饿（垂其翼于飞君子于行主人有言）；六二膝盖受伤借马脱险（明夷于左股用拯马壮吉）；九三除恶务尽不可操切（明夷于南狩得其大首不可疾贞）；六四洞察内幕脱身险境（入于左腹获心出于门庭）；六五箕子。"
    }
  ],
  "lesson-37_风火家人": [
    {
      "sectionKeyword": "大象传",
      "tag": "风火家人格局 · 边读边思",
      "question": "家人卦“风自火出，治家齐国”，初九“闲有家，悔亡”，家庭与核心初创团队内部，为何必须在萌芽期立下规矩？",
      "hint": "💡 玄微先生点穴启发：上卦为巽风，下卦为离火。火燃烧升腾带动空气流动生出微风，风助火势火生风威，内外呼应协同。《大象传》曰：“风自火出，家人；君子以言有物而行有恒。”由内而外修身、齐家、治国、平天下，立言有据言行一致，故命此卦为“家人”（齐家之道、和乐安康）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "风火家人时位 · 边读边思",
      "question": "六二“无攸遂，在中馈，贞吉”，做好后勤防线与基座支撑的“内当家”，其价值为何远胜于盲目抛头露面？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“家道齐整”六阶治家：初六防患未然严立家规（闲有家悔亡）；六二操持内务柔顺持家（无攸遂在中馈贞吉）；九三严厉管教虽过犹吉（家人嗃嗃悔厉吉妇子嘻嘻终吝）；六四勤俭持家财源亨通（富家大吉顺在位也）；九五以爱治家化育亲族（王假有家勿。"
    }
  ],
  "lesson-38_火泽睽": [
    {
      "sectionKeyword": "大象传",
      "tag": "火泽睽格局 · 边读边思",
      "question": "睽卦“火动而上，泽动而下，同而不同”，初九“丧马勿逐，自复”，合伙人之间产生分歧误解时，为何“不过度追究”反能自愈？",
      "hint": "💡 玄微先生点穴启发：上卦为离火（火性上炎），下卦为兑泽（水性下渗）。《大象传》曰：“上火下泽，睽；君子以同而异。”水火背道而驰、互不相通，两相背离甚至相互猜忌。然而大千世界和而不同，智者不强求一致，而在背离中寻求互补与默契，故命此卦为“睽”（kuí，乖离背离、。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "火泽睽时位 · 边读边思",
      "question": "九二“遇主于巷，无咎”，体制内正规渠道走不通时，如何在非正式场合通过真诚偶遇破除坚冰？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“化解分歧”六阶智慧：初九任其自去马逸自归（丧马勿逐自复见恶人无咎）；九二小巷相遇因陋就简（遇主于巷未失道也）；六三身陷冤屈终得昭雪（见舆曳其牛掣其人天且劓）；九四形单影只得逢知己（睽孤遇元夫交孚无咎）；六五宗族同心咬合破冰（。"
    }
  ],
  "lesson-39_水山蹇": [
    {
      "sectionKeyword": "大象传",
      "tag": "水山蹇格局 · 边读边思",
      "question": "蹇卦“险在前，止于山”，初六“往蹇来誉”，明知前方有灭顶之险却强行冒进，为何常人总把蛮干当作勇敢？",
      "hint": "💡 玄微先生点穴启发：上卦为坎水（大河险滩），下卦为艮山（高耸险峰）。前有惊涛骇浪，后有崇山峻岭，跋山涉水步履艰难（蹇）。《大象传》曰：“山上有水，蹇；君子以反身修德。”面对无法硬冲的绝境，智者绝不盲目送死，而是止步反思、反求诸己提升内功，故命此卦为“蹇”（ji。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "水山蹇时位 · 边读边思",
      "question": "六二“王臣蹇蹇，匪躬之故”，为公义与大局涉险犯难，与为个人私利冒险有何本质区别？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“险境反省”六阶进退：初六前有险阻知难而退（往蹇来誉宜待也）；六二王臣奔波非为私利（王臣蹇蹇匪躬之故）；九三盲目冒进折返为安（往蹇来反内喜之也）；六四寻求同道连带结盟（往蹇来连当位实也）；九五深陷大难贤友来援（大蹇朋来以中节也。"
    }
  ],
  "lesson-40_雷水解": [
    {
      "sectionKeyword": "大象传",
      "tag": "雷水解格局 · 边读边思",
      "question": "解卦“雷雨作，解缓赦过”，卦辞“夙吉，往有功”，危机解除之后，为何迅速休养生息、不过度清算旧账至关重要？",
      "hint": "💡 玄微先生点穴启发：上卦为震雷，下卦为坎水。《大象传》曰：“雷雨作，解；君子以赦过宥罪。”初春春雷阵阵伴随甘霖降下，冰封的大地与江河瞬间冰雪消融。寒冬过去生机勃发，所有险阻冰释前嫌，君子赦免罪过宽容待人，故命此卦为“解”（jiě，纾难解困、化险为夷）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "雷水解时位 · 边读边思",
      "question": "初六“无咎”，大乱初定之时，为什么“无为而治、不折腾”是最好的疗愈？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“纾困释怀”六阶转机：初六安宁无事休养生息（刚柔之际义无咎也）；九二射杀狐狸得获正道（田获三狐得黄矢）；六三德不配位致寇招祸（负且乘致寇至）；九四解脱私心诚交良友（解而拇朋至斯孚）；六五君子解缚小人自退（君子维有解吉）；上九高。"
    }
  ],
  "lesson-41_山泽损": [
    {
      "sectionKeyword": "大象传",
      "tag": "山泽损格局 · 边读边思",
      "question": "损卦“损下益上，与时偕行”，初九“已事遄往，无咎，酌损之”，付出帮助他人时，如何拿捏火候做到“帮急不帮贪”？",
      "hint": "💡 玄微先生点穴启发：上卦为艮山，下卦为兑泽。《大象传》曰：“山下有泽，损；君子以惩忿窒欲。”大泽水汽蒸腾滋润高山，深泽沉潜泥沙堆高山峰。损下以益上，克制个人膨胀的欲望与愤怒，以有限之自我换取无限之境界，故命此卦为“损”（减损私欲、舍己成仁）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "山泽损时位 · 边读边思",
      "question": "六三“三人行则损一人，一人行则得其友”，在核心合伙人结构中，为什么三人合伙往往容易内耗、双人契约更稳固？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“克己损益”六阶舍得：初九迅速协助适可而止（已事遄往酌损之）；九二守正为本不损自益（利贞征凶弗损益之）；六三减少纷扰精诚专一（三人行则损一人一人行则得其友）；六四去除旧疾喜从天降（损其疾使遄有喜）；六五上天赐福十朋之龟（或益之。"
    }
  ],
  "lesson-42_风雷益": [
    {
      "sectionKeyword": "大象传",
      "tag": "风雷益格局 · 边读边思",
      "question": "益卦“损上益下，民说无疆”，初九“利用为大作，元吉”，当红利与资源充沛时，为何必须迅速启动标志性的大项目？",
      "hint": "💡 玄微先生点穴启发：上卦为巽风，下卦为震雷。《大象传》曰：“风雷，益；君子以见善则迁，有过则改。”春雷阵阵配合狂风大作，风助雷威雷助风势，激荡天地化育万物。损上以益下，君王让利于万民，百姓富足则天下安定，故命此卦为“益”（滋养繁茂、损上益下）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "风雷益时位 · 边读边思",
      "question": "六二“或益之十朋之龟，弗克违”，真正的外部赋能与超级红利，为什么只青睐内心虚明中正的行道者？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“广施恩泽”六阶大业：初九趁势而为大展宏图（利用为大作元吉）；九二顺天应人天赐大福（或益之十朋之龟永贞吉）；六三利用危困磨砺心志（益之用凶事中行告公用圭）；六四居中协调迁都大吉（中行告公从中馈利用为依迁国）；九五发自内心恩惠万。"
    }
  ],
  "lesson-43_泽天夬": [
    {
      "sectionKeyword": "大象传",
      "tag": "泽天夬格局 · 边读边思",
      "question": "夬卦“决也，五阳决一阴”，初九“壮于前趾，往不胜为咎”，力量尚未形成绝对碾压时轻举妄动，为什么必然提前暴露底牌？",
      "hint": "💡 玄微先生点穴启发：上卦为兑泽，下卦为乾天。深渊汪洋大水悬挂在苍天之顶，水库蓄满即将决堤奔涌而出。五阳爻刚健上推，仅剩顶部一阴爻；代表正义之师果断决绝裁决小人，决堤放水雷厉风行，故命此卦为“夬”（guài，决断、裁断、决去小人）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "泽天夬时位 · 边读边思",
      "question": "九三“壮于䪁，有凶；独行遇雨，若濡有愠”，在清理团队害群之马时，遭人误解却坚持大义，需要怎样的心理承受力？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“雷厉决断”六阶魄力：初九力量薄弱切莫逞强（壮于前趾往不胜为咎）；九二严密戒备防患未然（惕号莫夜有戎勿恤）；九三忍辱负重暗中谋定（壮于頄有凶君子夬夬若濡有愠无咎）；九四进退维谷失去听从（臀无肤其行次且闻言不信）；九五中正决断连。"
    }
  ],
  "lesson-44_天风姤": [
    {
      "sectionKeyword": "大象传",
      "tag": "天风姤格局 · 边读边思",
      "question": "姤卦“一阴生于五阳之下，女壮勿娶”，初六“系于金柅，贞吉”，组织中微小的负面诱惑或裂痕刚露头，为何必须铁腕制止？",
      "hint": "💡 玄微先生点穴启发：上卦为乾天，下卦为巽风。《大象传》曰：“天下有风，姤；后以施命诰四方。”微风吹拂苍茫天下，无微不至穿透万物。底层初生一阴爻，象征弱小之物在不经意间破土相逢；防微杜渐防止恶习暗中蔓延，故命此卦为“姤”（gòu，相遇、邂逅、警惕初萌）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "天风姤时位 · 边读边思",
      "question": "九二“包有鱼，无咎；不利宾”，对内部核心机密与关键资源，如何在尚未成熟前严加保护不外泄？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“偶遇慎微”六阶警策：初六及时刹车制止恶萌（系于金柅贞吉柔道牵也）；九二藏而不露防范小人（包有鱼无咎不利宾）；九三虽处窘境未受侵害（臀无肤其行次且无大咎）；九四脱离群众失去民心（包无鱼起凶远民也）；九五以仁德涵养包容天下（以杞。"
    }
  ],
  "lesson-45_泽地萃": [
    {
      "sectionKeyword": "大象传",
      "tag": "泽地萃格局 · 边读边思",
      "question": "萃卦“泽上于地，聚英才”，初六“有孚不终，乃乱乃萃”，团队聚合初期人心浮动，如何用明确的共同愿景定人心？",
      "hint": "💡 玄微先生点穴启发：上卦为兑泽，下卦为坤地。《大象传》曰：“泽上于地，萃；君子以除戎器，戒不虞。”千万条溪流汇聚于大泽湖泊之中，大泽滋养着大地泥土。江河汇聚、人才聚集、宗庙聚族，群英荟萃欣欣向荣，故命此卦为“萃”（cuì，聚集、萃聚、万民归心）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "泽地萃时位 · 边读边思",
      "question": "六二“引吉，无咎；孚乃利用禴”，资源匮乏时如何吸引顶级人才加入？为什么精诚所至胜过空头支票？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“群英汇聚”六阶凝聚：初六诚心未定容易迷失（有孚不终乃乱乃萃）；六二心怀虔敬感动上天（引吉无咎孚乃利用禴）；六三徘徊孤立应当主动（萃如嗟嗟无攸利往无咎）；九四功高盖主大吉无咎（大吉无咎位不当也）；九五德高望重统一群伦（萃有位无。"
    }
  ],
  "lesson-46_地风升": [
    {
      "sectionKeyword": "大象传",
      "tag": "地风升格局 · 边读边思",
      "question": "升卦“木生于地中，柔顺而升”，初六“允升，大吉”，起步晋升时，为什么获得上层与基层的双向信任是核心通行证？",
      "hint": "💡 玄微先生点穴启发：上卦为坤地，下卦为巽木。《大象传》曰：“地中生木，升；君子以顺德，积小以高大。”大地泥土深处的树木嫩芽破土而出，日复一日默默向上生长，终成参天大树。顺应天地德行，积蓄微小而成博大，故命此卦为“升”（升腾、晋升、步步高升）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "地风升时位 · 边读边思",
      "question": "九二“孚乃利用禴，无咎”，在资源不对称时向上沟通，如何用极简、聚焦的真实交付打动决策者？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“稳步跃升”六阶阶梯：初六深受赏识自信高升（允升大吉上合志也）；六二心存至诚微物享祭（孚乃利用禴春享之义）；六三一马平川畅通无阻（升虚邑无所疑也）；六四登堂入室王祭岐山（王用亨于岐山顺事也）；六五按部就班位列尊荣（贞吉升阶大得。"
    }
  ],
  "lesson-47_泽水困": [
    {
      "sectionKeyword": "大象传",
      "tag": "泽水困格局 · 边读边思",
      "question": "困卦“水在泽下，君子致命遂志”，初六“臀困于株木，入于幽谷，三岁不觌”，在漫长的困境中，盲目挣扎为何只会伤痕累累？",
      "hint": "💡 玄微先生点穴启发：上卦为兑泽，下卦为坎水。《大象传》曰：“泽无水，困；君子以致命遂志。”水本该在湖泽之中，然而泉水全部渗漏到湖底深渊之下，湖面干涸龟裂、寸草不生。处于山穷水尽、孤立无援之大绝境；君子舍身取义、在至暗时刻淬炼钢铁心志，故命此卦为“困”（困顿穷绝。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "泽水困时位 · 边读边思",
      "question": "九二“困于酒食，朱绂方来”，在舒适区与金手铐中被困住的现代骨干，如何保持冲出泥潭的魄力？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“逆境涅槃”六阶升华：初六意志沉沦陷入幽谷（臀困于株木入于幽谷三岁不觌）；六二困于享受朱衣降临（困于酒食朱绂方来利用享祀）；六三进退失据自断退路（困于石据于蒺藜入室不见妻）；九四徐徐而来终脱困局（来徐徐困于金车吝有终）；九五饱。"
    }
  ],
  "lesson-48_水风井": [
    {
      "sectionKeyword": "大象传",
      "tag": "水风井格局 · 边读边思",
      "question": "井卦“改邑不改井，汲泉润物”，初六“井泥不食，旧井无禽”，自身缺乏硬核专业交付物时，凭什么赢得市场尊重？",
      "hint": "💡 玄微先生点穴启发：上卦为坎水，下卦为巽木。《大象传》曰：“木上有水，井；君子以劳民劝相。”木制的水桶深入地下寒泉，辘轳运转清泉源源不断被汲引到地面。水井千古不移其所、甘泉供天下人汲饮而永不干涸枯竭；修身治学当如挖井，不达清泉誓不罢休，故命此卦为“井”（滋养无。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "水风井时位 · 边读边思",
      "question": "九二“井谷射鲋，瓮敝漏”，拥有才华却只与庸碌小人为伍自甘堕落，这是怎样的人生悲剧？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“清泉修养”六阶深挖：初六井底污泥不堪饮用（井泥不食旧井无禽）；六二陶罐破漏弃于深沟（井谷射鲋瓮敝漏）；六三淘洗干净无人来汲（井渫不食为我心恻可用汲）；六四砌砖整修沉淀内功（井甃无咎修井也）；九五寒泉清冽万人享用（井洌寒泉食中。"
    }
  ],
  "lesson-49_泽火革": [
    {
      "sectionKeyword": "大象传",
      "tag": "泽火革格局 · 边读边思",
      "question": "革卦“水火相息，天地革而四时成”，初九“巩用黄牛之革”，改革初期时机未到，为什么必须死守底线绝不可盲动？",
      "hint": "💡 玄微先生点穴启发：上卦为兑泽（水），下卦为离火。《大象传》曰：“泽中有火，革；君子以治历明时。”水与火同处一处，水能熄灭烈火，烈火能煮干大泽，两者势不两立爆发天翻地覆的根本变革。汤武革命顺天应人，破旧立新重整乾坤，故命此卦为“革”（革除弊端、革命革新）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "泽火革时位 · 边读边思",
      "question": "六二“巳日乃革之，征吉，无咎”，任何组织变革为什么必须在获得广泛共识（“已日”）之后方能动手？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“制度变革”六阶攻坚：初九时机未到稳固守正（巩用黄牛之革不可以有为）；六二时机成熟果断出征（巳日革之征吉行有嘉）；九三三番推敲谋定而动（革言三就又何之矣）；九四破除天命人心大顺（改命吉信志也）；九五顺天应人大刀阔斧（大人虎变未。"
    }
  ],
  "lesson-50_火风鼎": [
    {
      "sectionKeyword": "大象传",
      "tag": "火风鼎格局 · 边读边思",
      "question": "鼎卦“木上有火，调和五味，鼎新成物”，初六“鼎颠趾，否臧，出否”，打破旧有落后体制清除毒瘤，为何是创新的首要前提？",
      "hint": "💡 玄微先生点穴启发：上卦为离火，下卦为巽木。《大象传》曰：“木上有火，鼎；君子以正位凝命。”以木柴助燃火焰，烹煮调和五味佳肴。鼎为古代国家至高无上之重器，去旧为革、取新为鼎，象征安邦定国、立国承运化育人才，故命此卦为“鼎”（革故鼎新、正位凝命）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "火风鼎时位 · 边读边思",
      "question": "九四“鼎折足，覆公餗，其形渥，凶”，所托非人、德薄而位尊，在现代投资或用人中会导致怎样的毁灭性事故？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“重器鼎新”六阶造化：初六鼎足翻倒倒出残渣（鼎颠趾利出否得妾以子）；九二鼎中饱满小人眼红（鼎有实我仇有疾不我能即）；九三鼎耳受损行路受阻（鼎耳革其行塞雉膏不食方雨亏悔）；九四担当过重折足覆羹（鼎折足覆公餗其形渥凶）；六五鼎配金。"
    }
  ],
  "lesson-53_风山渐": [
    {
      "sectionKeyword": "大象传",
      "tag": "风山渐格局 · 边读边思",
      "question": "渐卦“渐进有序，鸿渐于干”，初六“鸿渐于干，小子厉”，职场起步期缺乏积累，为什么越着急越容易被社会毒打？",
      "hint": "💡 玄微先生点穴启发：上卦为巽风（树木），下卦为艮山。《大象传》曰：“山上有木，渐；君子以居贤德善俗。”高耸的大山之上长有一棵大树，微风吹拂，大树顺应四时扎根岩层、缓缓拔高长成参天大树。如同鸿雁迁徙按部就班，女子出嫁六礼备至，循序渐进不可操之过急，故命此卦为“渐。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "风山渐时位 · 边读边思",
      "question": "九三“鸿渐于陆，夫征不复，妇孕不育，凶”，脱离稳固基本盘盲目跨界扩张，为何必然引发后方崩盘？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“渐进成器”六阶步调：初六初入江湖微有浮议（鸿渐于干小子厉有言无咎）；六二从容安歇欢聚饮食（鸿渐于磐饮食衎衎不素饱也）；九三盲目远征脱离正道（鸿渐于陆夫征不复妇孕不育）；六四巧妙栖身安于枯枝（鸿渐于木或得其桷顺以巽也）；九五历。"
    }
  ],
  "lesson-54_雷泽归妹": [
    {
      "sectionKeyword": "大象传",
      "tag": "雷泽归妹格局 · 边读边思",
      "question": "归妹卦“人之终始，征凶，无攸利”，为什么违背自然秩序与客观规律的急功近利合作，往往不得善终？",
      "hint": "💡 玄微先生点穴启发：上卦为震雷（长男），下卦为兑泽（少女）。大泽之上惊雷大作，少女迷恋长男，情窦初开急于婚嫁。《大象传》曰：“泽上有雷，归妹；君子以永终知敝。”仅凭一时冲动激情盲目结合，违背正常礼义程序，终局必然走向破败；君子当见微知著、预知终局之弊病，故命此。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "雷泽归妹时位 · 边读边思",
      "question": "初九“归妹以娣，跛能履，征吉”，在不对等的劣势合作关系中，如何甘当副手、安分守己以自保？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“急情之戒”六阶审视：初六甘为偏房跛能勉行（归妹以娣跛能履吉相承也）；六二坚守贞操甘居寂寞（眇能视利幽人之贞）；六三贪图名分反遭嫌弃（归妹以须反归以娣）；九四延期等待静候良缘（归妹愆期迟归有时）；六五不慕虚荣贤德无双（帝乙归妹。"
    }
  ],
  "lesson-55_雷火丰": [
    {
      "sectionKeyword": "大象传",
      "tag": "雷火丰格局 · 边读边思",
      "question": "丰卦“日中则昃，月盈则食”，初九“遇其配主，虽旬无咎”，在业务巅峰期，如何识别真正互补且同频的黄金搭档？",
      "hint": "💡 玄微先生点穴启发：上卦为震雷，下卦为离火。《大象传》曰：“雷电皆至，丰；君子以折狱致刑。”雷声轰鸣电光照耀，天地大明、万物丰硕浩瀚如日中天。然而烈日升到正顶必将西斜，盛极之时暗藏倾覆之危机；处丰大之时当居安思危，故命此卦为“丰”（丰硕盛大、盛极防微）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "雷火丰时位 · 边读边思",
      "question": "九三“丰其沛，日中见沬，折其右肱，无咎”，处于事业日中天的顶峰，为什么往往伴随着最诡谲的遮蔽与隐秘背叛？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“丰盛保泰”六阶权衡：初九结交贤朋平分秋色（遇其配主虽旬无咎）；六二黑云蔽日正午见斗（丰其蔀日中见斗往得疑疾有孚发若）；九三阴翳遮蔽折断右臂（丰其沛日中见沬折其右肱）；九四重云消散遇见明师（丰其蔀日中见斗遇其夷主吉）；六五广纳。"
    }
  ],
  "lesson-56_火山旅": [
    {
      "sectionKeyword": "大象传",
      "tag": "火山旅格局 · 边读边思",
      "question": "旅卦“山上有火，羁旅异乡”，初六“旅琐琐，斯其所取灾”，身处异地客场时，因斤斤计较蝇头小利会招来何种灭顶之灾？",
      "hint": "💡 玄微先生点穴启发：上卦为离火，下卦为艮山。《大象传》曰：“山上有火，旅；君子以明慎用刑而不留狱。”高山之上燃烧起野火，随风蔓延、过而不留。游子背井离乡客居异域，人情淡薄处处羁绊；在异乡必须低调谦逊、慎言慎行，故命此卦为“旅”（羁旅异乡、客居自保）。。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "火山旅时位 · 边读边思",
      "question": "六二“旅即次，怀其资，得童仆贞”，出差或外派开拓新市场，如何处理好住宿、资金与可靠助手的安全底线？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“异乡立足”六阶自持：初六斤斤计较自招灾祸（旅琐琐斯其所取灾）；六二安身立命深得帮扶（旅即次怀其资得童仆贞）；九三骄傲蛮横焚烧旅舍（旅焚其次丧其童仆贞厉）；九四虽得盘缠未安其心（旅于处得其资斧我心不快）；六五展现才华得享美誉（。"
    }
  ],
  "lesson-59_风水涣": [
    {
      "sectionKeyword": "大象传",
      "tag": "风水涣格局 · 边读边思",
      "question": "涣卦“风行水上，人心涣散”，初六“用拯马壮，吉”，组织人心刚刚散架之时，为何必须不惜一切代价借强力迅速凝聚？",
      "hint": "💡 玄微先生点穴启发：上卦为巽风，下卦为坎水。《大象传》曰：“风行水上，涣；先王以享于上帝，立庙。”暖洋洋的春风拂过浩荡江面，吹散了千里浮冰，波澜泛起冰消雪融。人心涣散隔阂之时，当立宗庙、祭神灵凝聚共同信仰，化散为聚、涉大川共渡难关，故命此卦为“涣”（化解冰封、。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "风水涣时位 · 边读边思",
      "question": "九二“涣奔其机，悔亡”，危机风暴来临之际，如何第一时间找到并依靠自己的避风港与坚实基座？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“破冰聚心”六阶经纶：初六借助强援脱离困境（用拯马壮吉顺也）；六二奔赴机台消除悔恨（涣奔其机悔亡得愿也）；六三舍弃私心大公无私（涣其躬无悔志在外也）；六四散除朋党重组大局（涣其群元吉光大也）；九五号令如汗普惠天下（涣汗其大号涣。"
    }
  ],
  "lesson-60_水泽节": [
    {
      "sectionKeyword": "大象传",
      "tag": "水泽节格局 · 边读边思",
      "question": "节卦“节制有限，苦节不可贞”，初九“不出户庭，无咎”，当外部环境要求收缩自律时，如何守住门径不盲目社交？",
      "hint": "💡 玄微先生点穴启发：上卦为坎水，下卦为兑泽。《大象传》曰：“泽上有水，节；君子以制数度，议德行。”江河流水汇聚于大泽湖泊之中，湖泊有其固定的容量与堤坝边界；水少则枯竭，水满则泛滥，唯有节制得当方能碧波荡漾。人生与制度皆须制定规矩限度，故命此卦为“节”（节制约束。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "水泽节时位 · 边读边思",
      "question": "九二“不出门庭，凶”，当时机已经成熟需要出击突破时，如果依然死守所谓的“节制”，为何反而变成作茧自缚？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“度数节制”六阶分寸：初六闭门自守洞悉通塞（不出户庭知通塞也）；六二错失良机大祸临头（不出门庭凶失时极也）；六三放纵无度叹息悔恨（不节若则嗟若谁咎也）；六四安然守节承接天命（安节之亨承上道也）；九五甘于守节大吉大利（甘节之吉居。"
    }
  ],
  "lesson-61_风泽中孚": [
    {
      "sectionKeyword": "大象传",
      "tag": "风泽中孚格局 · 边读边思",
      "question": "中孚卦“泽上有风，诚信立极”，初九“虞吉，有他不燕”，建立信任的第一步，为什么必须专一而绝不能心怀二意？",
      "hint": "💡 玄微先生点穴启发：上卦为巽风，下卦为兑泽。全卦外实内虚，上下各两阳爻护卫中间两阴爻，如母鸟孵卵、雏鸟破壳。《大象传》曰：“泽上有风，中孚；君子以议狱缓死。”清风拂过大泽泛起层层波澜，至诚无私的信义感动天地飞禽走兽。心中有信、言行一致，故命此卦为“中孚”（内心。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "风泽中孚时位 · 边读边思",
      "question": "九二“鸣鹤在阴，其子和之；我有好爵，吾与尔靡之”，真正高维的心灵感应与同频，为什么根本不需要喧嚣大呼？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“至诚感应”六阶品格：初六专心致志不受动摇（虞吉有他不燕也）；九二鹤鸣幽谷子声相应（鸣鹤在阴其子和之中心愿也）；六三进退失据心神大乱（得敌或鼓或罢或泣或歌）；六四明月将圆超越私党（月几望马匹亡绝类上也）；九五至诚相握天下归心（。"
    }
  ],
  "lesson-62_雷山小过": [
    {
      "sectionKeyword": "大象传",
      "tag": "雷山小过格局 · 边读边思",
      "question": "小过卦“飞鸟遗音，可小事不可大事”，初六“飞鸟以凶”，羽翼未丰之时强行展翅高飞，在现代创业中会导致怎样的惨败？",
      "hint": "💡 玄微先生点穴启发：上卦为震雷，下卦为艮山。中间两阳爻、上下各两阴爻，如飞鸟振翅之形。高山之顶惊雷炸响，雷声极近逼人。《大象传》曰：“山上有雷，小过；君子以行过乎恭，丧过乎哀，用过乎俭。”小事可以稍过分寸以示敬慎（如礼貌过度恭敬、用度过度节俭），大事绝不可逾矩。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "雷山小过时位 · 边读边思",
      "question": "九三“弗过防之，从或戕之，凶”，面对潜在的凶险如果不做任何冗余防御，为什么必然遭遇降维打击？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“敬慎适度”六阶平衡：初六羽翼未丰盲目高飞（飞鸟以凶不可如何也）；六二退求其次顺应尊长（过其祖遇其妣不及其君）；九三防备不严自遭杀戮（弗过防之或戕之凶）；九四刚柔相济审慎行事（无咎弗过遇之往厉必戒）；六五密云不雨深穴取兽（密云。"
    }
  ],
  "lesson-63_水火既济": [
    {
      "sectionKeyword": "大象传",
      "tag": "水火既济格局 · 边读边思",
      "question": "既济卦“六爻皆当位，初吉终乱”，当所有目标与KPI全部达成时，为何反而是系统最容易走向熵增的起点？",
      "hint": "💡 玄微先生点穴启发：上卦为坎水，下卦为离火。《大象传》曰：“水在火上，既济；君子以思患而预防之。”水在锅炉之上，火在灶膛之下，水得火之加热烹饪成佳肴，火得水之节制不至燎原。全卦六爻全部当位（阴居阴位、阳居阳位），阴阳水火达到极致平衡完美；然而盛极必衰，大功告成。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "水火既济时位 · 边读边思",
      "question": "九三“高宗伐鬼方，三年克之，小人勿用”，打赢最艰苦的战役后，团队最容易滋生哪些骄奢与赏罚不公风险？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“守成防变”六阶警策：初九刹车减速浸湿尾巴（曳其轮濡其尾无咎）；六二失落头巾切莫强求（妇丧其茀勿逐七日得）；九三征伐外敌历经三年（高宗伐鬼方三年克之小人勿用）；六四严密防漏整日警惕（濡有衣袽终日戒）；九五东邻盛祭不如西邻薄祭（。"
    }
  ],
  "lesson-64_火水未济": [
    {
      "sectionKeyword": "大象传",
      "tag": "火水未济格局 · 边读边思",
      "question": "未济卦“小狐汔济濡其尾，无攸利”，当离终点只剩最后一步时，如何防范盲目乐观导致的功亏一篑？",
      "hint": "💡 玄微先生点穴启发：上卦为离火，下卦为坎水。《大象传》曰：“火在水上，未济；君子以慎辨物居方。”火性炎上拼命往长空飞升，水性润下拼命往地底流淌，水火背道而驰无法相交。全卦六爻全部失位（阴居阳位、阳居阴位），代表事业尚未成功，一切处于崭新的探索重构之中！易经六十。"
    },
    {
      "sectionKeyword": "伊川易传",
      "tag": "火水未济时位 · 边读边思",
      "question": "九二“曳其轮，贞吉”，在即将胜利的冲刺阶段，为什么主动刹车减速反而能确保最终安全靠岸？",
      "hint": "💡 玄微先生点穴启发：本卦自下而上为“永恒探索”六阶新篇：初六小狐涉水浸湿尾巴（濡其尾吝不知极也）；九二刹紧车轮坚守正道（曳其轮贞吉中以行正也）；六三未济涉险求索前路（未济征凶利涉大川）；九四历尽艰险伐定大局（贞吉悔亡震用伐鬼方三年有赏）；九五正义昭彰辉耀天下（。"
    }
  ]
};

  // 渲染正文穿插的【💡 易道顿悟小憩 · 边读边思】卡片
  window.renderInlineThinkPrompts = function() {
    const readerContent = document.getElementById('readerContent');
    if (!readerContent) return;

    // 清理旧的穿插卡片
    readerContent.querySelectorAll('.yj-inline-think-card').forEach(el => el.remove());

    const cur = getCurrentLesson();
    if (!cur) return;

    const questions = INLINE_THINK_BANK[cur.id] || [];
    if (!questions || questions.length === 0) {
      // 若尚未定制，尝试提取本课题库第一问作为穿插启发
      const bank = window.YijingInquiryBank && window.YijingInquiryBank[cur.id];
      if (bank && bank.length > 0) {
        questions.push({
          sectionKeyword: '核心要义',
          tag: '本课核心 · 边读边思',
          question: bank[0],
          hint: `💡 玄微先生点穴启发：请紧扣《${cur.title}》的主旨，结合当下阅读所感，记录下一两句最真实的理解。`
        });
      } else {
        return;
      }
    }

    // 寻找正文中插入锚点（核心：插在当前核心要义正文读完之后、下一个核心要义标题之前）
    const assessments = (window.LearningVault && window.LearningVault.getInlineAssessments)
      ? window.LearningVault.getInlineAssessments(cur.id)
      : {};

    // 提取正文中所有标题元素，严禁包含最外层 section
    const allHeaders = Array.from(readerContent.querySelectorAll('.step-header, .yao-sub-title, h3, h4.sub-sec-title'));

    questions.forEach((qItem, qIdx) => {
      let insertAnchor = null;
      let insertBefore = false;

      if (qItem.sectionKeyword && allHeaders.length > 0) {
        const kw = qItem.sectionKeyword.replace(/\s+/g, '');
        const headerIdx = allHeaders.findIndex(h => {
          const t = (h.textContent || '').replace(/\s+/g, '');
          return t.includes(kw);
        });

        if (headerIdx !== -1) {
          const curH = allHeaders[headerIdx];
          // 寻找下一个小节标题（即本核心要义正文读完的位置）
          let nextH = null;
          for (let i = headerIdx + 1; i < allHeaders.length; i++) {
            const candidate = allHeaders[i];
            if (curH.classList.contains('step-header')) {
              if (candidate.classList.contains('step-header')) {
                nextH = candidate;
                break;
              }
            } else {
              if (candidate.classList.contains('step-header') || candidate.className === curH.className || candidate.tagName === curH.tagName) {
                nextH = candidate;
                break;
              }
            }
          }

          if (nextH) {
            insertAnchor = nextH;
            insertBefore = true;
          } else {
            let p = curH.parentNode;
            insertAnchor = p.lastElementChild || curH;
            insertBefore = false;
          }
        }
      }

      // 未匹配时，按索引均匀映射到各标题小节末尾
      if (!insertAnchor && allHeaders.length > 0) {
        const stepIndex = Math.min(Math.floor(((qIdx + 1) / (questions.length + 1)) * allHeaders.length), allHeaders.length - 1);
        insertAnchor = allHeaders[stepIndex];
        insertBefore = true;
      }

      const card = document.createElement('div');
      card.className = 'yj-inline-think-card';
      const inputId = `inlineThinkInput_${cur.id}_${qIdx}`;
      const hintId = `inlineHintBox_${cur.id}_${qIdx}`;
      const assessResultId = `inlineAssessResult_${cur.id}_${qIdx}`;
      const assessBtnId = `inlineAssessBtn_${cur.id}_${qIdx}`;

      const historyItem = assessments[qIdx] || {};
      const savedAnswer = historyItem.user_answer || '';
      const savedAssessment = historyItem.teacher_assessment || '';

      card.innerHTML = `
        <div class="yj-inline-think-header">
          <span class="yj-inline-think-tag">💡 ${escapeHtml(qItem.tag || '易道顿悟小憩 · 边读边思')}</span>
          <span style="font-size:12px; color:var(--text-faint);">驻足自省 · 知行合一</span>
        </div>
        <div class="yj-inline-think-q">${qItem.question}</div>
        <textarea class="yj-inline-think-input" id="${inputId}" rows="2" placeholder="在此敲下你读到此处的顿悟、现实反思或当下困惑...">${escapeHtml(savedAnswer)}</textarea>
        <div class="yj-inline-think-actions">
          <button class="yj-btn-outline" style="font-size:12px; padding:5px 12px; border-color:var(--gold); color:var(--gold);" onclick="toggleHintDrawer('${hintId}')">☯️ 查看玄微先生点穴启发</button>
          <button class="yj-btn-outline" id="${assessBtnId}" style="font-size:12px; padding:5px 14px; border-color:var(--purple, #a855f7); color:var(--purple, #a855f7); font-weight:700;" onclick="requestInlineThinkAssessment('${cur.id}', ${qIdx})">✨ 提请玄微先生 · 师承评估</button>
          <button class="yj-btn-gold" style="font-size:12px; padding:5px 14px;" onclick="saveInlineThinkNote('${escapeHtml(qItem.tag || '边读边思')}', '${inputId}', '${cur.id}')">📝 存入本课随堂微笔记</button>
        </div>
        <div class="yj-inline-hint-box" id="${hintId}">
          ${qItem.hint || '在易道研学中，每一次驻足反思都是一次认知跃迁。'}
        </div>
        <div class="yj-inline-assessment-container ${savedAssessment ? 'open' : ''}" id="${assessResultId}">
          ${savedAssessment ? formatTeacherAssessmentHtml(savedAssessment, historyItem.updated_at, false) : ''}
        </div>
      `;

      if (insertAnchor && insertAnchor.parentNode) {
        if (insertBefore) {
          insertAnchor.parentNode.insertBefore(card, insertAnchor);
        } else {
          insertAnchor.parentNode.appendChild(card);
        }
      } else {
        const stageWrap = document.getElementById('bottomStagesWrap');
        if (stageWrap && stageWrap.parentNode) {
          stageWrap.parentNode.insertBefore(card, stageWrap);
        } else {
          readerContent.appendChild(card);
        }
      }
    });
  };

  // 格式化解析玄微先生的三维评估卡片 (肯定之处、不足之处、学习建议)
  window.formatTeacherAssessmentHtml = function(text, timeStr = '', isStreaming = false) {
    if (!text) return '';

    // 解析三大模块
    let affirmContent = '';
    let critiqueContent = '';
    let adviceContent = '';

    const lines = text.split('\n');
    let currentMode = 'general';
    let generalBuf = [];

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.includes('【明德见智') || trimmed.includes('肯定之处')) {
        currentMode = 'affirm';
      } else if (trimmed.includes('【见微知著') || trimmed.includes('辨正不足') || trimmed.includes('不足之处')) {
        currentMode = 'critique';
      } else if (trimmed.includes('【致知力行') || trimmed.includes('研学建议') || trimmed.includes('学习建议')) {
        currentMode = 'advice';
      } else {
        if (currentMode === 'affirm') {
          affirmContent += (affirmContent ? '\n' : '') + line;
        } else if (currentMode === 'critique') {
          critiqueContent += (critiqueContent ? '\n' : '') + line;
        } else if (currentMode === 'advice') {
          adviceContent += (adviceContent ? '\n' : '') + line;
        } else {
          generalBuf.push(line);
        }
      }
    });

    // 若未严格分出三段，将通用内容展示
    let bodyHtml = '';
    if (affirmContent || critiqueContent || adviceContent) {
      if (affirmContent.trim()) {
        bodyHtml += `
          <div class="yj-assess-block affirm">
            <div class="yj-assess-block-title">🟢 【明德见智 · 肯定之处】</div>
            <div>${escapeHtml(affirmContent.trim()).replace(/\n/g, '<br/>')}</div>
          </div>
        `;
      }
      if (critiqueContent.trim()) {
        bodyHtml += `
          <div class="yj-assess-block critique">
            <div class="yj-assess-block-title">🟡 【见微知著 · 辨正不足与点穴】</div>
            <div>${escapeHtml(critiqueContent.trim()).replace(/\n/g, '<br/>')}</div>
          </div>
        `;
      }
      if (adviceContent.trim()) {
        bodyHtml += `
          <div class="yj-assess-block advice">
            <div class="yj-assess-block-title">🔵 【致知力行 · 研学与发力建议】</div>
            <div>${escapeHtml(adviceContent.trim()).replace(/\n/g, '<br/>')}</div>
          </div>
        `;
      }
    } else {
      bodyHtml = `
        <div class="yj-assess-block affirm">
          <div class="yj-assess-block-title">☯️ 【玄微先生 · 师承开示】</div>
          <div>${escapeHtml(text.trim()).replace(/\n/g, '<br/>')}</div>
        </div>
      `;
    }

    return `
      <div class="yj-inline-assessment-card">
        <div class="yj-assess-header">
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="yj-assess-seal">玄微先生 · 师承点评</span>
            <span style="font-size:12px; color:var(--text-sub);">${timeStr || '刚才'}</span>
          </div>
          <div class="yj-assess-saved-pill">
            ${isStreaming ? '⚡ 宗师推演中...' : '🟢 已双向同步持久化落盘'}
          </div>
        </div>
        <div class="yj-assess-body">
          ${bodyHtml}
        </div>
      </div>
    `;
  };

  // 提请玄微先生对边读边思回答展开评估并自动落盘
  window.requestInlineThinkAssessment = async function(guaId, qIdx) {
    const cur = getCurrentLesson();
    const targetGuaId = guaId || (cur ? cur.id : 'unknown');
    const questions = INLINE_THINK_BANK[targetGuaId] || [];
    const qItem = questions[qIdx] || { question: '边读边思', tag: '易道顿悟', hint: '' };

    const inputId = `inlineThinkInput_${targetGuaId}_${qIdx}`;
    const resultId = `inlineAssessResult_${targetGuaId}_${qIdx}`;
    const assessBtnId = `inlineAssessBtn_${targetGuaId}_${qIdx}`;

    const input = document.getElementById(inputId);
    const resultEl = document.getElementById(resultId);
    const assessBtn = document.getElementById(assessBtnId);

    if (!input) return;
    const userAnswer = input.value.trim();
    if (!userAnswer) {
      alert('请先在输入框中敲下你读到此处的真实思考、疑惑或感悟，再提请玄微先生评估。');
      input.focus();
      return;
    }

    // 设置 loading 态
    if (assessBtn) {
      assessBtn.disabled = true;
      assessBtn.innerHTML = `⏳ 玄微先生审阅点穴中...`;
    }

    // 展开容器并渲染思考骨架
    if (resultEl) {
      resultEl.classList.add('open');
      resultEl.innerHTML = `
        <div class="yj-assess-loading">
          <span class="yj-assess-spinner">☯️</span>
          <div style="font-size:13px; color:var(--gold); font-weight:700;">玄微先生正观照小友之悟道心性，深究时位得失……</div>
          <div style="font-size:12px; color:var(--text-sub); margin-top:4px;">（正在辨析：明德见智肯定、见微知著解惑、致知力行建议）</div>
        </div>
      `;
    }

    let accumulatedContent = '';

    const finishAssessment = function(finalText) {
      const timeStr = new Date().toLocaleString();
      if (resultEl) {
        resultEl.innerHTML = formatTeacherAssessmentHtml(finalText, timeStr, false);
      }
      if (assessBtn) {
        assessBtn.disabled = false;
        assessBtn.innerHTML = `✨ 重新提请师承评估`;
      }

      // 核心：同步进行存储落盘！
      if (window.LearningVault && window.LearningVault.saveInlineAssessment) {
        window.LearningVault.saveInlineAssessment(
          targetGuaId,
          qIdx,
          qItem.question,
          qItem.tag || '边读边思',
          userAnswer,
          finalText,
          cur
        );
        console.log(`[InlineAssessment] 🟢 学员回答与玄微先生评估已成功同步落盘至 ${targetGuaId}`);
      }
    };

    try {
      if (window.YijingAIService && window.YijingAIService.evaluateInlineThink) {
        await window.YijingAIService.evaluateInlineThink({
          lessonTitle: cur ? cur.title : targetGuaId,
          question: qItem.question,
          studentAnswer: userAnswer,
          hint: qItem.hint || '',
          tag: qItem.tag || '边读边思',
          lessonMeta: cur || {},
          onContent: (chunk, full) => {
            accumulatedContent = full;
            if (resultEl) {
              resultEl.innerHTML = formatTeacherAssessmentHtml(full, '正在生成...', true);
            }
          },
          onDone: ({ content }) => {
            accumulatedContent = content || accumulatedContent;
            finishAssessment(accumulatedContent);
          },
          onError: (err) => {
            console.warn('[InlineAssessment] API调用异常，启用离线高保真宗师引擎:', err);
            const offline = (window.YijingAIService && window.YijingAIService.generateOfflineInlineAssessment)
              ? window.YijingAIService.generateOfflineInlineAssessment({
                  lessonTitle: cur ? cur.title : targetGuaId,
                  question: qItem.question,
                  studentAnswer: userAnswer,
                  hint: qItem.hint || '',
                  tag: qItem.tag || '边读边思'
                })
              : '🟢 【明德见智 · 肯定之处】：善哉！能将所学印证自身，心性甚诚。\n\n🟡 【见微知著 · 辨正不足】：切忌脱离现实约束，地道乃生存之本。\n\n🔵 【致知力行 · 研学建议】：笃行实干，静待时变。';
            finishAssessment(offline);
          }
        });
      } else {
        // 服务未就绪直接使用离线评估
        const offline = '🟢 【明德见智 · 肯定之处】：善哉！能将所学印证自身，心性甚诚。\n\n🟡 【见微知著 · 辨正不足】：切忌脱离现实约束，地道乃生存之本。\n\n🔵 【致知力行 · 研学建议】：笃行实干，静待时变。';
        finishAssessment(offline);
      }
    } catch (e) {
      console.error('Assessment execution failed:', e);
      const offline = '🟢 【明德见智 · 肯定之处】：善哉！能将所学印证自身，心性甚诚。\n\n🟡 【见微知著 · 辨正不足】：切忌脱离现实约束，地道乃生存之本。\n\n🔵 【致知力行 · 研学建议】：笃行实干，静待时变。';
      finishAssessment(offline);
    }
  };

  // 存入随堂微笔记
  window.saveInlineThinkNote = function(tag, inputId, guaId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    const text = input.value.trim();
    if (!text) {
      alert('请先输入您的思考或心得，再存入微笔记。');
      return;
    }
    const cur = getCurrentLesson();
    if (window.LearningVault) {
      window.LearningVault.addNote(guaId || (cur ? cur.id : 'unknown'), tag, text, cur);
      alert('✅ 已将顿悟心得存入本课专属随堂笔记，并自动同步落盘！');
      input.style.borderColor = 'var(--gold)';
    }
  };

  // 展开/折叠提示抽屉
  window.toggleHintDrawer = function(id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.toggle('open');
  };

  // 插入费曼启发脚手架
  window.insertFeynmanScaffold = function(snippet) {
    const area = document.getElementById('feyFullText');
    if (!area) return;
    if (area.value.trim().length > 0) {
      area.value += '\n\n' + snippet;
    } else {
      area.value = snippet;
    }
    area.focus();
    setupAutoResizeTextarea('feyFullText', null, 160);
  };

  // 钩住正文 loadLesson：翻页时联动渲染正文穿插小憩与底部两大卡片
  const origLoadLesson = window.loadLesson;
  window.loadLesson = function(idx) {
    if (origLoadLesson) origLoadLesson(idx);
    setTimeout(() => {
      window.renderInlineThinkPrompts();
      window.renderBottomAssistantStages();
      if (document.getElementById('yjAssistantPanel').classList.contains('open')) {
        syncCoachCurrentGua();
      }
    }, 120);
  };

  // 底部两大卡片渲染（复盘与费曼：自适应难易度与章节专属内容）
  window.renderBottomAssistantStages = function() {
    const readerContent = document.getElementById('readerContent');
    if (!readerContent) return;

    const old = document.getElementById('yjStageCardWrap');
    if (old) old.remove();

    const cur = getCurrentLesson();
    if (!cur) return;

    const cfg = getLessonAdaptiveConfig(cur.id, cur);
    const bank = window.YijingInquiryBank && window.YijingInquiryBank[cur.id] ? window.YijingInquiryBank[cur.id] : [];
    let questions = bank.slice(0, cfg.reviewCount);
    if (!questions || questions.length === 0) {
      questions = [
        `结合《${cur.title}》的核心要义，你在现实中最深刻的印证或启发是什么？`,
        `如果将本卦提炼为一条通俗易懂的处事心智底牌，会是什么？`
      ];
      if (cfg.reviewCount >= 3) {
        questions.push(`在未来的具体生活或工作决策中，你将如何落地践行本卦智慧？`);
      }
    }

    const record = window.LearningVault ? window.LearningVault.getGuaRecord(cur.id, cur) : { review: {}, feynman: {} };
    const rev = record.review || {};
    const fey = record.feynman || {};
    const hasAnalysis = rev.ai_analysis && rev.ai_analysis.content;

    const wrap = document.createElement('div');
    wrap.className = 'yj-stage-card-wrap';
    wrap.id = 'yjStageCardWrap';

    // 动态生成本课专属复盘题目 HTML
    const reviewItemsHtml = questions.map((qText, idx) => {
      let val = '';
      if (rev.items && rev.items[idx]) {
        val = rev.items[idx].answer || '';
      } else if (idx === 0 && rev.q1_mirror) {
        val = rev.q1_mirror;
      } else if (idx === 1 && rev.q2_mindset) {
        val = rev.q2_mindset;
      } else if (idx === 2 && rev.q3_action) {
        val = rev.q3_action;
      }
      return `
        <div class="yj-review-item">
          <label><span style="color:var(--gold); font-weight:800;">探问 ${idx + 1} ·</span> ${escapeHtml(qText)}</label>
          <textarea id="revQ_${idx}" rows="2" placeholder="在此写下切合本章专属要旨的真实思考与个人认知算法...">${escapeHtml(val)}</textarea>
        </div>
      `;
    }).join('');

    // 动态生成费曼大白话脚手架 HTML
    const scaffoldsHtml = (cfg.scaffolds || []).map(sc => `
      <div class="yj-scaffold-box" onclick="insertFeynmanScaffold('${escapeHtml(sc.insert).replace(/'/g, "\\'")}')">
        <div class="yj-scaffold-title">${escapeHtml(sc.title)}</div>
        <div class="yj-scaffold-desc">${escapeHtml(sc.desc)}</div>
        <div class="yj-scaffold-action">＋ 点击填入自述引导模板</div>
      </div>
    `).join('');

    // 动态生成核心线索指引 HTML
    const hintsHtml = (cfg.coreHints || []).map(h => `<li>${escapeHtml(h)}</li>`).join('');

    wrap.innerHTML = `
      <section class="yj-stage-card" id="stage3Card">
        <div class="yj-stage-header">
          <div class="yj-stage-info">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span class="yj-stage-tag" style="background:var(--gold-light, rgba(212,163,89,0.18)); color:var(--gold, #d4a359); margin-bottom:0;">阶段三 · 悟道复盘</span>
              <span class="yj-difficulty-pill ${cfg.badgeClass}">${cfg.levelLabel}（精研 ${cfg.reviewCount} 问）</span>
            </div>
            <h2>🧠 《${cur.title}》本章专属反思与认知提炼</h2>
            <p>古圣人作易，“反身而诚”。以下针对本章核心卦义与时位拐点设计，回答问题将本课化为您脑海中的决策算法。</p>
          </div>
          <div class="yj-stage-actions">
            <button class="yj-btn-outline" onclick="openVaultModal('review')" style="padding:6px 14px; font-size:13px;">📜 展开修学档案</button>
            <button class="yj-btn-outline" onclick="toggleHintDrawer('stage3HintDrawer')" style="padding:6px 14px; font-size:13px; border-color:var(--gold); color:var(--gold);">💡 核心线索指引</button>
            <button class="yj-btn-outline" onclick="requestBottomMasterAgentReview()" style="padding:6px 14px; font-size:13px; border-color:var(--gold); color:var(--gold); font-weight:700;">✨ 提请玄微先生 · 深度剖析</button>
            <button class="yj-btn-gold" onclick="saveBottomReview()" style="padding:6px 16px; font-size:13px;">💾 保存复盘心得</button>
          </div>
        </div>

        <div class="yj-hint-drawer" id="stage3HintDrawer">
          <div style="font-weight:700; color:var(--gold); margin-bottom:6px;">💡 《${cur.title}》易理复盘核心启发线索：</div>
          <ul style="margin:0; padding-left:18px; color:var(--text-sub); font-size:13px; line-height:1.65;">
            ${hintsHtml || '<li>紧扣本卦主旨与时位转换，从身心体验与现实选择切入。</li>'}
          </ul>
        </div>

        <div class="yj-review-grid" style="grid-template-columns: 1fr;">
          ${reviewItemsHtml}
        </div>

        <!-- 正文原生玄微先生四维易道深度点评卡片 -->
        <div class="yj-review-analysis-card" id="bottomRevAnalysisCard" style="display:${hasAnalysis ? 'flex' : 'none'};">
          <div class="yj-analysis-header">
            <div class="yj-analysis-title">
              <span>☯️</span>
              <span>玄微先生 · 易道学术多维深度比对诊断</span>
            </div>
            <span id="bottomRevAnalysisTime" style="font-size:12px; color:var(--text-faint);">${rev.ai_analysis && rev.ai_analysis.updated_at ? '剖析于 ' + rev.ai_analysis.updated_at : ''}</span>
          </div>
          <div class="yj-analysis-body" id="bottomRevAnalysisContent">${(rev.ai_analysis && rev.ai_analysis.content ? (window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(rev.ai_analysis.content) : rev.ai_analysis.content.replace(/\n/g, '<br>')) : '')}</div>
          <div class="yj-analysis-actions">
            <button class="yj-tool-btn" onclick="copyBottomAnalysisContent()">📋 复制点评</button>
            <button class="yj-tool-btn" style="color:var(--gold); border-color:var(--gold);" onclick="openCoachFromReview()">💬 转向玄微助教深入对话</button>
          </div>
        </div>
      </section>

      <section class="yj-stage-card" id="stage4Card">
        <div class="yj-stage-header">
          <div class="yj-stage-info">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span class="yj-stage-tag" style="background:var(--purple-light, rgba(168,85,247,0.18)); color:var(--purple, #a855f7); margin-bottom:0;">阶段四 · 费曼大白话精研输出</span>
              <span class="yj-difficulty-pill ${cfg.badgeClass}">${cfg.levelLabel}</span>
            </div>
            <h2>📝 《${cur.title}》费曼通关自述与生活转译</h2>
            <p>费曼学习法核心：用最通俗易懂的大白话、生动的生活比喻，讲给完全不懂易经的外行听。能讲透，才算真懂！</p>
          </div>
          <div class="yj-stage-actions">
            <button class="yj-btn-outline" onclick="openVaultModal('feynman')" style="padding:6px 14px; font-size:13px;">📜 展开修学档案</button>
            <button class="yj-btn-outline" onclick="requestBottomMasterAgentReview()" style="padding:6px 14px; font-size:13px; border-color:var(--purple, #a855f7); color:var(--purple, #a855f7); font-weight:700;">✨ 提请玄微先生 · 费曼剖析</button>
            <button class="yj-btn-gold" onclick="saveBottomFeynman()" style="padding:6px 16px; font-size:13px;">🏆 提交保存费曼笔记</button>
          </div>
        </div>

        <div class="yj-feynman-scenario">
          <div style="font-weight:800; font-size:14px; margin-bottom:4px; display:flex; align-items:center; gap:6px;">
            <span>🎯 费曼任务目标：</span>
            <span style="color:var(--gold);">${escapeHtml(cfg.scenarioTitle)}</span>
          </div>
          <div style="font-size:13px; color:var(--text-sub); line-height:1.6;">
            ${escapeHtml(cfg.scenarioPrompt)}
          </div>
        </div>

        <div style="margin: 14px 0 8px 0; font-size:13px; font-weight:700; color:var(--text-sub);">
          💡 费曼通俗自述脚手架（点击即可填入参考引导模板）：
        </div>
        <div class="yj-feynman-scaffolds">
          ${scaffoldsHtml}
        </div>

        <div style="margin-top:14px; display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:14px; font-weight:800; color:var(--text-m); display:flex; justify-content:space-between; align-items:center;">
            <span>🗣️ 你的 3 分钟费曼大白话自述全稿：</span>
            <span style="font-size:12px; font-weight:400; color:var(--text-faint);">用生活比喻向外行朋友讲透本课精髓</span>
          </label>
          <textarea id="feyFullText" class="mentor-textarea" rows="5" placeholder="假想你的外行朋友正坐在你对面，试着用生活大白话讲给他听：\n比如：“你知道吗？《${cur.title}》其实讲的是……”">${escapeHtml(fey.full_text || '')}</textarea>
        </div>
      </section>
    `;

    readerContent.appendChild(wrap);

    // 绑定自适应多行输入
    questions.forEach((_, idx) => {
      setupAutoResizeTextarea(`revQ_${idx}`, null, 120);
    });
    setupAutoResizeTextarea('feyFullText', null, 200);
  };

  window.saveBottomReview = function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const cfg = getLessonAdaptiveConfig(cur.id, cur);
    const bank = window.YijingInquiryBank && window.YijingInquiryBank[cur.id] ? window.YijingInquiryBank[cur.id] : [];
    const questions = bank.slice(0, cfg.reviewCount);
    if (questions.length === 0) {
      for (let i = 0; i < cfg.reviewCount; i++) {
        questions.push(`《${cur.title}》实战悟道要义 ${i + 1}`);
      }
    }

    const items = [];
    for (let i = 0; i < questions.length; i++) {
      const el = document.getElementById(`revQ_${i}`);
      items.push({
        question: questions[i],
        answer: el ? el.value.trim() : ''
      });
    }

    const payload = {
      items: items,
      q1_mirror: items[0] ? items[0].answer : '',
      q2_mindset: items[1] ? items[1].answer : '',
      q3_action: items[2] ? items[2].answer : '',
    };

    window.LearningVault.saveReview(cur.id, payload, cur);

    // 同步给弹窗中的输入框（如有）
    const v1 = document.getElementById('vRevQ1');
    const v2 = document.getElementById('vRevQ2');
    const v3 = document.getElementById('vRevQ3');
    if (v1 && items[0]) v1.value = items[0].answer;
    if (v2 && items[1]) v2.value = items[1].answer;
    if (v3 && items[2]) v3.value = items[2].answer;

    alert(`✅ 《${cur.title}》本章专属悟道复盘已成功归档并自动落盘！`);
  };

  window.saveBottomFeynman = function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const full_text = (document.getElementById('feyFullText') ? document.getElementById('feyFullText').value : '').trim();

    // 依然保留旧 framework 数据避免丢失
    const record = window.LearningVault.getGuaRecord(cur.id, cur);
    const prevFw = (record.feynman && record.feynman.framework) ? record.feynman.framework : {};

    window.LearningVault.saveFeynman(cur.id, {
      framework: prevFw,
      full_text: full_text
    }, cur);

    // 同步给弹窗
    const ff = document.getElementById('vFeyFullText');
    if (ff) ff.value = full_text;

    alert(`🎉 《${cur.title}》费曼通关笔记已持久归档并自动落盘！`);
  };

  // 正文原生卡片：提请玄微先生深度学术剖析
  window.requestBottomMasterAgentReview = async function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;

    const cfg = getLessonAdaptiveConfig(cur.id, cur);
    const bank = window.YijingInquiryBank && window.YijingInquiryBank[cur.id] ? window.YijingInquiryBank[cur.id] : [];
    const questions = bank.slice(0, cfg.reviewCount);

    const items = [];
    for (let i = 0; i < Math.max(questions.length, cfg.reviewCount); i++) {
      const el = document.getElementById(`revQ_${i}`);
      const val = el ? el.value.trim() : '';
      if (val) {
        items.push({
          question: questions[i] || `反思探问 ${i + 1}`,
          answer: val
        });
      }
    }

    const full_text = (document.getElementById('feyFullText') ? document.getElementById('feyFullText').value : '').trim();

    if (items.length === 0 && !full_text) {
      alert('请先写下至少一条复盘反思或费曼大白话自述，玄微先生方能为您点穴辨正！');
      return;
    }

    const card = document.getElementById('bottomRevAnalysisCard');
    const body = document.getElementById('bottomRevAnalysisContent');
    const timeEl = document.getElementById('bottomRevAnalysisTime');

    if (card && body) {
      card.style.display = 'flex';
      body.classList.add('yj-typing-cursor');
      body.innerHTML = '正在调取当前卦象全息经传原典与四大宗师阐微，玄微先生易道推演剖析中...';
      if (timeEl) timeEl.innerText = '正在生成点评...';
      card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    const reviewData = {
      items: items,
      q1_mirror: items[0] ? items[0].answer : '',
      q2_mindset: items[1] ? items[1].answer : '',
      q3_action: items[2] ? items[2].answer : ''
    };
    const feynmanData = {
      full_text: full_text
    };

    if (window.YijingAIService) {
      try {
        await window.YijingAIService.analyzeReviewAndFeynman({
          lessonMeta: cur,
          reviewData,
          feynmanData,
          onContent: (chunk, fullContent) => {
            if (body) {
              body.innerHTML = window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(fullContent) : fullContent.replace(/\n/g, '<br>');
            }
          },
          onDone: ({ content }) => {
            if (body) {
              body.classList.remove('yj-typing-cursor');
              body.innerHTML = window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(content) : content.replace(/\n/g, '<br>');
            }
            const nowTime = new Date().toLocaleString();
            if (timeEl) timeEl.innerText = `剖析于 ${nowTime}`;

            // 保存到档案与磁盘
            window.LearningVault.saveReviewAnalysis(cur.id, content, cur);
            window.LearningVault.appendDialogue(
              cur.id,
              `【提请复盘深度剖析】研习《${cur.title}》专属反思与费曼自述`,
              content,
              cur
            );
            // 同步模态框显示
            const vBody = document.getElementById('vRevAnalysisContent');
            const vTime = document.getElementById('vRevAnalysisTime');
            const vCard = document.getElementById('vRevAnalysisCard');
            if (vBody && vCard) {
              vCard.style.display = 'flex';
              vBody.innerHTML = window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(content) : content.replace(/\n/g, '<br>');
              if (vTime) vTime.innerText = `剖析于 ${nowTime}`;
            }
          },
          onError: (err) => {
            if (body) {
              body.classList.remove('yj-typing-cursor');
              body.innerHTML = `<span style="color:var(--danger, #f85149);">⚠️ 宗师连线微恙，请检查网络或配置：${err.message || err}</span>`;
            }
          }
        });
      } catch (e) {
        if (body) body.classList.remove('yj-typing-cursor');
      }
    }
  };

  window.copyBottomAnalysisContent = function() {
    const body = document.getElementById('bottomRevAnalysisContent');
    if (!body || !body.innerText) return;
    navigator.clipboard.writeText(body.innerText).then(() => {
      alert('📋 玄微先生深度点评已复制到剪贴板！');
    }).catch(() => {
      alert('复制失败，请手动划选复制。');
    });
  };

  // 输入框自适应高度与键盘发送监听 (完美支持删除文字精准回缩、粘贴撑开、单行还原、超限滚动)
  function setupAutoResizeTextarea(textareaId, submitFn, maxHeight = 120) {
    const el = typeof textareaId === 'string' ? document.getElementById(textareaId) : textareaId;
    if (!el) return;

    const doResize = () => {
      if (typeof window.adjustTextareaHeight === 'function') {
        window.adjustTextareaHeight(el, maxHeight);
      }
    };

    // 监听所有文本变化（输入、退格删除、剪切、粘贴、组合键），确保删除文字时高度实时平滑回缩！
    ['input', 'change', 'keyup', 'cut', 'paste'].forEach(evt => {
      el.addEventListener(evt, doResize);
    });

    if (typeof submitFn === 'function') {
      el.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          submitFn();
        }
      });
    }

    // 初始执行一次
    doResize();
  }

  // 监听本地项目自动落盘状态
  if (window.LearningVault && window.LearningVault.addSyncListener) {
    window.LearningVault.addSyncListener((state) => {
      const footerStatus = document.getElementById('vaultFooterStatus');
      const footerBadge = document.getElementById('vaultSyncBadge');
      if (footerStatus) {
        if (state.online) {
          footerStatus.innerHTML = `<span style="color:#10b981; font-weight:700;">🟢 本地项目数据自动落盘中</span> <span style="font-size:12px; color:var(--text-sub);">(已实时落盘至 data/learning_vault/ · ${state.time})</span>`;
        } else {
          footerStatus.innerHTML = `<span style="color:var(--gold); font-weight:600;">🟡 浏览器离线持久化中</span> <span style="font-size:12px; color:var(--text-sub);">(终端执行 ./start_vault.sh 开启项目自动落盘)</span>`;
        }
      }
      if (footerBadge) {
        footerBadge.innerHTML = state.online ? '🟢 磁盘在线' : '🟡 离线模式';
        footerBadge.style.color = state.online ? '#10b981' : 'var(--gold)';
        footerBadge.style.borderColor = state.online ? '#10b981' : 'var(--border)';
      }
    });
  }

  window.testVaultSync = async function() {
    if (!window.LearningVault) return;
    const online = await window.LearningVault.checkServerStatus();
    if (online) {
      alert(`🟢 本地项目数据落盘服务已连接！\n服务地址: ${window.location.origin}\n落盘目录: data/learning_vault/\n任何问答、笔记、复盘、费曼与宗师点评均会自动静默落盘写入！`);
    } else {
      alert('🟡 本地落盘守护服务未启动。\n当前数据安全保存在您的浏览器本地存储中。\n若需自动写入项目磁盘，请在终端执行:\n./start_vault.sh');
    }
  };

  setTimeout(() => {
    window.renderInlineThinkPrompts();
    window.renderBottomAssistantStages();
    setupAutoResizeTextarea('coachInput', () => window.submitCoachQuestion(), 120);
    setupAutoResizeTextarea('vaultQuickQInput', () => window.submitVaultQuickQuestion(), 120);

    // 针对底部发问按钮增加双重事件绑定保障与阻止冒泡
    const sendBtn = document.getElementById('coachSendBtn');
    if (sendBtn) {
      sendBtn.onclick = function(e) {
        e.preventDefault();
        e.stopPropagation();
        window.submitCoachQuestion();
      };
    }
  }, 400);

  // ==========================================================================
  // 阶段四：个人决策心智算法图谱 (Mind Map / Decision Algorithm Network)
  // ==========================================================================

  let currentMindMapFilter = 'all';
  let activeMindMapGuaId = 'lesson-01_乾为天';

  const mindMapModalHtml = `
  <div class="yj-mindmap-overlay" id="yjMindMapOverlay" onclick="if(event.target===this) closeMindMapModal()">
    <div class="yj-mindmap-modal">
      <div class="yj-mindmap-header">
        <div class="yj-mindmap-title">
          <span>🧠</span>
          <span>易道六十四卦 · 个人决策心智算法图谱</span>
          <span style="font-size:11.5px; padding:2px 8px; border-radius:10px; background:rgba(212,163,89,0.15); color:var(--gold); font-weight:600;">全息心智网络</span>
        </div>
        <div class="yj-mindmap-stats-bar" id="mindMapStatsBar">
          <!-- 动态注入统计 -->
        </div>
        <div style="display:flex; gap:10px; align-items:center;">
          <button class="yj-btn-gold" onclick="exportMasterCompendiumMarkdown()" style="padding:5px 14px; font-size:12.5px;">📥 导出手册(.md)</button>
          <button class="yj-btn-outline" onclick="openMasterCompendiumPrintView()" style="padding:5px 14px; font-size:12.5px; border-color:var(--gold); color:var(--gold);">🖨️ 典藏排版打印/PDF</button>
          <button class="yj-btn-outline" onclick="closeMindMapModal()" style="padding:5px 12px; font-size:12.5px;">✕ 关闭</button>
        </div>
      </div>

      <div class="yj-mindmap-toolbar">
        <div class="yj-mindmap-tabs">
          <button class="yj-mindmap-tab active" id="tabMapAll" onclick="filterMindMap('all')">🌌 64卦文王时序网络</button>
          <button class="yj-mindmap-tab" id="tabMapTrigrams" onclick="filterMindMap('trigrams')">🧭 八大原力算法分类</button>
          <button class="yj-mindmap-tab" id="tabMapCompleted" onclick="filterMindMap('completed')">🏆 个人已通关算法</button>
        </div>
        <div style="font-size:12px; color:var(--text-faint);">点击任意卦象卡片，查看专属决策原型、个人自述与玄微箴言</div>
      </div>

      <div class="yj-mindmap-body">
        <div class="yj-mindmap-grid-wrap">
          <div class="yj-mindmap-grid" id="mindMapGrid">
            <!-- 动态渲染 64 卦卡片 -->
          </div>
        </div>

        <div class="yj-mindmap-drawer" id="mindMapDetailDrawer">
          <!-- 动态渲染选中卦详情 -->
        </div>
      </div>

      <div class="yj-mindmap-footer">
        <div style="font-size:12.5px; color:var(--text-sub);">
          💡 易道心智法则：64 卦即 64 套动态决策算法。反身而诚、费曼讲透，方能化经为用。
        </div>
        <div style="display:flex; gap:10px;">
          <button class="yj-tool-btn" onclick="openVaultModal('feynman')">📜 打开本课修学档案</button>
          <button class="yj-tool-btn" style="color:var(--gold); border-color:var(--gold);" onclick="openMasterCompendiumPrintView()">📖 查看完整认知手册全集 ➔</button>
        </div>
      </div>
    </div>
  </div>
  `;

  // 挂载到 body
  const mapContainer = document.createElement('div');
  mapContainer.innerHTML = mindMapModalHtml;
  document.body.appendChild(mapContainer);

  window.openMindMapModal = function() {
    const overlay = document.getElementById('yjMindMapOverlay');
    if (overlay) overlay.classList.add('open');
    const cur = getCurrentLesson();
    if (cur) activeMindMapGuaId = cur.id;
    renderMindMapStats();
    renderMindMapCards();
    renderMindMapDetail(activeMindMapGuaId);
  };

  window.closeMindMapModal = function() {
    const overlay = document.getElementById('yjMindMapOverlay');
    if (overlay) overlay.classList.remove('open');
  };

  window.filterMindMap = function(mode) {
    currentMindMapFilter = mode;
    ['tabMapAll', 'tabMapTrigrams', 'tabMapCompleted'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });
    if (mode === 'all') document.getElementById('tabMapAll')?.classList.add('active');
    if (mode === 'trigrams') document.getElementById('tabMapTrigrams')?.classList.add('active');
    if (mode === 'completed') document.getElementById('tabMapCompleted')?.classList.add('active');
    renderMindMapCards();
  };

  function renderMindMapStats() {
    const statsBar = document.getElementById('mindMapStatsBar');
    if (!statsBar || !window.LearningVault) return;
    const all = window.LearningVault.getAllRecords();
    const lessons = getFullLessonsList();
    const total = lessons.length;
    let completedCount = 0;
    let feynmanCount = 0;
    let notesCount = 0;
    let analysisCount = 0;

    lessons.forEach(l => {
      const r = all[l.id];
      if (r) {
        if (r.feynman && (r.feynman.full_text || (r.feynman.framework && r.feynman.framework.core_trend))) feynmanCount++;
        if (r.notes && r.notes.length > 0) notesCount += r.notes.length;
        if (r.review && r.review.ai_analysis && r.review.ai_analysis.content) analysisCount++;
        if (r.review && (r.review.items?.length > 0 || r.review.q1_mirror)) completedCount++;
      }
    });

    statsBar.innerHTML = `
      <div class="yj-stat-item">研学进度: <strong>${completedCount}/${total}</strong> 课</div>
      <div class="yj-stat-item">费曼通关: <strong>${feynmanCount}</strong> 卦</div>
      <div class="yj-stat-item">修学微笔记: <strong>${notesCount}</strong> 篇</div>
      <div class="yj-stat-item">宗师点穴: <strong>${analysisCount}</strong> 卦</div>
    `;
  }

  function renderMindMapCards() {
    const grid = document.getElementById('mindMapGrid');
    if (!grid || !window.LearningVault) return;
    const all = window.LearningVault.getAllRecords();
    const lessons = getFullLessonsList();

    let list = lessons;
    if (currentMindMapFilter === 'completed') {
      list = lessons.filter(l => {
        const r = all[l.id];
        return r && (r.feynman?.full_text || r.review?.items?.length > 0 || r.notes?.length > 0);
      });
    }

    grid.innerHTML = list.map(l => {
      const r = all[l.id] || {};
      const hasFeynman = !!(r.feynman && (r.feynman.full_text || r.feynman.framework?.core_trend));
      const hasReview = !!(r.review && (r.review.items?.length > 0 || r.review.q1_mirror));
      const hasNotes = !!(r.notes && r.notes.length > 0);
      const hasAnalysis = !!(r.review && r.review.ai_analysis?.content);

      const isActive = l.id === activeMindMapGuaId;
      const meta = (window.YijingNaturalSystem && window.YijingNaturalSystem.GUA_NATURE_MAP) ? window.YijingNaturalSystem.GUA_NATURE_MAP[l.id] : null;

      return `
        <div class="yj-map-card ${isActive ? 'active' : ''}" onclick="selectMindMapGua('${l.id}')">
          <div class="yj-map-card-symbol">${l.symbol || '☯️'}</div>
          <div class="yj-map-card-title">${escapeHtml(l.navTitle || l.title.split(' ')[2] || l.title)}</div>
          <div class="yj-map-card-motto">${escapeHtml((meta && meta.natureScene) ? meta.natureScene.split('·')[0] : (l.tag || '时位演化'))}</div>
          <div class="yj-map-card-badges">
            ${hasFeynman ? '<span class="yj-map-pill feynman">费曼</span>' : ''}
            ${hasNotes ? '<span class="yj-map-pill note">笔记</span>' : ''}
            ${hasAnalysis ? '<span class="yj-map-pill analysis">点穴</span>' : ''}
            ${(!hasFeynman && !hasNotes && !hasReview) ? '<span class="yj-map-pill" style="opacity:0.4;">待研</span>' : ''}
          </div>
        </div>
      `;
    }).join('');
  }

  window.selectMindMapGua = function(guaId) {
    activeMindMapGuaId = guaId;
    renderMindMapCards();
    renderMindMapDetail(guaId);
  };
  window.openMindMapAlgorithmDetail = window.selectMindMapGua;

  function renderMindMapDetail(guaId) {
    const drawer = document.getElementById('mindMapDetailDrawer');
    if (!drawer || !window.LearningVault) return;
    const meta = getGuaMetaById(guaId);
    const rec = window.LearningVault.getGuaRecord(guaId, meta);
    const nat = (window.YijingNaturalSystem && window.YijingNaturalSystem.GUA_NATURE_MAP) ? window.YijingNaturalSystem.GUA_NATURE_MAP[guaId] : null;
    const cfg = getLessonAdaptiveConfig(guaId, meta);

    const fey = rec.feynman || {};
    const rev = rec.review || {};
    const notes = rec.notes || [];

    drawer.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; border-bottom:1px dashed var(--border-light); padding-bottom:12px;">
        <span style="font-size:32px; color:var(--gold);">${meta.symbol || '☯️'}</span>
        <div>
          <div style="font-size:15px; font-weight:800; color:var(--gold);">${escapeHtml(meta.title)}</div>
          <div style="font-size:12px; color:var(--text-sub);">${escapeHtml(nat ? nat.natureScene : (cfg.levelLabel || '决策心智模型'))}</div>
        </div>
      </div>

      <div>
        <div style="font-size:12.5px; font-weight:700; color:var(--gold); margin-bottom:4px;">🏛️ 大象传决策法则：</div>
        <div style="font-size:13px; color:var(--text-m); line-height:1.6; background:rgba(212,163,89,0.06); padding:8px 12px; border-radius:6px; border-left:3px solid var(--gold);">
          ${escapeHtml(nat && nat.daxiangQuote ? nat.daxiangQuote : (meta.motto || '自强不息，厚德载物'))}
        </div>
      </div>

      <div>
        <div style="font-size:12.5px; font-weight:700; color:var(--purple, #a855f7); margin-bottom:4px;">🗣️ 我的费曼大白话决策自述：</div>
        <div style="font-size:13px; color:var(--text-m); line-height:1.6; max-height:120px; overflow-y:auto; background:var(--bg); padding:8px 12px; border-radius:6px; border:1px solid var(--border-light);">
          ${escapeHtml(fey.full_text || '（尚未写下大白话费曼自述，能讲给外行听才算真懂）')}
        </div>
      </div>

      ${rev.ai_analysis && rev.ai_analysis.content ? `
      <div>
        <div style="font-size:12.5px; font-weight:700; color:var(--gold); margin-bottom:4px;">☯️ 玄微先生多维深度诊断：</div>
        <div style="font-size:12.5px; color:var(--text-m); line-height:1.6; max-height:140px; overflow-y:auto; background:var(--bg); padding:8px 12px; border-radius:6px; border:1px solid var(--border-light);">
          ${formatMasterAnalysisHtml(rev.ai_analysis.content)}
        </div>
      </div>` : ''}

      <div style="margin-top:auto; display:flex; gap:8px; padding-top:10px;">
        <button class="yj-btn-gold" style="flex:1; padding:8px 10px; font-size:13px;" onclick="closeMindMapModal(); loadLessonById('${guaId}');">📖 跳转研读本课</button>
        <button class="yj-btn-outline" style="flex:1; padding:8px 10px; font-size:13px;" onclick="closeMindMapModal(); activeVaultGuaId='${guaId}'; openVaultModal('feynman');">📜 查看修学档案</button>
      </div>
    `;
  }

  // 根据 lessonId 找到并跳转加载课时
  window.loadLessonById = function(lessonId) {
    const lessons = getFullLessonsList();
    const idx = lessons.findIndex(l => l.id === lessonId);
    if (idx !== -1 && typeof window.loadLesson === 'function') {
      window.loadLesson(idx);
    }
  };

  // ==========================================================================
  // 阶段四：汇编导出《我的周易认知手册》(典藏版 Markdown & 打印排版 HTML)
  // ==========================================================================

  // 1. 生成完整典藏版 Markdown
  window.exportMasterCompendiumMarkdown = function() {
    if (!window.LearningVault) return;
    const all = window.LearningVault.getAllRecords();
    const lessons = getFullLessonsList();
    const nowStr = new Date().toLocaleString();

    let md = `# ☯️ 《我的周易认知手册 · 个人决策算法修学全集》\n\n`;
    md += `> **修学者**：易道自修精进学者  \n`;
    md += `> **汇编归档时间**：${nowStr}  \n`;
    md += `> **知识库版本**：易道认知工坊 v3.0 · 六十四卦全息心智算法典藏版  \n\n`;
    md += `---\n\n`;

    md += `## 📜 前言 · 东方决策心智模型总纲\n\n`;
    md += `《周易》绝非求神问卜之巫书，而是东方先民历经数千年仰观俯察、观物取象所建立的“非线性复杂动态决策系统”。\n`;
    md += `六十四卦，即是人类生命中面临的六十四种时势情境与决策算法。\n`;
    md += `本手册由修学者在日常自研中，依托四大宗师原典，逐卦反身而诚悟道复盘、以费曼大白话生活转译、并由主 Agent 玄微先生点穴辨正汇编而成。\n\n`;
    md += `---\n\n`;

    md += `## 📚 六十四卦个人修学研习实录\n\n`;

    lessons.forEach((l, idx) => {
      const rec = all[l.id] || {};
      const nat = (window.YijingNaturalSystem && window.YijingNaturalSystem.GUA_NATURE_MAP) ? window.YijingNaturalSystem.GUA_NATURE_MAP[l.id] : null;
      const fey = rec.feynman || {};
      const rev = rec.review || {};
      const notes = rec.notes || [];

      md += `### ${idx + 1}. ${l.symbol || '☯️'} 《${l.title}》\n\n`;
      if (nat) {
        md += `> **天地交感**：${nat.natureScene || '自然交感'}  \n`;
        md += `> **大象传法则**：${nat.daxiangQuote || l.motto || ''}  \n\n`;
      }

      // 费曼大白话
      md += `#### 🗣️ 费曼大白话处事锦囊（向外行讲透）：\n\n`;
      if (fey.full_text) {
        md += `${fey.full_text}\n\n`;
      } else {
        md += `*(本卦尚未提交费曼自述全稿)*\n\n`;
      }

      // 悟道复盘
      md += `#### 🧠 反身而诚 · 悟道复盘：\n\n`;
      if (rev.items && rev.items.length > 0) {
        rev.items.forEach((it, i) => {
          md += `${i + 1}. **${it.question}**：\n   ${it.answer || '（未作答）'}\n\n`;
        });
      } else if (rev.q1_mirror) {
        md += `1. **生命印证**：${rev.q1_mirror}\n2. **认知心法**：${rev.q2_mindset}\n3. **行动承诺**：${rev.q3_action}\n\n`;
      } else {
        md += `*(本卦尚未填写悟道反思)*\n\n`;
      }

      // 宗师点评
      if (rev.ai_analysis && rev.ai_analysis.content) {
        md += `#### ☯️ 玄微先生多维学术诊断 (${rev.ai_analysis.updated_at || '最近'})：\n\n`;
        md += `${rev.ai_analysis.content}\n\n`;
      }

      // 边读边思 · 师承评估
      const inlineAssess = rec.inline_assessments || {};
      if (Object.keys(inlineAssess).length > 0) {
        md += `#### 💡 边读边思 · 师承点穴与评估 (${Object.keys(inlineAssess).length} 题)：\n\n`;
        Object.keys(inlineAssess).forEach(k => {
          const item = inlineAssess[k];
          md += `**【${item.tag || '边读边思'}】**：${item.question}\n\n`;
          md += `> **学员作答**：${item.user_answer || '（未作答）'}\n\n`;
          md += `> **玄微先生师承评估**：\n> ${(item.teacher_assessment || '').replace(/\n/g, '\n> ')}\n\n`;
        });
      }

      // 随堂微笔记
      if (notes.length > 0) {
        md += `#### 📝 课时随堂微笔记 (${notes.length} 条)：\n\n`;
        notes.forEach(n => {
          md += `- **${n.title}** (${n.timestamp})：${n.content}\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `我的周易认知手册_个人决策算法修学全集_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
  };

  // 2. 打开典藏排版打印 / 导出 PDF 视图
  window.openMasterCompendiumPrintView = function() {
    if (!window.LearningVault) return;
    const all = window.LearningVault.getAllRecords();
    const lessons = getFullLessonsList();
    const nowStr = new Date().toLocaleDateString();

    let compendiumHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <title>我的周易认知手册 · 个人决策算法修学全集</title>
  <style>
    :root {
      --ink: #1a1612;
      --paper: #fcfbf9;
      --gold: #b88636;
      --border: #e6dfd5;
      --cinnabar: #a62b2b;
    }
    body {
      margin: 0;
      padding: 0;
      background: var(--paper);
      color: var(--ink);
      font-family: "Songti SC", "SimSun", "Noto Serif SC", "STSong", serif;
      line-height: 1.8;
      font-size: 15px;
    }
    .print-toolbar {
      position: sticky;
      top: 0;
      background: #222;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 1000;
      box-shadow: 0 2px 10px rgba(0,0,0,0.3);
      font-family: -apple-system, sans-serif;
    }
    .print-btn {
      background: #d4a359;
      color: #1a1612;
      border: none;
      padding: 6px 16px;
      font-weight: 700;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
    }
    .book-container {
      max-width: 860px;
      margin: 40px auto;
      padding: 60px 80px;
      background: #fff;
      box-shadow: 0 4px 30px rgba(0,0,0,0.06);
      border: 1px solid var(--border);
    }
    .cover-page {
      text-align: center;
      padding: 100px 0;
      border-bottom: 2px solid var(--border);
      page-break-after: always;
    }
    .cover-symbol {
      font-size: 80px;
      color: var(--gold);
      margin-bottom: 20px;
    }
    .cover-title {
      font-size: 34px;
      font-weight: 900;
      letter-spacing: 2px;
      color: var(--ink);
      margin-bottom: 12px;
    }
    .cover-subtitle {
      font-size: 18px;
      color: #666;
      margin-bottom: 50px;
    }
    .seal-box {
      display: inline-block;
      border: 3px solid var(--cinnabar);
      color: var(--cinnabar);
      padding: 8px 16px;
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 4px;
      border-radius: 4px;
      margin-top: 40px;
    }
    .lesson-section {
      margin-top: 50px;
      padding-top: 30px;
      border-top: 1px dashed var(--border);
      page-break-inside: avoid;
    }
    .lesson-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .lesson-sym {
      font-size: 36px;
      color: var(--gold);
    }
    .lesson-tit {
      font-size: 20px;
      font-weight: 800;
      color: var(--ink);
    }
    .daxiang-box {
      background: #faf8f5;
      border-left: 4px solid var(--gold);
      padding: 10px 16px;
      font-style: italic;
      margin: 12px 0;
      color: #555;
    }
    .feynman-box {
      background: #fbf9fc;
      border-left: 4px solid #a855f7;
      padding: 12px 16px;
      margin: 12px 0;
    }
    .master-box {
      background: #fdfbf7;
      border: 1px solid #ebd9b8;
      border-radius: 8px;
      padding: 14px 18px;
      margin: 12px 0;
    }
    @media print {
      .print-toolbar { display: none !important; }
      body { background: #fff; }
      .book-container { box-shadow: none; border: none; padding: 0; margin: 0; max-width: 100%; }
      .cover-page { padding: 180px 0; }
      .lesson-section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="print-toolbar">
    <div>📚 <strong>《我的周易认知手册》典藏版预览</strong> · 建议选择“另存为 PDF”以获得最佳典藏效果</div>
    <div style="display:flex; gap:10px;">
      <button class="print-btn" onclick="window.print()">🖨️ 打印 / 另存为 PDF</button>
      <button class="print-btn" style="background:#555; color:#fff;" onclick="window.close()">✕ 关闭</button>
    </div>
  </div>

  <div class="book-container">
    <div class="cover-page">
      <div class="cover-symbol">☯️</div>
      <div class="cover-title">我的周易认知手册</div>
      <div class="cover-subtitle">东方决策心智模型 · 个人修学实录与费曼大白话全集</div>
      <div style="font-size:14px; color:#888;">研学归档时间：${nowStr} · 易道认知工坊</div>
      <div class="seal-box">知行合一</div>
    </div>

    <h2>前言 · 东方决策心智算法总纲</h2>
    <p>《周易》是东方最早对非线性动态系统建立的全息数学模型。本手册由修学者依循“反身而诚”与“费曼讲透”之精髓，逐卦沉淀人生与事业决策算法，汇聚成个人专属的认知底牌。</p>

    ${lessons.map((l, idx) => {
      const rec = all[l.id] || {};
      const nat = (window.YijingNaturalSystem && window.YijingNaturalSystem.GUA_NATURE_MAP) ? window.YijingNaturalSystem.GUA_NATURE_MAP[l.id] : null;
      const fey = rec.feynman || {};
      const rev = rec.review || {};

      return `
      <div class="lesson-section">
        <div class="lesson-header">
          <span class="lesson-sym">${l.symbol || '☯️'}</span>
          <span class="lesson-tit">第 ${idx + 1} 卷 · 《${escapeHtml(l.title)}》</span>
        </div>
        <div class="daxiang-box">
          🏛️ <strong>大象传处事法则</strong>：${escapeHtml(nat ? nat.daxiangQuote : (l.motto || ''))}
        </div>
        <div class="feynman-box">
          🗣️ <strong>费曼通俗自述全稿</strong>：<br>
          ${escapeHtml(fey.full_text || '（暂未记录费曼自述）')}
        </div>
        ${rev.ai_analysis && rev.ai_analysis.content ? `
        <div class="master-box">
          ☯️ <strong>玄微先生多维学术诊断</strong>：<br>
          ${escapeHtml(rev.ai_analysis.content).replace(/\n/g, '<br>')}
        </div>` : ''}
        ${(rec.inline_assessments && Object.keys(rec.inline_assessments).length > 0) ? `
        <div style="background:#f6f9f6; border-left:4px solid #2ea043; padding:12px 16px; margin:12px 0;">
          💡 <strong>边读边思 · 师承点穴与评估实录</strong>：<br>
          ${Object.keys(rec.inline_assessments).map(k => {
            const item = rec.inline_assessments[k];
            return `<div style="margin-top:8px; padding-top:6px; border-top:1px dashed #d0d7de;">
              <strong>【${escapeHtml(item.tag || '边读边思')}】</strong>：${escapeHtml(item.question)}<br>
              <span style="color:#555;">学员作答</span>：${escapeHtml(item.user_answer)}<br>
              <div style="margin-top:4px; color:#1a1612; background:#fff; padding:6px 10px; border-radius:4px; border:1px solid #e1e4e8;">
                ${escapeHtml(item.teacher_assessment).replace(/\n/g, '<br>')}
              </div>
            </div>`;
          }).join('')}
        </div>` : ''}
      </div>
      `;
    }).join('')}
  </div>
</body>
</html>`;

    const printWin = window.open('', '_blank');
    if (printWin) {
      printWin.document.open();
      printWin.document.write(compendiumHtml);
      printWin.document.close();
    } else {
      alert('请允许浏览器弹出窗口以查看典藏打印预览。');
    }
  };

})();
