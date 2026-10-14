import re
import json

with open('data/huangji_clean.txt', 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f if line.strip()]

print(f"Total lines: {len(lines)}")

# 查找所有篇、卷、节标志
chapters = []
for idx, line in enumerate(lines):
    # 匹配诸如：观物篇第十一、观物篇第十二、观物外篇、卷一、以会统运 等
    if re.search(r'^(?:观物篇|观物内篇|观物外篇|卷[一二三四五六七八九十百]+|皇极经世书?[卷篇]|以[会运世]统[运世年])', line):
        snippet = ' '.join(lines[idx:idx+4])
        chapters.append({
            'line_idx': idx,
            'title': line,
            'snippet': snippet[:120]
        })

print(f"Found {len(chapters)} chapter headers.")
with open('data/huangji_chapters.json', 'w', encoding='utf-8') as f:
    json.dump(chapters, f, ensure_ascii=False, indent=2)

print("Saved to data/huangji_chapters.json")
