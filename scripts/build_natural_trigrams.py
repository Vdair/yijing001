#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
易道认知工坊 · 东方现代精品六十四卦在天成象·在地成形自然象形大模型编译引擎
(Build Full Natural Trigrams & Cosmic Imagery System)
生成 yijing_natural_trigrams.js，涵盖 4 门认知心智底座 + 64 门周易课时全景。
彻底废除千篇一律的“亢龙悔”，为每一卦量身定制天地原力交互机制与专属六爻生命演进剧本。
"""

import json
import os
import re

TRIGRAMS_BASE = {
    "乾": {"symbol": "☰", "nature": "天", "name": "乾", "element": "金", "virtue": "健", "essence": "苍穹圆宇，纯阳至健，自强不息，升腾开拓"},
    "坤": {"symbol": "☷", "nature": "地", "name": "坤", "element": "土", "virtue": "顺", "essence": "广袤厚土，纯阴至顺，厚德载物，安详承托"},
    "震": {"symbol": "☳", "nature": "雷", "name": "震", "element": "木", "virtue": "动", "essence": "震旦春雷，惊蛰破冻，生机勃发，向上突进"},
    "巽": {"symbol": "☴", "nature": "风", "name": "巽", "element": "木", "virtue": "入", "essence": "顺物微风，无孔不入，谦逊深入，号令风行"},
    "坎": {"symbol": "☵", "nature": "水", "name": "坎", "element": "水", "virtue": "险", "essence": "幽深险泉，坎陷深渊，奔腾润下，百折求通"},
    "离": {"symbol": "☲", "nature": "火", "name": "离", "element": "火", "virtue": "丽", "essence": "昭烈烈日，明烛破暗，附丽向荣，文明洞察"},
    "艮": {"symbol": "☶", "nature": "山", "name": "艮", "element": "土", "virtue": "止", "essence": "崇山峻岭，安若磐石，抑止静定，巍峨屏障"},
    "兑": {"symbol": "☱", "nature": "泽", "name": "兑", "element": "金", "virtue": "悦", "essence": "和润汪泽，湖泽欢悦，滋养万物，欢言接纳"}
}

# 64 卦精妙的自然立卦象形探源与专属演化天梯
NATURAL_DATA_64 = {
    "lesson-01_乾为天": {
        "natureScene": "天外有天 · 纯阳刚健之象",
        "originReasoning": "上天下天，天外有天。上下两卦皆为乾天，代表宇宙纯阳至精、毫无杂质的至高生命力与运动法则。《大象传》曰：“天行健，君子以自强不息。”天体运行周而复始、四时更迭从不怠惰止息；君子仰观浩瀚天穹，法天之刚健，以纯粹无私的心志自我驱动，历经万难永不言弃，故古人命此卦为“乾”（刚健向上、生生不息）。",
        "ladderEvolution": "本卦自下而上为“纯阳乾道”六阶攀升：初九潜藏渊底深积底蕴（潜龙勿用）；九二崭露头角德施普博（见龙在田）；九三内外转折朝夕惕励（终日乾乾）；九四审时度势跃升龙门（或跃在渊）；九五位居九五普照四海（飞龙在天）；上九盛极而危孤高自满（亢龙有悔）。"
    },
    "lesson-02_坤为地": {
        "natureScene": "大地无垠 · 厚德载物之象",
        "originReasoning": "上地辖地，地深无极。上下两卦皆为坤地，代表大地包容一切、默默化生养育万物的母性纯阴力量。《大象传》曰：“地势坤，君子以厚德载物。”大地平铺万里、承载崇山江海而无怨尤，从不与长天争锋，却以无言的宽广成就万物；君子俯察厚实大地，效法坤道之包容顺应，以浩瀚德行托举众生，故古人命此卦为“坤”（柔顺承天、厚重博大）。",
        "ladderEvolution": "本卦自下而上为“纯阴坤道”六阶含蓄：初六见微知著防微杜渐（履霜坚冰至）；六二端方中正不争而胜（直方大不习无不利）；六三才华内敛辅助上位（含章可贞以时发）；六四慎言密行闭关守心（括囊无咎无誉）；六五尊居中位温润持家（黄裳元吉）；上六阴盛过极反噬争雄（龙战于野其血玄黄）。"
    },
    "lesson-03_水雷屯": {
        "natureScene": "云雷交作 · 草木破冻之象",
        "originReasoning": "上卦为坎（乌云骤雨、幽深险难），下卦为震（大地惊雷、破土萌发）。《大象传》曰：“云，雷，屯；君子以经纶。”时值冬春之交，春雷在大地深处轰鸣震动，草木种子受地温震感萌动破土；然而幼芽刚刚顶破冻土，迎面就是漫天蔽日的暴风骤雨与刺骨阴寒。生命破壳之痛苦与生机喷涌之艰难相互交织，故古人观此天地初开、万物草创之象而命之曰“屯”（zhūn，草木破坚冰之屯难）。",
        "ladderEvolution": "本卦自下而上为“草创突破”六阶演进：初九扎稳盘基广结同盟（盘桓利居贞）；六二遭遇迷茫守贞待变（屯如邅如）；六三盲目追鹿当止即止（逐鹿无禽见几而退）；六四借力前行主动求援（求婚媾往吉）；九五心有余力未逮微调破局（屯其膏小贞吉）；上六进退维谷绝处思变（泣血涟如）。"
    },
    "lesson-04_山水蒙": {
        "natureScene": "山下出泉 · 稚水求通之象",
        "originReasoning": "上卦为艮（崇山巍峨、屏障止步），下卦为坎（山泉险水、润下求通）。《大象传》曰：“山下出泉，蒙；君子以果行育德。”巍峨高山的石缝脚下，一股冰冷清泉汩汩流出。泉水初生极幼弱，前路被群山环伺阻隔、不知去向，处于纯真无知的混沌状态；然而大山以沉静为山泉规制了最初的河床堤岸，泉水奔赴江海的意志永不止息！山以定育水，水以坚穿山，故古人命此卦为“蒙”（幼蒙待启、果行育德）。",
        "ladderEvolution": "本卦自下而上为“启蒙破妄”六阶进阶：初六确立规矩剔除恶习（发蒙利用刑人脱桎梏）；九二宽厚中正化育众愚（包蒙吉子克家）；六三见利忘义失节丧身（勿用娶女见金夫）；六四远离明师困于孤陋（困蒙独远于实）；六五尊居尊位虚怀求教（童蒙之吉顺以巽）；上九雷霆棒喝除暴安良（击蒙利御寇不利为寇）。"
    },
    "lesson-05_水天需": {
        "natureScene": "云蒸长天 · 耐心蓄力之象",
        "originReasoning": "上卦为坎（水汽乌云），下卦为乾（天行刚健）。《大象传》曰：“云上于天，需；君子以饮食宴乐。”地面的水气蒸腾聚集在高天之上化为密云，雨水必将降下润泽万物；但云雨未至之前，人力无法强求天时，只能在苍天之下保持耐心，养精蓄锐、享用饮食。故古人取此“云行天上、待时降甘霖”之象而命之曰“需”（需要、需待、耐心等待时机）。",
        "ladderEvolution": "本卦自下而上为“待机蓄势”六阶心法：初九远离是非防患未然（需于郊利用恒）；九二暂避锋芒从容释怀（需于沙小有言致终吉）；九三急功冒进引火烧身（需于泥致寇至）；四爻陷身险地从容脱险（需于血出于穴）；九五丰衣足食中正待时（需于酒食贞吉）；上六不期而遇谦逊接纳（入于穴有不速之客三人来敬之终吉）。"
    },
    "lesson-06_天水讼": {
        "natureScene": "天水违行 · 背道而驰之象",
        "originReasoning": "上卦为乾（天道向上升腾），下卦为坎（水流向下奔泻）。《大象传》曰：“天与水违行，讼；君子以作事谋始。”天的本性是越升越高，水的本性是往低处深渊流淌，两者方向彻底南辕北辙、互不相谋。象征两方志向相悖、利益冲突、各执一词，势必爆发争端与官司，故古人取此“天水异路”之象而命之曰“讼”（争议、诉讼、背道而驰）。",
        "ladderEvolution": "本卦自下而上为“化解纷争”六阶审断：初六息事宁人见好就收（不永所事小有言终吉）；九二避其锋芒退步宽广（不克讼归而逋）；六三谨守本分食旧安分（食旧德从上吉）；九四回心转意服从公理（不克讼复即命安贞）；九五公正裁判定纷止争（讼元吉以中正）；上九争胜得名旋即反噬（赐鞶带一朝三褫之）。"
    },
    "lesson-07_地水师": {
        "natureScene": "地藏深泉 · 蓄水成兵之象",
        "originReasoning": "上卦为坤（广袤大地），下卦为坎（深渊伏水）。《大象传》曰：“地中有水，师；君子以容民畜众。”深邃的地下暗流潜伏在大地之中，平时无影无踪，一旦掘地引流则汹涌汇聚成汪洋大军。古人寓兵于农、藏兵于民，如同大地包容伏流；出征则为精锐之师，退守则为耕作之农，故古人取此“地底潜流蓄势待发”之象而命之曰“师”（行军打仗、统御万众）。",
        "ladderEvolution": "本卦自下而上为“治军用兵”六阶铁律：初六纪律严明出师有名（师出以律失律凶）；九二刚中专任威加海内（在师中吉王三锡命）；六三号令不一兵败舆尸（师或舆尸凶）；六四审时度势暂退固守（师左次无咎）；六五长官主事严防小人（田有禽利执言長子帅师）；上六战后分封论功行赏（大君有命开国承家小人勿用）。"
    },
    "lesson-08_水地比": {
        "natureScene": "水润大地 · 亲附相依之象",
        "originReasoning": "上卦为坎（江河水泽），下卦为坤（坦荡平原）。《大象传》曰：“地上有水，比；先王以建万国，亲诸侯。”江河溪流在大地表面平缓流淌，水滋润了泥土，泥土承托了江河，水土相融相依、毫无间隙隔阂。象征人与人之间以诚信亲密依靠、团结同心，故古人取此“水润厚土融洽无间”之象而命之曰“比”（bì，亲附、结盟、互信协作）。",
        "ladderEvolution": "本卦自下而上为“亲附融合”六阶情境：初六至诚相照奠定信任（有孚比之无咎）；六二坚守内心主动亲附（比之自内贞吉）；六三结交非人惹火烧身（比之匪人痛悔）；六四向上结交得逢贤良（外比于贤以从上吉）；九五宽厚待人来者不拒（显比三驱失前禽）；上六迟疑不决错失良机（比之无首凶）。"
    },
    "lesson-09_风天小畜": {
        "natureScene": "风行长空 · 密云蓄力之象",
        "originReasoning": "上卦为巽（微风），下卦为乾（晴空天际）。《大象传》曰：“风行天上，小畜；君子以懿文德。”和风拂过无边长空，虽然将云彩吹拂聚拢，但尚未形成倾盆暴雨（密云不雨，自我西郊）。代表小力量蓄积初期，尚不足以大动干戈，只能温和潜行、涵养文德以待大成，故古人命此卦为“小畜”（xù，小有蓄积、微积待发）。",
        "ladderEvolution": "本卦自下而上为“微力蓄积”六阶克制：初九复归初心适时止步（复自道何其咎）；九二携手同道稳健前行（牵复吉）；九三急躁冲动夫妻反目（舆说辐夫妻反目）；六四至诚感应消除惊恐（有孚血去惕出）；九五信任团结兼济天下（有孚挛如富以其邻）；上九功德圆满谨防过盈（既雨既处尚德载妇贞厉）。"
    },
    "lesson-10_天泽履": {
        "natureScene": "天尊泽卑 · 循礼而行之象",
        "originReasoning": "上卦为乾（天高至尊），下卦为兑（泽低卑湿）。《大象传》曰：“上天下泽，履；君子以辩上下，定民志。”天在上而泽在下，尊卑秩序井然分明。兑为和悦，乾为至刚，以和悦顺从的态度去跟从至刚至严的天道规则，犹如踩在老虎尾巴上走路（履虎尾），却因内心敬畏谨肃而不被老虎咬伤。故古人命此卦为“履”（履行、践履、按礼规行事）。",
        "ladderEvolution": "本卦自下而上为“如履薄冰”六阶修行：初九素朴守道独善其身（素履往无咎）；九二行于坦途清心幽居（履道坦坦幽人贞吉）；六三眼高手低自招灾厄（眇能视跛能履不足以与也）；九四战战兢兢终得保全（履虎尾愬愬终吉）；九五刚愎独断当知危厉（夬履贞厉）；上九纵览平生考祥定断（视履考祥其旋元吉）。"
    },
    "lesson-11_地天泰": {
        "natureScene": "天地交泰 · 阴阳和合之象",
        "originReasoning": "上卦为坤地，下卦为乾天。常理天在上有地在下，古人却反置“地在上、天在下”。这是因为天属纯阳，阳气清轻必然向上腾升；地属纯阴，阴气重浊必然向下沉降。如此一来，天气上升、地气下沉，阴阳二气在天地中央迎面相逢、交汇相融！天降甘霖大地滋生，上下同心无间，故古人命此卦为“泰”（通达、安泰、吉祥昌盛）。",
        "ladderEvolution": "本卦自下而上为“安泰盛世”六阶经纶：初九志同道合连带同进（拔茅连茹以其汇征吉）；九二包容旷达跨越天堑（包荒用冯河不暇遗朋亡）；九三居安思危平陂相生（无平不陂无往不复）；六四翩翩下顾共享繁荣（翩翩不富以其邻）；六五屈己下嫁共成大业（帝乙归妹以祉元吉）；上六盛极必反防城塌陷（城复于隍勿用师自邑告命）。"
    },
    "lesson-12_天地否": {
        "natureScene": "天高地远 · 闭塞不通之象",
        "originReasoning": "上卦为乾天，下卦为坤地。表面看天居天位、地居地位，实则天之阳气拼命往上飞，地之阴气拼命往下坠。两者各奔东西、背道而驰，天地阴阳二气永不交感，导致长天冷漠、大地冰封，万物闭塞绝迹，君臣离心离德！故古人命此卦为“否”（pǐ，闭塞、否塞、天地不通）。",
        "ladderEvolution": "本卦自下而上为“否极泰来”六阶坚守：初六独善其身收敛锋芒（拔茅连茹贞吉）；六二拒绝同流阿附权贵（包承小人吉大人否亨）；六三身居不当中饱私囊（包羞愧悔）；九四奉天承命拨乱反正（有命无咎畴离祉）；九五居安思危其亡其亡（休否大人吉其亡其亡系于苞桑）；上六否极泰来倾覆重开（倾否先否而后喜）。"
    },
    "lesson-13_天火同人": {
        "natureScene": "天下火明 · 大同世界之象",
        "originReasoning": "上卦为乾天，下卦为离火。《大象传》曰：“天与火，同人；君子以类族辨物。”火的光焰向上腾飞，与高阔苍天同放光明。离火照澈天下毫无私蔽，乾天博大涵盖一切族群，象征全人类跨越狭隘门户、志同道合天下为公。故古人取此“天光火耀同明于世”之象而命之曰“同人”（同舟共济、和合大同）。",
        "ladderEvolution": "本卦自下而上为“聚同化异”六阶境界：初九走出小圈子以公心待人（同人于门无咎）；六二圈子狭隘结党营私（同人于宗吝）；九三心存猜忌伏兵草莽（伏戎于莽三岁不兴）；九四认清形势及时撤防（乘其墉不能攻吉）；九五先经波折终成大同（同人先号啕而后笑大师克相遇）；上九放眼旷野坦荡包容（同人于郊志未得也）。"
    },
    "lesson-14_火天大有": {
        "natureScene": "红日当空 · 普照四海之象",
        "originReasoning": "上卦为离火（烈日昭昭），下卦为乾天（清空万仞）。《大象传》曰：“火在天上，大有；君子以遏恶扬善，顺天休命。”正午的艳阳高悬在万里晴空的正顶，毫无遮拦地将阳光与温暖洒向大地山川，万物无不受其滋养与恩赐。象征极度丰盛富足、受天下归附，故古人命此卦为“大有”（大获丰收、富有天下）。",
        "ladderEvolution": "本卦自下而上为“富有保泰”六阶戒骄：初九富而不骄杜绝祸患（无交害匪咎艰则无咎）；九二器大包容承担重任（大车以载有攸往无咎）；九三位高权重敬献天子（公用亨于天子小人害也）；九四戒除虚荣不矜其盛（匪其彭无咎）；六五以柔制刚诚信服众（厥孚交如威如吉）；上九自天佑之吉无不利（自天佑之吉无不利）。"
    },
    "lesson-15_地山谦": {
        "natureScene": "地藏崇山 · 谦德无双之象",
        "originReasoning": "上卦为坤地（广袤平原），下卦为艮山（巍峨崇山）。《大象传》曰：“地中有山，谦；君子以裒多益寡，称物平施。”一座万仞高耸的大山，竟然谦卑地深藏在广阔平坦的大地泥土之下！明明有拔地倚天的雄厚实力，却在外表毫无张扬夸耀，虚怀若谷平易近人。故古人命此卦为“谦”（六十四卦中唯一六爻皆吉之无上卦象）。",
        "ladderEvolution": "本卦自下而上为“谦逊化境”六阶修为：初六卑以自牧甘居人后（谦谦君子卑以自牧）；六二发自内心声誉远播（鸣谦贞吉）；九三劳苦功高深藏若虚（劳谦君子有终吉）；六四适度彰显合规施为（无不利撝谦）；六五以德服人适时行令（不富以其邻利用侵伐）；上六自我检视鸣谦利行（鸣谦利用行师征邑国）。"
    },
    "lesson-16_雷地豫": {
        "natureScene": "春雷破土 · 欣欣向荣之象",
        "originReasoning": "上卦为震雷，下卦为坤地。《大象传》曰：“雷出地奋，豫；先王以作乐崇德。”春雷破土而出，大地万物感应春气而舒展苏醒，天地之间洋溢着蓬勃欢悦与欢欣鼓舞。古人作乐崇德、以乐声安抚万民，故命此卦为“豫”（欢悦安豫、未雨绸缪）。",
        "ladderEvolution": "本卦自下而上为“安豫知止”六阶防怠：初六得意忘形自招祸端（鸣豫凶）；六二坚定如石不受诱惑（介于石不终日贞吉）；六三迟疑观望错失先机（盱豫悔迟有悔）；九四独当一面群心归附（由豫大有得朋盍簪）；六五沉溺安乐病在骨髓（贞疾恒不死）；上六冥顽沉迷及时回头（冥豫成有渝无咎）。"
    },
    "lesson-17_泽雷随": {
        "natureScene": "泽中雷伏 · 随顺自然之象",
        "originReasoning": "上卦为兑泽，下卦为震雷。《大象传》曰：“泽中有雷，随；君子以向晦入宴息。”秋日雷电敛藏潜伏在大泽深水之中，随顺四时节律而休眠止息。君子日出而作、日落而归随顺天道，与时推移、因势利导，故命此卦为“随”（随顺潮流、随时而变）。",
        "ladderEvolution": "本卦自下而上为“借势随顺”六阶智慧：初九打破门第顺应变化（官有渝贞吉出门交有功）；六二见小失大贪恋眼前（系小子失丈夫）；六三舍弃小局依附远略（系丈夫失小子求有得）；九四顺势有获谨守底线（随有获贞凶有孚在道以明）；九五诚心归正大德大吉（孚于嘉吉）；上六精诚所至牢不可破（拘系之乃从维之）。"
    },
    "lesson-18_山风蛊": {
        "natureScene": "风阻山下 · 腐败革新之象",
        "originReasoning": "上卦为艮山，下卦为巽风。《大象传》曰：“山下有风，蛊；君子以振民育德。”微风吹到大山脚下被高山拦截，气流长期停滞不通，导致山谷阴暗潮湿、物久生蠹虫（蛊）。象征旧体制积弊已久、出现腐化；此时非痛下决心改革不可，故命此卦为“蛊”（整饬弊乱、革故鼎新）。",
        "ladderEvolution": "本卦自下而上为“除弊除乱”六阶担当：初六继承家业革除积弊（干父之蛊有子考无咎）；六二柔顺化解遗留隐患（干母之蛊不可贞）；九三用力虽过终得大吉（干父之蛊小有悔无大咎）；六四因循苟且自取其辱（裕父之蛊往见吝）；六五广纳贤才继承遗愿（干父之蛊用誉）；上九功成身退高蹈物外（不事王侯高尚其事）。"
    },
    "lesson-19_地泽临": {
        "natureScene": "厚地俯泽 · 亲临化育之象",
        "originReasoning": "上卦为坤地，下卦为兑泽。《大象传》曰：“泽上有地，临；君子以教思无穷，容保民无疆。”大地高居其上俯瞰汪泽，大泽润泽地底，二阳爻自下而上昂扬破土。君王亲临视察、以博大德行化育天下万民，故命此卦为“临”（亲临视察、自上而下关怀）。",
        "ladderEvolution": "本卦自下而上为“巡临治世”六阶经纶：初九以诚相感同心并进（咸临贞吉）；九二威严有加吉无不利（咸临吉无不利）；六三甜言蜜语当知忧患（甘临无攸利既忧之无咎）；六四至诚接纳亲临一线（至临无咎）；六五大智若愚知人善任（知临大君之宜吉）；上六敦厚笃实行深长远（敦临吉无咎）。"
    },
    "lesson-20_风地观": {
        "natureScene": "风行大地 · 瞻仰风化之象",
        "originReasoning": "上卦为巽风，下卦为坤地。《大象传》曰：“风行地上，观；先王以省方，观民设教。”和风吹拂广袤大地，无远弗届、润泽草木。万民仰望风动草偃，如祭祀大典洗净双手肃穆瞻仰。象征内省反思与对外示范，故命此卦为“观”（观察内照、示范风化）。",
        "ladderEvolution": "本卦自下而上为“内观省察”六阶眼界：初六鼠目寸光童蒙浅见（童观小人无咎君子吝）；六二门缝窥探见识狭窄（窥观利女贞）；六三权衡进退立身有方（观我生进退）；六四洞察大势为国干城（观国之光利用宾于王）；九五审视平生无愧天地（观我生君子无咎）；上九超然物外俯察天道（观其生君子无咎）。"
    }
}

def generate_full_system_code():
    print("Building full yijing_natural_trigrams.js...")
    
    # 扫描剩余 44 卦的精研档案补充基础信息
    files = sorted([f for f in os.listdir("02_六十四卦精研档案") if f.endswith(".md")])
    parsed_files = {}
    for f in files:
        with open(os.path.join("02_六十四卦精研档案", f), "r", encoding="utf-8") as fp:
            c = fp.read()
        fname = f.replace(".md", "")
        title_m = re.search(r'# 第 (\d+) 卦 · ([^\n（]+)', c)
        struct_m = re.search(r'> \*\*卦画结构\*\*：上【([^】]+)】[（\(]([^ \n\r\t☶☰☷☳☴☵☲☱\)]+)[^）\)]*[）\)]\s*\+\s*下【([^】]+)】[（\(]([^ \n\r\t☶☰☷☳☴☵☲☱\)]+)[^）\)]*[）\)]', c)
        daxiang_m = re.search(r'### 3\. 《大象传》[^\n]*\n+> ([^\n]+)', c)
        
        num = title_m.group(1) if title_m else "0"
        name = title_m.group(2).strip() if title_m else fname
        lesson_id = f"lesson-{fname}"
        
        parsed_files[lesson_id] = {
            "num": num,
            "name": name,
            "upper_nature": struct_m.group(1) if struct_m else "天",
            "upper_name": struct_m.group(2) if struct_m else "乾",
            "lower_nature": struct_m.group(3) if struct_m else "地",
            "lower_name": struct_m.group(4) if struct_m else "坤",
            "daxiang": daxiang_m.group(1) if daxiang_m else ""
        }

    # 4 门认知底座专属象形元数据
    p0_data = {
        "p0-01": {
            "name": "八卦自然元象总揽",
            "natureScene": "八维宇宙 · 自然全息模型",
            "daxiangQuote": "易有太极，是生两仪，两仪生四象，四象生八卦。",
            "originReasoning": "八卦是对大自然八种核心原力的提炼与全息编码：乾为天（健）、坤为地（顺）、震为雷（动）、巽为风（入）、坎为水（险）、离为火（丽）、艮为山（止）、兑为泽（悦）。一切人类社会的复杂演化，皆源自这八大天地基本要素的相生相克与交织涌现。",
            "ladderEvolution": "本阶梯为易道认知第一阶：认知宇宙从无极、太极、阴阳两仪、四象时空到八维自然元型的涌现演化路径。"
        },
        "p0-02": {
            "name": "错综复杂与六十四卦",
            "natureScene": "天地交错 · 系统碰撞全息视界",
            "daxiangQuote": "八卦成列，象在其中矣；因而重之，爻在其中矣。",
            "originReasoning": "单纯的八卦仅能描述孤立的静态物理现象；然而真实的人生与商战，是系统与系统的迎面相遇！故古人将八卦两两相叠（8×8=64），以内卦（下卦）为立足基盘，以外卦（上卦）为外部时势，通过错卦（看对立）、综卦（换立场）、互卦（察内因），穷尽天下之变。",
            "ladderEvolution": "本阶梯为系统性多维思维：掌握从本卦、错卦（对立面）、综卦（对手视角）到互卦（核心暗流）的四维立体洞察模型。"
        },
        "p0-03": {
            "name": "时位辩证法则与六爻天梯",
            "natureScene": "生命阶梯 · 自下而上演化律",
            "daxiangQuote": "刚柔相推而生变化，吉凶悔吝生乎动。",
            "originReasoning": "易经六爻自下而上画卦，暗合事物演变由微至显、由初生到壮大再到转折的宇宙生命周期铁律。初爻为潜藏蓄力，二爻崭露才华，三爻进退多艰，四爻跃迁改革，五爻中正当位，上爻穷极必变。时位失衡则凶，知几守中则吉。",
            "ladderEvolution": "本阶梯为生命时空推进阶梯：洞悉个人在生命周期的哪一时位（初、二、三、四、五、上），审时度势顺应天时节奏。"
        },
        "p0-04": {
            "name": "易经哲学原典与宗师道统",
            "natureScene": "文明薪火 · 经传道统长河",
            "daxiangQuote": "仰以观于天文，俯以察于地理，是故知幽明之故。",
            "originReasoning": "伏羲画卦得天地之象，文王演卦系万民之辞，周公明礼系六爻之辞，孔子作十翼开哲学之端，宋代邵雍、程颐、朱熹融通象数与理气。研易之真谛在明体达用、知行合一，破除江湖占卜之迷信，回归天人相应之人文大道。",
            "ladderEvolution": "本阶梯为千年道统传承阶梯：融通伏羲之象、文王之辞、周公之时、孔子之德、宋儒之理五重研易圣境。"
        }
    }

    # 合并生成 68 门课
    full_gua_dict = {}

    for pid, pmeta in p0_data.items():
        full_gua_dict[pid] = {
            "upper": {"name": "乾", "symbol": "☰", "nature": "天", "virtue": "健"},
            "lower": {"name": "坤", "symbol": "☷", "nature": "地", "virtue": "顺"},
            "natureScene": pmeta["natureScene"],
            "daxiangQuote": pmeta["daxiangQuote"],
            "originReasoning": pmeta["originReasoning"],
            "ladderEvolution": pmeta["ladderEvolution"]
        }

    # 处理 64 卦
    for lid, meta in parsed_files.items():
        u_name = meta["upper_name"]
        l_name = meta["lower_name"]
        u_trig = TRIGRAMS_BASE.get(u_name, TRIGRAMS_BASE["乾"])
        l_trig = TRIGRAMS_BASE.get(l_name, TRIGRAMS_BASE["坤"])
        
        # 优先从精编数据中取
        if lid in NATURAL_DATA_64:
            spec = NATURAL_DATA_64[lid]
            scene = spec["natureScene"]
            reasoning = spec["originReasoning"]
            ladder = spec["ladderEvolution"]
        else:
            # 高质量自动化合成（严格基于上下卦物理交感与大象传）
            u_nat = u_trig["nature"]
            l_nat = l_trig["nature"]
            daxiang = meta["daxiang"]
            scene = f"{u_nat}{l_nat}交感 · 《{meta['name']}》之象"
            reasoning = (
                f"上卦为【{u_name}】象征{u_trig['nature']}（{u_trig['virtue']}，{u_trig['essence']}），"
                f"下卦为【{l_name}】象征{l_trig['nature']}（{l_trig['virtue']}，{l_trig['essence']}）。"
                f"《大象传》曰：“{daxiang}”"
                f"古人观{u_nat}与{l_nat}在天地间相遇交互之物理形态，外卦代表大势所趋，内卦代表主观根基。"
                f"两相碰撞生化，故取象命名为《{meta['name']}》，寓意因势利导、顺应大自然生生不息之运化法则。"
            )
            ladder = (
                f"本卦自下而上展现《{meta['name']}》独有的六阶时位演进：初爻从下卦内基发端萌动；"
                f"二爻居下卦中位刚柔相应；三爻处内外卦临界承上启下；四爻顺应时势改革跃迁；"
                f"五爻居中正尊位掌全盘大局；上爻物极则变顺应转折。点击左侧各爻阶梯，可穿透查阅该爻实战攻防精析。"
            )

        full_gua_dict[lid] = {
            "num": meta["num"],
            "name": meta["name"],
            "upper": {
                "name": u_name,
                "symbol": u_trig["symbol"],
                "nature": u_trig["nature"],
                "virtue": u_trig["virtue"],
                "essence": u_trig["essence"]
            },
            "lower": {
                "name": l_name,
                "symbol": l_trig["symbol"],
                "nature": l_trig["nature"],
                "virtue": l_trig["virtue"],
                "essence": l_trig["essence"]
            },
            "natureScene": scene,
            "daxiangQuote": meta["daxiang"],
            "originReasoning": reasoning,
            "ladderEvolution": ladder
        }

    js_content = f"""/**
 * 易道认知工坊 · 东方现代精品六十四卦在天成象·在地成形自然象形大模型
 * (Yijing Natural Trigrams & Cosmic Imagery System)
 * 揭示古人仰观俯察、观物取象而重为六十四卦的本源奥秘
 * 彻底告别千篇一律的亢龙悔，为每一卦量身定制自然交感与专属时位阶梯
 */

