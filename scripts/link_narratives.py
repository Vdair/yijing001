#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
更新 eco_sphere.html 引入 narrative_sprint1.js
并在 assets/eco_sphere.js 中对接 window.NARRATIVE_STORE 统一存储体系
"""

import os
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HTML_FILE = os.path.join(BASE_DIR, "eco_sphere.html")
JS_FILE = os.path.join(BASE_DIR, "assets", "eco_sphere.js")

# 1. 更新 HTML 引入
def update_html():
    with open(HTML_FILE, 'r', encoding='utf-8') as f:
        html = f.read()

    tag = '<script src="assets/narratives/narrative_sprint1.js"></script>'
    if tag not in html:
        html = html.replace('<script src="assets/eco_data.js"></script>',
                            '<script src="assets/eco_data.js"></script>\n  <script src="assets/narratives/narrative_sprint1.js"></script>')
        with open(HTML_FILE, 'w', encoding='utf-8') as f:
            f.write(html)
        print("Injected narrative_sprint1.js tag to eco_sphere.html!")
    else:
        print("HTML tag already present.")

# 2. 更新 JS 中对 NARRATIVE_STORE 的挂载与查找
def update_js():
    with open(JS_FILE, 'r', encoding='utf-8') as f:
        js = f.read()

    # 将原本的 QIAN_NARRATIVE 挂载到 window.NARRATIVE_STORE[1]
    if 'window.NARRATIVE_STORE = window.NARRATIVE_STORE || {};' not in js:
        js = js.replace('const QIAN_NARRATIVE = {', 'window.NARRATIVE_STORE = window.NARRATIVE_STORE || {};\n  window.NARRATIVE_STORE[1] = {\n    guaName: "乾为天",\n    themeName: "领袖进取篇 · 职场英雄之旅与飞龙大展宏图",\n    subTitle: "天行刚健 · 六阶生命周期演进",\n    stages: {')
        # 把结尾的 }; 改为 }};
        # 查找并在 applyTimelineStep 中统一从 NARRATIVE_STORE 读取
        print("Updated QIAN_NARRATIVE to store!")

    # 更新 applyTimelineStep 中的读取逻辑
    old_extract_logic = """    let storyData;
    if (isQian && QIAN_NARRATIVE[step]) {
      const qItem = QIAN_NARRATIVE[step];
      const pData = qItem.perspectives[currentPerspective] || qItem.perspectives['career'];
      storyData = {
        yaoCode: qItem.yaoCode,
        stageTag: qItem.stageTag,
        origText: qItem.origText,
        origTrans: qItem.origTrans,
        title: pData.title,
        text: pData.text,
        wisdom: pData.wisdom,
        visual: qItem.visual
      };
    }"""

    new_extract_logic = """    let storyData;
    const storeItem = window.NARRATIVE_STORE && window.NARRATIVE_STORE[guaIdx];
    if (storeItem && storeItem.stages && storeItem.stages[step]) {
      const qItem = storeItem.stages[step];
      const pData = (qItem.perspectives && (qItem.perspectives[currentPerspective] || qItem.perspectives['primary'] || qItem.perspectives['career'])) || {};
      storyData = {
        yaoCode: qItem.yaoCode || `第${step}爻`,
        stageTag: qItem.stageTag || `第${step}幕`,
        origText: qItem.origText || `${activeNode.userData.name} · 第${step}爻`,
        origTrans: qItem.origTrans || '',
        title: pData.title || `${storeItem.themeName || activeNode.userData.name} · 第${step}阶`,
        text: pData.text || '',
        wisdom: pData.wisdom || '',
        visual: qItem.visual || { type: 'earth', icon: '☯️', name: activeNode.userData.name, hint: '时位流转' }
      };
      // 更新副标题
      const subTitleEl = document.getElementById('theater-subtitle');
      if (subTitleEl && storeItem.themeName) {
        subTitleEl.innerText = `${storeItem.themeName} · ${storeItem.subTitle || ''}`;
      }
    }"""

    if old_extract_logic in js:
        js = js.replace(old_extract_logic, new_extract_logic)
        print("Replaced extraction logic with dynamic NARRATIVE_STORE loader!")
    else:
        # 正则替换
        pattern = r'let storyData;\s*if\s*\(isQian[\s\S]*?visual:\s*qItem\.visual\s*\}\;\s*\}'
        js = re.sub(pattern, new_extract_logic, js)
        print("Replaced via regex!")

    with open(JS_FILE, 'w', encoding='utf-8') as f:
        f.write(js)

update_html()
update_js()
