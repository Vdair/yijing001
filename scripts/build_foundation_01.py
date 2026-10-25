# -*- coding: utf-8 -*-
"""
脚本：提炼 01_八卦基础通识，生成第一课《天地之象 · 八卦全息原型与能量建模》
"""
import os
import json
import re

base_dir = r'c:\Users\HiQhb\.gemini\antigravity-ide\scratch\yijing001'
out_md = os.path.join(base_dir, 'data', '00_认知基础_01_八卦全息原型.md')
data_path = os.path.join(base_dir, 'course_data.js')

content_md = """# 认知筑基 · 第一课：天地之象 · 八卦全息原型与能量建模

> 本篇提炼自《01_八卦基础通识/00_八卦总论与八卦图.md》与《01_八卦基础通识/09_梅花易数_八卦万物全息类象图谱.md》。  
> 旨在帮助自修学者穿透表象术语，直击八卦作为中国古代“全息物理学”与“心智动力学”的底层原型。

---

## 壹、 起源：伏羲画卦与远取诸物近取诸身

### 1. 认知观测的第一原则
* **《系辞下传》原典**：
  > “古者包牺氏之王天下也，仰则观象于天，俯则观法于地，观鸟兽之文与地之宜，近取诸身，远取诸物，于是始作八卦，以通神明之德，以类万物之情。”
* **现代认知解读**：
  * **非虚妄臆造**：八卦不是占卜巫术的发明，而是上古先民对自然界能量运转模型的**高度数学化抽象**；
  * **全息对应法**：
    * **仰观于天**：观测日月星辰流转、四季冷暖交替、阴阳二气消长；
    * **俯察于地**：考察山川水泽、风雷地貌、动植物生发枯荣；
    * **近取诸身**：体察人体自身之耳目口鼻、气血骨骼、脏腑经络；
    * **远取诸物**：归纳社会人际、生产器具、鸟兽性情。

---

## 贰、 极简算法：阴阳二元与三才之道

### 1. 阴阳两爻：宇宙二元二进制码
* **阳爻（—，九）**：代表主动、光明、刚健、发散、自驱、奇数；
* **阴爻（--，六）**：代表顺从、潜藏、柔和、承载、包容、偶数；
* 德国数学家莱布尼茨在接触到邵雍的先天六十四卦方圆图后惊叹，这是人类最早也是最纯粹的二进制数学表达。

### 2. 三画成卦：天、地、人“三才模型”
* 每一单卦由三爻组成，自下而上对应宇宙三维空间结构：
  * **初爻（下）**：**地道**（物质载体、物理环境、现实基础、底层群众）；
  * **中爻（中）**：**人道**（心性修养、人际关系、组织协同、行动决策）；
  * **上爻（上）**：**天道**（客观规律、时代大势、战略方向、终极准则）。
* 人居天地之中，参赞天地之化育，故易经是一门“在天地规律中指导人类行为决策”的知行体系。

---

## 叁、 八卦全息原型与八大自然原力

> 乾坤两卦为阴阳之父母，其余六卦为阴阳交合所生之三男三女。

| 卦名 | 卦画 | 自然物象 | 核心卦德 | 家庭角色 | 能量动力学特征 | 现代心智映射 |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **乾** | ☰ | **天** | **健**（刚健端直） | 父亲 / 统帅 | 纯粹能量喷涌，不息自驱运转 | 创始意志、领导魄力、顶层设计 |
| **坤** | ☷ | **地** | **顺**（厚德载物） | 母亲 / 平台 | 纯粹柔和承载，滋养万物化生 | 资源底盘、交付能力、包容忍耐 |
| **震** | ☳ | **雷** | **动**（奋发破土） | 长男 / 先锋 | 一阳伏于二阴之下，爆发性萌动 | 冲锋破局、冷启动突围、创业先锋 |
| **巽** | ☴ | **风** | **入**（潜移默化） | 长女 / 智囊 | 一阴入于二阳之下，无孔不入渗透 | 战略渗透、心智教育、柔性公关 |
| **坎** | ☵ | **水** | **陷**（险中求通） | 中男 / 涉险者 | 一阳陷于二阴之间，幽深凶险流动 | 逆境生存、危机公关、流动破障 |
| **离** | ☲ | **火** | **丽**（附丽明彻） | 中女 / 启明者 | 一阴丽于二阳之中，外明内虚燃烧 | 品牌曝光、文化指引、洞察觉醒 |
| **艮** | ☶ | **山** | **止**（笃实稳重） | 少男 / 守关者 | 一阳止于二阴之上，巍然不动阻隔 | 风险控制、底线思维、定力坚守 |
| **兑** | ☱ | **泽** | **悦**（和颜悦色） | 少女 / 沟通者 | 一阴悦于二阳之上，滋润喜悦交通 | 用户沟通、商务谈判、价值共享 |

---

## 肆、 空间与时间：先天八卦与后天八卦双螺旋

### 1. 伏羲先天八卦图：宇宙空间的“绝对体态对称”
* **原典**：《说卦传》“天地定位，山泽通气，雷风相薄，水火不相射，八卦相错。”
* **核心结构**：
  * 南乾北坤（天在上，地在下）；
  * 东离西坎（日出于东，水流于西）；
  * 东北震对西南巽（雷与风相对相荡）；
  * 西北艮对东南兑（山与泽水气互通）。
* **哲学真谛**：**体态平衡与永恒稳态**。描述宇宙万物在空间维度上互补对称的本体图景。

### 2. 文王后天八卦图：时间节气与生命流转的“动态运行”
* **原典**：《说卦传》“帝出乎震，齐乎巽，相见乎离，致役乎坤，说言乎兑，战乎乾，劳乎坎，成言乎艮。”
* **核心结构**：
  * **震东（春分 · 发端）** ➔ **巽东南（立夏 · 齐盛）** ➔ **离南（夏至 · 极明）** ➔ **坤西南（立秋 · 涵养）**；
  * **兑西（秋分 · 收获喜悦）** ➔ **乾西北（立冬 · 战伐肃杀）** ➔ **坎北（冬至 · 归藏劳作）** ➔ **艮东北（立春 · 止宿终结并开启下一轮）**。
* **哲学真谛**：**周流不息的时序算法**。描述生命、事业、企业由萌发到繁盛、由衰退到沉淀的不可逆周期流转。

---

## 伍、 万物类象心法：梅花易数的“取象比类”思维

> 八卦不是静态的代码，而是万事万物在不同维度上的全息投射网。

### 1. 什么是“以象知意”？
* 古人认为，宇宙间形形色色的事物，只要内在动力学特征相同，就属于同一“卦象”：
  * 一匹奔腾不息的骏马、一家企业的董事长、一块坚固纯金的手表、人的大脑神经，在动力学上都是“刚健运转”，故统属于**乾金之象**；
  * 一片肥沃广袤的黑土地、一个部门默默支持的后台运营、一辆大卡车载重车、人的脾胃消化系统，在动力学上都是“承载涵养”，故统属于**坤土之象**。

### 2. 避免两个极端误区
* **误区一：机械死记硬背**（以为乾就只能是马、坤只能是牛，脱离了具体语境）；
* **误区二：虚无神秘主义**（以为八卦是玄学预言，忽视了它本质是“系统特征的降维抽象”）。
* **正解**：学八卦，关键在体悟**“八大原力的动态特征”**。见动知震、见险知坎、见止知艮、见悦知兑。

---
"""

