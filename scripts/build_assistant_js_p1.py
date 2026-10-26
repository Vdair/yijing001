# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.js')

part1 = r'''/**
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
  trigger.onclick = toggleAssistantPanel;
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
'''

with open(target, 'w', encoding='utf-8') as f:
    f.write(part1)

print("yijing_assistant.js Part 1 写入成功！")
