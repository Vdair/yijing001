with open('data/yichuan_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pos = text.find('小畜')
with open('data/xiaoxu_debug.txt', 'w', encoding='utf-8') as out:
    out.write(text[pos-100:pos+200])

print("Saved debug text!")
