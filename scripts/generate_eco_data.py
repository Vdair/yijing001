import json
import re

# 读取 course_data.js 并解析
with open('course_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

json_str = re.sub(r'^\s*window\.COURSE\s*=\s*', '', content.strip()).rstrip(';')
data = json.loads(json_str)

lessons = []
lines_to_idx = {}

idx = 0
for part in data.get('parts', []):
    if part.get('id') == 'p-0':
        continue
    p_title = part.get('title')
    p_num = part.get('num')
    for topic in part.get('topics', []):
        for lesson in topic.get('lessons', []):
            lines = lesson.get('lines')
            lines_tuple = tuple(lines)
            lessons.append({
                'idx': idx,
                'id': lesson.get('id'),
                'title': lesson.get('title'),
                'navTitle': lesson.get('navTitle'),
                'symbol': lesson.get('symbol'),
                'upper': lesson.get('upper'),
                'lower': lesson.get('lower'),
                'lines': lines,
                'motto': lesson.get('motto', ''),
                'part_title': p_title,
                'part_num': p_num
            })
            lines_to_idx[lines_tuple] = idx
            idx += 1

print(f"Loaded {len(lessons)} lessons.")

# 验证错综互
# 错卦：每个爻取反
# 综卦：颠倒整个列表
# 互卦：二三四爻为下卦，三四五爻为上卦 (lines[1], lines[2], lines[3], lines[2], lines[3], lines[4])

# 12 消息卦列表 (二进制 lines 从初爻到上爻)
# 复: [1,0,0,0,0,0] 1阳
# 临: [1,1,0,0,0,0] 2阳
# 泰: [1,1,1,0,0,0] 3阳
# 大壮: [1,1,1,1,0,0] 4阳
# 夬: [1,1,1,1,1,0] 5阳
# 乾: [1,1,1,1,1,1] 6阳
# 姤: [0,1,1,1,1,1] 1阴5阳
# 遁: [0,0,1,1,1,1] 2阴4阳
# 否: [0,0,0,1,1,1] 3阴3阳
# 观: [0,0,0,0,1,1] 4阴2阳
# 剥: [0,0,0,0,0,1] 5阴1阳
# 坤: [0,0,0,0,0,0] 6阴

pi_gua_map = {
    (1,0,0,0,0,0): ("复卦", "冬至·一阳生（农历十一月·子）"),
    (1,1,0,0,0,0): ("临卦", "大寒·二阳生（农历十二月·丑）"),
    (1,1,1,0,0,0): ("泰卦", "立春·三阳开泰（农历正月·寅）"),
    (1,1,1,1,0,0): ("大壮卦", "春分·四阳炽盛（农历二月·卯）"),
    (1,1,1,1,1,0): ("夬卦", "清明·五阳决阴（农历三月·辰）"),
    (1,1,1,1,1,1): ("乾卦", "立夏·纯阳极盛（农历四月·巳）"),
    (0,1,1,1,1,1): ("姤卦", "夏至·一阴始生（农历五月·午）"),
    (0,0,1,1,1,1): ("遁卦", "大暑·二阴渐长（农历六月·未）"),
    (0,0,0,1,1,1): ("否卦", "立秋·阴盛阳衰（农历七月·申）"),
    (0,0,0,0,1,1): ("观卦", "秋分·四阴肃杀（农历八月·酉）"),
    (0,0,0,0,0,1): ("剥卦", "霜降·硕果仅存（农历九月·戌）"),
    (0,0,0,0,0,0): ("坤卦", "立冬·纯阴归藏（农历十月·亥）")
}

eco_data = []

for l in lessons:
    lines = l['lines']
    # 错卦
    cuo_lines = tuple(1 - x for x in lines)
    cuo_idx = lines_to_idx.get(cuo_lines)
    
    # 综卦
    zong_lines = tuple(reversed(lines))
    zong_idx = lines_to_idx.get(zong_lines)
    
    # 互卦
    # 下卦为 2,3,4 爻（索引 1,2,3），上卦为 3,4,5 爻（索引 2,3,4）
    hu_lines = (lines[1], lines[2], lines[3], lines[2], lines[3], lines[4])
    hu_idx = lines_to_idx.get(hu_lines)
    
    # 序卦
    prev_idx = (l['idx'] - 1 + 64) % 64
    next_idx = (l['idx'] + 1) % 64
    
    lines_tuple = tuple(lines)
    pi_info = pi_gua_map.get(lines_tuple, None)
    
    # 提取纯卦名，如 "01_乾为天" -> "乾为天"
    clean_name = re.sub(r'^lesson-\d+_', '', l['id'])
    
    eco_data.append({
        'idx': l['idx'],
        'id': l['id'],
        'name': clean_name,
        'navTitle': l['navTitle'],
        'symbol': l['symbol'],
        'lines': lines,
        'yangCount': sum(lines),
        'upper': l['upper'],
        'lower': l['lower'],
        'motto': l['motto'],
        'partTitle': l['part_title'],
        'partNum': l['part_num'],
        'cuo': {'idx': cuo_idx, 'name': lessons[cuo_idx]['navTitle'] if cuo_idx is not None else ''},
        'zong': {'idx': zong_idx, 'name': lessons[zong_idx]['navTitle'] if zong_idx is not None else ''},
        'hu': {'idx': hu_idx, 'name': lessons[hu_idx]['navTitle'] if hu_idx is not None else ''},
        'prev': {'idx': prev_idx, 'name': lessons[prev_idx]['navTitle']},
        'next': {'idx': next_idx, 'name': lessons[next_idx]['navTitle']},
        'isPiGua': bool(pi_info),
        'piInfo': pi_info[1] if pi_info else ''
    })

print(f"Generated {len(eco_data)} entries.")
print(f"Check 0 (Qian): cuo={eco_data[0]['cuo']}, zong={eco_data[0]['zong']}, hu={eco_data[0]['hu']}")
print(f"Check 2 (Chun): cuo={eco_data[2]['cuo']}, zong={eco_data[2]['zong']}, hu={eco_data[2]['hu']}")

# 写入 assets/eco_data.js
js_output = "window.ECO_DATA = " + json.dumps(eco_data, ensure_ascii=False, indent=2) + ";\n"
with open('assets/eco_data.js', 'w', encoding='utf-8') as f:
    f.write(js_output)

print("Saved to assets/eco_data.js successfully.")
