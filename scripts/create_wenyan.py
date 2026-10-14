import os

with open('05_易学经典原典馆/01_周易本义_朱熹/01_乾为天.md', 'r', encoding='utf-8') as f:
    qian = f.read()

with open('05_易学经典原典馆/01_周易本义_朱熹/02_坤为地.md', 'r', encoding='utf-8') as f:
    kun = f.read()

# 提取文言
q_wenyan_pos = qian.find('文言曰')
if q_wenyan_pos == -1:
    q_wenyan_pos = qian.find('文言')
k_wenyan_pos = kun.find('文言曰')
if k_wenyan_pos == -1:
    k_wenyan_pos = kun.find('文言')

q_wenyan = qian[q_wenyan_pos:] if q_wenyan_pos != -1 else ""
k_wenyan = kun[k_wenyan_pos:] if k_wenyan_pos != -1 else ""

content = f"""---
title: 周易本义 · 文言传
author: 〔南宋〕朱熹
book: 周易本义
edition: 四库全书馆藏本 / 宋咸淳吴革刊本校勘
---

# 周易本义 · 文言传

> **说明**：《文言传》专释乾坤两卦之性德义理。朱熹《周易本义》依程颐例，附载于乾、坤二卦本义之后。此处辑录合编以便通读。

---

## 一、 乾文言本义注

{q_wenyan}

---

## 二、 坤文言本义注

{k_wenyan}
"""

with open('05_易学经典原典馆/01_周易本义_朱熹/67_文言传.md', 'w', encoding='utf-8') as out:
    out.write(content)

print("Saved 67_文言传.md successfully!")
