# -*- coding: utf-8 -*-
"""
脚本：提炼 02_六十四卦系统与 03_错综复杂，生成第二课《重卦之变 · 六十四卦错综复杂与时空全息图谱》
"""
import os
import json
import re

base_dir = r'c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001'
out_md = os.path.join(base_dir, 'data', '00_认知基础_02_六十四卦重卦演进.md')
data_path = os.path.join(base_dir, 'course_data.js')

content_md = """# 认知筑基 · 第二课：重卦之变 —— 六十四卦错综复杂与多维视界

> 本篇提炼自《02_六十四卦精研档案》体系与《03_易理哲学与认知模型/02_六十四卦错综复杂图谱.md》。  
> 旨在帮助自修学者掌握易经最强大的“立体思考算法”——错卦、综卦、互卦与上下卦解构。

---

## 壹、 为什么单卦必须重为六十四卦？

### 1. 穷天下之变：八卦不足以描摹复杂系统
* **《系辞下传》**：“八卦成列，象在其中矣；因而重之，爻在其中矣；刚柔相推，变在其中矣。”
* **孔颖达《周易正义》阐微**：
  * 单纯的三画八卦，仅能表征天地、水火、雷风、山泽等单一自然原力（静态原型）；
  * 然而现实社会与人生命运，无一不是**“系统与系统相遇、环境与主体互动”**的复杂动态；
  * 故圣人将八卦两两相叠（$8 \\times 8 = 64$），以六爻之形态，备万物之形象，穷天下之能事。

---

## 贰、 上下卦的相对论：内卦（贞）与外卦（悔）

> 读懂任何一卦，第一步是看清内卦与外卦的博弈关系。

| 维度 | 内卦（下卦 · 三爻以下） | 外卦（上卦 · 四爻以上） |
| :--- | :--- | :--- |
| **易学术语** | **贞（正也、定也、本也）** | **悔（动也、应也、变也）** |
| **空间角色** | 内部、自身、主观、基盘、初心 | 外部、社会、客观、客场、大势 |
| **实战审断** | 团队自身实力、产品交付底盘、心理定力 | 市场宏观环境、合作对手态度、时代风口 |
| **研判逻辑** | “内卦决定你能守多久” | “外卦决定你能走多远” |

* **经典案例对比**：
  * **地天泰（䷊）**：内卦乾（内怀刚健），外卦坤（外示谦和柔顺）。内心极度自驱强大，对外极度谦逊包容，故为“安泰吉祥”；
  * **天地否（䷋）**：内卦坤（内里软弱退缩），外卦乾（外部高调傲慢）。金玉其外败絮其中，上下不通，故为“闭塞困阻”。

---

## 叁、 易经的“全息四维视界”：正、错、综、互

> 面对同一个事物，普通人只能看到“正卦”（当前表象），易经智者却能同时启动四维全息观察。

### 1. 正卦（本卦 · 当前时空断面）
* 当前事物所处的位置与直接状态。

### 2. 错卦（阴阳完全颠倒 · 极限对立面）
* **生成规则**：将正卦的六个爻，阳爻全部变阴爻，阴爻全部变阳爻。
* **思维模型**：**对立面推演法**。
  * 任何事物的背面，必定存在它的对立面。
  * 如乾卦（䷀，纯刚）错坤卦（䷁，纯柔）；
  * 水火既济（䷾，圆满成功）错火水未济（䷿，全盘未竟）。
* **实战启示**：当你处于极度顺遂时，看错卦便能提前洞察它的对立危机；当你处于绝境时，看错卦便能找到重生的潜能。

### 3. 综卦（上下 180 度翻转 · 换位思考）
* **生成规则**：将正卦像旋转木马一样头脚颠倒 180 度。
* **思维模型**：**同理心与对手视角**。
  * 站在你对面的敌人、客户、上级眼中，事情呈现什么状态？
  * 如水雷屯（䷂，初生艰难）综山水蒙（䷃，启蒙求知）——在创业者眼中是艰难摸索，在导师眼中是启蒙教育；
  * 如水天需（䷄，耐心等待）综天水讼（䷅，诉讼争执）——等待不及时，就会爆发冲突争讼。

### 4. 互卦（内核隐藏动力 · 微观内生因果）
* **生成规则**：舍弃最底下的初爻和最顶上的上爻，取中间四爻：
  * 以二、三、四爻为下卦；
  * 以三、四、五爻为上卦；
  * 重新组装成一个新的重卦。
* **思维模型**：**隐秘动机与底层暗流**。
  * 任何事物的发展，中途必然受到内部核心人员与深层利益关系的操纵。
  * 互卦揭示的是事物“中间阶段的隐藏骨架与转折暗流”。

---

## 肆、 读懂六十四卦的“三步解构法”

自修学者拿到任意一卦，只需按三步拆解，即可破除盲区：
1. **看卦名与卦象**：上卦是什么自然物？下卦是什么自然物？两者相遇会发生什么物理/社会反应？（如火在水上、水在火下、山上有木、雷在地下）；
2. **看内外国策**：主体（下卦）是否得当？客体（上卦）是否合时？
3. **看错综互体**：对立面是什么（防反噬）？对手怎么看（换位思考）？内部暗流往哪里走（抓主因）？

---
"""

