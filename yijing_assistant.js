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
                <span>玄微先生 · 易道学术四维深度点评</span>
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
        analysisBody.innerHTML = rev.ai_analysis.content.replace(/\n/g, '<br>');
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
              body.innerHTML = fullContent.replace(/\n/g, '<br>');
            }
          },
          onDone: ({ content }) => {
            if (body) body.classList.remove('yj-typing-cursor');
            const nowTime = new Date().toLocaleString();
            if (timeEl) timeEl.innerText = `剖析于 ${nowTime}`;

            // 保存到档案
            window.LearningVault.saveReviewAnalysis(activeVaultGuaId, content, meta);
            // 同时在对话流记录一条互动
            window.LearningVault.appendDialogue(
              activeVaultGuaId,
              `【提请复盘深度剖析】研习《${meta.title}》反身而诚悟道心得`,
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
          const mock = `【玄微先生·易道学术四维点评】：\n1. 🧭【时位契合度】：学员能感知当前时势之动静，唯需谨记顺境当以守正为本。\n2. ⚡【反常识穿透】：已初具阴阳互根之眼界。\n3. 🛡️【知行闭环】：践诺微动作甚善，防微杜渐，必得亨通。\n4. 📜【知行箴言】：知进退存亡而不失其正者，其唯君子乎！`;
          body.innerHTML = mock.replace(/\n/g, '<br>');
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

  // 难易度自适应评估模型：根据课时类型与深浅自适应问题数量与费曼情境
  function getLessonAdaptiveConfig(lessonId, lesson) {
    if (!lessonId) lessonId = '';
    // Level 1: 认知底座与入门导读课 (p0-01 ~ p0-04)
    if (lessonId.startsWith('p0-') || lessonId.startsWith('intro-')) {
      return {
        level: 1,
        levelLabel: '认知筑基 · 启蒙级',
        badgeClass: 'level-1',
        reviewCount: 2, // 2 道精炼核心复盘题，门槛友好
        inlineCount: 1, // 正文中穿插 1 道互动探问
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

    // Level 3: 深度辩证与复杂交变卦
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

    // Level 2: 经典标杆卦象（如乾、坤、谦、泰、否等 64 卦）
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

  // 第一阶段正文穿插【边读边思 · 驻足小探问】精研题库
  const INLINE_THINK_BANK = {
    'p0-01': [
      {
        sectionKeyword: '三才',
        tag: '三才模型 · 边读边思',
        question: '读到“三才之道（初爻为地，中爻为人，上爻为天）”，停下来想一想：在你当前负责的一项重要工作或个人目标中，属于客观不可动的“地道（现实基础）”和时代大势的“天道”分别是什么？身处中间的你，当前最该在哪一点发力？',
        hint: '💡 玄微先生点穴启发：地道是看得见摸得着的资源配称、现金流或底层交付能力；天道是不可逆的行业周期、监管与用户心理演化。人在其中，既不能脱离地皮起高楼，也不能妄图逆天而行。人道的发力点在于“顺天应人”，在客观约束中做出最高胜率的行为抉择。'
      }
    ],
    'p0-02': [
      {
        sectionKeyword: '全息四维',
        tag: '全息视界 · 边读边思',
        question: '“错卦看底线，综卦换立场，互卦察暗流”。面对当前与你有利益分歧的一位合作方或竞争对手，如果把他的视界头脚颠倒 180 度（综卦视角），他眼中最焦虑的风险是什么？',
        hint: '💡 玄微先生点穴启发：常人习惯执着于自己的主观得失（本卦），但高手总能在谈判桌前瞬间切换到综卦视角。对手的激烈防御往往源于他背后的脆弱或被动，看穿他的综卦，破局的真正筹码才会浮现。'
      }
    ],
    'p0-03': [
      {
        sectionKeyword: '时位',
        tag: '时位辩证 · 边读边思',
        question: '“吉凶悔吝生乎动，得中远胜于得位”。回顾最近的一次纠结或决策，你是在执着于“我的名分、面子或职务权力（得位）”，还是顺应了事情当前最平衡中正的客观节奏（得中）？',
        hint: '💡 玄微先生点穴启发：得位常关乎外在虚名与权力，而得中关乎内在时机的把握与分寸感。位不当而能守中，往往能逢凶化吉；居尊位而失中，最易滋生骄狂亢坠之险。'
      }
    ],
    'p0-04': [
      {
        sectionKeyword: '十翼',
        tag: '经传破迷 · 边读边思',
        question: '程颐重义理（天理时势），朱熹重象占（直觉意象）。在做重大商业或人生选择时，你更倾向于纯逻辑推理，还是整体直觉感应？两者如何借由易道融通？',
        hint: '💡 玄微先生点穴启发：现代认知科学证明，最高阶的决策往往是“理与象”的协同：用逻辑排除坏选项，用意象感知整体涌现。体用一源，显微无间。'
      }
    ],
    'lesson-01_乾为天': [
      {
        sectionKeyword: '小象传',
        tag: '时位攻防 · 边读边思',
        question: '从初九“潜龙勿用”到九二“见龙在田”、九三“夕惕若厉”，人往往在取得初步成效时最易滋生浮躁。回想你的经历，哪次在“见”之后急于求成而遭遇了波折？',
        hint: '💡 玄微先生点穴启发：二爻见龙初试锋芒，最容易让人误以为天下我有。但三爻处于重卦交界，内卦之极，危机四伏。“终日乾乾，夕惕若厉”不是懦弱，而是为了在暴风雨来临前深筑护城河。'
      },
      {
        sectionKeyword: '亢龙有悔',
        tag: '亢满之防 · 边读边思',
        question: '“亢龙有悔，穷之灾也”。为什么纯阳刚健行至最高处，反而潜藏着最大危机？身处业务高光期或管理高位时，当如何主动“分权让利”以避其亢？',
        hint: '💡 玄微先生点穴启发：纯阳无阴则孤阳不生。飞龙在天依赖群龙相助，一旦高居绝顶而失去基层呼应，便是亢龙。明智者在巅峰主动退一步、让出聚光灯、培育后辈，方能“保合太和，乃利贞”。'
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

    // 寻找正文中插入锚点
    const sections = readerContent.querySelectorAll('.step-header, .sub-sec-title, .step-section, h3, blockquote');
    questions.forEach((qItem, qIdx) => {
      let anchor = null;
      if (qItem.sectionKeyword) {
        for (let el of sections) {
          if (el.textContent && el.textContent.includes(qItem.sectionKeyword)) {
            anchor = el;
            break;
          }
        }
      }
      if (!anchor && sections.length > qIdx + 1) {
        anchor = sections[Math.min(qIdx * 2 + 1, sections.length - 1)];
      }

      const card = document.createElement('div');
      card.className = 'yj-inline-think-card';
      const inputId = `inlineThinkInput_${cur.id}_${qIdx}`;
      const hintId = `inlineHintBox_${cur.id}_${qIdx}`;

      card.innerHTML = `
        <div class="yj-inline-think-header">
          <span class="yj-inline-think-tag">💡 ${qItem.tag || '易道顿悟小憩 · 边读边思'}</span>
          <span style="font-size:12px; color:var(--text-faint);">驻足自省 · 知行合一</span>
        </div>
        <div class="yj-inline-think-q">${qItem.question}</div>
        <textarea class="yj-inline-think-input" id="${inputId}" rows="2" placeholder="在此敲下你读到此处的顿悟、现实反思或当下困惑..."></textarea>
        <div class="yj-inline-think-actions">
          <button class="yj-btn-outline" style="font-size:12px; padding:5px 12px; border-color:var(--gold); color:var(--gold);" onclick="toggleHintDrawer('${hintId}')">☯️ 查看玄微先生点穴启发</button>
          <button class="yj-btn-gold" style="font-size:12px; padding:5px 14px;" onclick="saveInlineThinkNote('${escapeHtml(qItem.tag || '边读边思')}', '${inputId}', '${cur.id}')">📝 存入本课随堂微笔记</button>
        </div>
        <div class="yj-inline-hint-box" id="${hintId}">
          ${qItem.hint || '在易道研学中，每一次驻足反思都是一次认知跃迁。'}
        </div>
      `;

      if (anchor && anchor.parentNode) {
        anchor.parentNode.insertBefore(card, anchor.nextSibling);
      } else {
        readerContent.appendChild(card);
      }
    });
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
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span class="yj-stage-tag" style="background:var(--gold-light, rgba(212,163,89,0.18)); color:var(--gold, #d4a359); margin-bottom:0;">阶段三 · 悟道复盘</span>
              <span class="yj-difficulty-pill ${cfg.badgeClass}">${cfg.levelLabel}（精研 ${cfg.reviewCount} 问）</span>
            </div>
            <h2>🧠 《${cur.title}》本章专属反思与认知提炼</h2>
            <p>古圣人作易，“反身而诚”。以下针对本章核心卦义与时位拐点设计，回答问题将本课化为您脑海中的决策算法。</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
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
              <span>玄微先生 · 易道学术四维深度点评</span>
            </div>
            <span id="bottomRevAnalysisTime" style="font-size:12px; color:var(--text-faint);">${rev.ai_analysis && rev.ai_analysis.updated_at ? '剖析于 ' + rev.ai_analysis.updated_at : ''}</span>
          </div>
          <div class="yj-analysis-body" id="bottomRevAnalysisContent">${(rev.ai_analysis && rev.ai_analysis.content ? rev.ai_analysis.content : '').replace(/\n/g, '<br>')}</div>
          <div class="yj-analysis-actions">
            <button class="yj-tool-btn" onclick="copyBottomAnalysisContent()">📋 复制点评</button>
            <button class="yj-tool-btn" style="color:var(--gold); border-color:var(--gold);" onclick="openCoachFromReview()">💬 转向玄微助教深入对话</button>
          </div>
        </div>
      </section>

      <section class="yj-stage-card" id="stage4Card">
        <div class="yj-stage-header">
          <div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px; flex-wrap:wrap;">
              <span class="yj-stage-tag" style="background:var(--purple-light, rgba(168,85,247,0.18)); color:var(--purple, #a855f7); margin-bottom:0;">阶段四 · 费曼大白话精研输出</span>
              <span class="yj-difficulty-pill ${cfg.badgeClass}">${cfg.levelLabel}</span>
            </div>
            <h2>📝 《${cur.title}》费曼通关自述与生活转译</h2>
            <p>费曼学习法核心：用最通俗易懂的大白话、生动的生活比喻，讲给完全不懂易经的外行听。能讲透，才算真懂！</p>
          </div>
          <div style="display:flex; gap:10px; flex-wrap:wrap;">
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
              body.innerHTML = fullContent.replace(/\n/g, '<br>');
            }
          },
          onDone: ({ content }) => {
            if (body) body.classList.remove('yj-typing-cursor');
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
              vBody.innerHTML = content.replace(/\n/g, '<br>');
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
})();
