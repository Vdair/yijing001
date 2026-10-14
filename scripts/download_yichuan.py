import urllib.request
import urllib.parse
import os

url = "https://daizhige.org/%E6%98%93%E8%97%8F/%E6%98%93%E7%BB%8F/%E4%BC%8A%E5%B7%9D%E6%98%93%E4%BC%A0.html"
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}

print("Fetching 伊川易传...")
req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as resp:
        content = resp.read().decode('utf-8')
        os.makedirs('data', exist_ok=True)
        with open('data/yichuan_yichuan_raw.html', 'w', encoding='utf-8') as f:
            f.write(content)
    print(f"Successfully downloaded 伊川易传! Size: {len(content)}")
except Exception as e:
    print("Download error:", e)
