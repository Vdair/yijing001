import re
import json

with open('data/zhengyi_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 六十四卦标准顺序列表 (序数, 卦名, 卦体: 下卦+上卦)
# 注意周易正义里的格式通常为 "下卦下上卦上。" 如 "乾下乾上。"
gua_order = [
    (1, "乾为天", "乾下乾上"),
    (2, "坤为地", "坤下坤上"),
    (3, "水雷屯", "震下坎上"),
    (4, "山水蒙", "坎下艮上"),
    (5, "水天需", "乾下坎上"),
    (6, "天水讼", "坎下乾上"),
    (7, "地水师", "坎下坤上"),
    (8, "水地比", "坤下坎上"),
    (9, "风天小畜", "乾下巽上"),
    (10, "天泽履", "兑下乾上"),
    (11, "地天泰", "乾下坤上"),
    (12, "天地否", "坤下乾上"),
    (13, "天火同人", "离下乾上"),
    (14, "火天大有", "乾下离上"),
    (15, "地山谦", "艮下坤上"),
    (16, "雷地豫", "坤下震上"),
    (17, "泽雷随", "震下兑上"),
    (18, "山风蛊", "巽下艮上"),
    (19, "地泽临", "兑下坤上"),
    (20, "风地观", "坤下巽上"),
    (21, "火雷噬嗑", "震下离上"),
    (22, "山火贲", "离下艮上"),
    (23, "山地剥", "坤下艮上"),
    (24, "地雷复", "震下坤上"),
    (25, "天雷无妄", "震下乾上"),
    (26, "山天大畜", "乾下艮上"),
    (27, "山雷颐", "震下艮上"),
    (28, "泽风大过", "巽下兑上"),
    (29, "坎为水", "坎下坎上"),
    (30, "离为火", "离下离上"),
    (31, "泽山咸", "艮下兑上"),
    (32, "雷风恒", "巽下震上"),
    (33, "天山遁", "艮下乾上"),
    (34, "雷天大壮", "乾下震上"),
    (35, "火地晋", "坤下离上"),
    (36, "地火明夷", "离下坤上"),
    (37, "风火家人", "离下巽上"),
    (38, "火泽睽", "兑下离上"),
    (39, "水山蹇", "艮下坎上"),
    (40, "雷水解", "坎下震上"),
    (41, "山泽损", "兑下艮上"),
    (42, "风雷益", "震下巽上"),
    (43, "泽天夬", "乾下兑上"),
    (44, "天风姤", "巽下乾上"),
    (45, "泽地萃", "坤下兑上"),
    (46, "地风升", "巽下坤上"),
    (47, "泽水困", "坎下兑上"),
    (48, "水风井", "巽下坎上"),
    (49, "泽火革", "离下兑上"),
    (50, "火风鼎", "巽下离上"),
    (51, "震为雷", "震下震上"),
    (52, "艮为山", "艮下艮上"),
    (53, "风山渐", "艮下巽上"),
    (54, "雷泽归妹", "兑下震上"),
    (55, "雷火丰", "离下震上"),
    (56, "火山旅", "艮下离上"),
    (57, "巽为风", "巽下巽上"),
    (58, "兑为泽", "兑下兑上"),
    (59, "风水涣", "坎下巽上"),
    (60, "水泽节", "兑下坎上"),
    (61, "风泽中孚", "兑下巽上"),
    (62, "雷山小过", "艮下震上"),
    (63, "水火既济", "离下坎上"),
    (64, "火水未济", "坎下离上"),
]

# 寻找每一卦在文本中的位置
# 卦头通常形如：
# 乾下乾上。乾：
# 震下坎上。屯：
# 兑下乾上。履：
# 有的可能没有冒号，如：
# 坤下乾上。否之匪人
# 巽下兑上。大过：音相过之过。

results = []
current_search_start = 100 # 跳过前面目录

for num, name, structure in gua_order:
    # 查找 structure + [。\.\s]
    # 在当前搜索位置之后找第一个出现的
    pattern = re.compile(rf'(?:(?:上经[^\n]*\n|下经[^\n]*\n)?)\s*{structure}[。.]')
    m = pattern.search(text, current_search_start)
    if m:
        pos = m.start()
        # 获取匹配文本和后续一小段
        snippet = text[pos:pos+100].replace('\n', ' ')
        results.append({
            'num': num,
            'name': name,
            'structure': structure,
            'pos': pos,
            'snippet': snippet
        })
        current_search_start = pos + len(structure)
    else:
        results.append({
            'num': num,
            'name': name,
            'structure': structure,
            'pos': -1,
            'snippet': 'NOT FOUND'
        })

# 检查十翼部分：系辞上卷七, 系辞下卷八, 说卦卷九, 序卦卷十, 杂卦卷十一
shiyi_sections = [
    ('系辞上传', r'系辞上卷七'),
    ('系辞下传', r'系辞下卷八'),
    ('说卦传', r'说卦卷九'),
    ('序卦传', r'序卦卷十'),
    ('杂卦传', r'杂卦卷十一')
]

shiyi_results = []
for sname, spat in shiyi_sections:
    matches = list(re.finditer(spat, text))
    # 目录之后的那次出现
    real_match = [m for m in matches if m.start() > 1000]
    if real_match:
        pos = real_match[0].start()
        snippet = text[pos:pos+100].replace('\n', ' ')
        shiyi_results.append({'name': sname, 'pos': pos, 'snippet': snippet})
    else:
        shiyi_results.append({'name': sname, 'pos': -1, 'snippet': 'NOT FOUND'})

with open('data/zhengyi_analysis.json', 'w', encoding='utf-8') as f:
    json.dump({'64guas': results, 'shiyi': shiyi_results}, f, ensure_ascii=False, indent=2)

print('Analyzed zhengyi structure, saved to data/zhengyi_analysis.json')
