import re

with open('data/zhouyi_zhengyi_raw.html', 'r', encoding='utf-8') as f:
    html = f.read()

start_marker = '<div class="markdown-content">'
start_idx = html.find(start_marker)
if start_idx != -1:
    body = html[start_idx + len(start_marker):]
    end_marker = '<footer'
    end_idx = body.find(end_marker)
    if end_idx != -1:
        body = body[:end_idx]
else:
    body = html

body = re.sub(r'<br\s*/?>', '\n', body)
body = re.sub(r'</p>\s*<p>', '\n\n', body)
body = re.sub(r'<[^>]+>', '', body)
body = re.sub(r'\n{3,}', '\n\n', body)

with open('data/zhengyi_clean.txt', 'w', encoding='utf-8') as out:
    out.write(body)

print(f"Cleaned Zhouyi Zhengyi length: {len(body)}")
