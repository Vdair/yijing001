# -*- coding: utf-8 -*-
import re

# 1. 更新 assets/eco_sphere.css 添加 focus-backdrop 样式
css_append = '''
/* Focus Overlay Backdrop */
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
}

.focus-hint-pill {
  background: rgba(14, 18, 36, 0.85);
  border: 1px solid var(--border-glow);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6), 0 0 16px rgba(212, 175, 55, 0.25);
  backdrop-filter: blur(12px);
  padding: 8px 18px;
  border-radius: 30px;
  color: #f8fafc;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 14px;
  pointer-events: auto;
  animation: fadeInDown 0.4s ease;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-12px); }
  to { opacity: 1; transform: translateY(0); }
}

.btn-restore-pill {
  background: rgba(244, 63, 94, 0.2);
  border: 1px solid rgba(244, 63, 94, 0.5);
  color: #fda4af;
  padding: 4px 12px;
  border-radius: 14px;
  font-size: 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.btn-restore-pill:hover {
  background: var(--red);
  color: #fff;
  box-shadow: 0 0 10px rgba(244, 63, 94, 0.5);
}
'''

with open('assets/eco_sphere.css', 'a', encoding='utf-8') as f:
    f.write(css_append)

print("assets/eco_sphere.css updated successfully.")
