import re

with open("data/zhouyi_benyi_pure.txt", "r", encoding="utf-8") as f:
    text = f.read()

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
for idx, name in enumerate(gua_order, 1):
    # 朱熹本义中通常格式为：
    # 乾下，乾上。\n\n乾：... 或 乾下乾上。乾：
    # 也有可能是繁体字或没有冒号，如 "同人于野"
    patterns = [
        rf'([乾坤震巽坎离艮兑]下[，,\s]*[乾坤震巽坎离艮兑]上[。.\s\n]*{name}[:：\s])',
        rf'([乾坤震巽坎离艮兑]下[，,\s]*[乾坤震巽坎离艮兑]上[。.\s\n]*{name}[^，。]+[，。])',
        rf'(\n\s*{name}[:：][^\n]+)'
    ]
    matched = None
    for p in patterns:
        m = list(re.finditer(p, text))
        if m:
            matched = (m[0].start(), m[0].group(1))
            break
    if matched:
        results.append(f"{idx:02d} {name}: FOUND at {matched[0]} -> {matched[1][:30]!r}")
    else:
        results.append(f"{idx:02d} {name}: NOT FOUND")

with open("data/match_results.txt", "w", encoding="utf-8") as f:
    f.write("\n".join(results))

print("Results written to data/match_results.txt")
