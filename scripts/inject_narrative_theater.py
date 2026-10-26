#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
为六十四卦 3D 全息生态圈注入乾卦六爻“职场英雄之旅”动态故事化演进剧场
包含：
1. 连贯的故事体系（职场史诗 / 创业破局 / 君子原典三重视角切换）
2. 动态 Canvas 画卷粒子微动画（深渊水纹、破晓金光、夹层风暴、云渊试跃、九霄日出、深空知止）
3. 3D 运镜配合与当前爻光效
4. 优雅的沉浸式 HUD 排版
"""

import re
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_FILE = os.path.join(BASE_DIR, "eco_sphere.html")
CSS_FILE = os.path.join(BASE_DIR, "assets", "eco_sphere.css")
JS_FILE = os.path.join(BASE_DIR, "assets", "eco_sphere.js")

# 1. 更新 HTML
def update_html():
    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        html = f.read()

    # 替换 yao-timeline-bar 为故事化演进剧场
    new_timeline_html = """  <!-- Six Yao Narrative Cinematic Scrubber (六爻故事化动态演进剧场) -->
  <div class="hud-panel yao-timeline-bar" id="yao-timeline-bar">
    <!-- 剧场顶部控制栏 -->
    <div class="theater-top-bar">
      <div class="theater-title-group">
        <span class="theater-icon">🎬</span>
        <div class="theater-title-text">
          <b id="theater-gua-title">01. 乾为天 · 六爻时位故事剧场</b>
          <span class="theater-subtitle" id="theater-subtitle">六阶职场英雄之旅 · 自下而上生命周期演进</span>
        </div>
      </div>

      <!-- 视角切换器 -->
      <div class="perspective-switch-wrap">
        <span class="perspective-label">研习视角：</span>
        <div class="perspective-capsules" id="perspective-capsules">
          <button class="perspective-btn active" data-perspective="career" id="btn-persp-career">👔 职场史诗</button>
          <button class="perspective-btn" data-perspective="startup" id="btn-persp-startup">🚀 创业破局</button>
          <button class="perspective-btn" data-perspective="classic" id="btn-persp-classic">☯️ 乾龙修身</button>
        </div>
      </div>

      <div class="tl-controls">
        <button class="tl-btn" id="tl-btn-prev" title="上一爻">⏮ 上一幕</button>
        <button class="tl-btn play-btn" id="tl-btn-play" title="播放/暂停演进">▶ 自动放映</button>
        <button class="tl-btn" id="tl-btn-next" title="下一爻">下一幕 ⏭</button>
        <button class="tl-close-btn" id="tl-btn-close" title="退出剧场">&times;</button>
      </div>
    </div>

    <!-- 剧场主体区：左侧动态意象画卷 + 右侧沉浸式剧情解说 -->
    <div class="theater-main-stage">
      <!-- 左侧：实时 Canvas 粒子意象微电影 -->
      <div class="stage-visual-container">
        <canvas id="stage-canvas" width="220" height="180"></canvas>
        <div class="visual-badge" id="visual-badge">
          <span class="visual-icon" id="visual-icon">🌊</span>
          <span class="visual-name" id="visual-name">深渊暗流</span>
        </div>
        <div class="visual-scene-hint" id="visual-scene-hint">初入江湖 · 蓄力破局</div>
      </div>

      <!-- 右侧：结构化故事解说卡片 -->
      <div class="stage-script-card">
        <!-- 头部元数据行 -->
        <div class="script-header-line">
          <div class="script-yao-pill" id="script-yao-pill">
            <span class="yao-code">初九</span>
            <span class="yao-stage" id="script-stage-tag">第一幕 · 深渊潜伏</span>
          </div>
          <div class="script-original-quote" id="script-original-quote">
            <span class="orig-text">初九：潜龙，勿用。</span>
            <span class="orig-trans" id="script-orig-trans">如同潜伏深渊的巨龙，时机未到，切勿轻举妄动。</span>
          </div>
        </div>

        <!-- 故事内容大字解说 -->
        <div class="script-story-body">
          <h3 class="story-chapter-title" id="story-chapter-title">深渊潜伏 · 职场新人的沉潜破局</h3>
          <p class="story-chapter-text" id="story-chapter-text">
            刚刚步入职场或大厂团队，没有资历与人脉，周围暗流涌动。此时最致命的错误是急于证明自己或盲目出头。真正的聪明人懂得“深水潜伏”，把公司的核心业务链路摸透，默默把专业硬技能打磨到无可替代。忍得住寂寞，才能撑得起未来的大任。
          </p>
        </div>

        <!-- 底部心法锦囊 -->
        <div class="script-wisdom-pill" id="script-wisdom-pill">
          <span class="wisdom-tag">💡 决策心法</span>
          <span class="wisdom-text" id="script-wisdom-text">慎始敬终，深扎根系；未见全貌，不露锋芒。</span>
        </div>
      </div>
    </div>

    <!-- 底部六爻演进刻度条 -->
    <div class="timeline-track-wrap">
      <div class="timeline-steps" id="tl-steps-container">
        <button class="tl-step-btn current" data-step="1">
          <span class="step-num">初九</span>
          <small class="step-desc">潜龙勿用</small>
        </button>
        <button class="tl-step-btn" data-step="2">
          <span class="step-num">九二</span>
          <small class="step-desc">见龙在田</small>
        </button>
        <button class="tl-step-btn" data-step="3">
          <span class="step-num">九三</span>
          <small class="step-desc">终日乾乾</small>
        </button>
        <button class="tl-step-btn" data-step="4">
          <span class="step-num">九四</span>
          <small class="step-desc">或跃在渊</small>
        </button>
        <button class="tl-step-btn" data-step="5">
          <span class="step-num">九五</span>
          <small class="step-desc">飞龙在天</small>
        </button>
        <button class="tl-step-btn" data-step="6">
          <span class="step-num">上九</span>
          <small class="step-desc">亢龙有悔</small>
        </button>
      </div>
      <div class="timeline-progress-bar">
        <div class="timeline-progress-fill" id="tl-progress-fill"></div>
      </div>
    </div>
  </div>"""

    # 替换现有 timeline 模块
    pattern = r'<!-- Six Yao Timeline Progress Scrubber -->[\s\S]*?</div>\s*</div>\s*</div>'
    if re.search(pattern, html):
        html = re.sub(pattern, new_timeline_html, html)
        print("Replaced timeline bar with narrative theater HTML successfully!")
    else:
        # 兜底查找
        p2 = r'<div class="hud-panel yao-timeline-bar" id="yao-timeline-bar">[\s\S]*?</div>\s*</div>\s*</div>'
        html = re.sub(p2, new_timeline_html, html)
        print("Replaced via fallback pattern!")

    with open(HTML_FILE, 'w', encoding='utf-8') as f:
        f.write(html)

# 2. 编写配套 CSS 样式
def update_css():
    with open(CSS_FILE, 'r', encoding='utf-8') as f:
        css = f.read()

    new_theater_css = """
