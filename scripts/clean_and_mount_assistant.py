# -*- coding: utf-8 -*-
import os

learn_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'learn.html')

with open(learn_path, 'r', encoding='utf-8') as f:
    html = f.read()

# 1. 清理旧 CSS 引用
html = html.replace('  <link rel="stylesheet" href="ai_mentor.css">\n', '')
html = html.replace('  <link rel="stylesheet" href="ai_study_system.css">\n', '')

# 确保引入新的 yijing_assistant.css
if 'yijing_assistant.css' not in html:
    html = html.replace('</head>', '  <link rel="stylesheet" href="yijing_assistant.css">\n</head>')

# 2. 清理旧 JS 引用
html = html.replace('  <script src="ai_mentor_prompts.js"></script>\n', '')
html = html.replace('  <script src="ai_mentor.js"></script>\n', '')
html = html.replace('  <script src="learning_storage.js"></script>\n', '')
html = html.replace('  <script src="ai_study_system.js"></script>\n', '')

# 确保以干净形式引入
new_scripts = '''  <script src="learning_storage.js"></script>\n  <script src="yijing_assistant.js"></script>\n</body>'''
html = html.replace('</body>', new_scripts)

# 3. 顶栏按钮保留 openVaultModal()
if 'openVaultModal()' not in html:
    btn = '<button class="btn-action" onclick="openVaultModal()" style="background:var(--gold-light); color:var(--gold); border-color:var(--gold);">📜 修学复习册</button>\n      <button class="btn-action" onclick="toggleTheme()"'
    html = html.replace('<button class="btn-action" onclick="toggleTheme()"', btn)

with open(learn_path, 'w', encoding='utf-8') as f:
    f.write(html)

print("learn.html 清理并重新挂载完成！")
