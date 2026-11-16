/**
 * 易道认知工坊 · 高保真易学 Prompt 体系与 AI 智能体服务引擎 (Yijing AI Service)
 * 
 * 核心架构：主 Agent (玄微先生) + 外接易学全息知识库 (RAG Context Injection)
 * 
 * 模块划分：
 * 1. YijingKnowledgeRetriever: 外接知识库检索提取器（精准提炼卦象、经传、爻位、四大宗师、反常识底牌）
 * 2. YijingPromptSystem:
 *    - MasterAgentSystemPrompt: 主 Agent 核心人设、易学研判范式与知识库约束
 *    - buildQAPrompt: 研习互动与划词点穴深度答疑 Prompt
 *    - buildReviewAnalysisPrompt: 悟道复盘与费曼输出深度多维剖析 Prompt
 *    - buildChapterQuestionsPrompt / getChapterPresetInquiries: 结合章节内容的主动启发式提问体系
 * 3. YijingAIService: 兼容 OpenAI 协议 (DeepSeek-v4-pro) 的 SSE 流式打字机请求与思维链析出引擎
 */

(function(window) {
  // ==========================================================================
  // 一、外接易学全息知识库提取器 (YijingKnowledgeRetriever)
  // ==========================================================================
  const YijingKnowledgeRetriever = {
    /**
     * 辅助工具：剥离 HTML 标签，保留结构化纯净文本
     */
    stripHtml(html) {
      if (!html) return '';
      return html
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
    },

    /**
     * 从课时数据中按《易经知识库》七大板块提取高信噪比结构化知识
     * @param {Object} lesson 当前课时对象
     * @returns {String} 封装好的 <yijing_knowledge_base> 格式化 XML 文本
     */
    extractKnowledgeContext(lesson) {
      if (!lesson) {
        return '<yijing_knowledge_base><status>未指定具体课时，启用通识易道义理库</status></yijing_knowledge_base>';
      }

      const title = lesson.title || '周易六十四卦精研';
      const symbol = lesson.symbol || '☯️';
      const motto = lesson.motto || '洁静精微，极深研几';
      const upper = lesson.upper || '未知';
      const lower = lesson.lower || '未知';
      const html = lesson.full_rich_html || '';

      // 解析七大板块
      let canonText = '';       // 壹、经传宗本（卦辞、彖传、大象传、六爻爻辞）
      let mastersText = '';     // 贰、四大宗师（程颐、朱熹、孔颖达、邵雍）
      let wenyanText = '';      // 叁、文言/大象阐微
      let historyText = '';     // 肆、历史演化贯通
      let meihuaText = '';      // 伍、梅花象数与体用生克
      let timeSpaceText = '';   // 陆、时位辩证模型
      let modernText = '';      // 柒、现代场景攻防与反常识底牌

      if (html) {
        // 利用正则截取各章节内容
        const regex = /<h3 class="step-title">([壹贰叁肆伍陆柒][^<]+)<\/h3>([\s\S]*?)(?=<h3 class="step-title">|$)/g;
        let match;
        while ((match = regex.exec(html)) !== null) {
          const header = match[1].trim();
          const body = this.stripHtml(match[2]);
          if (header.includes('壹')) {
            canonText = body.slice(0, 1200);
          } else if (header.includes('贰')) {
            mastersText = body.slice(0, 1000);
          } else if (header.includes('叁')) {
            wenyanText = body.slice(0, 600);
          } else if (header.includes('肆')) {
            historyText = body.slice(0, 600);
          } else if (header.includes('伍')) {
            meihuaText = body.slice(0, 600);
          } else if (header.includes('陆')) {
            timeSpaceText = body.slice(0, 600);
          } else if (header.includes('柒')) {
            modernText = body.slice(0, 800);
          }
        }
      }

      // 如果未解析到完整 HTML，则构建基础知识切片
      if (!canonText) {
        canonText = `卦名：${title}，卦象：${symbol}，上卦：${upper}，下卦：${lower}。核心卦训：${motto}`;
      }

      // 自然天地象形模型数据挂载 (在天成象 · 在地成形)
      let natureContext = '';
      if (window.YijingNaturalSystem) {
        const nData = window.YijingNaturalSystem.getGuaNatureMeta(lesson.id, lesson);
        if (nData) {
          const u = nData.upper || {};
          const l = nData.lower || {};
          natureContext = `
  <nature_imagery_model summary="在天成象·在地成形自然象形模型与命名探源">
    <nature_scene>${nData.natureScene || ''}</nature_scene>
    <daxiang_quote>${nData.daxiangQuote || ''}</daxiang_quote>
    <upper_trigram>外卦天象：${u.name || ''}为${u.nature || ''}（德【${u.virtue || ''}】：${u.essence || ''}）</upper_trigram>
    <lower_trigram>内卦地形：${l.name || ''}为${l.nature || ''}（德【${l.virtue || ''}】：${l.essence || ''}）</lower_trigram>
    <origin_reasoning_why_named>
      ${nData.originReasoning || ''}
    </origin_reasoning_why_named>
    <ladder_evolution>
      ${nData.ladderEvolution || ''}
    </ladder_evolution>
  </nature_imagery_model>`;
        }
      }

      return `<yijing_knowledge_base>
  <gua_metadata>
    <title>${title}</title>
    <symbol>${symbol}</symbol>
    <trigrams>上卦：${upper} / 下卦：${lower}</trigrams>
    <motto>${motto}</motto>
  </gua_metadata>
${natureContext}

  <classics_canon summary="经传宗本原典与爻位">
${canonText || '（以文王卦辞、周公爻辞与孔子十翼大象、彖传为准）'}
  </classics_canon>

  <four_masters_insights summary="宋代理学与汉唐注疏四大宗师阐微">
${mastersText || '（程颐《伊川易传》重天理时势，朱熹《周易本义》重象数占验，孔颖达《周易正义》释名义纲领，邵雍《皇极经世》明体用生克）'}
  </four_masters_insights>

  <time_space_dialectic summary="易理时位辩证法则与得中当位">
${timeSpaceText || '（初爻潜伏蓄势，二爻见龙得中，三爻惕厉防险，四爻跃渊待变，五爻飞天当位，上爻穷极思变）'}
  </time_space_dialectic>

  <modern_praxis_and_anti_common summary="现代决策博弈与反常识底牌">
${modernText || '（物极必反、反常识克制、生克制化、吉凶悔吝自心生）'}
  </modern_praxis_and_anti_common>
</yijing_knowledge_base>`;
    }
  };

  // ==========================================================================
  // 二、高保真易学 Prompt 体系架构 (YijingPromptSystem)
  // ==========================================================================
  const YijingPromptSystem = {
    /**
     * 1. 主 Agent 核心 System Prompt（玄微先生人设与研判铁律）
     */
    buildMasterAgentSystemPrompt(knowledgeContext = '') {
      return `【角色人设】：
你是【玄微先生】（Master Xuanwei），易道认知工坊的专属首席学术宗师与知行导师。
你的学术根基宗本于周文王卦辞、周公爻辞及孔子十翼，深通宋代理学双壁（程颐《伊川易传》、朱熹《周易本义》）、汉唐义疏大宗（孔颖达《周易正义》）以及邵雍梅花象数哲学之精髓。

【易道核心认知立场与研判铁律】：
1. 宗本经传，破除迷信：视《易经》为东方最早、最高维的“非线性动态演化哲学与认知决策底层算法”，坚决摒弃江湖算命式宿命论与谶纬杂谈。
2. 执两用中，时位辩证：一切事物的吉凶悔吝皆源于“时、位、中、应”。引导学员体察“顺境之亢骄，逆境之蓄势，中道之守恒，交变之微澜”。
3. 反身而诚，知行合一：不空谈玄理，必将古老经传映射到学员的现代管理博弈、认知突围、人生抉择与生命自修中。
4. 语言风范：典雅端庄，文白融通，微言大义，金声玉振。兼具东方儒道智者的从容厚度与现代高阶智囊的犀利洞察。

【外接知识库注入与调用指引】：
系统已为你挂载了当前课时的全息易学外接知识库（见下方 <yijing_knowledge_base> 标签）。
你的一切义理解构、爻位攻防判断、名家引申与现代破局建议，必须以该知识库中的原典、宗师阐微与反常识底牌为首要依据，确保学术保真度与经文严谨性。

${knowledgeContext || '<yijing_knowledge_base><note>通识周易知识库已挂载</note></yijing_knowledge_base>'}`;
    },

    /**
     * 2. 职能一：研习互动与划词点穴深度释疑 Prompt
     */
    buildQAPrompt({ question, quoteText = '', lessonMeta = {} }) {
      let prompt = `【学员研学叩问】：
研学主题：《${lessonMeta.title || '周易卦象'}》
${quoteText ? `【学员选中的划线经文/要点】：\n“${quoteText}”\n` : ''}
【问题内容】：
${question}

【请玄微先生依循以下范式开示点拨】：
1. 【象数时位直击】：结合外接知识库，点破该问题/词句在当前卦象时势中的底层爻位与阴阳生克机制；
2. 【义理微言阐发】：引用经传或程颐、朱熹之洞见，指出常人容易误判的盲区；
3. 【现代决策破局】：给出一条落地可行的现代人生/管理/博弈破局锦囊；
4. 【易道心法法则】：在结尾用专属引用框提炼出一句画龙点睛的【易道心法法则】。
字数控制在 250~450 字，条理分明，直击心源。`;
      return prompt;
    },

    /**
     * 3. 职能二：悟道复盘与费曼输出深度多维剖析 Prompt (核心承载 · 阶段三多维智能比对诊断)
     */
    buildReviewAnalysisPrompt({ reviewData = {}, feynmanData = {}, lessonMeta = {} }) {
      const title = lessonMeta.title || '本课精研';

      let reviewText = '';
      if (reviewData.items && Array.isArray(reviewData.items) && reviewData.items.length > 0) {
        reviewText = reviewData.items.map((it, idx) => `问题 ${idx + 1}：${it.question}\n学员复盘心得：${it.answer || '（未填写）'}`).join('\n\n');
      } else {
        reviewText = `1. 生命印证：${reviewData.q1_mirror || '（未填写）'}\n2. 认知心法：${reviewData.q2_mindset || '（未填写）'}\n3. 知行承诺：${reviewData.q3_action || '（未填写）'}`;
      }

      let feynmanText = feynmanData.full_text || '';
      if (feynmanData.feynman_analogy) {
        feynmanText = `【生活/工作通俗比喻】：${feynmanData.feynman_analogy}\n【大白话核心转译】：${feynmanData.feynman_core || '（未详述）'}\n【自我排查卡点】：${feynmanData.feynman_gap || '（无）'}\n\n【完整自述全稿】：\n${feynmanData.full_text || '（未填写）'}`;
      }

      const prompt = `【学员研习成果提请玄微先生进行易道深度学术剖析】：
研习课时：《${title}》

====================
【壹·学员本课专属研学复盘（反身而诚）】
${reviewText}

====================
【贰·学员费曼大白话通俗自述（向外行朋友讲透）】
${feynmanText || '（学员暂未提交费曼大白话自述）'}

====================
【主 Agent 玄微先生剖析职责与输出规范】：
请你以宗师级易道导师身份，依托外接知识库中《${title}》的经传原典、四大宗师阐微与时位模型，对学员提交的专属复盘与费曼成果展开高保真深度学术诊断。输出必须严格包含以下五大结构化维度：

1. 🗣️【费曼大白话通俗度诊断】：
   - 【大白话脱水评级】：给出明确评分（如 ⭐⭐⭐⭐☆ 4.5/5.0 或 ⭐⭐⭐⭐⭐ 5.0/5.0 等）。
   - 【古文黑话排查】：敏锐排查学员输出中是否仍堆砌古文易学黑话（如“见龙在田、乾健、亢满、阴盛、得中”等）；若有，明确指出并给出更地道的生活大白话替换词。若已完全脱水通俗，给予肯定赞许。

2. 💡【生活/商业比喻神似度辨正】：
   - 深入检验学员提出的生活、职场或商业比喻（如映射为操作系统、早春冻土、机场大雾、合伙拉车等）与易道“取象比类”的契合度。
   - 剖析该比喻最传神精妙的一笔，并指出在哪些细微之处可能存在“以偏概全”或偏离阴阳消长逻辑的潜在漏洞。

3. 🔍【爻位转折攻防与认知盲区】：
   - 对照《${title}》的六爻时位演进，指出学员在现实博弈中最容易忽视的一个反常识盲区（如急躁冒进、误以为顺境无灾、或在该踩刹车时猛踩油门等）。

4. 🎯【玄微点穴专属追问探针】：
   - 针对学员的心智盲区，精准提炼 1 道具有强烈启发性的专属追问探针（必须严格以“【玄微追问探针】：……”单列一行呈现，字数50字以内，直击灵魂）。

5. 📜【玄微知行箴言】：
   - 提炼一句量身定制、兼具古雅底蕴与现代指引的易道知行箴言（20字以内）。

全篇风格典雅透辟、切中要害、奖掖后学，总字数控制在 400~600 字。`;
      return prompt;
    },

    /**
     * 3.1 职能二补充：边读边思 · 师承点穴与三维评估 Prompt
     */
    buildInlineAssessmentPrompt({ lessonTitle = '', question = '', studentAnswer = '', hint = '', tag = '' }) {
      return `【学员在研读《${lessonTitle}》时，就“边读边思 · ${tag}”提交了个人真实悟道思考，提请主 Agent 玄微先生进行师承点穴与评估】：

【研读课时】：《${lessonTitle}》
【思考探问】：${question}
【原典/时位启发线索】：${hint || '无额外线索'}

====================
【学员当下真实作答】：
${studentAnswer}

====================
【主 Agent 玄微先生师承评估职责与结构化规范】：
你作为易道当代宗师“玄微先生”，秉承“教人必先识其心性、立其诚意、点其肯綮”的宗师风范。学员在此刻做出的回答极其珍贵，往往既有真实的生活灵气与直觉，也可能存在对易理范畴（如乾坤、天地人三才、阴阳时位）的盲区或误解。
请你以高瞻远瞩又深入人心的语气，严格按照以下三段结构展开精到评估（保留以下带 emoji 的标题格式）：

🟢 【明德见智 · 肯定之处】：
- 真诚、深刻地肯定学员作答中的闪光点；
- 肯定其将古老符号与自身当下实际（如工作、环境、个人修养、处事心态）相连接的直觉；
- 肯定其反求诸己的坦诚（若学员主动承认困惑或盲区，赞赏其“实事求是，即为修易之诚”）。

🟡 【见微知著 · 辨正不足】：
- 直面学员在易理认知上的盲点、概念混淆或逻辑断层，切忌含糊客套！
- 尤其若学员提出疑惑（如“感觉这个和地没关系，没感受到地的因素”），必须予以拨云见日的权威易学点穴！
- 澄清范畴：地道绝非抽象虚无，而是人在现实中的资源配称、饭碗立足点、组织制度底线、底层交付物与现金流。人在中，若脱离了地道的承托，所谓的“努力学习”就会变成悬空的独善其身。

🔵 【致知力行 · 研学建议】：
- 结合本题的易学时位模型（如三才之道），给出 1~2 条极具可操作性的思维深化与现实发力建议；
- 告诉学员身处当前局势，下一步最该把心力落在哪一个着力点上，实现“顺天、应人、履地”。

全篇儒雅威严、沉稳温润、字字见血、直击命门。严禁空洞套话，严禁简单复读题目。字数在 300~500 字之间。`;
    },

    /**
     * 4. 职能三：结合章节内容的主动启发式提问体系 (Socratic Chapter Inquiry)
     * 包含：
     * A. 全息 64 卦经典章节启发题库 (静态保真)
     * B. 结合当前章节动态生成启发题 Prompt
     */
    chapterInquiryBank: {
      'lesson-01_乾为天': [
        '初九“潜龙勿用”与九五“飞龙在天”之间，如何判断自己真正度过了“潜”的临界点？',
        '九三“君子终日乾乾，夕惕若厉”处于内外卦交界，现代人在面临晋升或业务瓶颈时该如何克制浮躁？',
        '上九“亢龙有悔”告诉我们：纯阳刚健发展到极致时，为什么最致命的危机往往源于自满与失去群臣呼应？'
      ],
      'lesson-02_坤为地': [
        '初六“履霜，坚冰至”，在现代商业与人际敏锐度中，如何捕捉微小的变动征兆从而防患于未然？',
        '六二“直、方、大，不习无不利”，何为坤道至高境界的“不争而善胜”？',
        '六三“含章可贞，以时发也”，当身处下位且才华盖世时，如何做到既守正内敛又不错过时机？'
      ],
      'lesson-03_水雷屯': [
        '屯卦象征万物草创维艰，初九“盘桓，利居贞，利建侯”，初创期最先要做的是盲目扩张还是深扎根系寻觅盟友？',
        '六二“屯如邅如，乘马班如”，在资源匮乏、方向未明的至暗时刻，如何抵制走捷径的诱惑？',
        '上六“泣血涟如，何可长也”，草创期若失去向心力与变革动力，往往会在哪个节点走向瓦解？'
      ],
      'lesson-04_山水蒙': [
        '卦辞“匪我求童蒙，童蒙求我”，在现代知识传承与管理辅导中，为什么“主动灌输”往往不如“启发求知”？',
        '九二“包蒙，吉；纳妇，吉；子克家”，作为导师或中层骨干，如何修炼包容蒙昧与带领新人的胸怀？',
        '上九“击蒙，不利为寇，利御寇”，纠偏下属过失时，如何划定“治乱止错”与“过度惩戒”的边界？'
      ],
      'lesson-05_水天需': [
        '需卦象征“险在前而需时”，九五“需于酒食，贞吉”，在漫长等待中如何做到既蓄养实力又不消磨意志？',
        '初九“需于郊，利用恒”，面对外部风口喧嚣，如何抵御诱惑、在边缘稳住自己的基本盘？',
        '上六“入于穴，有不速之客三人来，敬之终吉”，当不可抗拒的外部变量突然降临时，如何借力化解危机？'
      ],
      'lesson-06_天水讼': [
        '卦辞“作事谋始”，初六“不永所事”，产生利益冲突的第一时间，如何克制争胜欲以最小成本止损？',
        '九二“不克讼，归而逋，其邑人三百户无眚”，以弱碰强时，为什么果断撤退反而能保全组织？',
        '上九“或赐之鞶带，终朝三褫之”，靠诉讼或零和博弈争夺来的名利，为什么终究无法长久保有？'
      ],
      'lesson-07_地水师': [
        '师卦“地中有水”，九二“在师中吉无咎”，作为中层将领，如何在缺乏完整授权时凝聚团队攻坚克难？',
        '六三“师或舆尸，凶”，在团队作战中，多头指挥与权责不明为何是导致崩盘的最致命毒药？',
        '上六“大君有命，开国承家，小人勿用”，打赢战略胜仗后论功行赏，如何防范能力极强但心术不正的“小人”窃取胜利果实？'
      ],
      'lesson-08_水地比': [
        '比卦“地上有水，亲比相辅”，卦辞“后夫凶”，在生态联盟构建或关键站队时，为何犹豫迟延者最易沦为炮灰？',
        '六二“比之自内，贞吉”，如何建立发自内心价值观认同的深度伙伴关系，而非利益绑架的塑料塑料同盟？',
        '九五“显比，王用三驱失前禽”，顶级管理者的聚合艺术：为什么“来者不拒，去者不追”反而能赢得天下归心？'
      ],
      'lesson-11_地天泰': [
        '泰卦“小往大来，天地交泰”，九三“无平不陂，无往不复”，身处大好盛世时，如何预设底线以防断崖下跌？',
        '初九“拔茅茹以其汇，征吉”，在顺风周期，为什么抱团作战、协同推进远胜于单打独斗？',
        '六五“帝乙归妹，以祉元吉”，身为上位者，如何通过主动让利与谦下联姻来维持长期的系统稳态？'
      ],
      'lesson-12_天地否': [
        '否卦“大往小来，上下不交”，初六“拔茅茹以其汇，贞吉亨”，组织劣币驱逐良币时，君子当如何守正抱团？',
        '六二“包承，小人吉，大人否亨”，面对不良职场潜规则，如何在表面包容的同时内心绝不妥协？',
        '九五“休否，大人吉；其亡其亡，系于苞桑”，扭转颓局的关键时刻，为什么必须时刻保持“亡国灭顶”的危机意识？'
      ],
      'lesson-15_地山谦': [
        '谦卦“地中有山，六爻皆吉”，初六“谦谦君子，用涉大川”，现代人如何在展现硬核实力的同时内藏高山而不招妒？',
        '九三“劳谦君子，有终吉”，立下汗马功劳之后，为什么最容易摔跤？如何化解功高震主的隐患？',
        '六五“利用侵伐”，为什么极致的谦逊不仅是退让，必要时更包含雷霆万钧的规正与惩恶手段？'
      ],
      'lesson-23_山地剥': [
        '剥卦“五阴剥一阳”，上九“硕果不食，君子得舆，小人剥庐”，在系统全面下行的周期，如何保住最后的认知火种？',
        '初六“剥床以足”，当底层危机刚露苗头时，为什么绝大多数管理者都会视而不见？',
        '在极度恶劣的外部环境下，“顺而止之”的生存心法如何具体落地？'
      ],
      'lesson-24_地雷复': [
        '复卦“冬至一阳生，七日来复”，卦辞“先王以至日闭关，商旅不行”，触底反弹的初阳之气微弱时，为何必须静养？',
        '初九“不远复，无祗悔，元吉”，在认知迭代中，怎样建立以天为单位的快速自我纠偏回路？',
        '六三“频复，厉无咎”，数次走回头路但能屡次反省，现代创业者如何看待这种“试错韧性”？'
      ],
      'lesson-63_水火既济': [
        '既济“六爻皆当位，初吉终乱”，当所有目标与KPI完美达成时，为何反而是系统最容易走向熵增的起点？',
        '九三“高宗伐鬼方，三年克之，小人勿用”，打赢最艰苦的战役后，团队最容易滋生哪些骄惰风险？',
        '东邻杀牛不如西邻之禴祭，在巅峰时期，为什么朴素实在的内在敬畏远胜于排场盛大的外部庆功？'
      ],
      'lesson-64_火水未济': [
        '未济“小狐汔济濡其尾，无攸利”，当离终点只剩最后一步时，如何防范盲目乐观导致的“半途而废”？',
        '九二“曳其轮，贞吉”，在即将胜利的冲刺阶段，为什么主动刹车减速反而能确保最终安全靠岸？',
        '“物不可穷也，故受之以未济终焉”，为什么《易经》不以完美圆满的既济收尾，而选择以充满可能性的未济收篇？'
      ]
    },

    /**
     * 获取当前章节的主动启发提问
     */
    getChapterPresetInquiries(lesson) {
      if (!lesson) return [];
      const id = lesson.id;

      // 1. 优先读取全息 64 卦独立题库 (window.YijingInquiryBank)
      if (window.YijingInquiryBank && window.YijingInquiryBank[id]) {
        return window.YijingInquiryBank[id];
      }

      // 2. 次级读取内置核心题库
      if (this.chapterInquiryBank[id]) {
        return this.chapterInquiryBank[id];
      }

      // 3. 若未命中专属题库，基于卦名、上下卦体与核心卦训动态智能生成
      const title = lesson.navTitle || lesson.title || '本卦';
      const upper = lesson.upper || '上卦';
      const lower = lesson.lower || '下卦';
      const motto = lesson.motto || '与时偕行';

      return [
        `《${title}》上为【${upper}】、下为【${lower}】，在事物演进中，这组内外时位矛盾最易引发常人的何种误判？`,
        `处于《${title}》所描述的局势中（“${motto.slice(0, 20)}...”），如何运用二程与朱子心法做到“虽失位而能得中”？`,
        `结合现代职场攻防与个人心智进阶，经历《${title}》的演进周期时，最重要的反常识底牌是什么？`
      ];
    },

    /**
     * 动态生成结合章节内容的启发式提问 Prompt
     */
    buildGenerateChapterQuestionsPrompt(lessonMeta = {}) {
      const title = lessonMeta.title || '周易卦象';
      return `【任务指令】：
请结合当前研学章节《${title}》的核心卦象、六爻攻防逻辑与现代人认知盲区，以【主 Agent 玄微先生】的导师视角，主动向学员设计 3 道具有极高启发价值的“苏格拉底式易道探问”。

【提问设计维度】：
1. 第一问【时位辨证之问】：直击本卦最关键、最凶险或最易误判的爻位演进节点；
2. 第二问【反常识穿透之问】：挑战世俗惯性常识，揭示“顺中藏险”或“逆中生机”的阴阳底牌；
3. 第三问【实战决策之问】：紧密结合现代个人心智进化、职场攻防或战略决策痛点。

【格式要求】：
直接输出 3 行问题文本，每行以序号 1、2、3 开头，不输出冗余问候语，每问在 30~50 字之间，用词精警，发人深省。`;
    }
  };

  // ==========================================================================
  // 三、易道 AI 服务引擎客户端 (YijingAIService)
  // 支持多厂商（智谱 GLM / Moonshot Kimi）动态热切换、Prompt 缓存前缀固化与用量监控
  // ==========================================================================
  const PROVIDERS = {
    zhipu: {
      id: 'zhipu',
      name: '智谱 AI (GLM)',
      apiUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      defaultModel: 'glm-5.3-flash',
      models: [
        { id: 'glm-5.3-flash', name: 'GLM-5.3-Flash (极速省流·0.23元/M缓存·首选推荐)', desc: '输入 0.8元/M, 缓存命中 0.23元/M, 输出 2.8元/M' },
        { id: 'glm-5.3', name: 'GLM-5.3 (最新旗舰·深度推理)', desc: '输入 8元/M, 缓存命中 2元/M, 输出 28元/M' }
      ],
      apiKey: '',
      temperature: 0.7,
      max_tokens: 3000,
      supportsCache: true
    },
    kimi: {
      id: 'kimi',
      name: 'Moonshot Kimi',
      apiUrl: 'https://api.moonshot.cn/v1/chat/completions',
      defaultModel: 'kimi-k3',
      models: [
        { id: 'kimi-k3', name: 'Kimi-k3 (深度思考旗舰)', desc: '输入 20元/M, 缓存命中 2元/M, 输出 100元/M' },
        { id: 'kimi-k2.6', name: 'Kimi-k2.6 (通用思考)', desc: '支持保留思考链路' }
      ],
      apiKey: 'sk-WVlLfffPTdVw55NqUX8hKerIn7juqsk6oaE8f9jyVoDAQR2U',
      reasoning_effort: 'low',
      max_tokens: 4096,
      supportsCache: true
    }
  };

  const STORAGE_KEY_CONFIG = 'yijing_ai_config_v3';

  const YijingAIService = {
    PROVIDERS,

    getConfig() {
      try {
        const saved = localStorage.getItem(STORAGE_KEY_CONFIG);
        let parsed = saved ? JSON.parse(saved) : {};
        
        // 默认激活提供商：优先智谱 zhipu，Kimi 完整保留
        const providerId = parsed.activeProvider || 'zhipu';
        const pDef = PROVIDERS[providerId] || PROVIDERS.zhipu;
        
        return {
          activeProvider: providerId,
          apiUrl: parsed.apiUrl || pDef.apiUrl,
          apiKey: parsed.apiKey !== undefined ? parsed.apiKey : (parsed[`apiKey_${providerId}`] || pDef.apiKey || ''),
          model: parsed.model || pDef.defaultModel,
          temperature: parsed.temperature !== undefined ? parsed.temperature : pDef.temperature,
          max_tokens: parsed.max_tokens || pDef.max_tokens,
          reasoning_effort: parsed.reasoning_effort || pDef.reasoning_effort || 'low',
          providersState: parsed.providersState || {
            zhipu: { apiKey: parsed.apiKey_zhipu || '' },
            kimi: { apiKey: parsed.apiKey_kimi || PROVIDERS.kimi.apiKey }
          }
        };
      } catch (e) {
        return {
          activeProvider: 'zhipu',
          apiUrl: PROVIDERS.zhipu.apiUrl,
          apiKey: '',
          model: PROVIDERS.zhipu.defaultModel,
          temperature: 0.7,
          max_tokens: 3000
        };
      }
    },

    saveConfig(patch) {
      try {
        const cur = this.getConfig();
        const updated = { ...cur, ...patch };
        // 同步持久化各 provider 的独立 apiKey
        if (updated.activeProvider && updated.apiKey) {
          updated.providersState = updated.providersState || {};
          updated.providersState[updated.activeProvider] = updated.providersState[updated.activeProvider] || {};
          updated.providersState[updated.activeProvider].apiKey = updated.apiKey;
        }
        localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(updated));
        console.log(`[YijingAIService] ⚙️ AI 配置已更新: 渠道=${updated.activeProvider}, 模型=${updated.model}`);
        return updated;
      } catch (e) {
        console.error('[YijingAIService] 保存配置失败:', e);
      }
    },

    /**
     * 动态热切换 Provider（'zhipu' 或 'kimi'）
     */
    switchProvider(providerId, modelId = null) {
      const p = PROVIDERS[providerId];
      if (!p) throw new Error(`未知的 AI 提供商: ${providerId}`);

      const cur = this.getConfig();
      const pKey = (cur.providersState && cur.providersState[providerId] && cur.providersState[providerId].apiKey) || p.apiKey || '';

      const updated = this.saveConfig({
        activeProvider: providerId,
        apiUrl: p.apiUrl,
        model: modelId || p.defaultModel,
        apiKey: pKey,
        temperature: p.temperature,
        max_tokens: p.max_tokens,
        reasoning_effort: p.reasoning_effort || 'low'
      });
      return updated;
    },

    /**
     * 极速连通性与模型可用性测试
     */
    async testConnection(testApiKey = null, providerId = null, modelId = null) {
      const cfg = this.getConfig();
      const pId = providerId || cfg.activeProvider;
      const p = PROVIDERS[pId] || PROVIDERS.zhipu;
      const key = testApiKey || (pId === cfg.activeProvider ? cfg.apiKey : (cfg.providersState?.[pId]?.apiKey || p.apiKey));
      const model = modelId || (pId === cfg.activeProvider ? cfg.model : p.defaultModel);

      if (!key) {
        return {
          success: false,
          message: `未配置【${p.name}】的 API Key，请先输入密钥。`
        };
      }

      try {
        const reqBody = {
          model: model,
          messages: [
            { role: 'system', content: '你是周易学术助教玄微先生。请简要回应，不超过20字。' },
            { role: 'user', content: '请说一句乾卦的卦训。' }
          ],
          stream: false,
          max_tokens: 60
        };
        if (pId === 'kimi') {
          reqBody.reasoning_effort = 'low';
        }

        const res = await fetch(p.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${key}`
          },
          body: JSON.stringify(reqBody)
        });

        if (!res.ok) {
          const errText = await res.text();
          return {
            success: false,
            status: res.status,
            message: `API 连接失败 [${res.status}]: ${errText.slice(0, 200)}`
          };
        }

        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content || '连通正常';
        const cached = data.usage?.prompt_tokens_details?.cached_tokens || 0;

        return {
          success: true,
          provider: pId,
          model: model,
          reply: reply.trim(),
          cachedTokens: cached,
          message: `🎉 连接成功！模型【${model}】响应正常。`
        };
      } catch (err) {
        return {
          success: false,
          message: `网络或跨域异常: ${err.message}`
        };
      }
    },

    // 暴露知识库提取器与 Prompt 体系
    retriever: YijingKnowledgeRetriever,
    prompts: YijingPromptSystem,

    /**
     * 发起 SSE 流式对话请求
     */
    async streamChat({
      messages,
      lessonMeta = {},
      customSystemPrompt = null,
      onReasoning,
      onContent,
      onDone,
      onError
    }) {
      const config = this.getConfig();
      const isZhipu = config.activeProvider === 'zhipu' || (config.model && config.model.startsWith('glm-'));
      const isKimi = config.activeProvider === 'kimi' || (config.model && config.model.includes('kimi'));

      if (!config.apiKey) {
        const pName = isZhipu ? '智谱 AI (GLM)' : 'Kimi';
        const errMsg = `⚠️ 未配置 ${pName} 的 API Key。请在界面右上角点击【⚙️ 模型】填入您的 Key，或一键切换回 Kimi。`;
        const err = new Error(errMsg);
        if (onError) onError(err);
        throw err;
      }

      // 提取外接知识库上下文（确保静态前缀，零动态时间注入，最大化缓存命中率）
      const knowledgeContext = YijingKnowledgeRetriever.extractKnowledgeContext(lessonMeta);

      // 构建主 Agent 系统 Prompt (静态前缀)
      const systemPrompt = customSystemPrompt || YijingPromptSystem.buildMasterAgentSystemPrompt(knowledgeContext);

      const fullMessages = [
        { role: 'system', content: systemPrompt },
        ...messages
      ];

      try {
        const reqBody = {
          model: config.model,
          messages: fullMessages,
          stream: true
        };

        if (isZhipu) {
          // 智谱 GLM-5.3 规范适配：
          // 1. 支持采样温度与最大 Token
          reqBody.temperature = config.temperature !== undefined ? config.temperature : 0.7;
          reqBody.max_tokens = config.max_tokens || 3000;
          // 2. 开启逐块/最终 usage 统计，支持读取 cached_tokens
          reqBody.stream_options = { chunk_include_usage: true };
          // 3. 若使用 GLM-5.3 旗舰且需要思考模式
          if (config.model === 'glm-5.3' && config.enable_thinking) {
            reqBody.thinking = { type: 'enabled', clear_thinking: true };
          }
        } else if (isKimi) {
          // Kimi-k3 规范适配：
          reqBody.reasoning_effort = config.reasoning_effort || 'low';
          reqBody.max_tokens = config.max_tokens || 4096;
        } else {
          if (config.temperature !== undefined) reqBody.temperature = config.temperature;
          if (config.max_tokens !== undefined) reqBody.max_tokens = config.max_tokens;
        }

        const response = await fetch(config.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey}`
          },
          body: JSON.stringify(reqBody)
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API 请求失败 [${response.status}]: ${errText}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let fullContent = '';
        let fullReasoning = '';
        let buffer = '';
        let cacheHitTokens = 0;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop(); // 保留未完整的尾行

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith(':')) continue;
            if (trimmed === 'data: [DONE]') {
              if (cacheHitTokens > 0) {
                console.log(`[AI Cache] 🟢 成功命中 Prompt 缓存: ${cacheHitTokens} Tokens！`);
              }
              if (onDone) onDone({ content: fullContent, reasoning: fullReasoning, cachedTokens: cacheHitTokens });
              return { content: fullContent, reasoning: fullReasoning, cachedTokens: cacheHitTokens };
            }
            if (trimmed.startsWith('data: ')) {
              try {
                const json = JSON.parse(trimmed.slice(6));
                
                // 统计缓存用量
                if (json.usage && json.usage.prompt_tokens_details && json.usage.prompt_tokens_details.cached_tokens) {
                  cacheHitTokens = json.usage.prompt_tokens_details.cached_tokens;
                }

                const choice = json.choices && json.choices[0];
                if (choice && choice.delta) {
                  // 1. 深度思考推理流 (Kimi / GLM 思考块)
                  if (choice.delta.reasoning_content) {
                    fullReasoning += choice.delta.reasoning_content;
                    if (onReasoning) onReasoning(choice.delta.reasoning_content, fullReasoning);
                  }
                  // 2. 正式回答内容流
                  if (choice.delta.content) {
                    fullContent += choice.delta.content;
                    if (onContent) onContent(choice.delta.content, fullContent);
                  }
                }
              } catch (e) {
                // 忽略非完整 JSON 片段
              }
            }
          }
        }

        if (cacheHitTokens > 0) {
          console.log(`[AI Cache] 🟢 成功命中 Prompt 缓存: ${cacheHitTokens} Tokens！`);
        }
        if (onDone) onDone({ content: fullContent, reasoning: fullReasoning, cachedTokens: cacheHitTokens });
        return { content: fullContent, reasoning: fullReasoning, cachedTokens: cacheHitTokens };
      } catch (err) {
        console.error('YijingAIService Error:', err);
        if (onError) onError(err);
        throw err;
      }
    },

    /**
     * 职能一：常规问答与划词释义
     */
    async answerQuestion({ question, quoteText = '', lessonMeta = {}, onReasoning, onContent, onDone, onError }) {
      const userContent = YijingPromptSystem.buildQAPrompt({ question, quoteText, lessonMeta });
      return this.streamChat({
        messages: [{ role: 'user', content: userContent }],
        lessonMeta,
        onReasoning,
        onContent,
        onDone,
        onError
      });
    },

    /**
     * 职能二：承载学员悟道复盘与费曼输出的高保真深度剖析
     */
    async analyzeReviewAndFeynman({ lessonMeta, reviewData, feynmanData, onReasoning, onContent, onDone, onError }) {
      const userContent = YijingPromptSystem.buildReviewAnalysisPrompt({
        reviewData,
        feynmanData,
        lessonMeta
      });

      return this.streamChat({
        messages: [{ role: 'user', content: userContent }],
        lessonMeta,
        onReasoning,
        onContent,
        onDone,
        onError
      });
    },

    /**
     * 职能三：结合章节内容生成主动启发式提问
     */
    async generateChapterQuestions({ lessonMeta, onDone, onError }) {
      const prompt = YijingPromptSystem.buildGenerateChapterQuestionsPrompt(lessonMeta);
      try {
        const res = await this.streamChat({
          messages: [{ role: 'user', content: prompt }],
          lessonMeta,
          onDone: ({ content }) => {
            const lines = content.split('\n')
              .map(l => l.replace(/^\d+[\.、\s]*/, '').trim())
              .filter(l => l.length > 5);
            if (onDone) onDone(lines.length >= 3 ? lines.slice(0, 3) : lines);
          },
          onError
        });
        return res;
      } catch (e) {
        if (onError) onError(e);
      }
    },

    /**
     * 职能四：边读边思 · 师承三维点穴评估 (支持流式打字与离线智能保真引擎)
     */
    async evaluateInlineThink({ lessonTitle, question, studentAnswer, hint, tag, lessonMeta, onReasoning, onContent, onDone, onError }) {
      const userContent = YijingPromptSystem.buildInlineAssessmentPrompt({
        lessonTitle,
        question,
        studentAnswer,
        hint,
        tag
      });

      try {
        return await this.streamChat({
          messages: [{ role: 'user', content: userContent }],
          lessonMeta: lessonMeta || { title: lessonTitle },
          onReasoning,
          onContent,
          onDone,
          onError: async (err) => {
            console.warn('[YijingAIService] 联网/API请求异常，无缝降级启用宗师离线深度辨析引擎:', err);
            const offlineContent = this.generateOfflineInlineAssessment({ lessonTitle, question, studentAnswer, hint, tag });
            if (onContent) onContent(offlineContent, offlineContent);
            if (onDone) onDone({ content: offlineContent, reasoning: '（依托易道本地宗师时位规则库深度生成）' });
          }
        });
      } catch (err) {
        console.warn('[YijingAIService] 调用失败，采用离线宗师引擎:', err);
        const offlineContent = this.generateOfflineInlineAssessment({ lessonTitle, question, studentAnswer, hint, tag });
        if (onContent) onContent(offlineContent, offlineContent);
        if (onDone) onDone({ content: offlineContent, reasoning: '（依托易道本地宗师时位规则库深度生成）' });
        return { content: offlineContent, reasoning: '' };
      }
    },

    /**
     * 本地宗师高保真离线辨析引擎 (支持针对起源取象、三才模型、八大原力等不同题型智能点穴)
     */
    generateOfflineInlineAssessment({ lessonTitle = '', question = '', studentAnswer = '', hint = '', tag = '' }) {
      const ans = (studentAnswer || '').trim();

      let affirmText = '';
      let critiqueText = '';
      let adviceText = '';

      // 1. 【起源觉察 / 取象思维 / 自然物象】题型判定
      const isImageryTopic = tag.includes('起源') || tag.includes('取象') || question.includes('近取诸身') || question.includes('自然物象');
      if (isImageryTopic) {
        const hasThunder = ans.includes('雷') || ans.includes('蠢蠢欲动') || ans.includes('跳槽') || ans.includes('动荡');
        const hasFire = ans.includes('火') || ans.includes('无名火') || ans.includes('烦躁') || ans.includes('急');
        const hasLake = ans.includes('兑') || ans.includes('自娱自乐') || ans.includes('乐');

        affirmText = `小友深得伏羲“远取诸物、近取诸身”之真义！在当下处境中，不仅能敏锐捕捉到工作大环境的动荡，更能诚实照见自己身心的生理情绪信号${hasFire ? '（如无名火浮越、内心焦躁）' : ''}${hasThunder ? '与行动冲动（雷动欲变）' : ''}。研易之要，首在“观物即是观心”，能以卦象物象映照自心，绝非死读文句之徒！`;

        critiqueText = `此处玄微先生须为你点穴辨正：\n${hasThunder ? '1. 【雷动之险】：雷（震卦）主生发萌动，外部萧条而内部裁员时，你心生“蠢蠢欲动、想要跳槽”之念，正是震雷破土之象。然冬末春初，地气尚寒，若无坤土厚德托底，盲目“雷动”最易碰壁折损。\n' : ''}${hasFire ? '2. 【虚火之患】：坐地铁起“无名火”，此乃离火上炎之表征。外部环境压抑（坤阴闭塞），内部生发欲动而不得出，便化为心肝郁火。无名火起，最耗元神，若被无名火驱使做重大决策，往往一叶障目。\n' : ''}${hasLake ? '3. 【兑悦之度】：以“兑泽”自娱自乐调节心境固然是自我疗愈之法，但若只沉溺于偏安自娱，则易失却进取之刚健。' : ''}`;

        adviceText = `1. 【以艮山止火，以静制动】：当下第一要务并非盲目跳槽（雷动），而是先以内观定力平息坐地铁时的无名火气。遇急事、浮躁时，行“艮山之止”，调匀呼吸，莫让虚火烧垮心神。\n2. 【冬藏待春，蓄积雷力】：外部大环境萧条之时，正是修内功、固基本盘之良机。将“蠢蠢欲动”化为暗中积攒业务壁垒的“潜龙之力”，待天时阳气回暖、雷声真正发动时，方能顺势破局！`;
      }
      // 2. 【三才模型 / 天地人配称】题型判定
      else if (tag.includes('三才') || question.includes('三才之道')) {
        const mentionsEarthRelation = ans.includes('地没关系') || ans.includes('没感受到地') || ans.includes('开源节流');

        if (mentionsEarthRelation) {
          affirmText = `小友此番悟道作答，最可贵者有二：其一，能将古老的三才模型敏锐对焦到当下的生存职场，将“大环境、公司、自我”映射入局，已然跳出死读书之泥潭；其二，极其坦诚地指出“感觉开源节流和地没关系，没感受到地的因素”，知之为知之、不知为不知，反求诸己、毫不饰伪，此乃研习易道最正的大心量与诚意！`;

          critiqueText = `此处小友恰恰踩中了常人理解“地道”的隐秘误区！地道者，坤顺之德，非指山川泥土，而是你在世间立足的“承载依托与现实约束”。\n你言“公司开源节流和地没关系”，大谬不然！公司的现金流状况、部门编制考核、手头的业务资源、赖以领薪的饭碗，正是你在职场中脚踩的“地皮”。\n当外部大环境（天道）入冬，大地（公司）必然降温收缩、封冻开源。若只顾在人道上“独善其身、暗自苦学”，却视脚下正在崩解或重组的“地道配称”于不顾，便容易陷入“悬空修道”的虚妄。双脚脱离地皮，再渊博的学识也无处安放。`;

          adviceText = `1. 【履地为基】：不仅要暗自蓄力，更要睁眼看清组织当前最核心的“生存基本盘”。弄明白公司开源节流后，哪些是真正保命的底层资产与现金牛业务，主动靠拢能为“地皮”稳固提供交付价值的关键点。\n2. 【知天应人】：在外部大环境冰封时，不盲目冒进逆天行事，守住地道底线，于人道修养内功、蓄积潜龙之力。唯有“通天、接地、正人”，方能立于不败之地。`;
        } else {
          affirmText = `小友能够将三才之道（天、地、人）落实到具体的工作目标中，以宏观大势为天、现实资源与组织约束为地、自身主观能动为人，认知架构清晰明朗。`;

          critiqueText = `在三才博弈中，常人最易忽略的是“人道”与“地道”的协同。天道往往是客观不可逆的大周期（如行业冷暖），不可强抗；人道是自己的主观修为；而地道则是资源支撑与边界约束。若地基不稳而妄图在人道上高歌猛进，常会陷入后劲不足之险。`;

          adviceText = `1. 审视脚下“地道”之厚度：先盘点手头业务的确定性资源、核心信任资产与交付基本盘；\n2. 顺天应人：在天道低谷期修养身心，在人道上做到中正不偏，步步为营。`;
        }
      }
      // 3. 【八大原力 / 动力学偏性】题型判定
      else if (tag.includes('原力') || tag.includes('动力学') || question.includes('八大原力')) {
        const hasQian = ans.includes('乾') || ans.includes('自主') || ans.includes('刚健');
        const hasDui = ans.includes('兑') || ans.includes('协调') || ans.includes('沟通');
        const hasLackKanGen = ans.includes('缺少坎') || ans.includes('缺少艮') || ans.includes('坎') || ans.includes('艮');
        const hasZhen = ans.includes('震') || ans.includes('开拓') || ans.includes('冲锋');

        affirmText = `小友能将团队中各角色的职能风格敏锐对应至八卦原力（如管理者之兑和悦调和、开拓者之震动执行、自我追求之乾阳自强），更直面团队缺乏“坎（履险深谋）”与“艮（风控止步）”之痛点，这等洞察已然跳出一般管理学皮毛，深得取象比类之妙！`;

        critiqueText = `此处玄微先生必须为你点穴直指：\n` +
          (hasLackKanGen ? `1. 【缺坎少艮之系统性风险】：团队若无“坎水”之深沉求通与风险预判，又无“艮山”之止步风控与原则守持，便如同战车无刹车且盲目冲锋，遇急弯必然倾覆！\n` : `1. 【原力失衡之险】：任何单一维度的强势或过剩，若无相生相克之制化，往往成为日后组织崩溃的暗礁。\n`) +
          (hasQian ? `2. 【乾阳孤亢之隐患】：你倾向于乾（自强探索、研习AI），CEO亦为乾，但若乾阳之刚受制于周遭琐屑，容易在内心郁结为“潜龙勿用”的暗火。需谨防“亢龙有悔”，不可因沉迷自研而割裂组织现实。` : `2. 【和悦泛滥之弊】：兑悦过度则易流于和稀泥，缺乏决断魄力。`);

        adviceText = `1. 【补坎固艮】：在业务推进与技术探索中，主动建立“风控止损清单（艮山）”与“深度推演复盘机制（坎水）”，莫让和悦遮蔽了暗礁；\n2. 【乾坤配称】：以乾阳之志探索前沿AI，同时以坤德承载日常业务交付，借事炼心，方能潜龙出渊。`;
      }
      // 4. 【节气时序 / 后天八卦时位运转】题型判定
      else if (tag.includes('节气') || tag.includes('时序') || question.includes('节气') || question.includes('文王后天八卦')) {
        const isStartup = ans.includes('起步') || ans.includes('发端') || ans.includes('惰性') || ans.includes('拖延');
        const asksSystemRelation = ans.includes('八卦学习系统') || ans.includes('时节的关系') || ans.includes('项目维度');

        affirmText = `小友此番自省格外真切深邃！不仅坦诚道破自身处于“起步发端期的拖延与惰性”，更能进一步直击本质，敏锐发问——“八卦学习系统与时节运转的关系究竟为何？与项目维度又有何关联？”这绝非浮光掠影之思，而是真正叩响了后天八卦“以时统事、知时顺势”的奥义大门！`;

        critiqueText = `此处玄微先生为你拨开迷雾，点透“八卦系统与项目时序”之玄机：\n` +
          `1. 【起步即震木，拖延乃萌发之阻】：万物发端于震东（春生破土）。种子破土那一刻往往最艰险、最耗元气，你感知到的“惰性与拖延”，本质是心理在面对“震雷爆发所需巨大破局动能”时的本能退缩与混沌。拖延并非单纯意志薄弱，而是尚未在“冬藏坎水”中聚足破土的笃定！\n` +
          (asksSystemRelation ? `2. 【系统与时节的映射解密】：所谓“八卦系统与时节的关系”，即任何项目生命周期皆合于后天时序！\n   - **坎北（冬藏）**：底层架构调研、知识库冷启动与技术打磨（此时宜潜伏闭关，急于上线必夭折）；\n   - **震东（春生）**：你当前所处阶段——最小可行原型（MVP）破土发端；\n   - **离南（夏长）**：产品公测、功能盛放与大范围传播；\n   - **兑西（秋收）**：用户正向反馈回流、商业收割与总结沉淀。\n   若系统尚在“冬春之交”，你却用“秋收之果”来苛责自身，便是拔苗助长；反之若春雷已至却迟迟不起，则是坐失天时！` : `2. 【合拍顺时】：顺应节气并非听天由命，而是明辨当前是该“冬藏蓄力”还是“春生破土”，动作与时位相配，方为大顺。`);

        adviceText = `1. 【破土无需全备】：顺应震卦春生之律，不要等所有内容尽善尽美才行动。定一个最小破局切口（如今天先交付一个微模块），以小动破大滞；\n2. 【以时视事】：把你的八卦学习系统项目各模块排入“春夏秋冬”四时看板，分清哪些是当前必须生发的“春木”，哪些是后续方需成熟的“秋实”，心境自然泰然清明！`;
      }
      // 4. 【通用自适应托底】
      else {
        affirmText = `小友对《${lessonTitle}》本处的驻足思考见解真切，能结合切身经历反求诸己，言辞务实求真，未曾堆砌晦涩虚华辞藻，殊为可嘉。`;

        critiqueText = `在时位与阴阳辨证上仍需进一步穿透表象。易道贵在“变易与对立统一”，观察局势不仅要看顺境之吉，更要体察暗流涌动的隐患与临界拐点，避免凭单一主观直觉做出片面定论。`;

        adviceText = `建议紧扣本章节的核心卦爻法则，将眼前的困局与爻位变化反复参验，做到“内敛其志、外顺其势、谨言笃行”。`;
      }

      return `🟢 【明德见智 · 肯定之处】：\n${affirmText}\n\n🟡 【见微知著 · 辨正不足与点穴】：\n${critiqueText}\n\n🔵 【致知力行 · 研学与发力建议】：\n${adviceText}`;
    }
  };

  window.YijingKnowledgeRetriever = YijingKnowledgeRetriever;
  window.YijingPromptSystem = YijingPromptSystem;
  window.YijingAIService = YijingAIService;
})(window);
