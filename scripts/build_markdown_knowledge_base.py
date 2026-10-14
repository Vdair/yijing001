#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
易经学习知识库构建全链路脚本
功能：
1. 读取 data/01_raw/ 中的 guaData.json 与 guaInterpretation.json
2. 执行文本深度去噪（去除爬虫版权、广告、无用字符）
3. 按照“学习优先、经传宗本、名家阐微、弱化口水占测”的标准生成 Markdown 知识体系：
   - 01_八卦基础通识/ (8 篇单卦通识 + 1 篇八卦总论)
   - 02_六十四卦精研档案/ (64 篇体系化单卦档案)
   - 03_易理哲学与认知模型/ (3 篇易理专题思辨)
   - 04_AI极速参考手册/ (64卦卦义速查卡 + 易学术语辞典)
"""

import os
import json
import re

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
RAW_DIR = os.path.join(BASE_DIR, "data", "raw_source")
BAGUA_DIR = os.path.join(BASE_DIR, "01_八卦基础通识")
GUA64_DIR = os.path.join(BASE_DIR, "02_六十四卦精研档案")
PHILOSOPHY_DIR = os.path.join(BASE_DIR, "03_易理哲学与认知模型")
AI_HANDBOOK_DIR = os.path.join(BASE_DIR, "04_AI极速参考手册")

TRIGRAMS = {
    "111": {"name": "乾", "nature": "天", "property": "健", "symbol": "☰", "wuxing": "金", "family": "父", "direction_houtian": "西北", "direction_xiantian": "南"},
    "000": {"name": "坤", "nature": "地", "property": "顺", "symbol": "☷", "wuxing": "土", "family": "母", "direction_houtian": "西南", "direction_xiantian": "北"},
    "100": {"name": "震", "nature": "雷", "property": "动", "symbol": "☳", "wuxing": "木", "family": "长男", "direction_houtian": "正东", "direction_xiantian": "东北"},
    "011": {"name": "巽", "nature": "风", "property": "入", "symbol": "☴", "wuxing": "木", "family": "长女", "direction_houtian": "东南", "direction_xiantian": "西南"},
    "010": {"name": "坎", "nature": "水", "property": "险/陷", "symbol": "☵", "wuxing": "水", "family": "中男", "direction_houtian": "正北", "direction_xiantian": "正西"},
    "101": {"name": "离", "nature": "火", "property": "丽/明", "symbol": "☲", "wuxing": "火", "family": "中女", "direction_houtian": "正南", "direction_xiantian": "正东"},
    "001": {"name": "艮", "nature": "山", "property": "止", "symbol": "☶", "wuxing": "土", "family": "少男", "direction_houtian": "东北", "direction_xiantian": "西北"},
    "110": {"name": "兑", "nature": "泽", "property": "悦", "symbol": "☱", "wuxing": "金", "family": "少女", "direction_houtian": "正西", "direction_xiantian": "东南"}
}

def clean_text(text):
    if not text:
        return ""
    # 移除网页爬虫版权信息
    text = re.sub(r'未经允许不得转载.*?(?=$|\n)', '', text)
    text = re.sub(r'周易第\d+卦.*?(?=$|\n)', '', text)
    # 移除多余的 HTML 转义
    text = text.replace('&nbsp;', ' ').replace('&raquo;', '»').replace('&#038;', '&')
    # 规整连续空行和多余空格
    text = re.sub(r'\s{2,}', ' ', text)
    return text.strip()

def load_data():
    with open(os.path.join(RAW_DIR, "guaData.json"), "r", encoding="utf-8") as f:
        gua_data = json.load(f)
    with open(os.path.join(RAW_DIR, "guaInterpretation.json"), "r", encoding="utf-8") as f:
        interp_data = json.load(f)
    return gua_data, interp_data

def build_bagua_basics():
    """生成 01_八卦基础通识/ 目录下的 9 篇文档"""
    # 1. 八卦总论
    overview_path = os.path.join(BAGUA_DIR, "00_八卦总论与八卦图.md")
    overview_content = """# 八卦总论与八卦时空图谱

> 《易·系辞上》：“易有太极，是生两仪，两仪生四象，四象生八卦。”
> 八卦是《周易》最核心的八个三爻卦（经卦），代表宇宙八种核心自然现象与生命属性。

---

