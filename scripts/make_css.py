# -*- coding: utf-8 -*-
"""
生成整个自用学习平台代码的核心脚本
"""
import os
import json

base_dir = r"c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001"

# 1. 编写 lesson.css
css_content = """/* 易道认知工坊 - 现代美学样式表 */
:root, [data-theme="dark"] {
  --bg: #0d1117;
  --side: #161b22;
  --card: #1c2128;
  --card-hover: #22272e;
  --border: rgba(255, 255, 255, 0.12);
  --border-light: rgba(255, 255, 255, 0.06);
  --text-m: #f0f6fc;
  --text-sub: #8b949e;
  --text-faint: #6e7681;
  --accent: #2ea043;
  --accent-light: rgba(46, 160, 67, 0.15);
  --gold: #d29922;
  --gold-light: rgba(210, 153, 34, 0.15);
  --blue: #58a6ff;
  --blue-light: rgba(88, 166, 255, 0.15);
  --purple: #bc8cff;
  --purple-light: rgba(188, 140, 255, 0.15);
  --danger: #f85149;
  --radius: 12px;
  --radius-sm: 8px;
  --shadow: 0 8px 24px rgba(0,0,0,0.3);
}

[data-theme="light"] {
  --bg: #f6f8fa;
  --side: #ffffff;
  --card: #ffffff;
  --card-hover: #f3f4f6;
  --border: rgba(0, 0, 0, 0.1);
  --border-light: rgba(0, 0, 0, 0.05);
  --text-m: #1f2328;
  --text-sub: #59636e;
  --text-faint: #8c959f;
  --accent: #1a7f37;
  --accent-light: rgba(26, 127, 55, 0.1);
  --gold: #9a6700;
  --gold-light: rgba(154, 103, 0, 0.1);
  --blue: #0969da;
  --blue-light: rgba(9, 105, 218, 0.1);
  --purple: #8250df;
  --purple-light: rgba(130, 80, 223, 0.1);
  --danger: #cf222e;
  --shadow: 0 4px 16px rgba(0,0,0,0.06);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text-m);
  line-height: 1.6;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 顶栏 */
.topbar {
  height: 56px;
  background: var(--side);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  flex-shrink: 0;
  z-index: 100;
}
.brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 17px; }
.brand-badge {
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 99px;
  letter-spacing: 0.5px;
}
.top-actions { display: flex; align-items: center; gap: 12px; }
.route-selector, .btn-action {
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text-m);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
}
.route-selector:hover, .btn-action:hover { border-color: var(--accent); }

/* 主工作区布局 */
.main-wrapper {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;
}

/* 左侧栏 */
.sidebar {
  width: 320px;
  background: var(--side);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}
.sidebar-search {
  padding: 12px 14px;
  border-bottom: 1px solid var(--border-light);
}
.sidebar-search input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 8px 12px;
  color: var(--text-m);
  font-size: 13px;
  outline: none;
}
.progress-box {
  padding: 10px 14px;
  background: var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: var(--text-sub);
}
.progress-bar-bg {
  width: 120px;
  height: 6px;
  background: var(--border);
  border-radius: 99px;
  overflow: hidden;
}
.progress-bar-fill {
  height: 100%;
  background: var(--accent);
  width: 0%;
  transition: width 0.3s;
}

.course-tree {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}
.part-group { margin-bottom: 14px; }
.part-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--text-faint);
  text-transform: uppercase;
  padding: 6px 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topic-group { margin-bottom: 6px; }
.topic-title {
  font-size: 13px;
  font-weight: 600;
  padding: 5px 8px;
  color: var(--text-sub);
}
.lesson-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  font-size: 13px;
  color: var(--text-m);
  cursor: pointer;
  text-decoration: none;
  margin-bottom: 2px;
  transition: all 0.15s;
}
.lesson-item:hover { background: var(--card-hover); }
.lesson-item.active { background: var(--accent-light); color: var(--accent); font-weight: 600; }
.lesson-item .status-icon { font-size: 12px; color: var(--text-faint); }
.lesson-item.done .status-icon { color: var(--accent); }
.lesson-tag {
  font-size: 11px;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--border);
  color: var(--text-sub);
  margin-left: auto;
}

/* 右侧研习主视窗 */
.reader-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background: var(--bg);
}
.reader-content {
  flex: 1;
  overflow-y: auto;
  padding: 28px 40px;
  max-width: 960px;
  margin: 0 auto;
  width: 100%;
}

/* 卦象标题与元数据头条 */
.lesson-header {
  margin-bottom: 28px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border);
}
.header-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.gua-symbol-badge {
  font-size: 32px;
  line-height: 1;
  background: var(--card);
  border: 1px solid var(--border);
  padding: 4px 10px;
  border-radius: var(--radius-sm);
  color: var(--gold);
}
.header-meta h1 { font-size: 26px; font-weight: 800; color: var(--text-m); }
.header-meta .motto { font-size: 14px; color: var(--text-sub); margin-top: 4px; }
.header-tags { display: flex; gap: 8px; margin-top: 10px; }
.pill-tag {
  font-size: 12px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 99px;
  background: var(--blue-light);
  color: var(--blue);
}

/* 四步研习法卡片样式 */
.step-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px 28px;
  margin-bottom: 22px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
}
.step-section::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
}
.step-see::before { background: var(--blue); }
.step-think::before { background: var(--purple); }
.step-scene::before { background: var(--gold); }
.step-teach::before { background: var(--accent); }

.step-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}
.step-badge {
  font-size: 12px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
}
.step-see .step-badge { background: var(--blue-light); color: var(--blue); }
.step-think .step-badge { background: var(--purple-light); color: var(--purple); }
.step-scene .step-badge { background: var(--gold-light); color: var(--gold); }
.step-teach .step-badge { background: var(--accent-light); color: var(--accent); }

.step-title { font-size: 18px; font-weight: 700; color: var(--text-m); }

.step-body { font-size: 15px; color: var(--text-m); line-height: 1.8; }
.step-body p { margin-bottom: 12px; }
.step-body ul { padding-left: 20px; margin-bottom: 12px; }
.step-body li { margin-bottom: 6px; }

/* 爻象可视化交互柱 */
.yao-visual-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 8px;
  margin: 16px 0;
  padding: 16px;
  background: var(--border-light);
  border-radius: var(--radius-sm);
}
.yao-bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}
.yao-stripe {
  width: 100%;
  height: 10px;
  border-radius: 3px;
}
.yao-yang { background: var(--gold); }
.yao-yin {
  background: transparent;
  display: flex;
  gap: 4px;
}
.yao-yin-half { background: var(--blue); flex: 1; height: 10px; border-radius: 3px; }

/* 场景对比卡片 */
.scene-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-top: 14px; }
.scene-card {
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 16px;
}
.scene-card h4 { font-size: 15px; font-weight: 700; margin-bottom: 8px; color: var(--gold); }
.scene-card p { font-size: 13.5px; color: var(--text-sub); line-height: 1.7; }

/* 费曼挑战框 */
.feynman-box {
  background: var(--accent-light);
  border: 1px dashed var(--accent);
  border-radius: var(--radius-sm);
  padding: 16px 20px;
  margin-top: 14px;
}
.feynman-box h4 { color: var(--accent); font-size: 15px; font-weight: 700; margin-bottom: 8px; }
.feynman-formula {
  background: var(--card);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  font-weight: 700;
  font-size: 14px;
  color: var(--text-m);
  margin-bottom: 10px;
}
.feynman-expand-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}

/* 底部操作与翻页栏 */
.footbar {
  height: 64px;
  background: var(--side);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  flex-shrink: 0;
}
.foot-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text-m);
  padding: 10px 20px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.foot-btn:hover { border-color: var(--accent); }
.foot-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }
.foot-btn.primary:hover { opacity: 0.9; }

@media (max-width: 800px) {
  .sidebar { position: absolute; left: 0; top: 0; bottom: 0; z-index: 200; transform: translateX(-100%); }
  .sidebar.open { transform: translateX(0); }
  .reader-content { padding: 20px; }
  .scene-cards { grid-template-columns: 1fr; }
}
"""

with open(os.path.join(base_dir, "lesson.css"), "w", encoding="utf-8") as f:
    f.write(css_content)

print("lesson.css generated successfully.")
