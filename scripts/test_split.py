import re

# 我们同时在殆知阁文本和四库本中测试
with open('data/zhouyi_benyi_pure.txt', 'r', encoding='utf-8') as f:
    daizhi = f.read()

with open('data/wikisource_benyi_clean.txt', 'r', encoding='utf-8') as f:
    wiki = f.read()

pattern = r'([乾坤震巽坎离艮兑乾坤震巽坎離艮兌]下[，,\s]*[乾坤震巽坎离艮兑乾坤震巽坎離艮兌]上)'

daizhi_matches = list(re.finditer(pattern, daizhi))
wiki_matches = list(re.finditer(pattern, wiki))

with open('data/split_test.txt', 'w', encoding='utf-8') as out:
    out.write(f"Daizhi matches: {len(daizhi_matches)}\n")
    out.write(f"Wiki matches: {len(wiki_matches)}\n\n")
    out.write("--- Wiki Matches Preview ---\n")
    for i, m in enumerate(wiki_matches):
        snippet = wiki[m.start():m.start()+40].replace('\n', ' ')
        out.write(f"{i+1:02d}: {snippet}\n")

print(f"Daizhi: {len(daizhi_matches)}, Wiki: {len(wiki_matches)}")