## 壹· 八卦取象与记忆歌诀（宋·朱熹）

| 卦名 | 卦画 | 歌诀 | 自然之象 | 性德特征 | 阴阳属性 | 五行 | 后天方位 | 先天方位 | 家族人伦 |
| :---: | :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **乾** | ☰ | 乾三连 | 天 | 健（刚健不息） | 纯阳 | 阳金 | 西北 | 正南 | 父 |
| **坤** | ☷ | 坤六断 | 地 | 顺（柔顺厚载） | 纯阴 | 阴土 | 西南 | 正北 | 母 |
| **震** | ☳ | 震仰盂 | 雷 | 动（生发萌动） | 阳（一阳初生）| 阳木 | 正东 | 东北 | 长男 |
| **巽** | ☴ | 巽下断 | 风 | 入（谦逊深入） | 阴（一阴初生）| 阴木 | 东南 | 西南 | 长女 |
| **坎** | ☵ | 坎中满 | 水 | 险（曲折险难） | 阳（阳居阴中）| 阳水 | 正北 | 正西 | 中男 |
| **离** | ☲ | 离中虚 | 火 | 丽（光明附着） | 阴（阴居阳中）| 阴火 | 正南 | 正东 | 中女 |
| **艮** | ☶ | 艮覆碗 | 山 | 止（抑止安稳） | 阳（阳长于上）| 阳土 | 东北 | 西北 | 少男 |
| **兑** | ☱ | 兑上缺 | 泽 | 悦（喜悦和善） | 阴（阴浮于上）| 阴金 | 正西 | 东南 | 少女 |

---

## 贰· 先天八卦与后天八卦的区别

### 1. 先天八卦（伏羲八卦）—— 讲“体”与空间对应
- **核心原则**：天地定位，山泽通气，雷风相薄，水火不相射。
- **空间对称**：
  - 乾（南）与 坤（北）相对；
  - 离（东）与 坎（西）相对；
  - 震（东北）与 巽（西南）相对；
  - 艮（西北）与 兑（东南）相对。
- **哲学内涵**：展现宇宙天地本来的阴阳对称和谐状态，重在自然之法则。

### 2. 后天八卦（文王八卦）—— 讲“用”与时间流行
- **核心原则**：帝出乎震，齐乎巽，相见乎离，致役乎坤，说言乎兑，战乎乾，劳乎坎，成言乎艮。
- **时序运行**：
  - 从正东【震】开始（春天、万物生发）；
  - 转向东南【巽】（春夏之交、滋润成长）；
  - 行至正南【离】（夏日炎炎、万物显明茂盛）；
  - 转向西南【坤】（夏末秋初、长养成熟）；
  - 行至正西【兑】（秋季收获、欢喜悦纳）；
  - 转向西北【乾】（秋冬之间、战备收缩、尊贵肃杀）；
  - 行至正北【坎】（冬季严寒、归藏劳顿、潜伏歇息）；
  - 终于东北【艮】（冬春之交、止于过去、成始成终）。
- **哲学内涵**：展现天地万物春生、夏长、秋收、冬藏的生命律动，重在人道修养与顺应天时。

---

## 叁· 易学思维学习导引

