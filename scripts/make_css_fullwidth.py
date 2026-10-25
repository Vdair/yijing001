# -*- coding: utf-8 -*-
"""
优化 lesson.css：解除 960px 窄屏限制，铺满大屏，放大字体，优化现代教学排版呼吸感
"""
import os

base_dir = r"c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001"
css_path = os.path.join(base_dir, "lesson.css")

full_css = """/* 易道认知工坊 - 现代沉浸式宽屏自修课件样式表 (大字版·铺满视窗) */
:root, [data-theme="dark"] {
  --bg: #0b0f14;
  --side: #131820;
  --card: #18202c;
  --card-hover: #1f2a3a;
  --border: rgba(255, 255, 255, 0.12);
  --border-light: rgba(255, 255, 255, 0.07);
  --text-m: #f0f6fc;
  --text-sub: #9caab9;
  --text-faint: #6e7d8f;
  --accent: #2ea043;
  --accent-light: rgba(46, 160, 67, 0.16);
  --gold: #e3b341;
  --gold-light: rgba(227, 179, 65, 0.15);
  --blue: #58a6ff;
  --blue-light: rgba(88, 166, 255, 0.15);
  --purple: #bc8cff;
  --purple-light: rgba(188, 140, 255, 0.15);
  --danger: #f85149;
  --radius: 14px;
  --radius-sm: 8px;
  --shadow: 0 8px 28px rgba(0,0,0,0.35);
}

[data-theme="light"] {
  --bg: #f5f7fa;
  --side: #ffffff;
  --card: #ffffff;
  --card-hover: #f1f4f8;
  --border: rgba(0, 0, 0, 0.1);
  --border-light: rgba(0, 0, 0, 0.05);
  --text-m: #1b1f24;
  --text-sub: #4b5665;
  --text-faint: #768390;
  --accent: #1a7f37;
  --accent-light: rgba(26, 127, 55, 0.1);
  --gold: #b07d12;
  --gold-light: rgba(176, 125, 18, 0.12);
  --blue: #0969da;
  --blue-light: rgba(9, 105, 218, 0.1);
  --purple: #8250df;
  --purple-light: rgba(130, 80, 223, 0.1);
  --danger: #cf222e;
  --shadow: 0 4px 18px rgba(0,0,0,0.06);
}

* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  background: var(--bg);
  color: var(--text-m);
  line-height: 1.8;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  font-size: 16px; /* 提升基础字号 */
}

/* 顶栏 */
.topbar {
  height: 60px;
  background: var(--side);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  flex-shrink: 0;
  z-index: 100;
}
.brand { display: flex; align-items: center; gap: 12px; font-weight: 800; font-size: 19px; }
.brand-badge {
  background: var(--accent);
  color: #fff;
  font-size: 11.5px;
  padding: 3px 9px;
  border-radius: 99px;
  letter-spacing: 0.5px;
}
.top-actions { display: flex; align-items: center; gap: 14px; }
.route-selector, .btn-action {
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text-m);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
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
  width: 340px;
  background: var(--side);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.25s ease;
}
.sidebar-search {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-light);
}
.sidebar-search input {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 9px 14px;
  color: var(--text-m);
  font-size: 14px;
  outline: none;
}
.progress-box {
  padding: 12px 16px;
  background: var(--border-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 13px;
  color: var(--text-sub);
}
.progress-bar-bg {
  width: 140px;
  height: 7px;
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
  padding: 10px;
}
.part-group { margin-bottom: 16px; }
.part-title {
  font-size: 12.5px;
  font-weight: 800;
  color: var(--text-faint);
  text-transform: uppercase;
  padding: 6px 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.topic-group { margin-bottom: 8px; }
.lesson-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 12px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  color: var(--text-m);
  cursor: pointer;
  text-decoration: none;
  margin-bottom: 3px;
  transition: all 0.15s;
}
.lesson-item:hover { background: var(--card-hover); }
.lesson-item.active { background: var(--accent-light); color: var(--accent); font-weight: 700; }
.lesson-item .status-icon { font-size: 13px; color: var(--text-faint); }
.lesson-item.done .status-icon { color: var(--accent); }
.lesson-tag {
  font-size: 11px;
  padding: 2px 7px;
  border-radius: 4px;
  background: var(--border);
  color: var(--text-sub);
  margin-left: auto;
}

/* ── 右侧研习主视窗 (宽屏自适应，彻底消除中间过窄问题) ── */
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
  padding: 36px 50px;
  max-width: 1480px; /* 大幅扩宽，铺满大屏 */
  width: 100%;
  margin: 0 auto;
}

/* 卦象标题头 */
.lesson-header {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--border);
}
.header-top { display: flex; align-items: center; gap: 18px; margin-bottom: 16px; }
.gua-symbol-badge {
  font-size: 42px;
  line-height: 1;
  background: var(--card);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: var(--radius-sm);
  color: var(--gold);
  box-shadow: var(--shadow);
}
.header-meta h1 { font-size: 30px; font-weight: 800; color: var(--text-m); letter-spacing: -0.5px; }
.header-meta .motto { font-size: 16px; color: var(--text-sub); margin-top: 6px; }
.header-tags { display: flex; gap: 10px; margin-top: 14px; flex-wrap: wrap; }
.pill-tag {
  font-size: 13px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 99px;
  background: var(--blue-light);
  color: var(--blue);
}

/* ── 竖向六爻天梯 (自下而上) ── */
.yao-ladder-container {
  display: flex;
  gap: 32px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 24px;
  margin: 24px 0;
  box-shadow: var(--shadow);
}
.yao-ladder {
  display: flex;
  flex-direction: column-reverse; /* 自下而上 */
  gap: 10px;
  width: 260px;
  flex-shrink: 0;
  background: var(--bg);
  padding: 16px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}
.yao-ladder-rung {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--card);
  border: 1px solid var(--border-light);
}
.yao-ladder-rung:hover, .yao-ladder-rung.active {
  background: var(--accent-light);
  border-color: var(--accent);
  transform: translateX(6px);
}
.yao-pos-name {
  font-size: 13px;
  font-weight: 800;
  width: 60px;
  color: var(--text-sub);
}
.yao-graphic {
  flex: 1;
  height: 14px;
  border-radius: 3px;
  display: flex;
  align-items: center;
}
.yao-graphic.yang { background: var(--gold); }
.yao-graphic.yin { display: flex; gap: 6px; background: transparent; }
.yao-graphic.yin .yin-half { flex: 1; height: 14px; background: var(--blue); border-radius: 3px; }

.yao-ladder-intro {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 15.5px;
  color: var(--text-m);
  line-height: 1.85;
}
.yao-ladder-intro h4 {
  font-size: 18px;
  font-weight: 800;
  color: var(--gold);
  margin-bottom: 10px;
}

/* ── 课程通识卡片与分章结构 ── */
.step-section {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 30px 36px;
  margin-bottom: 28px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
}
.step-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}
.step-badge {
  font-size: 13px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 6px;
  letter-spacing: 0.5px;
}
.step-title { font-size: 22px; font-weight: 800; color: var(--text-m); }
.step-body { font-size: 16px; color: var(--text-m); line-height: 1.9; }
.step-body p { margin-bottom: 14px; }

/* ── 深度四维羽翼方块 ── */
.classic-wings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 18px;
  margin-bottom: 18px;
}
.wing-box {
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 16px 18px;
  font-size: 15px;
  line-height: 1.8;
}
.wing-box-title {
  font-size: 14px;
  font-weight: 800;
  color: var(--gold);
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ── 逐爻深度解构大卡片 ── */
.yao-deep-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 24px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: all 0.2s;
}
.yao-deep-card:hover {
  border-color: var(--gold);
}
.yao-deep-header {
  padding: 18px 26px;
  background: var(--border-light);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.yao-deep-title {
  display: flex;
  align-items: center;
  gap: 14px;
  font-size: 19px;
  font-weight: 800;
  color: var(--text-m);
}
.yao-pos-badge {
  background: var(--gold-light);
  color: var(--gold);
  padding: 3px 10px;
  border-radius: 6px;
  font-size: 13.5px;
  font-weight: 800;
}
.yao-stage-tag {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--text-sub);
  background: var(--bg);
  padding: 4px 12px;
  border-radius: 99px;
  border: 1px solid var(--border-light);
}
.yao-deep-body {
  padding: 26px;
}

/* 教学视角的现代解码与导师点睛 */
.mentor-spotlight {
  background: rgba(227, 179, 65, 0.08);
  border-left: 4px solid var(--gold);
  padding: 16px 20px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 16px 0;
  font-size: 15.5px;
  line-height: 1.85;
}
.modern-decode-box {
  background: rgba(46, 160, 67, 0.07);
  border-left: 4px solid var(--accent);
  padding: 16px 20px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin: 16px 0;
  font-size: 15.5px;
  line-height: 1.85;
}
.redline-warning {
  background: rgba(248, 81, 73, 0.09);
  border: 1px solid rgba(248, 81, 73, 0.25);
  border-radius: var(--radius-sm);
  padding: 14px 18px;
  color: var(--danger);
  font-size: 14.5px;
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

/* 场景对比卡片 */
.scene-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 18px; }
.scene-card {
  border: 1px solid var(--border);
  background: var(--bg);
  border-radius: var(--radius-sm);
  padding: 20px;
}
.scene-card h4 { font-size: 17px; font-weight: 800; margin-bottom: 10px; color: var(--gold); }
.scene-card p { font-size: 15px; color: var(--text-sub); line-height: 1.8; }

/* 费曼挑战框 */
.feynman-box {
  background: var(--accent-light);
  border: 1.5px dashed var(--accent);
  border-radius: var(--radius-sm);
  padding: 22px 26px;
  margin-top: 18px;
}
.feynman-box h4 { color: var(--accent); font-size: 18px; font-weight: 800; margin-bottom: 12px; }
.feynman-formula {
  background: var(--card);
  padding: 14px 18px;
  border-radius: var(--radius-sm);
  font-weight: 800;
  font-size: 16px;
  color: var(--text-m);
  margin-bottom: 14px;
}
.feynman-expand-btn {
  background: var(--accent);
  color: #fff;
  border: none;
  padding: 9px 18px;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 12px;
}

/* 底部操作与翻页栏 */
.footbar {
  height: 70px;
  background: var(--side);
  border-top: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 40px;
  flex-shrink: 0;
}
.foot-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  background: var(--card);
  border: 1px solid var(--border);
  color: var(--text-m);
  padding: 11px 24px;
  border-radius: var(--radius-sm);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.foot-btn:hover { border-color: var(--accent); }
.foot-btn.primary { background: var(--accent); color: #fff; border-color: var(--accent); }

@media (max-width: 1000px) {
  .reader-content { padding: 20px; }
  .yao-ladder-container { flex-direction: column; }
  .yao-ladder { width: 100%; }
  .scene-cards, .classic-wings-grid { grid-template-columns: 1fr; }
}
"""

with open(css_path, "w", encoding="utf-8") as f:
    f.write(full_css)

print("lesson.css re-written with full-width and enlarged readable fonts.")
