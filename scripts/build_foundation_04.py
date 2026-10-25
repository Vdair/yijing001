# -*- coding: utf-8 -*-
"""
脚本：提炼 04_AI极速参考手册，生成第四课《经传门径 · 周易经传体系与易学术语深度破迷》
并追加至 course_data.js 作为认知筑基第四课 (p0-04)
"""
import os
import json
import re

base_dir = r'c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001'
out_md = os.path.join(base_dir, 'data', '00_认知基础_04_周易经传与术语破迷.md')
data_path = os.path.join(base_dir, 'course_data.js')

content_md = """# 认知筑基 · 第四课：经传门径 —— 周易经传体系与易学术语深度破迷

> 本篇提炼自《04_AI极速参考手册/易学术语与基础概念辞典.md》与《04_AI极速参考手册/64卦卦义与卦象速查卡.md》。  
> 旨在帮助自修学者消除概念迷雾，理顺《周易》古经与《十翼》的结构脉络，精准掌握专业术语的严谨内涵。

---

## 壹、 经与传的边界：一部书的千年演进

> 很多人把《易经》当成一本书，实际上它是“两套文本、四个时代、多位圣哲”跨越千年的智慧结晶。

| 范畴 | 产生时代 | 核心作者 | 文本组成 | 核心功能 |
| :--- | :--- | :--- | :--- | :--- |
| **易之象（画卦）** | 上古时代 | **伏羲氏** | 八卦画、六十四卦画（无文字，纯符号） | 原始天地能量与二进制宇宙建模 |
| **经（周易古经）** | 殷周之际 | **周文王、周公** | 64 卦卦辞（文王作） + 384 爻爻辞（周公作） | 历史情境记录与决策吉凶断辞 |
| **传（十翼）** | 春秋战国 | **孔子及儒门后学** | 十篇哲学羽翼（彖上下、象上下、系辞上下、文言、说卦、序卦、杂卦） | **从卜筮巫术向人道哲学、心智模型的伟大飞跃** |

* **关键启示**：如果没有孔子作《十翼》，《周易》只是一本佶屈聱牙的上古占卜手册。正是《易传》赋予了它深邃的宇宙观、辩证法与修身心智，使其跃升为“群经之首，大道之源”。

---

## 贰、 孔子“十翼”全息功能地图

> “翼”者，鸟之羽翼也。《易经》如鸟之身躯，得《十翼》而能飞腾万里。

1. **《彖传》（上下两篇）**：
   * *功能*：**统摄全盘**。“彖”即断也，从全卦的大局结构，总释卦名、卦象及卦辞之宏大政治与人生义理。
2. **《象传》（上下两篇）**：
   * **大象传**：**君子效法天道之法门**。每一篇都以“君子以……”或“先王以……”展开，教导人如何效法自然建立社会伦理与管理制度；
   * **小象传**：**逐爻行为审断**。紧随每一句爻辞之后，解释该爻在具体时位中的刚柔、进退与德行得失。
3. **《系辞传》（上下两篇）**：
   * *功能*：**易学总论与哲学巅峰**。系统阐发易经的形而上宇宙观（“一阴一阳之谓道”、“形而上者谓之道，形而下者谓之器”），是通读易经的哲学金钥匙。
4. **《文言传》（一篇）**：
   * *功能*：**乾坤至尊特辑**。孔子唯独为乾卦、坤卦作传，将儒家的修身、齐家、治国、仁义道德推向极致。
5. **《说卦传》（一篇）**：
   * *功能*：**八卦全息类象之宗本**。详尽解说八卦的方位、家庭伦理、动植物与万物类象，梅花易数等后世象数学派皆由此生发。
6. **《序卦传》（一篇）**：
   * *功能*：**六十四卦因果演进链**。从“乾坤（天地宇宙始）”到“屯蒙（生命启蒙）”，直至“既济未济（终而复始）”，阐明六十四卦为何如此排列的永恒因果逻辑。
7. **《杂卦传》（一篇）**：
   * *功能*：**对冲辩证法**。打破文王卦序，将六十四卦两两成对（如“乾刚坤柔”、“比乐师忧”、“临观之义，或与或求”），在强烈对比中反衬卦义真谛。

---

## 叁、 核心易学范畴与高频术语深度破迷

### 1. “易”之一名而含三义（郑玄三大公理）
* **变易**：天地宇宙无一刻不在运动变化，唯有“拥抱变化”才是最大的确定性；
* **简易**：大道至简，宇宙万物再繁复，都可以还原为阴阳二气的消长平衡；
* **不易**：在瞬息万变之中，推动天地运转的底层因果法则（天道）是恒古不变的。

### 2. “元亨利贞”四德密码
* **非吉凶签文**：许多人将其视作“大吉大利”的四句吉利话，实为大谬；
* **程颐四德算法**：
  * **元（善之长也）**：善始发端、初心纯正、仁厚包容；
  * **亨（嘉之会也）**：资源汇聚、制度畅达、礼法规范；
  * **利（义之和也）**：各得其所、公平分配、合义共赢；
  * **贞（事之干也）**：正固坚实、恪守底线、风控常存。
* 只有经历了“元始 ➔ 亨通 ➔ 利和 ➔ 贞固”的完整四阶闭环，一个组织或生命才能跨越周期、生生不息。

### 3. “中正”：易经推崇的最高德行
* **得位（正）**：阳居奇数位（一、三、五）、阴居偶数位（二、四、六）。名副其实，权责匹配；
* **得中（中）**：二爻为下卦之中，五爻为上卦之中。不偏不倚，从容中庸；
* **最高心法**：**中往往重于正**。处于复杂动态世界中，拘泥于教条的形式正义，往往容易折损；唯有具备“执中守衡”的弹性和格局，方能立于不败之地。

---
"""

