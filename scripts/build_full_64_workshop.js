/**
 * scripts/build_full_64_workshop.js
 * 阶段四·子任务A：全量64卦（68门课）专属教学工坊与费曼任务矩阵工程化全覆盖
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const BASE_DIR = path.dirname(__dirname);
const ASSISTANT_JS = path.join(BASE_DIR, 'yijing_assistant.js');

// 1. 加载核心全息数据
const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(BASE_DIR, 'course_data.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(BASE_DIR, 'yijing_inquiry_bank.js'), 'utf8'), sandbox);
vm.runInContext(fs.readFileSync(path.join(BASE_DIR, 'yijing_natural_trigrams.js'), 'utf8'), sandbox);

const course = sandbox.window.COURSE;
const inquiries = sandbox.window.YijingInquiryBank;
const naturalSys = sandbox.window.YijingNaturalSystem;

// 2. 读取当前 yijing_assistant.js 中已完成的 20 卦定制（阶段一、阶段二成果，必须100%保留）
const assistantCode = fs.readFileSync(ASSISTANT_JS, 'utf8');

// 提取当前 LESSON_CUSTOM_CONFIGS
const configStartMarker = "const LESSON_CUSTOM_CONFIGS = ";
const configEndMarker = ";\n\n  // 难易度自适应评估模型";
const cStart = assistantCode.indexOf(configStartMarker);
const cEnd = assistantCode.indexOf(configEndMarker, cStart);

if (cStart === -1 || cEnd === -1) {
  console.error("Could not find LESSON_CUSTOM_CONFIGS boundaries in yijing_assistant.js");
  process.exit(1);
}
const configJsonStr = assistantCode.slice(cStart + configStartMarker.length, cEnd);
const currentConfigs = JSON.parse(configJsonStr);

// 提取当前 INLINE_THINK_BANK
const bankStartMarker = "const INLINE_THINK_BANK = ";
const bankEndMarker = ";\n\n  // 渲染正文穿插的";
const bStart = assistantCode.indexOf(bankStartMarker);
const bEnd = assistantCode.indexOf(bankEndMarker, bStart);

if (bStart === -1 || bEnd === -1) {
  console.error("Could not find INLINE_THINK_BANK boundaries in yijing_assistant.js");
  process.exit(1);
}
const bankJsonStr = assistantCode.slice(bStart + bankStartMarker.length, bEnd);
const currentBank = JSON.parse(bankJsonStr);

console.log("Preserved existing configs count:", Object.keys(currentConfigs).length);
console.log("Preserved existing bank count:", Object.keys(currentBank).length);

// 3. 定义深水辩证卦集合 (Level 3)
const LEVEL3_GUAS = new Set([
  'lesson-03_水雷屯', 'lesson-05_水天需', 'lesson-12_天地否', 'lesson-18_山风蛊',
  'lesson-23_山地剥', 'lesson-24_地雷复', 'lesson-28_泽风大过', 'lesson-29_坎为水',
  'lesson-30_离为火', 'lesson-33_天山遁', 'lesson-36_地火明夷', 'lesson-38_火泽睽',
  'lesson-39_水山蹇', 'lesson-40_雷水解', 'lesson-41_山泽损', 'lesson-43_泽天夬',
  'lesson-44_天风姤', 'lesson-47_泽水困', 'lesson-49_泽火革', 'lesson-50_火风鼎',
  'lesson-63_水火既济', 'lesson-64_火水未济'
]);

// 4. 遍历所有 68 门课时，补充缺失的 48 卦
const allLessons = [];
course.parts.forEach(p => p.topics.forEach(t => t.lessons.forEach(l => allLessons.push(l))));

let addedCount = 0;

allLessons.forEach(lesson => {
  const id = lesson.id;
  if (currentConfigs[id] && currentBank[id]) {
    return; // 已在阶段一、二精研定制，跳过
  }

  const meta = naturalSys.GUA_NATURE_MAP[id] || {};
  const inq = inquiries[id] || [
    `结合《${lesson.title}》的核心卦义，你在现实中最深刻的启发是什么？`,
    `本卦时位转折处，常人最容易在哪个爻位犯下误判？`,
    `如何将本卦的易道心法转化为长期的处事底牌？`
  ];

  const guaName = meta.name || lesson.navTitle || lesson.title;
  const upperNature = meta.upper ? meta.upper.nature : '';
  const lowerNature = meta.lower ? meta.lower.nature : '';
  const scene = meta.natureScene || `${upperNature}${lowerNature}相荡之象`;
  const reasoning = meta.originReasoning || '';
  const evolution = meta.ladderEvolution || '';

  const isLevel3 = LEVEL3_GUAS.has(id);
  const level = isLevel3 ? 3 : 2;
  const levelLabel = isLevel3 ? '深水辩证 · 进阶级' : '时位精研 · 标杆级';
  const badgeClass = isLevel3 ? 'level-3' : 'level-2';

  // 4.1 生成 LESSON_CUSTOM_CONFIGS
  const scenarioTitle = `向朋友讲透《${guaName}》的核心处事底牌与避险智慧`;
  const scenarioPrompt = `假想你的朋友完全没接触过周易，正面临类似《${guaName}》所揭示的现实情境（${scene}）。请用 3 分钟生活大白话向他讲透本卦最受用的做人处事锦囊，严禁使用玄虚古文黑话！`;

  // 提炼 3 条精深 CoreHints
  const hint1 = meta.daxiangQuote ? `《大象传》点穴：“${meta.daxiangQuote}”，指明了本卦的立身与治事格局。` : `紧扣${scene}，体悟自然天地原力交互对人事决策的投射。`;
  const hint2 = reasoning ? reasoning.slice(0, 100) + '……' : `理解阴阳刚柔消长，不执泥于一时得失，顺应大势节奏。`;
  const hint3 = evolution ? evolution.slice(0, 100) + '……' : `六爻自下而上，初爻慎始蓄力，三爻惕厉戒慎，五爻得中尊位，上爻戒亢知止。`;

  // 提炼 3 组 Scaffolds
  const scaffolds = [
    {
      title: '💡 现实打个比方',
      desc: `把《${guaName}》的${scene}映射为生活、职场或商业中的具体生动案例`,
      insert: `【生活/业务比方】：这一卦在现实中就像……，看似……，其实……`
    },
    {
      title: '🗣️ 大白话核心锦囊',
      desc: '抽离文言卦辞，把古人的避坑心得提炼为 1 条通俗处事铁律',
      insert: `【大白话核心锦囊】：古人其实是在提醒我们：身处这个时位，最关键的行动原则是……`
    },
    {
      title: '🔍 避坑盲区自检',
      desc: '人在这个阶段最容易自以为是地犯什么低级错误？',
      insert: `【最易摔跤的盲区】：人在这种局面下最容易误判的是……，切记千万不可……`
    }
  ];

  currentConfigs[id] = {
    level,
    levelLabel,
    badgeClass,
    reviewCount: 3,
    inlineCount: 2,
    scenarioTitle,
    scenarioPrompt,
    coreHints: [hint1, hint2, hint3],
    scaffolds
  };

  // 4.2 生成 INLINE_THINK_BANK (2 道穿插探问)
  currentBank[id] = [
    {
      sectionKeyword: '大象传',
      tag: `${guaName}格局 · 边读边思`,
      question: inq[0] || `读到此处，停下来想一想：在你的工作或个人经历中，曾经历过怎样与《${guaName}》相仿的时势交感？`,
      hint: `💡 玄微先生点穴启发：${reasoning ? reasoning.slice(0, 120) + '。' : '观象玩辞，体用一源。将天地之象照进现实处境，破除主观妄念。'}`
    },
    {
      sectionKeyword: '伊川易传',
      tag: `${guaName}时位 · 边读边思`,
      question: inq[1] || `面对《${guaName}》的时位演变，如果你正处在关键拐点，最该如何权衡取舍？`,
      hint: `💡 玄微先生点穴启发：${evolution ? evolution.slice(0, 120) + '。' : '得中远胜于机械得位，审时度势，动静有节方能立于不败之地。'}`
    }
  ];

  addedCount++;
});

console.log(`Successfully generated and added ${addedCount} missing lessons!`);
console.log(`Total LESSON_CUSTOM_CONFIGS count now: ${Object.keys(currentConfigs).length}`);
console.log(`Total INLINE_THINK_BANK count now: ${Object.keys(currentBank).length}`);

// 5. 替换回 yijing_assistant.js
const updatedConfigJson = JSON.stringify(currentConfigs, null, 2);
const updatedBankJson = JSON.stringify(currentBank, null, 2);

// 先替换 INLINE_THINK_BANK (靠后)
let newCode = assistantCode.slice(0, bStart + bankStartMarker.length) + updatedBankJson + assistantCode.slice(bEnd);

// 再替换 LESSON_CUSTOM_CONFIGS (靠前)
const newCStart = newCode.indexOf(configStartMarker);
const newCEnd = newCode.indexOf(configEndMarker, newCStart);
newCode = newCode.slice(0, newCStart + configStartMarker.length) + updatedConfigJson + newCode.slice(newCEnd);

fs.writeFileSync(ASSISTANT_JS, newCode, 'utf8');
console.log("yijing_assistant.js updated with 100% full 68-lesson coverage!");
