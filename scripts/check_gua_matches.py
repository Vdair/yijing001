import re

with open("data/zhouyi_benyi_pure.txt", "r", encoding="utf-8") as f:
    text = f.read()

# 找出所有的 卦名 和 结构特征
# 通常朱熹本义中每卦开始形式如：
# 乾下，乾上。
# 坤下，坤上。
# 震下，坎上。屯：元亨...
# 或者 卦名：...

# 我们看看 64 卦的文王序列表
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

print("Scanning 64 gua occurrences in text...")
found = []
for name in gua_order:
    # 查找诸如 "乾下，乾上" 或 "艮下，坎上" 等八卦上下组合模式
    pattern = rf'([乾坤震巽坎离艮兑]下[，,]\s*[乾坤震巽坎离艮兑]上[。.\n\s]*{name}[:：])'
    m = list(re.finditer(pattern, text))
    if m:
        found.append((name, m[0].start(), m[0].group(1)))
    else:
        # 尝试匹配 name[:：]
        p2 = rf'({name}[:：][^\n]+)'
        m2 = list(re.finditer(p2, text))
        if m2:
            found.append((name, m2[0].start(), "fallback: " + m2[0].group(1)[:30]))
        else:
            found.append((name, -1, "NOT FOUND"))

missing = [name for name, pos, note in found if pos == -1]
print(f"Total found: {len(found) - len(missing)} / 64")
if missing:
    print(f"Missing: {missing}")
else:
    print("All 64 gua matched perfectly!")
