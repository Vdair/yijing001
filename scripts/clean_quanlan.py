import os
import re

# 找到下载的文件
files = os.listdir("data")
quanlan_file = [f for f in files if "wikisource" in f and (".html" in f) and ("1" not in f and "2" not in f and "index" not in f)][0]
path = os.path.join("data", quanlan_file)

with open(path, "r", encoding="utf-8") as f:
    html = f.read()

# 提取 mw-parser-output
m = re.search(r'<div class="mw-parser-output">(.*?)<div class="printfooter"', html, re.DOTALL)
if m:
    content = m.group(1)
else:
    content = html

# 移除 script, style, comments
content = re.sub(r'<script.*?</script>', '', content, flags=re.DOTALL)
content = re.sub(r'<style.*?</style>', '', content, flags=re.DOTALL)
content = re.sub(r'<!--.*?-->', '', content, flags=re.DOTALL)

# 换行处理
content = re.sub(r'<br\s*/?>', '\n', content)
content = re.sub(r'</p>\s*<p>', '\n\n', content)
content = re.sub(r'</h[1-6]>', '\n\n', content)
content = re.sub(r'<[^>]+>', '', content)

# 去除 HTML 实体
content = content.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>')

# 繁简转换说明：四库全书本是繁体字，我们可以用简单的映射或标准库转为规范简体（如果需要），或者保留原汁原味
with open("data/wikisource_quanlan_clean.txt", "w", encoding="utf-8") as out:
    out.write(content)

print(f"Cleaned quanlan length: {len(content)}")
