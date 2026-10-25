import urllib.request
import os

os.makedirs('assets/libs', exist_ok=True)

urls = {
    'assets/libs/three.min.js': 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js',
    'assets/libs/OrbitControls.js': 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js',
    'assets/libs/tween.umd.js': 'https://cdnjs.cloudflare.com/ajax/libs/tween.js/18.6.4/tween.umd.js'
}

for path, url in urls.items():
    if not os.path.exists(path):
        print(f"Downloading {url} to {path}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as resp:
                content = resp.read()
                with open(path, 'wb') as f:
                    f.write(content)
            print(f"Downloaded {path} ({len(content)} bytes)")
        except Exception as e:
            print(f"Failed to download {url}: {e}")
    else:
        print(f"Already exists: {path}")
