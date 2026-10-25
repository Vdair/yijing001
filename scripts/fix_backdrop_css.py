# -*- coding: utf-8 -*-
# 1. 移除 assets/eco_sphere.css 中覆盖在 canvas 上的全屏蒙版
with open('assets/eco_sphere.css', 'r', encoding='utf-8') as f:
    css = f.read()

# 替换 .focus-backdrop 样式为穿透式的纯提示条
css = css.replace('''/* Focus Overlay Backdrop */
.focus-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 5;
  background: radial-gradient(circle at center, rgba(7, 9, 19, 0.45) 20%, rgba(7, 9, 19, 0.88) 100%);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding-top: 76px;
}

.focus-backdrop.active {
  opacity: 1;
  pointer-events: auto;
}''', '''/* Focus Overlay Bar (提示栏置顶，不遮挡 3D 视口) */
.focus-backdrop {
  position: absolute;
  top: 76px;
  left: 0;
  width: 100%;
  z-index: 10;
  pointer-events: none;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  opacity: 0;
  transition: opacity 0.35s ease;
}

.focus-backdrop.active {
  opacity: 1;
  pointer-events: auto;
}''')

with open('assets/eco_sphere.css', 'w', encoding='utf-8') as f:
    f.write(css)

print("assets/eco_sphere.css fixed.")
