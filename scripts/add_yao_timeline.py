# -*- coding: utf-8 -*-
import re

# 2. 向 eco_sphere.html 插入 timeline 节点并在详情卡增加演进按钮
with open('eco_sphere.html', 'r', encoding='utf-8') as f:
    html = f.read()

timeline_markup = '''  <!-- Six Yao Timeline Progress Scrubber -->
  <div class="hud-panel yao-timeline-bar" id="yao-timeline-bar">
    <div class="timeline-header">
      <div class="tl-title">
        <span class="tl-icon">⏳</span>
        <b id="tl-gua-name">01. 乾为天 · 六爻时位演进</b>
      </div>
      <div class="tl-controls">
        <button class="tl-btn" id="tl-btn-play" title="播放/暂停演进">▶ 自动演进</button>
        <button class="tl-btn" id="tl-btn-reset" title="重置回初爻">↺ 初爻</button>
        <button class="tl-close-btn" id="tl-btn-close" title="退出六爻演进">&times;</button>
      </div>
    </div>
    
    <div class="timeline-stage-info" id="tl-stage-info">
      <span class="stage-tag" id="tl-stage-tag">初爻 · 潜伏生发</span>
      <span class="stage-desc" id="tl-stage-desc">初爻地道之始：潜藏蓄力，未可施用。深扎根系，切忌急功近利。</span>
    </div>

    <div class="timeline-track-wrap">
      <div class="timeline-steps" id="tl-steps-container">
        <button class="tl-step-btn current" data-step="1"><span>初爻</span><small>基层潜伏</small></button>
        <button class="tl-step-btn" data-step="2"><span>二爻</span><small>破土崭露</small></button>
        <button class="tl-step-btn" data-step="3"><span>三爻</span><small>夹层危厉</small></button>
        <button class="tl-step-btn" data-step="4"><span>四爻</span><small>审慎跃迁</small></button>
        <button class="tl-step-btn" data-step="5"><span>五爻</span><small>至尊执中</small></button>
        <button class="tl-step-btn" data-step="6"><span>上爻</span><small>极盛知退</small></button>
      </div>
      <div class="timeline-progress-bar">
        <div class="timeline-progress-fill" id="tl-progress-fill"></div>
      </div>
    </div>
  </div>
'''

if 'id="yao-timeline-bar"' not in html:
    html = html.replace('  <!-- Right Detail Card (Glassmorphism Modal) -->', timeline_markup + '\n  <!-- Right Detail Card (Glassmorphism Modal) -->')

# 在详情卡的 action-bar 加一个时间推进按钮
timeline_btn = '''    <div class="action-bar">
      <button class="study-btn" id="btn-trigger-timeline" style="background:rgba(212,175,55,0.18); border:1px solid var(--gold); color:var(--gold-light);">
        <span>⏳ 推进六爻时位演进</span>
      </button>
      <a href="#" class="study-btn" id="study-btn">
        <span>📖 进入自修大课</span>
      </a>
    </div>'''

html = re.sub(r'<div class="action-bar">\s*<a href="#" class="study-btn" id="study-btn">.*?</div>', timeline_btn, html, flags=re.DOTALL)

with open('eco_sphere.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("eco_sphere.html updated with timeline successfully.")
