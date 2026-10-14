import urllib.request
import urllib.parse
import ssl
import time
import os

url = "https://daizhige.org/%E6%98%93%E8%97%8F/%E6%98%93%E7%BB%8F/%E5%91%A8%E6%98%93%E6%AD%A3%E4%B9%89.html"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

print("Fetching 周易正义 with retry...")
for i in range(3):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            content = resp.read().decode('utf-8')
            os.makedirs('data', exist_ok=True)
            with open('data/zhouyi_zhengyi_raw.html', 'w', encoding='utf-8') as f:
                f.write(content)
        print(f"Successfully downloaded 周易正义! Size: {len(content)}")
        break
    except Exception as e:
        print(f"Attempt {i+1} failed:", e)
        time.sleep(2)
