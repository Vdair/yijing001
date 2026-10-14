import re

with open('data/yichuan_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 查找所有 【某下某上】
pattern = r'【([干乾坤震巽坎离離艮兑兌]+下[干乾坤震巽坎离離艮兑兌]+上)】'
matches = list(re.finditer(pattern, text))

print(f"Total matches for 【下上】: {len(matches)}")

with open('data/yichuan_all_gua_tags.txt', 'w', encoding='utf-8') as out:
    for i, m in enumerate(matches):
        start = m.start()
        # 取后面 50 个字
        snippet = text[start:start+60].replace('\n', ' ')
        out.write(f"{i+1:02d}: {snippet}\n")

print("Saved all gua tags to data/yichuan_all_gua_tags.txt")
