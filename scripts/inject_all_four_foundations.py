# -*- coding: utf-8 -*-
"""
脚本：优化认知筑基 4 课的 HTML 渲染细节（去除冗余大标题、支持表格加粗、消除分隔线字符）
"""
import os
import json
import re

base_dir = r'c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001'
data_path = os.path.join(base_dir, 'course_data.js')

def md_to_html(md, theme_color='var(--blue)'):
    lines = md.strip().split('\n')
    html_parts = []
    in_ul = False
    in_table = False
    in_blockquote = False
    
    for line in lines:
        l = line.strip()
        if not l or l == '---':
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            continue
            
        if l.startswith('# '):
            # 顶部 H1 大标题已在顶部 Header 显示，正文中忽略
            continue
            
        if l.startswith('### '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            title = l[4:].strip()
            html_parts.append(f'<h4 class="sub-sec-title">{title}</h4>')
        elif l.startswith('## '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            title = l[3:].strip()
            html_parts.append(f'<div class="step-header" style="margin-top:28px;"><span class="step-badge" style="background:var(--border); color:{theme_color};">核心要义</span><h3 class="step-title">{title}</h3></div>')
        elif l.startswith('| '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            cells = [c.strip() for c in l.split('|')[1:-1]]
            if '---' in cells[0]: continue
            parsed_cells = [re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', c) for c in cells]
            row_html = ''.join([f'<td style="padding:10px 14px; border:1px solid var(--border-light); font-size:15px;">{c}</td>' for c in parsed_cells])
            if not in_table:
                html_parts.append('<table style="width:100%; border-collapse:collapse; margin:16px 0; background:var(--bg); border:1px solid var(--border);">')
                in_table = True
            html_parts.append(f'<tr>{row_html}</tr>')
        elif l.startswith('> '):
            if in_table: html_parts.append('</table>'); in_table = False
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if not in_blockquote:
                html_parts.append('<blockquote class="classic-quote" style="border-left-color:' + theme_color + ';">')
                in_blockquote = True
            bq_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l[2:])
            html_parts.append(f'<p>{bq_text}</p>')
        elif l.startswith('* ') or l.startswith('- '):
            if in_table: html_parts.append('</table>'); in_table = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            if not in_ul:
                html_parts.append('<ul class="classic-list">')
                in_ul = True
            li_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l[2:])
            li_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', li_text)
            html_parts.append(f'<li>{li_text}</li>')
        elif re.match(r'^\d+\.\s', l):
            if in_table: html_parts.append('</table>'); in_table = False
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            p_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l)
            html_parts.append(f'<p class="num-item">{p_text}</p>')
        else:
            if in_table: html_parts.append('</table>'); in_table = False
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            p_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l)
            p_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', p_text)
            html_parts.append(f'<p class="normal-p">{p_text}</p>')
            
    if in_table: html_parts.append('</table>')
    if in_ul: html_parts.append('</ul>')
    if in_blockquote: html_parts.append('</blockquote>')
    return '\n'.join(html_parts)

md1 = open(os.path.join(base_dir, 'data', '00_认知基础_01_八卦全息原型.md'), encoding='utf-8').read()
md2 = open(os.path.join(base_dir, 'data', '00_认知基础_02_六十四卦重卦演进.md'), encoding='utf-8').read()
md3 = open(os.path.join(base_dir, 'data', '00_认知基础_03_时位辩证与以物观物.md'), encoding='utf-8').read()
md4 = open(os.path.join(base_dir, 'data', '00_认知基础_04_周易经传与术语破迷.md'), encoding='utf-8').read()

four_lessons = [
    {
        'id': 'p0-01',
        'title': '第一课 · 天地之象 —— 八卦全息原型与能量建模',
        'navTitle': '01. 天地八卦原型',
        'tag': '能量建模',
        'symbol': '☰',
        'motto': '近取诸身，远取诸物；八卦成列，象在其中',
        'full_rich_html': f'<section class="step-section" style="border-left:4px solid var(--blue);">{md_to_html(md1, "var(--blue)")}</section>'
    },
    {
        'id': 'p0-02',
        'title': '第二课 · 重卦之变 —— 六十四卦错综复杂与时空全息图谱',
        'navTitle': '02. 错综复杂演进',
        'tag': '多维视界',
        'symbol': '☯️',
        'motto': '刚柔相推，变在其中；错综其纬，天地全息',
        'full_rich_html': f'<section class="step-section" style="border-left:4px solid var(--purple);">{md_to_html(md2, "var(--purple)")}</section>'
    },
    {
        'id': 'p0-03',
        'title': '第三课 · 时位决策 —— 易经时位辩证与邵雍以物观物法则',
        'navTitle': '03. 时位决策哲学',
        'tag': '心智模型',
        'symbol': '⚖️',
        'motto': '观物以性，破我执情；时乘六位，中正无咎',
        'full_rich_html': f'<section class="step-section" style="border-left:4px solid var(--accent);">{md_to_html(md3, "var(--accent)")}</section>'
    },
    {
        'id': 'p0-04',
        'title': '第四课 · 经传门径 —— 周易经传体系与易学术语深度破迷',
        'navTitle': '04. 经传体系与术语',
        'tag': '底层逻辑',
        'symbol': '📖',
        'motto': '两套文本，十翼羽翼；体仁长人，中正无偏',
        'full_rich_html': f'<section class="step-section" style="border-left:4px solid var(--gold);">{md_to_html(md4, "var(--gold)")}</section>'
    }
]

code = open(data_path, encoding='utf-8').read()
json_str = code.replace('window.COURSE = ', '').strip().rstrip(';')
course = json.loads(json_str)

course['parts'][0]['topics'][0]['lessons'] = four_lessons

with open(data_path, 'w', encoding='utf-8') as f:
    f.write('window.COURSE = ' + json.dumps(course, ensure_ascii=False, indent=2) + ';\n')

print('SUCCESS: Clean HTML successfully injected into course_data.js!')
