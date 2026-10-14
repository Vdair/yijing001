import os
import re

with open('data/wikisource_benyi_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

TRAD_MAP = {
    '畫': '画', '陰': '阴', '陽': '阳', '數': '数', '極': '极', '說': '说', '變': '变', '應': '应',
    '無': '无', '為': '为', '與': '与', '體': '体', '處': '处', '時': '时', '進': '进', '退': '退',
    '義': '义', '節': '节', '剛': '刚', '柔': '柔', '聖': '圣', '傳': '传', '象': '象', '辭': '辞',
    '繫': '系', '雜': '杂', '釋': '释', '謂': '谓', '蓋': '盖', '發': '发', '觀': '观', '見': '见'
}

def to_simp(txt):
    for k, v in TRAD_MAP.items():
        txt = txt.replace(k, v)
    return txt

sections = [
    ("65_系辞上传.md", "系辞上传", ["周易本義卷七", "繫辭上傳", "繫辭上"]),
    ("66_系辞下传.md", "系辞下传", ["周易本義卷八", "繫辭下傳", "繫辭下"]),
    ("67_文言传.md", "文言传", ["周易本義卷九", "文言傳"]),
    ("68_说卦传.md", "说卦传", ["周易本義卷十", "說卦傳"]),
    ("69_序卦传.md", "序卦传", ["周易本義卷十一", "序卦傳"]),
    ("70_杂卦传.md", "杂卦传", ["周易本義卷十二", "雜卦傳"])
]

out_dir = "05_易学经典原典馆/01_周易本义_朱熹"

for filename, title, markers in sections:
    pos = -1
    for m in markers:
        p = text.find(m)
        if p != -1:
            pos = p
            break
    
    if pos != -1:
        # 取该传文本（约 5000~10000 字符）
        raw_part = text[pos:pos+15000]
        # 寻找下一卷标记
        next_markers = ["周易本義卷", "筮儀", "圖目", "附錄"]
        end_p = len(raw_part)
        for nm in next_markers:
            np = raw_part.find(nm, 200)
            if np != -1 and np < end_p:
                end_p = np
        
        part_content = to_simp(raw_part[:end_p].strip())
        part_content = re.sub(r'○', '\n\n', part_content)
        part_content = re.sub(r'[〈《]', '【', part_content)
        part_content = re.sub(r'[〉》]', '】', part_content)
        
        doc = [
            "---",
            f"title: 周易本义 · {title}",
            "author: 〔南宋〕朱熹",
            "book: 周易本义",
            "edition: 四库全书馆藏本 / 宋咸淳吴革刊本校勘",
            "---",
            "",
            f"# 周易本义 · {title}",
            "",
            "> **作者**：〔南宋〕朱熹（文公）  ",
            "> **说明**：孔子《十翼》传文之朱熹本义章句疏解。  ",
            "",
            "---",
            "",
            "## 📜 经传正文与本义注疏",
            "",
            part_content,
            ""
        ]
        
        file_path = os.path.join(out_dir, filename)
        with open(file_path, "w", encoding="utf-8") as out:
            out.write("\n".join(doc))
        print(f"Generated {filename}, size: {len(part_content)}")
    else:
        print(f"Marker not found for {title}")
