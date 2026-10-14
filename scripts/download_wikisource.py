import urllib.request
import urllib.parse
import os

base = "https://zh.wikisource.org"
pages = [
    ("全览", "/wiki/%E5%91%A8%E6%98%93%E6%9C%AC%E7%BE%A9_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)/%E5%85%A8%E8%A6%BD"),
    ("卷1", "/wiki/%E5%91%A8%E6%98%93%E6%9C%AC%E7%BE%A9_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)/%E5%8D%B71"),
    ("卷2", "/wiki/%E5%91%A8%E6%98%93%E6%9C%AC%E7%BE%A9_(%E5%9B%9B%E5%BA%AB%E5%85%A8%E6%9B%B8%E6%9C%AC)/%E5%8D%B72"),
]

for name, path in pages:
    url = base + path
    print(f"Fetching {name} from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})
    try:
        with urllib.request.urlopen(req) as resp:
            content = resp.read().decode('utf-8')
            filename = f"data/wikisource_{name}.html"
            with open(filename, "w", encoding="utf-8") as f:
                f.write(content)
            print(f"Saved {filename}, size: {len(content)}")
    except Exception as e:
        print(f"Error fetching {name}:", e)
