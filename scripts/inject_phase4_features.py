#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
scripts/inject_phase4_features.py
阶段四·子任务B与C：注入【个人决策心智算法图谱】与【《我的周易认知手册》(典藏版) 一键汇编导出】
"""

import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSISTANT_JS = os.path.join(BASE_DIR, 'yijing_assistant.js')
ASSISTANT_CSS = os.path.join(BASE_DIR, 'yijing_assistant.css')

# 1. 准备要注入的 JS 代码
PHASE4_JS_CODE = r"""
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
"""

# 2. 准备要注入的 CSS 代码
PHASE4_CSS_CODE = r"""
/* ==========================================================================
   阶段四：个人决策心智算法图谱 & 典藏认知手册视觉样式
   ========================================================================== */
.yj-mindmap-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(10, 12, 16, 0.85);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: none;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.yj-mindmap-overlay.open {
  display: flex;
}
.yj-mindmap-modal {
  width: 95vw;
  max-width: 1220px;
  height: 90vh;
  background: var(--bg, #0d1117);
  border: 1px solid var(--gold, #d4a359);
  border-radius: 16px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.yj-mindmap-header {
  padding: 16px 24px;
  background: var(--card, #161b22);
  border-bottom: 1px solid var(--border, #30363d);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.yj-mindmap-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16.5px;
  font-weight: 800;
  color: var(--gold, #d4a359);
}
.yj-mindmap-stats-bar {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  font-size: 13px;
  color: var(--text-sub, #8b949e);
}
.yj-stat-item {
  display: flex;
  align-items: center;
  gap: 5px;
}
.yj-stat-item strong {
  color: var(--gold, #d4a359);
  font-size: 14.5px;
}
.yj-mindmap-toolbar {
  padding: 10px 24px;
  background: var(--bg-alt, #0f131a);
  border-bottom: 1px solid var(--border-light, #21262d);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
.yj-mindmap-tabs {
  display: flex;
  gap: 8px;
}
.yj-mindmap-tab {
  padding: 6px 14px;
  font-size: 13px;
  border-radius: 6px;
  border: 1px solid var(--border, #30363d);
  background: var(--card, #161b22);
  color: var(--text-sub, #8b949e);
  cursor: pointer;
  transition: all 0.2s ease;
}
.yj-mindmap-tab.active {
  background: var(--gold, #d4a359);
  color: #1a1612;
  font-weight: 700;
  border-color: var(--gold, #d4a359);
}
.yj-mindmap-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}
.yj-mindmap-grid-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}
.yj-mindmap-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 12px;
}
.yj-map-card {
  background: var(--card, #161b22);
  border: 1px solid var(--border, #30363d);
  border-radius: 10px;
  padding: 12px 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.yj-map-card:hover {
  transform: translateY(-2px);
  border-color: var(--gold, #d4a359);
  box-shadow: 0 4px 14px rgba(212, 163, 89, 0.18);
}
.yj-map-card.active {
  border-color: var(--gold, #d4a359);
  background: rgba(212, 163, 89, 0.12);
}
.yj-map-card-symbol {
  font-size: 26px;
  line-height: 1;
  color: var(--gold, #d4a359);
}
.yj-map-card-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text, #f0f6fc);
}
.yj-map-card-motto {
  font-size: 11px;
  color: var(--text-faint, #6e7681);
  line-height: 1.3;
}
.yj-map-card-badges {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}
.yj-map-pill {
  font-size: 9.5px;
  padding: 1px 5px;
  border-radius: 4px;
}
.yj-map-pill.feynman { background: rgba(168, 85, 247, 0.2); color: var(--purple, #a855f7); }
.yj-map-pill.note { background: rgba(88, 166, 255, 0.2); color: var(--blue, #58a6ff); }
.yj-map-pill.analysis { background: rgba(212, 163, 89, 0.2); color: var(--gold, #d4a359); }

.yj-mindmap-drawer {
  width: 380px;
  background: var(--card, #161b22);
  border-left: 1px solid var(--border, #30363d);
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.yj-mindmap-footer {
  padding: 12px 24px;
  background: var(--card, #161b22);
  border-top: 1px solid var(--border, #30363d);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}
"""

# 读取 JS
with open(ASSISTANT_JS, 'r', encoding='utf-8') as f:
    js = f.read()

# 检查是否已注入
if 'yjMindMapOverlay' not in js:
    # 找到文件末尾 IIFE 闭合前
    end_marker = "})();"
    idx = js.rfind(end_marker)
    if idx == -1:
        end_marker = "})(window);"
        idx = js.rfind(end_marker)
    if idx != -1:
        js = js[:idx] + PHASE4_JS_CODE + "\n" + js[idx:]
        with open(ASSISTANT_JS, 'w', encoding='utf-8') as f:
            f.write(js)
        print("Successfully injected Phase 4 JS code into yijing_assistant.js!")
    else:
        print("Error: Could not locate IIFE end marker in yijing_assistant.js")
else:
    print("Phase 4 JS code already present in yijing_assistant.js.")

# 读取 CSS
with open(ASSISTANT_CSS, 'r', encoding='utf-8') as f:
    css = f.read()

if 'yj-mindmap-overlay' not in css:
    css += "\n" + PHASE4_CSS_CODE + "\n"
    with open(ASSISTANT_CSS, 'w', encoding='utf-8') as f:
        f.write(css)
    print("Successfully injected Phase 4 CSS code into yijing_assistant.css!")
else:
    print("Phase 4 CSS code already present in yijing_assistant.css.")

print("Phase 4 injection script executed.")
