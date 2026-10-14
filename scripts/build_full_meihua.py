import os
import re

with open('data/meihua_clean.txt', 'r', encoding='utf-8') as f:
    lines = [line.strip() for line in f]

output_dir = '05_易学经典原典馆/05_梅花易数_邵雍'
os.makedirs(output_dir, exist_ok=True)

# 1. 00_梅花易数导读与起卦研习指南.md
xu_line = lines[20]
# 找到黄宗羲序言
guide_content = f"""---
title: 梅花易数导读与研习指南
author: 〔北宋〕邵雍 传 / 〔明〕整理 / 〔清〕黄宗羲 序
book: 梅花易数（心易神数）
type: 象数易占与全息类象
edition: 清刻梅花易数全本校正
---

# 梅花易数 · 导读与研习指南

> **学术与术数地位**：相传为北宋易学大师邵雍（康节）先生所创，是中国传统易学占筮史上与汉代焦京汉易、唐宋六爻纳甲并立的灵动心易流派。
> **核心特色**：“不动不占，不因事不占”。不藉蓍草龟甲之繁，触机而发，见物即起卦，取数即定爻。体用分明，生克直捷。

---

## 📜 黄宗羲原序

{xu_line}

---

## 🧭 一、梅花易数核心起卦心法矩阵

```mermaid
graph TD
    A[万物触机 / 心动起念] --> B{{起卦方式}}
    B -->|先天起卦: 先得数后得卦| C[年月日时 / 物数 / 声音 / 汉字字画]
    B -->|后天起卦: 先见象后得数| D[见老人有忧色 / 鸟鸣禽鸣 / 方位所见]
    C --> E[定上卦 与 下卦]
    D --> E
    E --> F[总数除以六取动爻]
    F --> G[排出 本卦 · 互卦 · 变卦]
    G --> H[确立 体卦 与 用卦]
    H --> I[依五行生克与时令旺衰断吉凶]
```

---

## ⚖️ 二、体用生克断法大则

- **体卦**：为主体、为我、为所求之主事，静而守位；
- **用卦**：为事端、为客、为外应时势，动而生变；
- **互卦**：事之中间过程、暗中隐伏之机理；
- **变卦**：事之终局、事态最终之落点。

| 生克格局 | 吉凶定断 | 现实事理映射 |
| :--- | :--- | :--- |
| **用生体** | 大吉，求之易得 | 得外力相助，贵人扶持，顺风顺水 |
| **体生用** | 耗泄，劳而少功 | 损己利人，付出巨大，心力交瘁 |
| **体克用** | 吉，克敌制胜 | 虽有阻力，但能掌控局势，胜券在握 |
| **用克体** | 凶，大受制约 | 遭外界压制打击，阻碍重重，败兆显露 |
| **体用比和** | 吉庆，谋为和谐 | 伙伴齐心，上下协力，安稳成就 |

---

## 📚 三、全书卷帙纲目

1. **[01_卷一_象数易理篇与起卦神断.md](file:///c:/Users/HiQhb/.gemini/antigravity-ide/scratch/yijing001/05_易学经典原典馆/05_梅花易数_邵雍/01_卷一_象数易理篇与起卦神断.md)**：先天卦数、年月日时起卦法、观梅占、牡丹占、借物占与八卦万物属类。
2. **[02_卷二_体用生克篇与分门占断.md](file:///c:/Users/HiQhb/.gemini/antigravity-ide/scratch/yijing001/05_易学经典原典馆/05_梅花易数_邵雍/02_卷二_体用生克篇与分门占断.md)**：心易占卜玄机、体用总诀、天时人事婚姻求谋二十门分占。
3. **[03_卷三_断占总诀篇与心易玄机.md](file:///c:/Users/HiQhb/.gemini/antigravity-ide/scratch/yijing001/05_易学经典原典馆/05_梅花易数_邵雍/03_卷三_断占总诀篇与心易玄机.md)**：八卦方位图、观物洞玄歌、花押字画断法、三要十应感应秘要。
"""

with open(os.path.join(output_dir, '00_梅花易数导读与研习指南.md'), 'w', encoding='utf-8') as f:
    f.write(guide_content)

print("Generated 00_梅花易数导读与研习指南.md")

# 2. 卷一 (Line 162 到 Line 552)
c1_lines = lines[162:552]
c1_body = '\n\n'.join([l for l in c1_lines if l])
c1_content = f"""---
title: 梅花易数 · 卷一
author: 〔北宋〕邵雍 传
book: 梅花易数
section: 象数易理篇与起卦占例
type: 起卦法则与神断实例
edition: 清刻梅花易数全本校正
---

# 梅花易数 · 卷一 · 象数易理篇

> **要义指引**：详述周易卦数、五行生克、八宫卦象，收录邵康节先生脍炙人口之“观梅占（二雀争枝坠地）”、“司马公家观牡丹占”、“邻夜扣门借物占”、“老人有忧色占”等神断实例，附八卦万物类象分类总纲。

---

## 📜 卷一原文

{c1_body}
"""
with open(os.path.join(output_dir, '01_卷一_象数易理篇与起卦神断.md'), 'w', encoding='utf-8') as f:
    f.write(c1_content)

print("Generated 01_卷一_象数易理篇与起卦神断.md")

# 3. 卷二 (Line 552 到 Line 783)
c2_lines = lines[552:783]
c2_body = '\n\n'.join([l for l in c2_lines if l])
c2_content = f"""---
title: 梅花易数 · 卷二
author: 〔北宋〕邵雍 传
book: 梅花易数
section: 体用生克篇与分门占断
type: 体用总诀与实战应用
edition: 清刻梅花易数全本校正
---

# 梅花易数 · 卷二 · 体用生克篇

> **要义指引**：阐发心易占卜玄机，确立体卦、用卦、互卦、变卦的生克乘侮大则，并将易理全面落实在天时、人事、家宅、婚姻、生产、求名、求利、出行、疾病、官讼等二十门社会人事生活实景中。

---

## 📜 卷二原文

{c2_body}
"""
with open(os.path.join(output_dir, '02_卷二_体用生克篇与分门占断.md'), 'w', encoding='utf-8') as f:
    f.write(c2_content)

print("Generated 02_卷二_体用生克篇与分门占断.md")

# 4. 卷三 (Line 783 到 Line 1002)
c3_lines = lines[783:1002]
c3_body = '\n\n'.join([l for l in c3_lines if l])
c3_content = f"""---
title: 梅花易数 · 卷三
author: 〔北宋〕邵雍 传
book: 梅花易数
section: 断占总诀篇与心易玄机
type: 洞玄歌、指迷赋与三要十应
edition: 清刻梅花易数全本校正
---

# 梅花易数 · 卷三 · 断占总诀篇

> **要义指引**：汇集梅花心易最高阶赋文秘诀，包含《观物洞玄歌》、《探玄赋》、《指迷赋》以及触景生情、全息共振的“三要十应（耳目心三要，天时地理人事十应）”心法。

---

## 📜 卷三原文

{c3_body}
"""
with open(os.path.join(output_dir, '03_卷三_断占总诀篇与心易玄机.md'), 'w', encoding='utf-8') as f:
    f.write(c3_content)

print("Generated 03_卷三_断占总诀篇与心易玄机.md")
