import re

with open('data/zhengyi_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 查找所有 【某下某上】 或 某下某上。
# 在正义中，格式如：乾下乾上。 或 坤下坤上。
pattern = r'([乾坤震巽坎离艮兑]+下[乾坤震巽坎离艮兑]+上[。.\s\n]*)'
matches = list(re.finditer(pattern, text))

print(f"Total matches in Zhouyi Zhengyi: {len(matches)}")

with open('data/zhengyi_all_tags.txt', 'w', encoding='utf-8') as out:
    for i, m in enumerate(matches):
        snippet = text[m.start():m.start()+60].replace('\n', ' ')
        out.write(f"{i+1:02d}: {snippet}\n")

print("Saved tags to data/zhengyi_all_tags.txt")
