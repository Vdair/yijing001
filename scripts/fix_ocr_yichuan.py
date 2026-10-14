import re

with open('data/yichuan_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 校正 OCR 错别字：八卦中的“防”实际上是“巽”！
# 还有没有其他的？比如“兌”误为“兑”已包含
text_fixed = re.sub(r'【([干乾坤震巽坎离離艮兑兌防]+下[干乾坤震巽坎离離艮兑兌防]+上)】', 
                    lambda m: m.group(0).replace('防', '巽').replace('干', '乾'), text)

pattern = r'【([乾坤震巽坎离離艮兑兌]+下[乾坤震巽坎离離艮兑兌]+上)】'
matches = list(re.finditer(pattern, text_fixed))

print(f"Total matches after fix: {len(matches)}")
with open('data/yichuan_fixed_tags.txt', 'w', encoding='utf-8') as out:
    for i, m in enumerate(matches):
        snippet = text_fixed[m.start():m.start()+60].replace('\n', ' ')
        out.write(f"{i+1:02d}: {snippet}\n")

print("Saved to data/yichuan_fixed_tags.txt")