学习六十四卦，核心在于将八个基本卦两两重叠：
- **下卦（内卦）**：代表内在心境、自我修养、初始阶段、近处微观。
- **上卦（外卦）**：代表外在环境、社会大势、发展结果、远处宏观。
两卦相互作用（雷水解、水火既济、山火贲等），便衍生出人生万千情境的处世智慧。
"""
    with open(overview_path, "w", encoding="utf-8") as f:
        f.write(overview_content)

    # 2. 生成八卦各单卦文档
    bagua_details = [
        ("01_乾卦_天健.md", "乾", "天", "健", "☰", "111", "纯阳不息，天道之刚", "大哉乾元，万物资始，乃统天。", "天行健，君子以自强不息。"),
        ("02_坤卦_地顺.md", "坤", "地", "顺", "☷", "000", "厚德载物，地道之柔", "至哉坤元，万物资生，乃顺承天。", "地势坤，君子以厚德载物。"),
        ("03_震卦_雷动.md", "震", "雷", "动", "☳", "100", "春雷激荡，生机萌发", "震，亨。震来虩虩，笑言哑哑。", "洊雷震，君子以恐惧修省。"),
        ("04_巽卦_风入.md", "巽", "风", "入", "☴", "011", "随风潜入，谦逊浸润", "巽，小亨，利有攸往，利见大人。", "随风巽，君子以申命行事。"),
        ("05_坎卦_水险.md", "坎", "水", "险", "☵", "010", "心亨行有尚，在险不失信", "习坎，有孚，维心亨，行有尚。", "水洊至，习坎；君子以常德行，习教事。"),
        ("06_离卦_火丽.md", "离", "火", "明", "☲", "101", "日月丽天，光明中正", "离，利贞，亨。畜牝牛，吉。", "明两作，离；大人以继明照于四方。"),
        ("07_艮卦_山止.md", "艮", "山", "止", "☶", "001", "动静有常，知止而后定", "艮其背，不获其身；行其庭，不见其人。无咎。", "兼山，艮；君子以思不出其位。"),
        ("08_兑卦_泽悦.md", "兑", "泽", "悦", "☱", "110", "和颜说色，朋友讲习", "兑，亨，利贞。", "丽泽，兑；君子以朋友讲习。")
    ]

    for fname, name, nature, prop, symbol, bin_code, title_desc, tuanci, xiangci in bagua_details:
        fpath = os.path.join(BAGUA_DIR, fname)
        trig = TRIGRAMS[bin_code]
        content = f"""# 八卦之【{name}卦】（{nature} · {symbol}）

> **卦象符号**：{symbol}（{name}三画）  
> **核心性德**：**{prop}**（{title_desc}）  
> **阴阳五行**：{trig['wuxing']} | 阴阳：{trig['family']}卦  
> **方位对应**：后天{trig['direction_houtian']} / 先天{trig['direction_xiantian']}

---

## 壹· 性德意象与自然象征

- **自然之象**：代表自然界中的【**{nature}**】。
- **性德特征**：【**{prop}**】。{title_desc}。
- **人伦取象**：在家庭结构中代表【**{trig['family']}**】。
- **身体器官**：{get_body_part(name)}。
- **动物象征**：{get_animal(name)}。

---

## 贰· 《彖》《象》经典引言

- **彖传大义**：
  > {tuanci}
- **大象之道**：
  > {xiangci}

---

## 叁· 易学修养启示

1. **认知修养**：
   - 观{nature}之象，体会“{prop}”之法则。
2. **处事原则**：
   - 当行则行，当止则止，体悟自然节律与天人合一。
3. **衍生重卦**：
   - 当【{name}】为上卦或下卦时，将与其它七卦组合生成 64 卦中的 8 个宏大情境（如{get_related_64(name)}等）。
