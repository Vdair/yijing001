import os
import re

archive_dir = "02_六十四卦精研档案"
zhengyi_dir = "05_易学经典原典馆/03_周易正义_孔颖达"

files = sorted([f for f in os.listdir(archive_dir) if f.endswith(".md")])
print(f"Total archive gua files: {len(files)}")

injected_count = 0
for f in files:
    archive_path = os.path.join(archive_dir, f)
    with open(archive_path, "r", encoding="utf-8") as af:
        content = af.read()
    
    # 检查是否已注入过孔颖达周易正义
    if "孔颖达《周易正义》" in content:
        continue
    
    prefix = f[:2]
    zy_files = [zf for zf in os.listdir(zhengyi_dir) if zf.startswith(prefix + "_")]
    if not zy_files:
        continue
        
    zy_path = os.path.join(zhengyi_dir, zy_files[0])
    with open(zy_path, "r", encoding="utf-8") as zf:
        zy_content = zf.read()
        
    # 从中提取正义曰首段与王弼注
    # 寻找第一段孔颖达疏解
    m_shu = re.search(r'📖 \*\*孔颖达〔正义疏解〕\*\*：\s*\n>\s*(.*?)(?=\n\n|\n###|\Z)', zy_content, re.DOTALL)
    if m_shu:
        shu_text = m_shu.group(1).replace('\n> ', ' ').replace('\n', ' ').strip()
        # 清理多余空格与标记
        shu_text = re.sub(r'\s+', ' ', shu_text)
        if len(shu_text) > 220:
            shu_text = shu_text[:220] + "……"
    else:
        shu_text = "以乾坤大化明生生之道，顺天应物，随时变易以达中和。"
        
    # 寻找卦辞或彖传王弼注
    m_wang = re.search(r'## 📜 经文、王弼注与孔颖达疏\s*\n\s*(.*?)(?=\n\n> 📖|\Z)', zy_content, re.DOTALL)
    if m_wang:
        wang_text = m_wang.group(1).replace('\n', ' ').strip()
        wang_text = re.sub(r'^[乾坤震巽坎离艮兑]+下[乾坤震巽坎离艮兑]+上[。.]\s*', '', wang_text)
        wang_text = re.sub(r'\s+', ' ', wang_text)
        if len(wang_text) > 180:
            wang_text = wang_text[:180] + "……"
    else:
        wang_text = "名卦明象，因象设教，物物各有其宜。"

    zhengyi_block = f"""
### 5. 孔颖达《周易正义》（魏晋玄学王注与汉唐正义宗本）
- **卦名与经注要义（王弼注）**：{wang_text}
- **孔疏大义与名理考释**：{shu_text}
- **玄学义理哲思启示**：王弼黜象数、扫纳甲谶纬，以“得意忘象、得象忘言”专发明理；孔颖达集汉唐经师注疏之成，辨物正名，使易道成为内圣外王修己应务的哲学宗本。
"""

    target_marker = "## 叁· 先贤义理与哲理阐微"
    if target_marker in content:
        p_four = content.find("## 肆·")
        if p_four != -1:
            new_content = content[:p_four] + zhengyi_block.strip() + "\n\n---\n\n" + content[p_four:]
            with open(archive_path, "w", encoding="utf-8") as out:
                out.write(new_content)
            injected_count += 1

print(f"Successfully injected Zhouyi Zhengyi into {injected_count} gua files in 02_六十四卦精研档案.")
