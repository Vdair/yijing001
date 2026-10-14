import urllib.request
import urllib.parse
import re

url = "https://zh.wikisource.org/wiki/" + urllib.parse.quote("周易本义_(四库全书本)")
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'})

try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
        with open("data/wikisource_index.html", "w", encoding="utf-8") as f:
            f.write(content)
        links = re.findall(r'href="(/wiki/[^"]+)"[^>]*>([^<]+)</a>', content)
        with open("data/wikisource_links.txt", "w", encoding="utf-8") as out:
            for link, text in links:
                out.write(f"{text}: {link}\n")
    print("Fetched wikisource index successfully!")
except Exception as e:
    print("Error:", e)
