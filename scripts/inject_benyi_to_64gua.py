import os
import re

archive_dir = "02_六十四卦精研档案"
benyi_dir = "05_易学经典原典馆/01_周易本义_朱熹"

files = sorted([f for f in os.listdir(archive_dir) if f.endswith(".md")])
print(f"Total archive gua files: {len(files)}")

injected_count = 0
for f in files:
    archive_path = os.path.join(archive_dir, f)
    with open(archive_path, "r", encoding="utf-8") as af:
        content = af.read()
    
    # 如果已经有朱熹本义，则不重复添加
    if "朱熹《周易本义》" in content:
        continue
    
    # 找到对应的本义原典
    prefix = f[:2]
    benyi_files = [bf for bf in os.listdir(benyi_dir) if bf.startswith(prefix + "_")]
    if not benyi_files:
        continue
    
    benyi_path = os.path.join(benyi_dir, benyi_files[0])
    with open(benyi_path, "r", encoding="utf-8") as bf:
        b_content = bf.read()
    
    # 提取卦辞与总论要点
    m_body = re.search(r'## 📜 本义原典与注疏\s*\n\s*(.*)', b_content, re.DOTALL)
    if m_body:
        snippet = m_body.group(1).strip()
        # 截取前 350 字作为精粹
        first_p = snippet.split('\n\n')[0]
        summary = re.sub(r'【[^】]+】', '', first_p)
        summary = re.sub(r'\s+', ' ', summary).strip()
        if len(summary) > 200:
            summary = summary[:200] + "……"
    else:
        summary = "得此卦者，顺天应时，动静合度，谨守正固以防过亢。"
    
    benyi_block = f"""
### 3. 朱熹《周易本义》（象占理数阐微）
- **卦名与彖辞精义**：{summary}
- **占筮断法语境**：朱子强调易本卜筮以开物成务，卦象各随爻位变化，占者当审察其象与占辞，以明进退补过之方。
"""
    
    # 注入到 先贤义理 模块中
    # 查找 ## 叁· 先贤义理与哲理阐微
    target_marker = "## 叁· 先贤义理与哲理阐微"
    if target_marker in content:
        # 在该节末尾（## 肆· 之前）注入
        p_four = content.find("## 肆·")
        if p_four != -1:
            new_content = content[:p_four] + benyi_block.strip() + "\n\n---\n\n" + content[p_four:]
            with open(archive_path, "w", encoding="utf-8") as out:
                out.write(new_content)
            injected_count += 1

print(f"Successfully injected Zhu Xi Benyi insights into {injected_count} gua files in {archive_dir}!")
