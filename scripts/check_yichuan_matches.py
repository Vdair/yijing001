import re

with open('data/yichuan_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 检查开头部分和序言
print("=== Head snippet (first 500 chars) ===")
with open('data/yichuan_head.txt', 'w', encoding='utf-8') as out:
    out.write(text[:1500])

# 检查 64 卦文王序卦名匹配
gua_order = [
    "乾", "坤", "屯", "蒙", "需", "讼", "师", "比",
    "小畜", "履", "泰", "否", "同人", "大有", "谦", "豫",
    "随", "蛊", "临", "观", "噬嗑", "贲", "剥", "复",
    "无妄", "大畜", "颐", "大过", "坎", "离",
    "咸", "恒", "遁", "大壮", "晋", "明夷", "家人", "睽",
    "蹇", "解", "损", "益", "夬", "姤", "萃", "升",
    "困", "井", "革", "鼎", "震", "艮", "渐", "归妹",
    "丰", "旅", "巽", "兑", "涣", "节", "中孚", "小过",
    "既济", "未济"
]

results = []
found_count = 0
for idx, name in enumerate(gua_order, 1):
    # 程颐易传中，卦名通常以：
    # ䷀乾 或 乾卦 或 乾： 或 乾下乾上 或 卦名在行首
    patterns = [
        rf'([䷀-䷿]?\s*{name}卦)',
        rf'(\n\s*{name}[:：\s][^\n]+)',
        rf'([乾坤震巽坎离艮兑]下[，,\s]*[乾坤震巽坎离艮兑]上[。.\s\n]*{name})',
        rf'(\n\s*{name}\n)'
    ]
    matched = None
    for p in patterns:
        m = list(re.finditer(p, text))
        if m:
            matched = (m[0].start(), m[0].group(1))
            break
    if matched:
        found_count += 1
        results.append(f"{idx:02d} {name}: FOUND at {matched[0]} -> {matched[1][:30]!r}")
    else:
        results.append(f"{idx:02d} {name}: NOT FOUND")

with open('data/yichuan_matches.txt', 'w', encoding='utf-8') as out:
    out.write(f"Matched {found_count} / 64 gua in Yichuan Yizhuan!\n\n" + "\n".join(results))

print(f"Matched {found_count} / 64 gua in Yichuan Yizhuan!")