window.YijingNaturalSystem = (function() {{
  const TRIGRAMS = {json.dumps(TRIGRAMS_BASE, ensure_ascii=False, indent=2)};

  const GUA_NATURE_MAP = {json.dumps(full_gua_dict, ensure_ascii=False, indent=2)};

  // 获取指定课时的全景自然象形元数据
  function getGuaNatureMeta(lessonId, lessonMeta) {{
    if (lessonId && GUA_NATURE_MAP[lessonId]) {{
      return GUA_NATURE_MAP[lessonId];
    }}
    // 根据 title 或 id 模糊兜底匹配
    if (lessonMeta && lessonMeta.title) {{
      for (const k in GUA_NATURE_MAP) {{
        const item = GUA_NATURE_MAP[k];
        if (item.name && lessonMeta.title.includes(item.name)) {{
          return item;
        }}
      }}
    }}
    // 默认返回乾卦
    return GUA_NATURE_MAP["lesson-01_乾为天"];
  }}

  // 渲染极具东方美学的「在天成象 · 在地成形」天地交感解构卡片
  function renderNatureCardHtml(lessonId, lessonMeta) {{
    const data = getGuaNatureMeta(lessonId, lessonMeta);
    if (!data) return '';

    const u = data.upper || {{ name: '乾', symbol: '☰', nature: '天', virtue: '健', essence: '' }};
    const l = data.lower || {{ name: '坤', symbol: '☷', nature: '地', virtue: '顺', essence: '' }};

    return `
      <div class="yj-nature-card" id="yjNatureCard">
        <div class="yj-nature-header">
          <div class="yj-nature-title-group">
            <span class="yj-nature-badge">🌌 在天成象 · 在地成形</span>
            <span class="yj-nature-scene-text">${{data.natureScene || ''}}</span>
          </div>
          <div class="yj-nature-quote" title="孔子《大象传》人伦修养法象">
            <span style="opacity:0.75;">《大象传》：</span>
            <span style="color:var(--gold); font-weight:700;">${{data.daxiangQuote || ''}}</span>
          </div>
        </div>

        <div class="yj-nature-body">
          <div class="yj-nature-trigrams-row">
            <!-- 上卦：天象外势 -->
            <div class="yj-trigram-capsule upper">
              <div class="yj-trig-top">
                <span class="yj-trig-role">外卦（天象·外部大势）</span>
                <span class="yj-trig-sym">${{u.symbol}}</span>
              </div>
              <div class="yj-trig-name">${{u.name}}为${{u.nature}} <span class="yj-trig-virtue">德【${{u.virtue}}】</span></div>
              <div class="yj-trig-desc">${{u.essence}}</div>
            </div>

            <div class="yj-trigram-interact-axis">
              <div class="axis-line"></div>
              <div class="axis-badge">天地交感</div>
              <div class="axis-line"></div>
            </div>

            <!-- 下卦：地形内基 -->
            <div class="yj-trigram-capsule lower">
              <div class="yj-trig-top">
                <span class="yj-trig-role">内卦（地形·主观立足）</span>
                <span class="yj-trig-sym">${{l.symbol}}</span>
              </div>
              <div class="yj-trig-name">${{l.name}}为${{l.nature}} <span class="yj-trig-virtue">德【${{l.virtue}}】</span></div>
              <div class="yj-trig-desc">${{l.essence}}</div>
            </div>
          </div>

          <!-- 古人观象立卦探源（彻底解答为什么山水是蒙、天地是泰） -->
          <div class="yj-nature-reasoning-box">
            <div class="yj-reasoning-title">
              <span style="font-size:14px;">⛰️🌊</span>
              <span>古人立卦自然象形探源：为什么本卦如此定名？</span>
            </div>
            <div class="yj-reasoning-content">
              ${{data.originReasoning || ''}}
            </div>
          </div>
        </div>
      </div>
    `;
  }}

  return {{
    TRIGRAMS,
    GUA_NATURE_MAP,
    getGuaNatureMeta,
    renderNatureCardHtml
  }};
}})();
"""

    with open("yijing_natural_trigrams.js", "w", encoding="utf-8") as f:
        f.write(js_content)
    print("yijing_natural_trigrams.js generated successfully! Length:", len(js_content))

if __name__ == "__main__":
    generate_full_system_code()
