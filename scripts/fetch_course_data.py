import urllib.request

url = "https://xueai.miyang.cn/slides/course-data.js"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        js = resp.read().decode('utf-8')
    with open("course_data_sample.js", "w", encoding="utf-8") as f:
        f.write(js[:10000]) # write first 10000 chars
    print("course-data.js fetched, total length:", len(js))
except Exception as e:
    print("Error:", e)
