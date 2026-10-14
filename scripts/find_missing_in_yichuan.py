with open('data/yichuan_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# 检查每个卦名在哪
from scripts.build_full_yichuan_yizhuan import GUA_DEFS

missing_gids = []
for gid, full, short, struct, bin_code in GUA_DEFS:
    # 查找 short + 序卦 或 short + 卦
    p1 = f"{short}序卦"
    p2 = f"{short}卦"
    p3 = struct
    if p1 not in text and p2 not in text and p3 not in text and short not in text:
        missing_gids.append((gid, full))
    else:
        # 查看是否在 blocks 里
        pass

print("Missing gids:", missing_gids)
