# -*- coding: utf-8 -*-
"""
安全轻量安装 AI 伴学导师系统到 learn.html
"""
import os

root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
learn_html_path = os.path.join(root_dir, 'learn.html')

with open(learn_html_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. 注入 CSS 引用
if 'ai_mentor.css' not in content:
    content = content.replace('</head>', '  <link rel="stylesheet" href="ai_mentor.css">\n</head>')

# 2. 注入 JS 引用
if 'ai_mentor.js' not in content:
    scripts_str = '''  <script src="ai_mentor_prompts.js"></script>\n  <script src="ai_mentor.js"></script>\n</body>'''
    content = content.replace('</body>', scripts_str)

with open(learn_html_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("learn.html 注入完成！")
