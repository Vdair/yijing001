/**
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

  // 3. 动态渲染正文底部的【阶段三·复盘】与【阶段四·费曼骨架】
  window.renderBottomStages = function() {
    const readerContent = document.getElementById('readerContent');
    if (!readerContent) return;

    // 避免重复挂载
    const old = document.getElementById('bottomStagesContainer');
    if (old) old.remove();

    const cur = getCurrentGua();
    if (!cur) return;

    const record = window.LearningVault ? window.LearningVault.getGuaRecord(cur.id) : { review: {}, feynman: { framework: {} } };
    const rev = record.review || {};
    const fey = record.feynman || { framework: {} };
    const fw = fey.framework || {};

    const bottomDiv = document.createElement('div');
    bottomDiv.id = 'bottomStagesContainer';
    bottomDiv.innerHTML = `
      <!-- 阶段三：悟道复盘 -->
      <section class="bottom-study-stage stage-review" id="stage3ReviewSection">
        <div class="stage-title-wrap">
          <div>
            <span class="stage-badge-large" style="background:var(--gold-light); color:var(--gold);">阶段三 · 悟道复盘</span>
            <h2>🧠 《${cur.title}》易道心智提炼与生命对齐</h2>
          </div>
          <button class="mentor-btn" onclick="saveBottomReview()">💾 保存复盘心得</button>
        </div>
        <p style="font-size:14px; color:var(--text-sub); line-height:1.7;">
          学易之道，“反身而诚”。读毕本卦经传与时位攻防，请回答以下三个苏格拉底式启发问题，将古老卦气转化为个人的认知算法。
        </p>

        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="mentor-input-group">
            <label style="font-size:14px; font-weight:800; color:var(--gold);">① 照镜子（生命印证）：回顾过往，你或身边哪次重大得失刚好踩准了本卦的顺逆节奏？</label>
            <textarea id="bottomRevQ1" class="mentor-textarea" rows="2" placeholder="在此写下切身印证的经历与反思...">${rev.q1 || ''}</textarea>
          </div>
          <div class="mentor-input-group">
            <label style="font-size:14px; font-weight:800; color:var(--gold);">② 炼心法（认知跃迁）：如果总结一条关于本卦最“反常识”的现代处事心智底牌，会是什么？</label>
            <textarea id="bottomRevQ2" class="mentor-textarea" rows="2" placeholder="提炼出属于你的一句话核心心法...">${rev.q2 || ''}</textarea>
          </div>
          <div class="mentor-input-group">
            <label style="font-size:14px; font-weight:800; color:var(--gold);">③ 知行合一（行动承诺）：在未来 7 天内，你将如何在某个具体的生活/工作微习惯中践行？</label>
            <textarea id="bottomRevQ3" class="mentor-textarea" rows="2" placeholder="写下可检验的具体行动动作...">${rev.q3 || ''}</textarea>
          </div>
        </div>
        <div id="bottomReviewTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${rev.updated_at ? `上次保存时间：${rev.updated_at}` : '尚未保存复盘'}
        </div>
      </section>

      <!-- 阶段四：费曼输出与通关骨架 -->
      <section class="bottom-study-stage stage-feynman" id="stage4FeynmanSection">
        <div class="stage-title-wrap">
          <div>
            <span class="stage-badge-large" style="background:var(--purple-light); color:var(--purple);">阶段四 · 费曼精研输出</span>
            <h2>📝 《${cur.title}》通关认知骨架与课后笔记</h2>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="mentor-btn outline" onclick="fillFrameworkTemplate()">⚡ 一键注入骨架模板</button>
            <button class="mentor-btn" onclick="saveBottomFeynman()">🏆 提交保存与评分</button>
          </div>
        </div>
        <p style="font-size:14px; color:var(--text-sub); line-height:1.7;">
          <b>真正学会这一卦，必须穿透以下四大底层认知维度</b>。按此结构详写您的课后笔记，系统将自动绑定并提供评分与归档：
        </p>

        <!-- 四维通关骨架输入格 -->
        <div class="feynman-framework-grid">
          <div class="framework-cell">
            <div class="framework-cell-title">📌 1. 卦象时势核心判据</div>
            <div class="framework-cell-desc">上下卦五行表征、当前所处大势（是龙困浅滩、日丽中天、还是险阻在前？）。</div>
            <textarea id="feyCoreTrend" class="framework-cell-input" placeholder="输入大势判断依据...">${fw.core_trend || ''}</textarea>
          </div>

          <div class="framework-cell">
            <div class="framework-cell-title">⚡ 2. 核心爻变拐点攻防</div>
            <div class="framework-cell-desc">哪一爻是吉凶转折关键枢纽？中正当位如何取舍？最凶险与最吉利之爻的攻防要诀。</div>
            <textarea id="feyKeyYao" class="framework-cell-input" placeholder="输入核心爻位转折攻防...">${fw.key_yao_turn || ''}</textarea>
          </div>

          <div class="framework-cell">
            <div class="framework-cell-title">🏢 3. 现实生活/商业案例映射</div>
            <div class="framework-cell-desc">将古老卦象映射到现代商业竞争、团队管理或人际博弈中的典型推演。</div>
            <textarea id="feyRealCase" class="framework-cell-input" placeholder="输入真实场景演练...">${fw.real_case || ''}</textarea>
          </div>

          <div class="framework-cell">
            <div class="framework-cell-title">🧘 4. 反常识易道心智底牌</div>
            <div class="framework-cell-desc">颠覆直觉常态的一条易理决策心法（如：亢龙有悔为何不凶？潜伏如何不沦为躺平？）。</div>
            <textarea id="feyAntiCommon" class="framework-cell-input" placeholder="输入反常识底牌...">${fw.anti_common_rule || ''}</textarea>
          </div>
        </div>

        <div class="mentor-input-group" style="margin-top:10px;">
          <label style="font-size:14px; font-weight:800; color:var(--text-m);">📜 综合费曼自述讲解全稿（大白话通俗输出）：</label>
          <textarea id="feyFullText" class="mentor-textarea" rows="4" placeholder="在此用大白话向一个没有学过易经的朋友，通俗讲透这一卦...">${fey.full_text || ''}</textarea>
        </div>

        <div id="bottomFeynmanTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${fey.updated_at ? `上次保存时间：${fey.updated_at}` : '尚未保存笔记'}
        </div>
      </section>
    `;

    readerContent.appendChild(bottomDiv);
  };

  window.saveBottomReview = function() {
    const cur = getCurrentGua();
    if (!cur) return;
    const q1 = document.getElementById('bottomRevQ1').value.trim();
    const q2 = document.getElementById('bottomRevQ2').value.trim();
    const q3 = document.getElementById('bottomRevQ3').value.trim();
    if (window.LearningVault) {
      window.LearningVault.saveReview(cur.id, { q1, q2, q3 });
      document.getElementById('bottomReviewTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
      alert(`✅ 《${cur.title}》悟道复盘已与本卦绑定保存！可在复习册中随时回溯。`);
    }
  };

  window.fillFrameworkTemplate = function() {
    const cur = getCurrentGua();
    if (!cur) return;
    document.getElementById('feyCoreTrend').value = `【时势判据】本卦由${cur.upper || '上卦'}与${cur.lower || '下卦'}相叠，处于事物演进的典型周期。`;
    document.getElementById('feyKeyYao').value = `【关键拐点】六爻之中以九五/六五居中得正，三爻多凶危，需格外防范转折风险。`;
    document.getElementById('feyRealCase').value = `【实战案例】映射于当前团队项目或个人晋升转型中，需把握进退火候。`;
    document.getElementById('feyAntiCommon').value = `【反常识心法】不求一时之烈，而求周流不居、动合于时。`;
  };

  window.saveBottomFeynman = function() {
    const cur = getCurrentGua();
    if (!cur) return;
    const core_trend = document.getElementById('feyCoreTrend').value.trim();
    const key_yao_turn = document.getElementById('feyKeyYao').value.trim();
    const real_case = document.getElementById('feyRealCase').value.trim();
    const anti_common_rule = document.getElementById('feyAntiCommon').value.trim();
    const full_text = document.getElementById('feyFullText').value.trim();

    if (window.LearningVault) {
      window.LearningVault.saveFeynman(cur.id, {
        framework: { core_trend, key_yao_turn, real_case, anti_common_rule },
        full_text: full_text
      });
      document.getElementById('bottomFeynmanTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
      alert(`🎉 《${cur.title}》费曼通关笔记已与本卦持久绑定！已计入您的专属修学档案。`);
    }
  };

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
