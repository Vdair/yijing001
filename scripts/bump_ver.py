# -*- coding: utf-8 -*-
import re

with open('learn.html', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'yijing_assistant\.css[^\"]*', 'yijing_assistant.css?v=20261026_light_v3', text)
text = re.sub(r'yijing_assistant\.js[^\"]*', 'yijing_assistant.js?v=20261026_light_v3', text)

with open('learn.html', 'w', encoding='utf-8') as f:
    f.write(text)

print('learn.html cache version updated to light_v3!')