"""
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)

def get_body_part(name):
    return {"乾": "头首、骨骼", "坤": "腹部、脾胃", "震": "足部、肝胆", "巽": "股（大腿）、气管", "坎": "耳、肾脏、血液", "离": "目、心脏", "艮": "手、背脊、关节", "兑": "口、舌、牙齿"}.get(name, "")

def get_animal(name):
    return {"乾": "马（行天健行）", "坤": "牛（柔顺负重）", "震": "龙（起伏腾跃）", "巽": "鸡（随风啼鸣）", "坎": "豕（豕喜水险）", "离": "雉（羽翼华美明艳）", "艮": "狗（忠勇守止）", "兑": "羊（和颜善悦）"}.get(name, "")

def get_related_64(name):
    return {"乾": "乾为天、天水讼、天风姤、天火同人", "坤": "坤为地、地天泰、地水师、地山谦", "震": "震为雷、雷天大壮、雷水解、雷火丰", "巽": "巽为风、风天小畜、风水涣、风火家人", "坎": "坎为水、水雷屯、水天需、水火既济", "离": "离为火、火天大有、火水未济、火地晋", "艮": "艮为山、山水蒙、山天大畜、山风蛊", "兑": "兑为泽、泽天夬、泽水困、泽火革"}.get(name, "")

def parse_zhangmingren_insights(summary_text):
    """从张铭仁长文本中提取对人生修养有益的核心启示，剔除占断口水"""
    if not summary_text:
        return ""
    insights = []
    # 提取解释
    m_exp = re.search(r'解释：([^。\n]+。?)', summary_text)
    if m_exp:
        insights.append(f"- **卦性总旨**：{m_exp.group(1).strip()}")
    # 提取特性
    m_tr = re.search(r'特性：([^。\n]+。?)', summary_text)
    if m_tr:
        insights.append(f"- **人格特质与心性**：{m_tr.group(1).strip()}")
    # 提取大运走势哲学
    m_yun = re.search(r'运势：([^。\n]+。?)', summary_text)
    if m_yun:
        clean_yun = clean_text(m_yun.group(1))
        insights.append(f"- **时势运行启示**：{clean_yun}")
    return "\n".join(insights)

def build_64_gua_archives(gua_data, interp_data):
    """生成 02_六十四卦精研档案/ 目录下的 64 篇高质量 Markdown"""
    for item in gua_data:
        xuhao = item["xuhao"]
        str_id = str(xuhao)
        name = item["name"]
        bin_code = item["binary"] # 6位，前3位下卦，后3位上卦
        symbol = item.get("symbol", "")
        guaci = clean_text(item.get("guaci", ""))
        tuanci = clean_text(item.get("tuanci", ""))
        xiangci = clean_text(item.get("xiangci", ""))
        yaoci_list = item.get("yaoci", [])
        xiaoxiang_list = item.get("xiaoxiang", [])
        
        lower_bin = bin_code[:3]
        upper_bin = bin_code[3:]
        trig_lower = TRIGRAMS.get(lower_bin, {"name": "未知", "nature": "", "property": "", "symbol": ""})
        trig_upper = TRIGRAMS.get(upper_bin, {"name": "未知", "nature": "", "property": "", "symbol": ""})
        
        # 对应解卦数据
        interp = interp_data.get(str_id, {})
        guaci_interp = interp.get("guaci_interpretation", {})
        yaoci_interp = interp.get("yaoci_interpretation", [])
        
        baihua_gua = clean_text(guaci_interp.get("baihua", ""))
        shaoyong_gua = guaci_interp.get("shaoyong", {})
        fupeirong_gua = guaci_interp.get("fupeirong", {})
        chuantong_gua = guaci_interp.get("chuantong", {})
        zhangmingren_gua = guaci_interp.get("zhangmingren", {})
        
        filename = f"{xuhao:02d}_{name}.md"
        fpath = os.path.join(GUA64_DIR, filename)
        
        # 生成单卦 Markdown
        lines = []
        lines.append(f"# 第 {xuhao:02d} 卦 · {name}（{symbol}）")
        lines.append("")
        lines.append(f"> **卦画结构**：上【{trig_upper['nature']}】（{trig_upper['name']} {trig_upper['symbol']}）+ 下【{trig_lower['nature']}】（{trig_lower['name']} {trig_lower['symbol']}）")
        lines.append(f"> **核心性德**：外【{trig_upper['property']}】而内【{trig_lower['property']}】")
        lines.append(f"> **二进制码**：`{bin_code}`（初爻至上爻：{bin_code[0]} -> {bin_code[5]}）")
        if chuantong_gua.get("大象"):
            lines.append(f"> **义理总纲**：{clean_text(chuantong_gua['大象'])}")
        lines.append("")
        lines.append("---")
        lines.append("")
        
        # 壹· 经传宗本
        lines.append("## 壹· 经传宗本（P0 核心原文与正解）")
        lines.append("")
        lines.append(f"### 1. 卦辞")
        lines.append(f"- **经文原文**：**{guaci}**")
        if baihua_gua:
            lines.append(f"- **白话正义**：{baihua_gua}")
        lines.append("")
        
        lines.append(f"### 2. 《彖传》大义（孔子总释一卦宏旨）")
        lines.append(f"> {tuanci}")
        lines.append("")
        
        lines.append(f"### 3. 《大象传》（人伦修养与道德法象）")
        lines.append(f"> {xiangci}")
        lines.append("")
        lines.append("---")
        lines.append("")
        
        # 贰· 六爻时位演变哲学
        lines.append("## 贰· 六爻时位演变哲学（P0 核心微观辩证）")
        lines.append("")
        lines.append("> 易经六爻自下而上发展，代表事物从萌芽、发展、中正、跃升到极盛反转的完整生命历程。")
        lines.append("")
        
        for i in range(6):
            pos_num = i + 1
            pos_name = yaoci_interp[i].get("positionName", f"第{pos_num}爻") if i < len(yaoci_interp) else f"第{pos_num}爻"
            yao_text = yaoci_list[i] if i < len(yaoci_list) else ""
            xiaoxiang_text = xiaoxiang_list[i] if i < len(xiaoxiang_list) else ""
            
            # 解卦
            yao_info = yaoci_interp[i] if i < len(yaoci_interp) else {}
            yao_baihua = clean_text(yao_info.get("baihua", ""))
            yao_shaoyong = yao_info.get("shaoyong", {})
            yao_fupeirong = yao_info.get("fupeirong", {})
            
            lines.append(f"### 爻位【{pos_name}】：{clean_text(yao_text)}")
            lines.append(f"- **小象传**：*{clean_text(xiaoxiang_text)}*")
            if yao_baihua:
                lines.append(f"- **经文训解**：{yao_baihua}")
            if yao_shaoyong.get("detail"):
                sy_phrase = yao_shaoyong.get("phrase", "")
                sy_detail = clean_text(yao_shaoyong.get("detail", ""))
                lines.append(f"- **先贤断语（邵雍）**：【{sy_phrase}】{sy_detail}")
            if yao_fupeirong.get("shiyun"):
                lines.append(f"- **时位哲理启迪（傅佩荣）**：{clean_text(yao_fupeirong['shiyun'])}")
            lines.append("")
            
        lines.append("---")
        lines.append("")
        
        # 叁· 先贤义理与哲理阐微
        lines.append("## 叁· 先贤义理与哲理阐微（P1 名家融通）")
        lines.append("")
        if fupeirong_gua.get("shiyun"):
            lines.append("### 1. 傅佩荣国学解（时运与心性智慧）")
            lines.append(f"- **时运义理**：{clean_text(fupeirong_gua.get('shiyun', ''))}")
            lines.append(f"- **处世自律**：{clean_text(fupeirong_gua.get('jiazhai', ''))}")
            lines.append("")
        
        if shaoyong_gua.get("phrase") or shaoyong_gua.get("detail"):
            lines.append("### 2. 邵雍《河洛理数》（理象数审思）")
            lines.append(f"- **四字心诀**：**{clean_text(shaoyong_gua.get('phrase', ''))}**")
            lines.append(f"- **义理总评**：{clean_text(shaoyong_gua.get('detail', ''))}")
            lines.append("")
            
        if chuantong_gua.get("summary"):
            lines.append("### 3. 传统经学总述")
            lines.append(f"> {clean_text(chuantong_gua.get('summary', ''))}")
            lines.append("")
            
        lines.append("---")
        lines.append("")
        
        # 肆· 人生修养与实践启示
        lines.append("## 肆· 人生修养与实践启示（P2/P3 实践转化）")
        lines.append("")
        if chuantong_gua.get("事业") or chuantong_gua.get("经商") or chuantong_gua.get("决策"):
            lines.append("### 1. 决策与修持之道")
            if chuantong_gua.get("决策"):
                lines.append(f"- **宏观决断**：{clean_text(chuantong_gua['决策'])}")
            if chuantong_gua.get("事业"):
                lines.append(f"- **建功立业**：{clean_text(chuantong_gua['事业'])}")
            if chuantong_gua.get("求名"):
                lines.append(f"- **进修德业**：{clean_text(chuantong_gua['求名'])}")
            lines.append("")
            
        zm_insights = parse_zhangmingren_insights(zhangmingren_gua.get("summary", ""))
        if zm_insights:
            lines.append("### 2. 心性品格与处境警示")
            lines.append(zm_insights)
            lines.append("")
            
        lines.append("---")
        lines.append("")
        
        # 伍· 象数演变思考题
        lines.append("## 伍· 象数演变与延伸思考")
        lines.append(f"- **本卦卦象**：下{trig_lower['nature']}上{trig_upper['nature']}。思考：当【{trig_lower['nature']}】的内在特质遇上【{trig_upper['nature']}】的外在环境，为何会推演出【{name}】的时空处境？")
        lines.append(f"- **中正原则**：二爻为下卦之中，五爻为上卦之中。观察本卦九二/六二、九五/六五是否当位中正？它们各自给出了怎样的进退建议？")
        lines.append("")
        
        with open(fpath, "w", encoding="utf-8") as f:
            f.write("\n".join(lines))
            
    print(f"Successfully generated 64 hexagram archives in {GUA64_DIR}")

def build_philosophy_modules():
    """生成 03_易理哲学与认知模型/ 目录下的 3 篇专题研究"""
    # 1. 易经时位辩证法则
    p1 = os.path.join(PHILOSOPHY_DIR, "01_易经时位辩证法则.md")
    c1 = """# 易经时位辩证法则：从初爻到上爻的人生时空模型

