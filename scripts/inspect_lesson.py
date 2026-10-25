import re

with open("zero_0_sample.html", "r", encoding="utf-8") as f:
    html = f.read()

# remove emojis before printing or write to file
headers = re.findall(r'<h[1-3][^>]*>(.*?)</h[1-3]>', html)
for h in headers[:15]:
    clean = re.sub(r'<[^>]+>', '', h).strip()
    clean = clean.encode('ascii', 'ignore').decode('ascii') or clean
    print("H:", clean[:80])

# check container classes
containers = re.findall(r'class=["\']([^"\']*(?:card|slide|step|box|content|quiz|case)[^"\']*)["\']', html)
print("Containers:", list(set(containers))[:20])
