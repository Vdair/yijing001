import re

with open("learn_sample.html", "r", encoding="utf-8") as f:
    text = f.read()

# check iframe
iframes = re.findall(r'<iframe[^>]*src=["\']([^"\']+)["\']', text)
print("iframes:", iframes)

# check scripts
scripts = re.findall(r'<script[^>]*src=["\']([^"\']+)["\']', text)
print("scripts:", scripts)

# check parts
parts = re.findall(r'class=["\']part-name["\'][^>]*>(.*?)<', text)
print("parts count:", len(parts))
for i, p in enumerate(parts):
    print(f"  Part {i+1}: {p.strip()}")

# check lesson links
lesson_items = re.findall(r'<a[^>]*href=["\']([^"\']+)["\'][^>]*class=["\']lesson-item["\'][^>]*>(.*?)</a>', text, re.DOTALL)
print("\nlessons count:", len(lesson_items))
for href, content in lesson_items[:10]:
    c_clean = re.sub(r'<[^>]+>', ' ', content)
    c_clean = ' '.join(c_clean.split())
    print(f"  [{href}] -> {c_clean}")

# check if there's slide template or iframe target
iframe_tags = re.findall(r'<iframe[^>]*>', text)
print("iframe tags:", iframe_tags)