> “六爻之义微矣，夫乾确然，示人易矣；夫坤聩然，示人简矣。” ——《易·系辞下》

《周易》由六画组成重卦，六爻自下而上排列，不仅代表自低到高的空间层次，更代表事物从萌生到终极的时间周期。理解六爻的“时”与“位”，是通晓易经修养哲学的关键。

---

## 壹· 六爻时空演进六阶段模型

| 爻位 | 空间象征 | 阶段定位 | 核心处世准则 | 典型代表（以乾卦为例） |
| :---: | :---: | :---: | :---: | :---: |
| **初爻** | 草野、基层、地表之下 | **萌芽萌动期** | 潜心养晦、慎始防微、不可妄动 | 初九：潜龙勿用 |
| **二爻** | 大地、岗位、崭露头角 | **发展显露期** | 谦逊求师、见重于人、积聚声誉 | 九二：见龙在田，利见大人 |
| **三爻** | 基层顶峰、过渡隘口 | **多凶危疑期** | 夙夜惕励、进退维谷、自省免咎 | 九三：终日乾乾，夕惕若厉 |
| **四爻** | 辅翼之位、中层高阶 | **跃升审慎期** | 试探进取、量力而行、随时顺应 | 九四：或跃在渊，无咎 |
| **五爻** | 天位、君位、领导核心 | **中正圆满期** | 德居尊位、天下归心、大展宏图 | 九五：飞龙在天，利见大人 |
| **上爻** | 极位、太上、周期终局 | **穷极反转期** | 居安思危、适可而止、知进知退 | 上九：亢龙有悔 |

