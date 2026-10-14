import re

with open('data/wikisource_benyi_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

missing_11 = [
    ("22", "贲", "賁"),
    ("23", "剥", "剝"),
    ("24", "复", "復"),
    ("25", "无妄", "无妄"),
    ("26", "大畜", "大畜"),
    ("27", "颐", "頤"),
    ("28", "大过", "大過"),
    ("29", "坎", "坎"),
    ("30", "离", "離"),
    ("43", "夬", "夬"),
    ("44", "姤", "姤")
]

with open('data/missing_11_check.txt', 'w', encoding='utf-8') as out:
    for num, s_name, t_name in missing_11:
        # 查找
        pos = text.find(t_name)
        pos_s = text.find(s_name)
        out.write(f"[{num}] {s_name}/{t_name}: pos_trad={pos}, pos_simp={pos_s}\n")
        # 找爻辞特征，如 六二 或 初九
        p = rf'({t_name}[^\n]+亨)'
        m = re.findall(p, text)
        if m:
            out.write(f"   卦辞: {m[0]}\n")
        else:
            out.write(f"   卦辞: not found by simple regex\n")

print("Saved check to data/missing_11_check.txt")
