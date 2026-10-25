# -*- coding: utf-8 -*-
with open('eco_sphere.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 在 <div id="canvas-container"></div> 下方插入 focus-backdrop
backdrop_div = '''  <!-- 3D WebGL Canvas Container -->
  <div id="canvas-container"></div>

  <!-- Focus Overlay Backdrop (点击蒙版恢复宇宙原状) -->
  <div id="focus-backdrop" class="focus-backdrop">
    <div class="focus-hint-pill" id="focus-hint-pill">
      <span>🪐 <b>四维拓扑研习态已锁定</b> · 可自由旋转缩放细观对比，点击任意暗处蒙版恢复宇宙全景</span>
      <button class="btn-restore-pill" id="btn-restore-pill">✕ 恢复原状</button>
    </div>
  </div>'''

html = html.replace('  <!-- 3D WebGL Canvas Container -->\n  <div id="canvas-container"></div>', backdrop_div)

with open('eco_sphere.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("eco_sphere.html updated with backdrop successfully.")
