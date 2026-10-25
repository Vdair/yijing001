/**
 * 课程结构化数据 —— 门户首页 (home.html) 与 Wiki 学习页 (learn.html) 的统一数据源。
 * 维护一处即可，新增/调整课程内容只改这里。
 *
 * 结构：篇章(part) → 主题(topic) → 知识点(lesson)
 * lesson.file 对应 slides/ 下的某个 .html
 * lesson.tag  用于显示彩色标签（交互/动画/概念/案例/安全 等）
 */
window.COURSE = {
  meta: {
    title: '学 AI 产品，从入门到精通',
    subtitle: '从大模型底层原理到 AI Agent Harness',
    brand: '小山学堂',
    author: '洛小山',
    authorUrl: 'https://luoxiaoshan.cn/',
    github: 'https://github.com/itshen/learn-ai',
  },
  parts: [
    /* 开篇：课程的第一站，先定位自己再讲怎么学。放在零基础入门篇之前，新访客默认落地
       在这里（learn.html 取 FLAT[0]）。暂时复用 prologue 标记，首页会渲染成 INTRO
       徽章，与零基础入门篇重复；待 Ask Alice 分支落地后换成专用的 preface 样式。 */
    {
      id: 'p-start',
      num: '课程开篇',
      title: '开始之前',
      desc: '四节开篇小课：先按目标挑一条学习路线，再用邓宁-克鲁格曲线找到自己现在的位置，讲清怎么学才能真的过脑子，以及为什么值得先花时间弄懂原理。原理通了，后面所有方案你都能自己看懂。',
      color: '#64748b',
      group: 'main',
      routes: ['use', 'pro', 'pm', 'build'],
      prologue: true,
      topics: [
        {
          id: 't-intro',
          title: '入门与定位',
          desc: '先搞清楚我们在哪里、为什么要打基础',
          lessons: [
            /* 路线选择放在全课第一节：五条路线最后都汇到「入门与定位」，
               所有人必经此处。注册成课时它才有阅读器外壳，也才进得了翻页序列。 */
            { file: 'roadmap.html', title: '先选一条适合你的路', desc: '五档学习路线按目标划好范围：只想会用 AI、把 AI 用到专业、做 AI 产品、自己动手搭、全都要。选完课程目录自动精简，随时能改', tag: '开篇' , navTitle: '选学习路线'},
            { file: '0-intro.html', title: '我们在哪里？邓宁-克鲁格效应', desc: '用邓宁-克鲁格曲线定位学员当前位置，明确课程目标：从愚昧之巅走向平稳高原', tag: '开篇' , navTitle: '我们在哪里'},
            { file: '0-how.html', title: '怎样学，知识才能过脑子', desc: '看完 ≠ 学到：每个案例都要停下来反思、代入自己的业务场景、尝试输出', tag: '开篇' , navTitle: '怎样学才有效'},
            { file: '0-why.html', title: '为什么要花时间讲原理', desc: 'AI 所有 Harness 操作本质都是对 message list 的处理。理解它，才能看懂所有方案', tag: '开篇' , navTitle: '为什么要打基础'},
          ],
        },
      ],
    },
    /* 学习方法专题：开篇讲了「怎样学才过脑子」，这一章把那一节展开成三十五节可操作的做法。
       标 prologue，所以不占主线编号，后面篇章的序号不变；四条路线都可见，因为提问、验证、
       留住知识这三件事跟学员想走哪条路无关。

       2026-08 重构：原来十一节，每节塞三到四个方法、两千多字，读者反馈晦涩。改成一页只讲
       一件事、四百到六百字、讲解责任交给演示，于是十一节展开成三十二节正文加三节收尾。
       字数与结构的闸门在 codex-course/check_page.py 的 learn 专题口径里。 */
    {
      id: 'p-learn',
      num: '学习方法',
      title: 'AI 教我学习：把它当老师用',
      desc: '知识随手就能问出来之后，学得好不好取决于三件事：问得准、验得住、留得下。三十五节课，一节只讲一个动作，四百字左右加一个能上手的演示：提问该带哪四个部件、它最容易在哪五处编、读不下去的条款怎么分四步拆开、带 AI 精读几十万行源码时怎么让每个论断都回到具体行、怎么让它出新题而不是出名词解释、外部记忆该分哪三层写、怎么确认自己真会了而不是读得顺、怎么把这些动作排进自己的周历，以及把站内侧边栏的 Alice 用成随时在场的助教。最后三节收尾：三十二个动作的汇总表、今天十分钟能填完的三行、用 30 道题找出我没学会的地方。',
      color: '#b45309',
      group: 'main',
      routes: ['use', 'pro', 'pm', 'build'],
      prologue: true,
      topics: [
        {
          id: 't-learn-open',
          title: '开篇：稀缺的是判断',
          desc: '答案变便宜之后，涨价的是什么',
          lessons: [
            { file: 'learn-1.html', title: '让 AI 帮我判断：这个建议适合我吗', desc: 'AI 说年卡划算，可能只是对经常去的人划算。把时间、距离和真实习惯说清楚，答案才是在帮你做决定。', tag: '认知', navTitle: '建议适合我吗' },
            { file: 'learn-2.html', title: '让 AI 帮我找到下一步该问什么', desc: '能问出答案、能指出可疑处、能问出下一问，这三层是分界。读完能认出自己停在哪一层。', tag: '认知', navTitle: '找到下一问' },
          ],
        },
        {
          id: 't-learn-ask',
          title: '提问：把讲义变成考卷',
          desc: '一句提问里该带什么',
          lessons: [
            { file: 'learn-3.html', title: '让 AI 按我的情况讲清楚', desc: '锚点、场景、出题、预警，每缺一个，回答就少一块。四句模板可以直接抄走。', tag: '提问', navTitle: '按我的情况讲' },
            { file: 'learn-4.html', title: '让 AI 用我熟悉的东西打比方', desc: '它不知道你熟悉什么，只能从公共题库里抽一个源领域。在提问里空出这一格，填你已经会的东西。', tag: '提问', navTitle: '用熟悉的东西类比' },
            { file: 'learn-5.html', title: '让 AI 一次只问我一个问题', desc: '把下一步推理变成一个问句交还给你，往下想的活儿留在你这边。读完能看出自己卡在第几问。', tag: '提问', navTitle: '一次只问一个' },
          ],
        },
        {
          id: 't-learn-guard',
          title: '防幻觉：三道防线',
          desc: '它会用同一种语气说错',
          lessons: [
            { file: 'learn-6.html', title: '让 AI 标出最可能编错的五类信息', desc: '一段读起来很顺的回答里，有五个位置默认该当可疑。读完能指出它们在哪。', tag: '验证', navTitle: '标出五类可疑信息' },
            { file: 'learn-7.html', title: '让 AI 的回答先过三道检查', desc: '要出处、交叉验证、标注不确定。同一段回答过三道闸，每开一道筛掉的不一样，三道全开还剩一条得自己翻原文。', tag: '验证', navTitle: '回答过三道检查' },
            { file: 'learn-8.html', title: '这次回答，我要不要去查原文', desc: '按后果决定查不查。越是它答得流畅完整的地方，越值得抽一处去对原文。', tag: '验证', navTitle: '这次要查原文吗' },
          ],
        },
        {
          id: 't-learn-hard',
          title: '啃硬材料：从条款到源码',
          desc: '读不下去的东西怎么拆开',
          lessons: [
            { file: 'learn-9.html', title: '让 AI 帮我拆开一段看不懂的条款', desc: '先要地图，再定位卡点，补那一层前置，最后回到原文。四步走完，那一句能用没有术语的话说出来。', tag: '阅读', navTitle: '拆开难懂条款' },
            { file: 'learn-10.html', title: '让 AI 先告诉我必须懂哪五个概念', desc: '按目录、摘要、结论、图表、正文的顺序给它，开工先问要先懂哪五个概念。', tag: '阅读', navTitle: '先列五个概念' },
            { file: 'learn-11.html', title: '让 AI 只根据我贴出的原文回答', desc: '转述会先丢掉限定条件、例外情况、指向别处的定义，而那正是花钱的部分。', tag: '阅读', navTitle: '只根据原文' },
            { file: 'learn-12.html', title: '让 AI 给每条判断标出原文位置', desc: 'AI 的每一条判断都要能指回原文的确切位置。指不回去的那几条，先别拿来做决定。', tag: '阅读', navTitle: '标出原文位置' },
            { file: 'learn-13.html', title: '让 AI 先确认我手上是哪一版', desc: '同一个文件名下可能是两份不同的东西。先确认手上这份的日期和来源，后面的判断只认这一版。', tag: '阅读', navTitle: '确认是哪一版' },
            { file: 'learn-14.html', title: '让 AI 改稿时保住关键信息', desc: '检查项全过，也可能是因为最难解释的那段被直接删掉了。既看留下的，也看少了什么。', tag: '阅读', navTitle: '改稿保住关键信息' },
          ],
        },
        {
          id: 't-learn-keep',
          title: '让知识留下来',
          desc: '取出来，以及写在对话外面',
          lessons: [
            { file: 'learn-15.html', title: '合上材料，让 AI 考我一次', desc: '取出来这个动作本身在加固记忆，重读加固的是眼熟。', tag: '记忆', navTitle: '合上材料考一次' },
            { file: 'learn-16.html', title: '让 AI 每次换一道没见过的新题', desc: '固定的旧题会被背熟。AI 的独特价值是能无限次出新题，而复习要放在快忘的时候。', tag: '记忆', navTitle: '每次换一道新题' },
            { file: 'learn-17.html', title: '让 AI 找出我在哪一步想错了', desc: '答错之后先别看答案，把当时的想法说给它，让它指出思路在哪一步偏了。', tag: '记忆', navTitle: '找到想错的一步' },
            { file: 'learn-18.html', title: '让 AI 在新对话里接着上次聊', desc: '上下文窗口是这一次会话的工作区，对话一关就空了。留下的那层得写在外面。', tag: '上下文', navTitle: '新对话接着聊' },
            { file: 'learn-19.html', title: '分三层告诉 AI：我是谁、在做什么', desc: '一句话自我介绍、项目背景、能被检索的笔记，各写什么、写在哪。', tag: '上下文', navTitle: '分三层介绍自己' },
            { file: 'learn-20.html', title: '让 AI 帮我把笔记写得以后找得到', desc: '一条笔记一个主题，开头一句话说清结论，带上当时的困惑。读完知道每次该挑哪几条喂进去。', tag: '上下文', navTitle: '笔记以后找得到' },
          ],
        },
        {
          id: 't-learn-check',
          title: '自查与避坑',
          desc: '怎么知道自己真会了，以及三个坑',
          lessons: [
            { file: 'learn-21.html', title: '让 AI 像外行一样追问我', desc: '让它只带初中知识来追问。读完能拿一个概念跑一遍，看自己卡在第几问。', tag: '自查', navTitle: '像外行一样追问' },
            { file: 'learn-22.html', title: '让 AI 改一个条件，再考我一次', desc: '一道原题加三种变体，看同一套背下来的步骤在哪一步失去依据。', tag: '自查', navTitle: '改条件再考一次' },
            { file: 'learn-23.html', title: '让 AI 等我写完三行，再给答案', desc: '预测它在边界上会怎么走，再让它故意讲错、你来指。', tag: '自查', navTitle: '写完三行再给答案' },
            { file: 'learn-24.html', title: '让 AI 帮我检查：我是真的懂了吗', desc: '好的阅读体验和知识进脑是两件事。盖住那段读得很顺的解释说三个要点，缺的那条就露出来。', tag: '避坑', navTitle: '我是真的懂了吗' },
            { file: 'learn-25.html', title: '让 AI 把推理过程还给我', desc: '结论可以借，推演借走了下次还得再借。读完能用一句话判断自己刚才是学会了还是只完成了。', tag: '避坑', navTitle: '把推理过程还给我' },
            { file: 'learn-26.html', title: '收藏之前，先用自己的话说一遍', desc: '拥有信息和拥有能力之间没有自动兑换。读完你会在点星之前多做一步。', tag: '避坑', navTitle: '先用自己的话说' },
          ],
        },
        {
          id: 't-learn-plan',
          title: '给自己设计一门课',
          desc: '把这些动作排进自己的路径',
          lessons: [
            { file: 'learn-27.html', title: '让 AI 按我的目标筛掉暂时用不上的材料', desc: '材料按知识完整性编排，你的时间按自己的目标编排。读完能写出一句别人看得见的目标，拿它筛材料。', tag: '规划', navTitle: '按目标筛材料' },
            { file: 'learn-28.html', title: '让 AI 用一个成品检查我会不会', desc: '里程碑到期那天要交一个别人看得见的东西，开工之前先跑一次前置自测。', tag: '规划', navTitle: '用成品检查' },
            { file: 'learn-29.html', title: '让 AI 帮我先留出复习时间', desc: '排周历的时候先扣掉复习位，再往剩下的空里放新内容。读完能看出复习位是怎么被一格一格占掉的。', tag: '规划', navTitle: '先留复习时间' },
          ],
        },
        {
          id: 't-learn-alice',
          title: '把侧边栏的 Alice 用起来',
          desc: '站内这个助手怎么用',
          lessons: [
            { file: 'learn-30.html', title: '直接指着这一页问 AI', desc: '当前页正文会自动带给她，输入框里打六个字就够，不用先把这段复制过去。', tag: '助教', navTitle: '指着这页问 AI' },
            { file: 'learn-31.html', title: '让 AI 现在就考我', desc: '空态第五道模拟面试围绕本页标题出题，一次一道，由浅入深。读完会用它看出哪一句取不出来。', tag: '助教', navTitle: '现在就考我' },
            { file: 'learn-32.html', title: '让 AI 下次主动想起我摘抄的内容', desc: '收藏是把那句话挪到另一个地方等你想起来。摘抄进笔记的那条，下一次你问相关的问题，它自己到她手上。', tag: '助教', navTitle: '下次想起摘抄' },
          ],
        },
        {
          id: 't-learn-end',
          title: '收尾',
          desc: '汇总、今天能做什么、自测',
          lessons: [
            { file: 'learn-33.html', title: '从 32 个动作里选出我的下一步', desc: '前面三十二页各讲一件事。勾出现在最缺的那两三项，这一页给出该走的页码顺序。', tag: '汇总', navTitle: '选出我的下一步' },
            { file: 'learn-34.html', title: '今天先完成这三行', desc: '三个动作，十分钟以内做得完。这一页不讲新东西，填完带走自己那三行。', tag: '落地', navTitle: '今天完成三行' },
            { file: 'learn-35.html', title: '用 30 道题找出我没学会的地方', desc: '三十道题覆盖前面三十二页。每一道先自己答一遍再翻答案，没答上的那几条，末尾按页码排成一张补课清单。', tag: '自测', navTitle: '找出没学会的地方' },
          ],
        },
      ],
    },
    {
      id: 'p0',
      num: '零基础入门',
      title: '写给第一次接触 AI 的你',
      desc: '不讲术语、不讲数学，用八节交互小课建立对 AI 的正确直觉：它能干哪些神奇的活、为什么会一本正经地胡说、怎么和它说话、什么能放心交给它。另附「小白三千问」：一页一问，把新手最常见的疑惑一次说清。零基础的家人朋友也能看懂，全章免登录开放。',
      color: '#0891b2',
      group: 'main',
      routes: ['use', 'pro', 'pm', 'build'],
      prologue: true,
      topics: [
        {
          id: 't-zero-what',
          title: 'AI 是个什么东西',
          desc: '先看它的能力，再看穿它的底牌',
          lessons: [
            { file: 'zero-0.html', title: 'AI 能干哪些神奇的活', desc: '六个真实使用现场：整理纪要、看懂报告、给任何人讲任何事、陪练面试、做小工具、生成海报。以前是人学软件，现在是软件听人话', tag: '交互' },
            { file: 'zero-1.html', title: '它其实在玩「接话茬」', desc: '不需要任何基础：AI 每次只做一件事——猜下一个字。两个小游戏，建立你对 AI 的第一个正确直觉', tag: '交互' },
            { file: 'zero-2.html', title: '它不是搜索引擎', desc: '搜索给书架，AI 给结论。理解「凭记忆回答」的三个后果：会记串、知识有截止日期、没有出处可查', tag: '概念' },
            { file: 'zero-3.html', title: '它会一本正经地胡说', desc: '三个找茬游戏：亲手从 AI 的回答里抓出编造的句子，再带走三个实用的小习惯', tag: '交互' },
          ],
        },
        {
          id: 't-zero-talk',
          title: '怎么和它说话',
          d