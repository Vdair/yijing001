import os
import re
import json

# 读取结构数据
with open('data/zhengyi_clean.txt', 'r', encoding='utf-8') as f:
    full_text = f.read()

with open('data/zhengyi_analysis.json', 'r', encoding='utf-8') as f:
    analysis = json.load(f)

guas = analysis['64guas']
shiyi = analysis['shiyi']

output_dir = '05_易学经典原典馆/03_周易正义_孔颖达'
os.makedirs(output_dir, exist_ok=True)

# 64卦二进制码对照表
BIN_MAP = {
    1: '111111', 2: '000000', 3: '100010', 4: '010001',
    5: '111010', 6: '010111', 7: '010000', 8: '000010',
    9: '111011', 10: '110111', 11: '111000', 12: '000111',
    13: '101111', 14: '111101', 15: '001000', 16: '000100',
    17: '100110', 18: '011001', 19: '110000', 20: '000011',
    21: '100101', 22: '101001', 23: '000001', 24: '100000',
    25: '100111', 26: '111001', 27: '100001', 28: '011110',
    29: '010010', 30: '101101', 31: '001110', 32: '011100',
    33: '001111', 34: '111100', 35: '000101', 36: '101000',
    37: '101011', 38: '110101', 39: '001010', 40: '010100',
    41: '110001', 42: '100011', 43: '111110', 44: '011111',
    45: '000110', 46: '011000', 47: '010110', 48: '011010',
    49: '101110', 50: '011101', 51: '100100', 52: '001001',
    53: '001011', 54: '110100', 55: '101100', 56: '001101',
    57: '011011', 58: '110110', 59: '010011', 60: '110010',
    61: '110011', 62: '001100', 63: '101010', 64: '010101'
}

# 格式化卦正文：对经文、注、疏进行清晰的层级标注
def format_zhengyi_body(raw_body):
    lines = raw_body.strip().split('\n')
    formatted = []
    
    # 关键词正则
    yao_pat = re.compile(r'^\s*(初九|初六|九二|六二|九三|六三|九四|六四|九五|六五|上九|上六|用九|用六)[：:]')
    tuan_pat = re.compile(r'^\s*《彖》曰[：:]?')
    xiang_pat = re.compile(r'^\s*《象》曰[：:]?')
    wenyan_pat = re.compile(r'^\s*《文言》曰[：:]?')
    shu_pat = re.compile(r'^\s*\[疏\](.*)')
    juan_pat = re.compile(r'^\s*(上经[^\n]*卷[^\n]*|下经[^\n]*卷[^\n]*)')
    
    for line in lines:
        l = line.strip()
        if not l:
            continue
        
        # 卷名标题
        if juan_pat.match(l):
            formatted.append(f"\n> **卷帙**：{l}\n")
            continue
        
        # 爻位标题
        m_yao = yao_pat.match(l)
        if m_yao:
            formatted.append(f"\n### 爻位【{m_yao.group(1)}】\n\n**经注**：{l}\n")
            continue
        
        # 彖曰
        if tuan_pat.match(l):
            formatted.append(f"\n### 《彖传》王注与孔疏\n\n**经注**：{l}\n")
            continue
            
        # 象曰
        if xiang_pat.match(l):
            formatted.append(f"\n### 《象传》王注与孔疏\n\n**经注**：{l}\n")
            continue
            
        # 文言曰
        if wenyan_pat.match(l):
            formatted.append(f"\n### 《文言传》王注与孔疏\n\n**经注**：{l}\n")
            continue
            
        # 孔疏
        m_shu = shu_pat.match(l)
        if m_shu:
            formatted.append(f"\n> 📖 **孔颖达〔正义疏解〕**：  \n> {m_shu.group(1)}\n")
            continue
            
        # 其他正文行（王弼注或经文）
        formatted.append(f"{l}\n")
        
    return '\n'.join(formatted)