---

## 贰· 易经断位的三大核心法则

### 1. 得正（当位）
- **阳爻居阳位（初、三、五爻）**，或 **阴爻居阴位（二、四、上爻）**，称之为“得正”或“当位”。
- **哲学含义**：才华与岗位匹配，名分相称，行事易顺畅。

### 2. 居中之道（中道）
- **第二爻**为下卦（内卦）之中，**第五爻**为上卦（外卦）之中。
- 易经尚“中”，**中往往重于正**。哪怕不当位，但若居中（如六五以阴居尊中），亦能以柔克刚，通达吉祥。

### 3. 相应与比应
- **初与四、二与五、三与上**：一阴一阳则为“有应”（志同道合、互为奥援）；若同阳或同阴则“无应”（缺乏助力）。
- **比**：相邻两爻（如初与二、四与五）刚柔相济称为“相亲比”。
"""
    with open(p1, "w", encoding="utf-8") as f:
        f.write(c1)

    # 2. 错综复杂卦演化
    p2 = os.path.join(PHILOSOPHY_DIR, "02_六十四卦错综复杂图谱.md")
    c2 = """# 六十四卦错综复杂图谱：多维审视事物的思维模型

> “杂卦者，杂糅众卦，错综其义，或以同相类，或以异相明也。”

古人学易讲究“错综复杂”四法，这不仅是象数推演技巧，更是一套极其高级的辩证决策模型：面对同一件事，从正面、反面、颠倒面、内部交错面进行全息透视。

---

## 壹· 错综复杂四大透视法

1. **正卦（本卦）**：当前所处的事物现状与表面现象。
2. **综卦（反卦/反看）**：
   - **推导方式**：将本卦整幅画象**旋转 180 度**上下颠倒。
   - **哲学智慧**：站在对方的角度看，站在相反立场审视。“换位思考”。
   - *例*：屯卦（水雷屯）颠倒过来即是蒙卦（山水蒙）。事物初创之难（屯），在对方或外人眼中往往是蒙昧待启（蒙）。
3. **错卦（对卦/变面）**：
   - **推导方式**：将本卦六爻阴阳全部互换（阳变阴，阴变阳）。
   - **哲学智慧**：走向事情的对立极面，观察危机潜伏与极限情境。“危机底线思维”。
   - *例*：乾卦（纯阳）的错卦是坤卦（纯阴）；泰卦（地天泰）的错卦是否卦（天地否）。