/* ==========================================================================
   六爻故事化动态演进剧场 (Hexagram Narrative Cinematic Scrubber)
   ========================================================================== */
.yao-timeline-bar {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%) translateY(140px);
  width: min(960px, 94vw);
  background: rgba(11, 15, 25, 0.94);
  backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(212, 175, 55, 0.35);
  border-radius: 18px;
  padding: 16px 24px;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 14px;
  opacity: 0;
  pointer-events: none;
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.85), 0 0 35px rgba(212, 175, 55, 0.25);
}

.yao-timeline-bar.active {
  transform: translateX(-50%) translateY(0);
  opacity: 1;
  pointer-events: auto;
}

/* 顶部控制栏 */
.theater-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  padding-bottom: 12px;
}

.theater-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.theater-icon {
  font-size: 20px;
}

.theater-title-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.theater-title-text b {
  font-size: 15px;
  color: var(--gold-light);
  font-family: var(--font-serif);
  letter-spacing: 0.5px;
}

.theater-subtitle {
  font-size: 11px;
  color: var(--text-muted);
}

/* 视角胶囊切换按钮 */
.perspective-switch-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 3px 8px;
  border-radius: 20px;
}

.perspective-label {
  font-size: 11px;
  color: var(--text-muted);
}

.perspective-capsules {
  display: flex;
  gap: 4px;
}

