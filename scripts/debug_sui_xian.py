with open('data/yichuan_clean.txt', 'r', encoding='utf-8') as f:
    text = f.read()

pos_sui = text.find('随')
pos_xian = text.find('咸')

with open('data/sui_xian_debug.txt', 'w', encoding='utf-8') as out:
    out.write(f"pos_sui: {pos_sui}, pos_xian: {pos_xian}\n")
    if pos_sui != -1:
        out.write("--- SUI ---\n" + text[pos_sui-50:pos_sui+150] + "\n\n")
    if pos_xian != -1:
        out.write("--- XIAN ---\n" + text[pos_xian-50:pos_xian+150] + "\n\n")

print("Saved sui and xian debug text!")
