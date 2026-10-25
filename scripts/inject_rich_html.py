# -*- coding: utf-8 -*-
"""
脚本：精准按照七大篇章切分并组装 HTML
"""
import os
import json
import re

base_dir = r'c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001'
kb_file = os.path.join(base_dir, 'data', '01_乾卦全息知识精研汇编.md')
data_path = os.path.join(base_dir, 'course_data.js')

kb_text = open(kb_file, encoding='utf-8').read()

def md_to_html(md):
    lines = md.strip().split('\n')
    html_parts = []
    in_ul = False
    in_blockquote = False
    
    for line in lines:
        l = line.strip()
        if not l:
            if in_ul:
                html_parts.append('</ul>')
                in_ul = False
            if in_blockquote:
                html_parts.append('</blockquote>')
                in_blockquote = False
            continue
            
        if l.startswith('### '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            title = l[4:].strip()
            # 爻位锚点
            anchor = ''
            for pos in ['初九', '九二', '九三', '九四', '九五', '上九', '用九']:
                if pos in title:
                    anchor = f'id="yao-card-{pos}"'
                    break
            html_parts.append(f'<h4 class="sub-sec-title" {anchor}>{title}</h4>')
        elif l.startswith('#### '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            title = l[5:].strip()
            anchor = ''
            for pos in ['初九', '九二', '九三', '九四', '九五', '上九', '用九']:
                if pos in title:
                    anchor = f'id="yao-card-{pos}"'
                    break
            html_parts.append(f'<h5 class="yao-sub-title" {anchor}>{title}</h5>')
        elif l.startswith('> '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if not in_blockquote:
                html_parts.append('<blockquote class="classic-quote">')
                in_blockquote = True
            bq_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l[2:])
            html_parts.append(f'<p>{bq_text}</p>')
        elif l.startswith('* ') or l.startswith('- '):
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            if not in_ul:
                html_parts.append('<ul class="classic-list">')
                in_ul = True
            li_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l[2:])
            li_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', li_text)
            html_parts.append(f'<li>{li_text}</li>')
        elif re.match(r'^\d+\.\s', l):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            p_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l)
            html_parts.append(f'<p class="num-item">{p_text}</p>')
        else:
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            p_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l)
            p_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', p_text)
            html_parts.append(f'<p class="normal-p">{p_text}</p>')
            
    if in_ul: html_parts.append('</ul>')
    if in_blockquote: html_parts.append('</blockquote>')
    return '\n'.join(html_parts)

# 使用精准正则切分 7 大篇章
raw_sections = re.split(r'\n(?=## [壹贰叁肆伍陆柒]、)', kb_text)

badges = [
    '壹 · 经传宗本', 
    '贰 · 宗师解构', 
    '叁 · 文言心印', 
    '肆 · 历史贯通', 
    '伍 · 万物类象', 
    '陆 · 时位辩证', 
    '柒 · 实战工坊'
]

sections_html = []

for idx, sec in enumerate(raw_sections[1:]):
    sec_lines = sec.strip().split('\n')
    sec_title = sec_lines[0].replace('## ', '').strip()
    sec_body = '\n'.join(sec_lines[1:]).strip()
    badge = badges[idx] if idx < len(badges) else f'第{idx+1}章'
    
    body_html = md_to_html(sec_body)
    sec_html = f'''
    <section class="step-section section-idx-{idx}">
      <div class="step-header">
        <span class="step-badge">{badge}</span>
        <h3 class="step-title">{sec_title}</h3>
      </div>
      <div class="step-body">
        {body_html}
      </div>
    </section>
    '''
    sections_html.append(sec_html)

full_html = '\n'.join(sections_html)

code = open(data_path, encoding='utf-8').read()
json_str = code.replace('window.COURSE = ', '').strip().rstrip(';')
course = json.loads(json_str)

qian_entry = {
    'id': 'lesson-01_乾为天',
    'title': '第 01 卦 · 乾为天（䷀）—— 纯阳刚健与六龙驭天全息精研',
    'navTitle': '01. 乾为天 (天健)',
    'tag': '核心动力',
    'symbol': '䷀',
    'upper': '乾为天 (☰)',
    'lower': '乾为天 (☰)',
    'lines': [1, 1, 1, 1, 1, 1],
    'motto': '天行刚健，自强不息；时乘六龙，保合太和',
    'full_rich_html': full_html
}

for part in course['parts']:
    for topic in part['topics']:
        for idx, les in enumerate(topic['lessons']):
            if les['id'] == 'lesson-01_乾为天':
                topic['lessons'][idx] = qian_entry

with open(data_path, 'w', encoding='utf-8') as f:
    f.write('window.COURSE = ' + json.dumps(course, ensure_ascii=False, indent=2) + ';\n')

print('SUCCESS: accurately sliced into 7 chapters and updated course_data.js! Length:', len(full_html))