with open(out_md, 'w', encoding='utf-8') as f:
    f.write(content_md)
print('SUCCESS: 00_认知基础_01_八卦全息原型.md written! Size:', os.path.getsize(out_md))

# 编译为 HTML 并更新 course_data.js 中的 p0-01 / lesson-zero-1
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
            html_parts.append(f'<div class="step-header" style="margin-top:24px;"><span class="step-badge" style="background:var(--blue-light); color:var(--blue);">理论精要</span><h3 class="step-title">{title}</h3></div>')
        elif l.startswith('| '):
            if in_ul: html_parts.append('</ul>'); in_ul = False
            if in_blockquote: html_parts.append('</blockquote>'); in_blockquote = False
            # 简易表格支持
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

lesson1_html = f'''
<section class="step-section" style="border-left:4px solid var(--blue);">
  {md_to_html(content_md)}
</section>
'''

# 注入 course_data.js
code = open(data_path, encoding='utf-8').read()
json_str = code.replace('window.COURSE = ', '').strip().rstrip(';')
course = json.loads(json_str)

# 找到认知筑基的第一课（p0-01 或 lesson-zero-1）
for part in course['parts']:
    if '认知' in part['title']:
        for topic in part['topics']:
            for les in topic['lessons']:
                if les['id'] in ['p0-01', 'lesson-zero-1']:
                    les['title'] = '第一课 · 天地之象 —— 八卦全息原型与能量建模'
                    les['navTitle'] = '01. 天地八卦原型'
                    les['tag'] = '能量建模'
                    les['motto'] = '近取诸身，远取诸物；八卦成列，象在其中'
                    les['full_rich_html'] = lesson1_html
                    break

with open(data_path, 'w', encoding='utf-8') as f:
    f.write('window.COURSE = ' + json.dumps(course, ensure_ascii=False, indent=2) + ';\n')

print('SUCCESS: Foundation lesson 1 successfully injected into course_data.js!')