4. **互卦（交卦/内因）**：
   - **推导方式**：去掉初爻和上爻，取二三四爻为下卦，取三四五爻为上卦。
   - **哲学智慧**：穿透表面现象，洞察事物内部隐蔽的心态、内核纠葛与发展中继阶段。“内因深层审视”。

---

## 贰· 易学思辨的现实意义

任何事物都不是静态孤立的。懂得“错综复杂”，便不会在顺境时狂妄（因知泰必有否之错），不会在困境时绝望（因知剥必有复之机），真正做到孔子所说的“极深而研几”。
"""
    with open(p2, "w", encoding="utf-8") as f:
        f.write(c2)

    # 3. 决策哲学
    p3 = os.path.join(PHILOSOPHY_DIR, "03_易经的决策与处世智慧.md")
    c3 = """# 易经的决策与处世智慧：吉凶悔吝的超脱之道

> “吉凶悔吝者，生乎动者也。” ——《易·系辞上》

《易经》开篇讲乾坤，全篇终结于《既济》与《未济》。它向世人传达的从来不是宿命论，而是如何在充满不确定的动态世界中，通过自我修持、知几自律，达到“无咎”的智慧。

---

## 壹· 吉、凶、悔、吝的辩证流转

在《易经》的断语体系中，存在一个四维循环圈：

1. **吉**：顺应天理人道，合乎时中，行之有得。
2. **吝**：心胸狭隘、迟疑吝啬、贪功恋位；虽未大凶，但已埋下危机的种芽。
3. **凶**：积吝成凶，盲目冒进或刚愎自用招致灾祸。
4. **悔**：遭遇困顿反思悔悟，痛改前非，自强修德；**由悔则能走向吉**。

> **易学至高境界——“无咎”**：  
> “无咎者，善补过也。” 人生不可避免会犯错，但善于反省、顺时修正，就能逢凶化吉，立于不败之地。

---

## 贰· 《易经》三大修身处世支柱

### 1. 刚柔相济（不执一端）
- 乾卦虽纯阳，上九却戒以“亢龙有悔”，用九警以“见群龙无首，吉”——至刚必须化为谦顺。
- 坤卦虽纯阴，六二却勉以“直方大，不习无不利”——柔顺不是懦弱，而是包含坚正的大地品格。

### 2. 居安思危（识微察几）
- “履霜，坚冰至。” 踩到微薄的晨霜，就应当洞察寒冬厚冰即将形成。优秀的决策者永远在萌芽时期看到未来的大势。

### 3. 唯谦受福（六十四卦独此全吉）
- 在整部六十四卦中，每一卦六爻往往都有吉有凶，唯有第 15 卦【地山谦】：
  **初六谦谦君子，六二鸣谦贞吉，九三劳谦君子有终，六四无不利撝谦，六五利用侵伐，上六鸣谦行师**。
  **六爻皆吉无凶！** 天道亏盈而益谦，地道变盈而流谦，人道恶盈而好谦。谦逊守柔，是天地间最稳固的力量。
"""
    with open(p3, "w", encoding="utf-8") as f:
        f.write(c3)

    print(f"Successfully generated philosophy modules in {PHILOSOPHY_DIR}")

def build_ai_handbook(gua_data, interp_data):
    """生成 04_AI极速参考手册/ 极简超低 Token 速查表"""
    card_path = os.path.join(AI_HANDBOOK_DIR, "64卦卦义与卦象速查卡.md")
    
    lines = []
    lines.append("# 六十四卦义理精要速查卡（AI 极速参考表）")
    lines.append("")
    lines.append("> 本表专为大模型、智能体 Agent 与人类学者快速掌握 64 卦核心哲学而设计。")
    lines.append("> 单表仅占用 ~3000 Token，便于一次性完整注入 LLM 上下文作为全局知识参考。")
    lines.append("")
    lines.append("| 序号 | 卦名 | 卦象 | 结构 | 二进制 | 卦德与核心处世哲学 | 一句话修身大象 |")
    lines.append("| :---: | :--- | :---: | :---: | :---: | :--- | :--- |")
    
    for item in gua_data:
        xuhao = item["xuhao"]
        str_id = str(xuhao)
        name = item["name"]
        bin_code = item["binary"]
        symbol = item.get("symbol", "")
        
        lower_bin = bin_code[:3]
        upper_bin = bin_code[3:]
        trig_lower = TRIGRAMS.get(lower_bin, {"name": "", "nature": ""})
        trig_upper = TRIGRAMS.get(upper_bin, {"name": "", "nature": ""})
        
        structure = f"{trig_upper['nature']}上{trig_lower['nature']}下"
        
        interp = interp_data.get(str_id, {})
        ct = interp.get("guaci_interpretation", {}).get("chuantong", {})
        daxiang = clean_text(ct.get("大象", item.get("xiangci", "")))
        summary = clean_text(ct.get("summary", ""))
        
        # 提炼核心哲学一句
        if len(daxiang) > 28:
            daxiang = daxiang[:28] + "..."
        if len(summary) > 35:
            summary = summary[:35] + "..."
            
        lines.append(f"| {xuhao:02d} | **{name}** | {symbol} | {structure} | `{bin_code}` | {summary} | {daxiang} |")
        
    with open(card_path, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))
        
    # 词典
    dict_path = os.path.join(AI_HANDBOOK_DIR, "易学术语与基础概念辞典.md")
    dict_content = """# 易学术语与基础概念词典

