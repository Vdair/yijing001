const fs = require('fs');

global.window = global;
global.localStorage = {
  store: {},
  getItem(k) { return this.store[k] || null; },
  setItem(k, v) { this.store[k] = String(v); },
  removeItem(k) { delete this.store[k]; }
};

const nativeFetch = globalThis.fetch;
globalThis.fetch = (url, opts) => {
  const fullUrl = typeof url === 'string' && url.startsWith('http') ? url : 'http://127.0.0.1:8090' + url;
  return nativeFetch(fullUrl, opts);
};

// 引入源码
const code = fs.readFileSync(__dirname + '/../yijing_ai_service.js', 'utf-8');
eval(code);

async function main() {
  console.log('========================================================');
  console.log('☯️ 易道认知工坊 · 智谱 GLM-5.3 全场景大模型自动化校验');
  console.log('========================================================');

  console.log('\n[1/4] 同步本地密钥配置并检测当前状态...');
  await YijingAIService.pullLocalConfigFile();
  const cfg = YijingAIService.getConfig();
  console.log(`当前激活渠道: ${cfg.activeProvider} | 当前模型: ${cfg.model}`);

  // 场景 1: 连通性测试
  console.log('\n[2/4] 校验场景一：模型设置弹窗极速连通性探测 (testConnection)...');
  const t0 = Date.now();
  const testRes = await YijingAIService.testConnection();
  console.log(`连通状态: ${testRes.success ? '✅ 成功' : '❌ 失败'} | 耗时: ${Date.now() - t0}ms`);
  console.log(`助教回音: "${testRes.reply}"`);
  if (!testRes.success) throw new Error('场景1失败: ' + testRes.message);

  // 场景 2: 助教伴读常规问答与划词点穴
  console.log('\n[3/4] 校验场景二：玄微先生伴读提问 / 划词点穴流式释疑 (answerQuestion)...');
  const t1 = Date.now();
  await YijingAIService.answerQuestion({
    question: '九三爻为什么说君子终日乾乾夕惕若厉？现代职场该如何理解？',
    quoteText: '九三：君子终日乾乾，夕惕若厉，无咎。',
    lessonMeta: { id: 'p0-01', title: '天地之象 —— 八卦全息原型与能量建模' },
    onReasoning: (d, full) => {},
    onContent: (d, full) => {},
    onDone: (res) => {
      console.log(`✅ 场景二问答完成！耗时: ${Date.now() - t1}ms`);
      console.log(`思考链: ${(res.reasoning || '').length} 字 | 正式回答: ${res.content.length} 字`);
      console.log('--- 宗师开示节选 ---');
      console.log(res.content.slice(0, 220) + '...\n');
      if (!res.content || res.content.length < 50) throw new Error('场景二正文内容为空或过短！');
    },
    onError: (err) => { throw new Error('场景二失败: ' + err.message); }
  });

  // 场景 3: 边读边思师承三维点穴评估
  console.log('\n[4/4] 校验场景三：边读边思 · 师承三维点穴实时评估 (evaluateInlineThink)...');
  const t2 = Date.now();
  await YijingAIService.evaluateInlineThink({
    lessonTitle: '天地之象 —— 八卦全息原型与能量建模',
    question: '初九潜龙勿用，如何判断自己真正度过了“潜”的阶段？',
    studentAnswer: '当自己在专业技能上有拿得出手的代表作，且外部开始主动寻求合作、时位机缘成熟时。',
    tag: '时位演化之思',
    hint: '初九阳在下，潜伏蓄势',
    onReasoning: (d, full) => {},
    onContent: (d, full) => {},
    onDone: (res) => {
      console.log(`✅ 场景三师承评估完成！耗时: ${Date.now() - t2}ms`);
      console.log(`思考链: ${(res.reasoning || '').length} 字 | 正式点评: ${res.content.length} 字`);
      console.log('--- 师承三维点穴节选 ---');
      console.log(res.content.slice(0, 220) + '...\n');
      if (!res.content || res.content.length < 50) throw new Error('场景三正文内容为空或过短！');
    },
    onError: (err) => { throw new Error('场景三失败: ' + err.message); }
  });

  console.log('========================================================');
  console.log('🎉 智谱 GLM-5.3-Flash 全场景大模型实测【100% 全部通过】！');
  console.log('========================================================');
}

main().catch(err => {
  console.error('\n❌ 校验出现异常:', err);
  process.exit(1);
});