# 1. 生成 00_周易正义序_孔颖达.md
xu_content = """---
title: 周易正义序
author: 〔唐〕孔颖达
book: 周易正义（十三经注疏本）
type: 原序导读
edition: 十三经注疏·阮元校刻本
---

# 周易正义序 · 〔唐〕国子祭酒 孔颖达 撰

> **历史地位**：唐贞观年间奉太宗李世民诏敕编纂《五经正义》，孔颖达领衔颜师古、司马才仲等名儒，博考汉魏晋唐诸家章句，易学独宗魏王弼、晋韩康伯之注，是为中国官方易学集大成之定本。
> **治易旨要**：扫汉儒互体、纳甲、飞伏、五行谶纬之繁琐，专明玄理人事，以义理畅达易道，极具思辨之光。

---

## 📜 《五经正义·周易正义序》提要与易学七论

夫《易》者，象也。爻者，效也。圣人有以仰观俯察，象天地而育群品，云行雨施，品物流形。若乃道济天下，德被生民，发弘大业，彰往察来，非圣人莫之能作，非圣人莫之能述。

孔颖达于正义发端，设“易学七论”以统括全经大旨：

### 第一论：明易之三名
引《易纬乾凿度》云：“易一名而含三义：所谓易也，变易也，不易也。”
- **易者简易**：天道自然，至简至易，行乎其所不得不行。
- **变易**：阴阳迁移，天地交运，六十四卦三百八十四爻时刻化生无常。
- **不易**：虽万变纷呈，而其刚柔往复之大则、生生不息之天理历劫常存。

### 第二论：论重卦之人
考辨重卦究竟本于伏羲、神农、夏禹或文王。孔氏博核群籍，断定：伏羲仰观俯察，始画八卦，因而重之以为六十四卦；神农、黄帝、尧、舜因之而施政治；文王拘于羑里，系卦辞以系民用；周公居摄，作爻辞以明占断；孔子晚而好《易》，作《十翼》以阐天人之极。

### 第三论：论三代易名之别
- 夏曰《连山》：以艮为首，山象之重出，象征云气出内其中，取其万物山出之象。
- 商曰《归藏》：以坤为首，万物莫不归藏于地，万物归聚之义。
- 周曰《周易》：周代之书，兼取周普、周备、周流无所不备之义。

### 第四论：论上下经卦数篇第
文王以乾坤为首，坎离为终，三十卦为上经，明生生天道之运；以咸恒为始，既济未济为终，三十四卦为下经，明人伦夫妇夫妇之道。

### 第五论：论夫子十翼
孔子赞易，作《彖》上下、《象》上下、《文言》、《系辞》上下、《说卦》、《序卦》、《杂卦》，合为十翼，羽翼斯经，以发幽显之奥。

### 第六论：论传易之源流
自商瞿受易于夫子，历汉代田何、丁宽、施、孟、梁丘、京房、费直、高相之传，至魏晋王辅嗣（王弼）、韩康伯起，力黜象数流弊，标举名理玄旨。

### 第七论：论所用王韩之注
唐代修《正义》，诸经皆定注疏，易学独取王弼注六十四卦、《文言》、《彖》、《象》，韩康伯注《系辞》、《说卦》、《序卦》、《杂卦》，盖以“王辅嗣清辞畅旨，研几穷理，独超前古”。孔颖达疏文博引先儒，考核同异，成百代易学之不刊巨典。
"""

with open(os.path.join(output_dir, '00_周易正义序_孔颖达.md'), 'w', encoding='utf-8') as f:
    f.write(xu_content)

print("Generated 00_周易正义序_孔颖达.md")

# 2. 生成 64 卦
for i in range(len(guas)):
    g = guas[i]
    num = g['num']
    name = g['name']
    struct = g['structure']
    start_pos = g['pos']
    
    # 终点位置：下一卦的起点，若是第64卦则是系辞上传的起点
    if i < len(guas) - 1:
        end_pos = guas[i+1]['pos']
    else:
        end_pos = shiyi[0]['pos']
        
    raw_content = full_text[start_pos:end_pos]
    
    # 去除开头的“上经乾传卷一”等重复行（如果在 format_zhengyi_body 会被识别为卷帙）
    body_formatted = format_zhengyi_body(raw_content)
    
    bin_code = BIN_MAP.get(num, '')
    
    file_title = f"{num:02d}_{name}.md"
    file_path = os.path.join(output_dir, file_title)
    
    md_content = f"""---
title: 周易正义 · {name}
author: 〔魏〕王弼 注 / 〔唐〕孔颖达 疏
book: 周易正义（十三经注疏本）
gua_id: {num}
gua_name: {name}
edition: 十三经注疏·阮元校刻本
---

# 周易正义 · 第 {num:02d} 卦 · {name}

> **卦体**：{struct}  
> **二进制码**：`{bin_code}`  
> **学派属性**：魏晋玄学开山义理派（王弼注）· 汉唐经学集大成正义（孔颖达疏）  

---

## 📜 经文、王弼注与孔颖达疏

{body_formatted}
"""
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(md_content)

print(f"Generated all 64 guas in {output_dir}")

# 3. 生成十翼传文 (65 ~ 69)
shiyi_files = [
    (65, "系辞上传", shiyi[0]['pos'], shiyi[1]['pos']),
    (66, "系辞下传", shiyi[1]['pos'], shiyi[2]['pos']),
    (67, "说卦传", shiyi[2]['pos'], shiyi[3]['pos']),
    (68, "序卦传", shiyi[3]['pos'], shiyi[4]['pos']),
    (69, "杂卦传", shiyi[4]['pos'], len(full_text)),
]

for num, sname, spos, epos in shiyi_files:
    raw_c = full_text[spos:epos]
    body_fmt = format_zhengyi_body(raw_c)
    
    fpath = os.path.join(output_dir, f"{num:02d}_{sname}.md")
    content = f"""---
title: 周易正义 · {sname}
author: 〔晋〕韩康伯 注 / 〔唐〕孔颖达 疏
book: 周易正义（十三经注疏本）
type: 十翼义理释微
edition: 十三经注疏·阮元校刻本
---

# 周易正义 · 卷帙翼传 · {sname}

> **注疏名家**：晋韩康伯注，唐国子祭酒孔颖达疏  
> **学派旨趣**：畅明大衍筮法、时空化育与天人名理，为易学哲理最高思辨之所存。  

---

## 📜 经传原文、韩康伯注与孔颖达疏解

{body_fmt}
"""
    with open(fpath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Generated all 5 shiyi files in Zhouyi Zhengyi")
