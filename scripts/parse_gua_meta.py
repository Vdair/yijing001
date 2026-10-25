import json
import re

# 读取 course_data.js 并提取所有 lesson
with open('course_data.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 去除开头的 window.COURSE =
json_str = re.sub(r'^\s*window\.COURSE\s*=\s*', '', content.strip())
# 去除结尾的分号
json_str = json_str.rstrip(';')

data = json.loads(json_str)

gua_list = []
for part in data.get('parts', []):
    if part.get('id') == 'p-0':
        continue
    for topic in part.get('topics', []):
        for lesson in topic.get('lessons', []):
            gua_list.append({
                'id': lesson.get('id'),
                'title': lesson.get('title'),
                'navTitle': lesson.get('navTitle'),
                'symbol': lesson.get('symbol'),
                'upper': lesson.get('upper'),
                'lower': lesson.get('lower'),
                'lines': lesson.get('lines'),
                'motto': lesson.get('motto', ''),
                'part_title': part.get('title'),
                'part_num': part.get('num')
            })

print(f"Total Gua found: {len(gua_list)}")
if gua_list:
    print(f"Sample 1: {gua_list[0]['id']} lines: {gua_list[0]['lines']}")
    print(f"Sample 64: {gua_list[-1]['id']} lines: {gua_list[-1]['lines']}")