.perspective-btn {
  background: transparent;
  border: 1px solid transparent;
  color: #cbd5e1;
  padding: 4px 10px;
  border-radius: 14px;
  font-size: 11.5px;
  cursor: pointer;
  transition: all 0.2s;
}

.perspective-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.08);
}

.perspective-btn.active {
  background: rgba(212, 175, 55, 0.25);
  border-color: var(--gold);
  color: var(--gold-light);
  font-weight: 600;
  box-shadow: 0 0 10px rgba(212, 175, 55, 0.3);
}

.tl-controls {
  display: flex;
  align-items: center;
  gap: 6px;
}

.tl-btn {
  background: rgba(212, 175, 55, 0.12);
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #fff;
  padding: 5px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.tl-btn:hover {
  background: var(--gold);
  color: #0b0f19;
  box-shadow: 0 0 14px rgba(212, 175, 55, 0.45);
}

.tl-btn.play-btn {
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.35), rgba(212, 175, 55, 0.15));
  border-color: var(--gold);
}

/* 剧场主舞台（双栏） */
.theater-main-stage {
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 18px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 14px 16px;
  min-height: 190px;
}

/* 左侧 Canvas 粒子意象微电影 */
.stage-visual-container {
  position: relative;
  width: 220px;
  height: 180px;
  border-radius: 10px;
  overflow: hidden;
  background: radial-gradient(circle at center, rgba(30, 41, 59, 0.8), rgba(11, 15, 25, 0.95));
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.8), 0 0 15px rgba(212, 175, 55, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

#stage-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}

.visual-badge {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(8px);
  padding: 3px 8px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.visual-icon {
  font-size: 13px;
}

.visual-name {
  font-size: 11px;
  color: var(--gold-light);
  font-weight: 600;
}

.visual-scene-hint {
  position: absolute;
  bottom: 8px;
  left: 8px;
  right: 8px;
  text-align: center;
  z-index: 2;
  font-size: 11px;
  color: #94a3b8;
  background: rgba(0, 0, 0, 0.55);
  padding: 3px 6px;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

/* 右侧故事解说卡片 */
.stage-script-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
}

.script-header-line {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.script-yao-pill {
  display: flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1));
  border: 1px solid var(--gold);
  border-radius: 6px;
  padding: 3px 10px;
}

.yao-code {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  font-family: var(--font-serif);
}

.yao-stage {
  font-size: 12px;
  color: var(--gold-light);
}

.script-original-quote {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.orig-text {
  font-weight: 700;
  color: #f8fafc;
  font-family: var(--font-serif);
}

.orig-trans {
  color: #94a3b8;
  font-size: 12px;
}

.story-chapter-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--gold-light);
  font-family: var(--font-serif);
  margin-bottom: 6px;
  letter-spacing: 0.5px;
}

.story-chapter-text {
  font-size: 13.5px;
  line-height: 1.65;
  color: #e2e8f0;
  margin: 0;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.8);
}

.script-wisdom-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(212, 175, 55, 0.08);
  border-left: 3px solid var(--gold);
  padding: 6px 12px;
  border-radius: 4px;
}

.wisdom-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--gold);
  white-space: nowrap;
}

.wisdom-text {
  font-size: 12px;
  color: #fde047;
  font-weight: 500;
}

/* 刻度按钮美化 */
.tl-step-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 6px;
}

.tl-step-btn .step-num {
  font-size: 13px;
  font-weight: 700;
  font-family: var(--font-serif);
}

.tl-step-btn .step-desc {
  font-size: 11px;
  opacity: 0.85;
}
"""
    # 替换原本的 .yao-timeline-bar 部分
    pattern = r'/\* Six Yao Timeline Scrubber.*?(?=/\* Right Detail Card)'
    if re.search(pattern, css, re.DOTALL):
        css = re.sub(pattern, new_theater_css + "\n", css, flags=re.DOTALL)
        print("Updated CSS with narrative theater styles!")
    else:
        css += "\n" + new_theater_css
        print("Appended new theater CSS to bottom!")

    with open(CSS_FILE, 'w', encoding='utf-8') as f:
        f.write(css)

# 执行更新
update_html()
update_css()
