# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai_study_system.js')

# Part 1: 基础框架与划词气泡
part1 = r'''/**
 * 易道认知工坊 · 四阶分层自修系统
 * 阶段一&二：划词微气泡 + 伴读浮窗
 * 阶段三&四：底部沉浸式复盘 + 费曼四维通关骨架
 */
(function() {
  // 1. 创建划词气泡与伴读浮窗 DOM
  const popover = document.createElement('div');
  popover.className = 'inline-selection-popover';
  popover.id = 'inlineSelectionPopover';
  popover.innerHTML = '<span>☯️ 叩问此句义理</span>';
  document.body.appendChild(popover);

  const modalHtml = `
  <div class="stage12-modal" id="stage12Modal">
    <div class="stage12-header">
      <div>
        <span style="font-weight:800; font-size:16px;">☯️ 伴读问答 · 辨微求真</span>
        <div style="font-size:12px; color:var(--text-sub);" id="stage12GuaTitle">当前卦象</div>
      </div>
      <button class="icon-btn" onclick="closeStage12Modal()">✕</button>
    </div>
    <div class="stage12-body">
      <div id="selectionQuoteBox" class="selection-quote-box" style="display:none;"></div>
      <div id="stage12ChatList" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:12px;"></div>
      <div style="display:flex; flex-direction:column; gap:8px;">
        <textarea id="stage12Input" class="mentor-textarea" rows="2" placeholder="在此向导师深入叩问古文或现实解法..."></textarea>
        <button class="mentor-btn" onclick="submitStage12QA()">发送叩问 ➔</button>
      </div>
    </div>
  </div>
  `;
  const mDiv = document.createElement('div');
  mDiv.innerHTML = modalHtml;
  document.body.appendChild(mDiv);

  // 划词监听
  let selectedText = '';
  document.addEventListener('mouseup', function(e) {
    if (e.target.closest('#stage12Modal') || e.target.closest('#inlineSelectionPopover')) return;
    const sel = window.getSelection();
    const str = sel ? sel.toString().trim() : '';
    if (str && str.length >= 2) {
      selectedText = str;
      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      popover.style.left = (rect.left + rect.width / 2 + window.scrollX) + 'px';
      popover.style.top = (rect.top + window.scrollY) + 'px';
      popover.style.display = 'flex';
    } else {
      popover.style.display = 'none';
    }
  });

  popover.addEventListener('click', function() {
    popover.style.display = 'none';
    openStage12WithSelection(selectedText);
  });

  window.openStage12WithSelection = function(txt) {
    const modal = document.getElementById('stage12Modal');
    modal.classList.add('open');
    const quote = document.getElementById('selectionQuoteBox');
    if (txt) {
      quote.style.display = 'block';
      quote.innerHTML = `<b>【所选文段】：</b>“${txt}”`;
      document.getElementById('stage12Input').value = `请结合历代宗师义理与时位演进，深入解读此句：“${txt}”`;
    } else {
      quote.style.display = 'none';
    }
    renderStage12History();
  };

  window.closeStage12Modal = function() {
    document.getElementById('stage12Modal').classList.remove('open');
  };
'''

with open(target, 'w', encoding='utf-8') as f:
    f.write(part1)

print("Part 1 写入成功！")
