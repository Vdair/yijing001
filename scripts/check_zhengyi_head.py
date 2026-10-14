with open('data/zhengyi_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

with open('data/zhengyi_head.txt', 'w', encoding='utf-8') as out:
    out.write(text[:2500])

print("Saved Zhengyi head snippet!")
