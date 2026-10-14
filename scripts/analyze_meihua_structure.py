import re

with open('data/meihua_clean.txt', 'r', encoding='utf-8') as f:
    lines = [l.strip() for l in f]

results = []
for i, l in enumerate(lines):
    if re.search(r'^(?:梅花易数|卷[一二三四五]|序|象数起例|天根月窟|八卦万物属类|体用总诀|三要十应|观梅占|牡丹占|邻夜扣门借物占)', l):
        snippet = ' '.join(lines[i:i+3])
        results.append(f"Line {i}: {l} | {snippet[:100]}")

with open('data/meihua_analysis.txt', 'w', encoding='utf-8') as out:
    out.write('\n'.join(results))

print("Saved analysis to data/meihua_analysis.txt")
