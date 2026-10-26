# -*- coding: utf-8 -*-
import os

learn_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'learn.html')

with open(learn_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. 注入 CSS
if 'ai_study_system.css' not in html:
    html = html.replace('</head>', '  <link rel="stylesheet" href="ai_study_system.css">\n</head>')

# 2. 注入 JS
if 'learning_storage.js' not in html:
    scripts = '''  <script src="learning_storage.js"></script>\n  <script src="ai_study_system.js"></script>\n</body>'''
    html = html.replace('</body>', scripts)

# 3. 顶栏添加【📜 修学复习册】入口
if 'openVaultModal()' not in html:
    btn = '<button class="btn-action" onclick="openVaultModal()" style="background:var(--gold-light); color:var(--gold); border-color:var(--gold);">📜 修学复习册</button>\n      <button class="btn-action" onclick="toggleTheme()"'
    html = html.replace('<button class="btn-action" onclick="toggleTheme()"', btn)

with open(learn_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("learn.html 注入成功！")