> 帮助 AI 消除概念幻觉，精准理解易经专业名词的严谨定义。

---

## 壹· 经传结构术语
- **经（周易古经）**：包含六十四卦的卦画、卦名、卦辞（文王作）与三百八十四爻爻辞（周公作）。
- **传（易传 / 十翼）**：相传孔子所作解易的十篇论著：
  - 《彖传》上下：总释卦名、卦象及卦辞之宏义；
  - 《象传》上下：分大象（释整卦天人之道）与小象（释各爻之微德）；
  - 《系辞传》上下：易学通论，系统阐述宇宙观与辩证法则；
  - 《文言传》：专门深度发挥乾、坤二卦之至理；
  - 《说卦传》：详述八卦万物类象与性质；
  - 《序卦传》：阐述六十四卦相生相承的排列次序与逻辑演变；
  - 《杂卦传》：打破文王卦序，两两相对反衬卦义。

---

## 贰· 象数与卦画术语
- **爻（Yáo）**：组成卦象的最小单位。阳爻记作“—”（代表刚、明、动、健），阴爻记作“--”（代表柔、暗、静、顺）。
- **经卦（单卦 / 八卦）**：由三个爻组成的卦，共八个（乾坤震巽坎离艮兑）。
- **别卦（复卦 / 重卦）**：由上下两个单卦相重叠而成的六爻卦，共六十四卦。
- **初爻 / 上爻**：六爻由下往上数，最底下一爻为初爻，最顶上一爻为上爻。阳爻称“九”，阴爻称“六”（如初九、六二、九五等）。
- **错卦**：阴阳完全颠倒对立之卦。
- **综卦**：卦象旋转 180 度反转颠倒之卦。
- **互卦**：取二三四爻为下卦、三四五爻为上卦组成的内联卦。

---

## 叁· 易理哲学核心范畴
- **元亨利贞**：
  - **元**：始生、仁德、万物之始；
  - **亨**：亨通、礼顺、成长发达；
  - **利**：祥和、义利、利益均沾；
  - **贞**：正固、智慧、守持正道。
- **中正**：二爻居下卦之中，五爻居上卦之中为“中”；阴爻居阴位、阳爻居阳位为“正”。中正兼具是易经最高尚的德行。
- **变易·简易·不易**（易之一名而含三义）：
  - **变易**：天地万物无时无刻不在运动变化；
  - **简易**：大道至简，阴阳两仪可化生天地万物；
  - **不易**：在千变万化之中，阴阳消长的自然法则是永恒不变的。
"""
    with open(dict_path, "w", encoding="utf-8") as f:
        f.write(dict_content)
        
    print(f"Successfully generated AI handbooks in {AI_HANDBOOK_DIR}")

def main():
    print("Starting full knowledge base build pipeline...")
    gua_data, interp_data = load_data()
    print(f"Loaded {len(gua_data)} hexagram records.")
    
    build_bagua_basics()
    build_64_gua_archives(gua_data, interp_data)
    build_philosophy_modules()
    build_ai_handbook(gua_data, interp_data)
    
    print("Pipeline execution completed successfully!")

if __name__ == "__main__":
    main()
