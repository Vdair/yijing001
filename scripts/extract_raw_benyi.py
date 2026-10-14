import re
import os

source_path = r"C:\Users\HiQhb\.gemini\antigravity-ide\brain\5b55faa5-2781-4950-9a67-4956f821040a\.system_generated\steps\24\content.md"

with open(source_path, "r", encoding="utf-8") as f:
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

os.makedirs('data', exist_ok=True)
with open('data/zhouyi_benyi_pure.txt', 'w', encoding='utf-8') as f:
    f.write(body)

print("Saved pure text successfully, length:", len(body))
