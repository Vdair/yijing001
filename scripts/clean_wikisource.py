import re

with open('data/wikisource_全览.html', 'r', encoding='utf-8') as f:
    html = f.read()

start = html.find('mw-parser-output')
end = html.find('printfooter')

if start != -1 and end != -1:
    body = html[start:end]
else:
    body = html

# 移除 script, style
body = re.sub(r'<script.*?</script>', '', body, flags=re.DOTALL)
body = re.sub(r'<style.*?</style>', '', body, flags=re.DOTALL)
body = re.sub(r'<!--.*?-->', '', body, flags=re.DOTALL)

# 将 <p> 替换为换行
body = re.sub(r'<br\s*/?>', '\n', body)
body = re.sub(r'</p>', '\n\n', body)
body = re.sub(r'</h[1-6]>', '\n\n', body)
body = re.sub(r'<[^>]+>', '', body)

# 替换 HTML 转义实体
body = body.replace('&nbsp;', ' ').replace('&#160;', ' ').replace('&quot;', '"').replace('&lt;', '<').replace('&gt;', '>')
# 压缩多余连续换行
body = re.sub(r'\n{3,}', '\n\n', body)

with open('data/wikisource_benyi_clean.txt', 'w', encoding='utf-8') as f:
    f.write(body)

print("Saved clean text! Length:", len(body))