with open(out_md, 'w', encoding='utf-8') as f:
    f.write(content_md)
print('SUCCESS: 00_认知基础_04_周易经传与术语破迷.md written! Size:', os.path.getsize(out_md))

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
            html_parts.append(f'<div class="step-header" style="margin-top:24px;"><span class="step-badge" style="background:var(--gold-light); color:var(--gold);">经传门径</span><h3 class="step-title">{title}</h3></div>')
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
        elif re.match(r'^\d+\.\s', l):
            if in_table: html_parts.append('</table>'); in_table = False
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            p_text = re.sub(r'\*\*(.*?)\*\*', r'<b>\1</b>', l)
            p_text = re.sub(r'\*(.*?)\*', r'<i>\1</i>', p_text)
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

lesson4_html = f'''
<section class="step-section" style="border-left:4px solid var(--gold);">
  {md_to_html(content_md)}
</section>
'''

lesson4_entry = {
    'id': 'p0-04',
    'title': '第四课 · 经传门径 —— 周易经传体系与易学术语深度破迷',
    'navTitle': '04. 经传体系与术语',
    'tag': '底层逻辑',
    'symbol': '📖',
    'motto': '两套文本，十翼羽翼；体仁长人，中正无偏',
    'full_rich_html': lesson4_html
}

code = open(data_path, encoding='utf-8').read()
json_str = code.replace('window.COURSE = ', '').strip().rstrip(';')
course = json.loads(json_str)

for part in course['parts']:
    if '认知' in part['title']:
        lessons = part['topics'][0]['lessons']
        # 检查是否已有 p0-04
        found = False
        for idx, l in enumerate(lessons):
            if l['id'] == 'p0-04':
                lessons[idx] = lesson4_entry
                found = True
                break
        if not found:
            lessons.append(lesson4_entry)
        break

with open(data_path, 'w', encoding='utf-8') as f:
    f.write('window.COURSE = ' + json.dumps(course, ensure_ascii=False, indent=2) + ';\n')

print('SUCCESS: Foundation lesson 4 successfully injected into course_data.js!')
