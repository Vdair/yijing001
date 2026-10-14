import re

with open('data/yichuan_fixed_tags.txt', 'r', encoding='utf-8') as f:
    lines = f.readlines()

found_names = []
for l in lines:
    # 提取序卦前的名字
    m = re.search(r'【([乾坤震巽坎离艮兑]+下[乾坤震巽坎离艮兑]+上)】\s*([^\s]{1,4})(序卦|元亨|卦|利)', l)
    if m:
        found_names.append(m.group(2))
    else:
        # fallback
        m2 = re.search(r'【([乾坤震巽坎离艮兑]+下[乾坤震巽坎离艮兑]+上)】\s*([^\s]{1,4})', l)
        if m2:
            found_names.append(m2.group(2))

GUA_64 = [
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

missing = [g for g in GUA_64 if not any(g in fn for fn in found_names)]

with open('data/missing_3_names.txt', 'w', encoding='utf-8') as out:
    out.write(f"Missing ({len(missing)}): {missing}\n\n")
    out.write("Found names:\n" + "\n".join(found_names))

print(f"Missing {len(missing)} gua names!")
