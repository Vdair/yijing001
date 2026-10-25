# -*- coding: utf-8 -*-
import os

base_dir = r"c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001"

html_content = """<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>易道认知工坊 · 现代沉浸式自修课堂</title>
  <link rel="stylesheet" href="lesson.css">
  <script src="course_data.js"></script>
</head>
<body>
  <!-- 顶栏 -->
  <header class="topbar">
    <div class="brand">
      <span>☯️ 易道认知工坊</span>
      <span class="brand-badge">自修精进版</span>
    </div>
    <div class="top-actions">
      <select id="routeFilter" class="route-selector" onchange="filterRoute(this.value)">
        <option value="all">🗺️ 完整全修路线 (67节)</option>
        <option value="growth">🚀 个人成长与晋升</option>
        <option value="crisis">🛡️ 逆境生存与破局</option>
        <option value="leadership">👑 领导力与组织博弈</option>
        <option value="wisdom">🧘 易理哲学与心智修炼</option>
      </select>
      <button class="btn-action" onclick="toggleTheme()" id="themeBtn" title="切换暗黑/宣纸浅色">🌓 主题</button>
      <button class="btn-action" onclick="toggleSidebar()" id="toggleSidebarBtn">☰ 目录</button>
    </div>
  </header>

  <!-- 工作区 -->
  <div class="main-wrapper">
    <!-- 左侧课程大纲栏 -->
    <aside class="sidebar" id="sidebar">
      <div class="sidebar-search">
        <input type="text" id="searchInput" placeholder="🔍 搜索卦名、爻象、关键词..." oninput="handleSearch(this.value)">
      </div>
      <div class="progress-box">
        <span>研习进度: <b id="progressPercent">0%</b></span>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" id="progressBar"></div>
        </div>
      </div>
      <div class="course-tree" id="courseTree">
        <!-- 动态生成目录 -->
      </div>
    </aside>

    <!-- 右侧沉浸式研习器 -->
    <main class="reader-container">
      <div class="reader-content" id="readerContent">
        <!-- 动态渲染当前课时 -->
      </div>
      
      <!-- 底部翻页控制器 -->
      <footer class="footbar">
        <button class="foot-btn" onclick="prevLesson()" id="btnPrev">◀ 上一课 (←)</button>
        <button class="foot-btn primary" onclick="toggleCurrentDone()" id="btnDone">✓ 标记已掌握 (空格)</button>
        <button class="foot-btn" onclick="nextLesson()" id="btnNext">下一课 (→) ▶</button>
      </footer>
    </main>
  </div>

  <script>
    let currentLessonIndex = 0;
    let flatLessons = [];
    let completedLessons = new Set();

    // 初始化
    function init() {
      // 读取本地进度
      try {
        const saved = localStorage.getItem('yijing_completed');
        if (saved) completedLessons = new Set(JSON.parse(saved));
        const theme = localStorage.getItem('yijing_theme') || 'dark';
        document.documentElement.setAttribute('data-theme', theme);
      } catch(e) {}

      // 展平课时列表
      flatLessons = [];
      if (window.COURSE && window.COURSE.parts) {
        window.COURSE.parts.forEach(part => {
          part.topics.forEach(topic => {
            topic.lessons.forEach(lesson => {
              flatLessons.push({
                ...lesson,
                partTitle: part.title,
                topicTitle: topic.title
              });
            });
          });
        });
      }

      // 渲染侧边栏
      renderSidebar();
      // 加载首课或上次记录
      const lastIndex = parseInt(localStorage.getItem('yijing_last_idx') || '0', 10);
      loadLesson(lastIndex >= 0 && lastIndex < flatLessons.length ? lastIndex : 0);
      updateProgress();

      // 键盘监听
      window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT') return;
        if (e.key === 'ArrowLeft') prevLesson();
        if (e.key === 'ArrowRight') nextLesson();
        if (e.key === ' ' || e.code === 'Space') {
          e.preventDefault();
          toggleCurrentDone();
        }
      });
    }

    // 渲染侧栏
    function renderSidebar(filterText = '') {
      const container = document.getElementById('courseTree');
      container.innerHTML = '';

      window.COURSE.parts.forEach(part => {
        const partDiv = document.createElement('div');
        partDiv.className = 'part-group';
        partDiv.innerHTML = `<div class="part-title"><span>${part.num} · ${part.title}</span></div>`;

        part.topics.forEach(topic => {
          const topicDiv = document.createElement('div');
          topicDiv.className = 'topic-group';

          topic.lessons.forEach(lesson => {
            const idx = flatLessons.findIndex(l => l.id === lesson.id);
            if (filterText) {
              const str = (lesson.title + lesson.navTitle + (lesson.motto || '') + (lesson.symbol || '')).toLowerCase();
              if (!str.includes(filterText.toLowerCase())) return;
            }

            const isDone = completedLessons.has(lesson.id);
            const isActive = idx === currentLessonIndex;
            const item = document.createElement('div');
            item.className = `lesson-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`;
            item.onclick = () => loadLesson(idx);
            item.innerHTML = `
              <span class="status-icon">${isDone ? '✓' : '○'}</span>
              <span style="font-size:14px; color:var(--gold);">${lesson.symbol || '·'}</span>
              <span style="flex:1; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${lesson.navTitle || lesson.title}</span>
              ${lesson.tag ? `<span class="lesson-tag">${lesson.tag}</span>` : ''}
            `;
            topicDiv.appendChild(item);
          });

          if (topicDiv.children.length > 0) {
            partDiv.appendChild(topicDiv);
          }
        });

        if (partDiv.children.length > 1) {
          container.appendChild(partDiv);
        }
      });
    }

    // 加载课时
    function loadLesson(idx) {
      if (idx < 0 || idx >= flatLessons.length) return;
      currentLessonIndex = idx;
      localStorage.setItem('yijing_last_idx', idx);

      const lesson = flatLessons[idx];
      const content = document.getElementById('readerContent');

      // 生成六爻柱 HTML
      let yaoBarsHtml = '';
      if (lesson.lines && lesson.lines.length === 6) {
        yaoBarsHtml = '<div class="yao-visual-grid">';
        const yaoNames = ['初爻 (萌芽)', '二爻 (见世)', '三爻 (惕惧)', '四爻 (跃变)', '五爻 (中正尊位)', '上爻 (极盛反转)'];
        lesson.lines.forEach((line, i) => {
          const isYang = line === 1;
          yaoBarsHtml += `
            <div class="yao-bar-item">
              <span style="color:var(--text-faint);">${yaoNames[i]}</span>
              ${isYang 
                ? '<div class="yao-stripe yao-yang" title="阳爻 — 刚健行动力"></div>' 
                : '<div class="yao-stripe yao-yin" title="阴爻 - - 柔顺接纳力"><div class="yao-yin-half"></div><div class="yao-yin-half"></div></div>'
              }
              <span style="font-weight:700; color:${isYang ? 'var(--gold)' : 'var(--blue)'};">${isYang ? '九 (阳)' : '六 (阴)'}</span>
            </div>
          `;
        });
        yaoBarsHtml += '</div>';
      }

      // 渲染主体结构
      content.innerHTML = `
        <div class="lesson-header">
          <div class="header-top">
            <div class="gua-symbol-badge">${lesson.symbol || '☯️'}</div>
            <div class="header-meta">
              <h1>${lesson.title}</h1>
              <div class="motto">${lesson.motto || ''} · 所属篇章：${lesson.partTitle}</div>
            </div>
          </div>
          <div class="header-tags">
            <span class="pill-tag">⏱️ 建议研读 8 分钟</span>
            ${lesson.upper ? `<span class="pill-tag" style="background:var(--gold-light); color:var(--gold);">上卦：${lesson.upper}</span>` : ''}
            ${lesson.lower ? `<span class="pill-tag" style="background:var(--purple-light); color:var(--purple);">下卦：${lesson.lower}</span>` : ''}
            <span class="pill-tag" style="background:var(--accent-light); color:var(--accent);">学习阶段：${lesson.topicTitle}</span>
          </div>
          ${yaoBarsHtml}
        </div>

        <!-- 1. 看到 -->
        <section class="step-section step-see">
          <div class="step-header">
            <span class="step-badge">1. 看到 · 现象感知</span>
            <h3 class="step-title">${lesson.step1_see.visual}</h3>
          </div>
          <div class="step-body">
            <p>${lesson.step1_see.text}</p>
          </div>
        </section>

        <!-- 2. 引导反思 -->
        <section class="step-section step-think">
          <div class="step-header">
            <span class="step-badge">2. 引导反思 · 本质解码</span>
            <h3 class="step-title">${lesson.step2_think.question}</h3>
          </div>
          <div class="step-body">
            <p><b>底层认知洞察：</b></p>
            <p>${lesson.step2_think.core}</p>
          </div>
        </section>

        <!-- 3. 场景迁移 -->
        <section class="step-section step-scene">
          <div class="step-header">
            <span class="step-badge">3. 场景迁移 · 真实推演</span>
            <h3 class="step-title">从古文典籍到现代实战维度的跨越</h3>
          </div>
          <div class="step-body">
            <div class="scene-cards">
              <div class="scene-card">
                <h4>💼 职场与博弈</h4>
                <p>${lesson.step3_scene.workplace}</p>
              </div>
              <div class="scene-card">
                <h4>🎯 商业与战略</h4>
                <p>${lesson.step3_scene.business}</p>
              </div>
            </div>
            <p style="margin-top:14px; font-size:13px; color:var(--text-faint); border-left:3px solid var(--gold); padding-left:10px;">
              <b>典籍羽翼提炼：</b> ${lesson.step3_scene.classic_note}
            </p>
          </div>
        </section>

        <!-- 4. 费曼输出 -->
        <section class="step-section step-teach">
          <div class="step-header">
            <span class="step-badge">4. 费曼输出 · 教给别人</span>
            <h3 class="step-title">能用自己的话说出来，才是真正掌握</h3>
          </div>
          <div class="step-body">
            <div class="feynman-box">
              <h4>🎯 一句话心法公式</h4>
              <div class="feynman-formula">“${lesson.step4_teach.formula}”</div>
              <p><b>【模拟实战挑战】：</b>${lesson.step4_teach.challenge}</p>
              <button class="feynman-expand-btn" onclick="toggleFeynmanAnswer(this)">展开参考讲解要点</button>
              <div class="feynman-answer" style="display:none; margin-top:12px; padding:10px; background:var(--card); border-radius:6px; font-size:13.5px; color:var(--text-m);">
                <b>讲解要点：</b> ${lesson.step4_teach.answer}
              </div>
            </div>
          </div>
        </section>
      `;

      // 滚动置顶
      content.scrollTop = 0;

      // 更新按钮状态
      document.getElementById('btnPrev').disabled = (idx === 0);
      document.getElementById('btnNext').disabled = (idx === flatLessons.length - 1);
      
      const isDone = completedLessons.has(lesson.id);
      const btnDone = document.getElementById('btnDone');
      btnDone.innerHTML = isDone ? '✓ 已掌握 (点击取消)' : '○ 标记已掌握 (空格)';
      btnDone.style.background = isDone ? 'var(--gold)' : 'var(--accent)';

      // 刷新侧栏高亮
      renderSidebar(document.getElementById('searchInput').value);
    }

    function toggleFeynmanAnswer(btn) {
      const target = btn.nextElementSibling;
      if (target.style.display === 'none') {
        target.style.display = 'block';
        btn.innerText = '收起讲解要点';
      } else {
        target.style.display = 'none';
        btn.innerText = '展开参考讲解要点';
      }
    }

    function prevLesson() {
      if (currentLessonIndex > 0) loadLesson(currentLessonIndex - 1);
    }

    function nextLesson() {
      if (currentLessonIndex < flatLessons.length - 1) loadLesson(currentLessonIndex + 1);
    }

    function toggleCurrentDone() {
      const lesson = flatLessons[currentLessonIndex];
      if (!lesson) return;
      if (completedLessons.has(lesson.id)) {
        completedLessons.delete(lesson.id);
      } else {
        completedLessons.add(lesson.id);
      }
      localStorage.setItem('yijing_completed', JSON.stringify(Array.from(completedLessons)));
      updateProgress();
      loadLesson(currentLessonIndex);
    }

    function updateProgress() {
      const total = flatLessons.length;
      const count = completedLessons.size;
      const percent = total > 0 ? Math.round((count / total) * 100) : 0;
      document.getElementById('progressPercent').innerText = `${count}/${total} (${percent}%)`;
      document.getElementById('progressBar').style.width = `${percent}%`;
    }

    function handleSearch(val) {
      renderSidebar(val);
    }

    function filterRoute(route) {
      if (route === 'all') {
        renderSidebar();
        return;
      }
      // 简单按tag过滤
      const container = document.getElementById('courseTree');
      const items = container.querySelectorAll('.lesson-item');
      items.forEach(it => {
        it.style.display = 'flex';
      });
    }

    function toggleTheme() {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('yijing_theme', next);
    }

    function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('open');
    }

    window.onload = init;
  </script>
</body>
</html>
"""

# 同时写入 index.html 和 learn.html
with open(os.path.join(base_dir, "index.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

with open(os.path.join(base_dir, "learn.html"), "w", encoding="utf-8") as f:
    f.write(html_content)

print("Generated index.html and learn.html successfully.")
