with open('data/yichuan_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pos_yu = text.find('【坤下震上】')
pos_gu = text.find('【巽下艮上】')
if pos_gu == -1:
    pos_gu = text.find('【防下艮上】')

with open('data/yu_gu_between.txt', 'w', encoding='utf-8') as out:
    out.write(text[pos_yu:pos_gu+100])

print("Saved yu to gu text!")
