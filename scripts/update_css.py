# -*- coding: utf-8 -*-
"""
更新 lesson.css，增加竖排六爻梯子及深度爻辞研习卡片样式
"""
import os

base_dir = r"c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001"
css_path = os.path.join(base_dir, "lesson.css")

with open(css_path, "r", encoding="utf-8") as f:
    css = f.read()

# 增加竖排六爻天梯样式与爻位卡片样式
extra_css = """
/* ── 竖向六爻天梯 (自下而上) ── */
.yao-ladder-container {
  display: flex;
  gap: 24px;
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 22px;
  margin: 20px 0;
  box-shadow: var(--shadow);
}
.yao-ladder {
  display: flex;
  flex-direction: column-reverse; /* 关键：自下而上，初爻在最下，上爻在最顶 */
  gap: 10px;
  width: 220px;
  flex-shrink: 0;
  background: var(--bg);
  padding: 14px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-light);
}
.yao-ladder-rung {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  background: var(--card);
  border: 1px solid var(--border-light);
}
.yao-ladder-rung:hover, .yao-ladder-rung.active {
  background: var(--accent-light);
  border-color: var(--accent);
  transform: translateX(4px);
}
.yao-pos-name {
  font-size: 11px;
  font-weight: 700;
  width: 48px;
  color: var(--text-sub);
}
.yao-graphic {
  flex: 1;
  height: 12px;
  border-radius: 3px;
  display: flex;
  align-items: center;
}
.yao-graphic.yang {
  background: var(--gold);
}
.yao-graphic.yin {
  display: flex;
  gap: 6px;
  background: transparent;
}
.yao-graphic.yin .yin-half {
  flex: 1;
  height: 12px;
  background: var(--blue);
  border-radius: 3px;
}
.yao-ladder-intro {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-size: 13.5px;
  color: var(--text-m);
  line-height: 1.8;
}
.yao-ladder-intro h4 {
  font-size: 16px;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 8px;
}

/* ── 逐爻深度解构卡片 ── */
.yao-deep-card {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.yao-deep-card:hover {
  border-color: var(--gold);
}
.yao-deep-header {
  padding: 14px 20px;
  background: var(--border-light);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.yao-deep-title {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  font-weight: 800;
  color: var(--text-m);
}
.yao-pos-badge {
  background: var(--gold-light);
  color: var(--gold);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 700;
}
.yao-stage-tag {
  font-size: 12px;
  color: var(--text-sub);
  background: var(--bg);
  padding: 2px 8px;
  border-radius: 99px;
  border: 1px solid var(--border-light);
}
.yao-deep-body {
  padding: 20px;
}

/* 典籍原典四格/多栏羽翼 */
.classic-wings-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 14px;
  margin-bottom: 14px;
}
.wing-box {
  background: var(--bg);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-sm);
  padding: 12px 14px;
  font-size: 13px;
  line-height: 1.7;
}
.wing-box-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.wing-box-title.zhuxi { color: #f0883e; }
.wing-box-title.shaoyong { color: #58a6ff; }
.wing-box-title.chengyi { color: #bc8cff; }
.wing-box-title.kong { color: #3fb950; }

.modern-decode-box {
  background: rgba(46, 160, 67, 0.05);
  border-left: 3px solid var(--accent);
  padding: 12px 16px;
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
  margin-top: 12px;
  font-size: 14px;
  line-height: 1.8;
}
.redline-warning {
  background: rgba(248, 81, 73, 0.08);
  border: 1px solid rgba(248, 81, 73, 0.2);
  border-radius: var(--radius-sm);
  padding: 10px 14px;
  color: var(--danger);
  font-size: 13px;
  margin-top: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}
"""

with open(css_path, "w", encoding="utf-8") as f:
    f.write(css + "\n" + extra_css)

print("lesson.css updated with vertical ladder and deep card styles.")