with open(out_md, 'w', encoding='utf-8') as f:
    f.write(content_md)
print('SUCCESS: 00_认知基础_02_六十四卦重卦演进.md written! Size:', os.path.getsize(out_md))

# 编译为 HTML
def md_to_html(md):
    lines = md.strip().split('\n')
    html_parts = []
    in_ul = False
    in_table = False
    in_blockquote = False
    
    for line in lines:
        l = line.strip()
        if not l:
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
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
            html_parts.append(f'<div class="step-header" style="margin-top:24px;"><span class="step-badge" style="background:var(--purple-light); color:var(--purple);">多维视界</span><h3 class="step-title">{title}</h3></div>')
        elif l.startswith('| '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            cells = [c.strip() for c in l.split('|')[1:-1]]
            if '---' in cells[0]: continue
            row_html = ''.join([f'<td style="padding:8px 12px; border:1px solid var(--border-light); font-size:14.5px;">{c}</td>' for c in cells])
            if not in_table:
                html_parts.append('<table style="width:100%; border-collapse:collapse; margin:16px 0; background:var(--bg);">')
                in_table = True
            html_parts.append(f'<tr>{row_html}</tr>')
        elif l.startswith('> '):
            if in_table: html_parts.append('</table>'); in_table = False
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if not in_blockquote:
                html_parts.append('<blockquote class="classic-quote">')
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

lesson2_html = f'''
<section class="step-section" style="border-left:4px solid var(--purple);">
  {md_to_html(content_md)}
</section>
'''

# 注入 course_data.js 中的第二课（p0-02 或 lesson-zero-2）
code = open(data_path, encoding='utf-8').read()
json_str = code.replace('window.COURSE = ', '').strip().rstrip(';')
course = json.loads(json_str)

for part in course['parts']:
    if '认知' in part['title']:
        for topic in part['topics']:
            for les in topic['lessons']:
                if les['id'] in ['p0-02', 'lesson-zero-2']:
                    les['title'] = '第二课 · 重卦之变 —— 六十四卦错综复杂与时空全息图谱'
                    les['navTitle'] = '02. 错综复杂演进'
                    les['tag'] = '多维视界'
                    les['motto'] = '刚柔相推，变在其中；错综其纬，天地全息'
                    les['full_rich_html'] = lesson2_html
                    break

with open(data_path, 'w', encoding='utf-8') as f:
    f.write('window.COURSE = ' + json.dumps(course, ensure_ascii=False, indent=2) + ';\n')

print('SUCCESS: Foundation lesson 2 successfully injected into course_data.js!')
