#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_phase2_workshop.py
全量生成阶段二数据并注入 yijing_assistant.js
"""

import os
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSISTANT_JS = os.path.join(BASE_DIR, 'yijing_assistant.js')

with open(ASSISTANT_JS, 'r', encoding='utf-8') as f:
    js_content = f.read()

# 定位要替换的代码块区间
start_pattern = "// 难易度自适应评估模型：根据课时类型与深浅自适应问题数量与费曼情境"
end_pattern = "  // 渲染正文穿插的【💡 易道顿悟小憩 · 边读边思】卡片"

start_idx = js_content.find(start_pattern)
end_idx = js_content.find(end_pattern)

if start_idx == -1 or end_idx == -1:
    print(f"Error: Could not locate markers in {ASSISTANT_JS}")
    exit(1)

print(f"Located code block from char {start_idx} to {end_idx}")
