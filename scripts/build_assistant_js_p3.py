# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'yijing_assistant.js')

part3 = r'''
  // ==========================================================================
  // 底部两大独立阶段：悟道复盘 + 费曼通关认知骨架
  // ==========================================================================
  window.renderBottomAssistantStages = function() {
    const readerContent = document.getElementById('readerContent');
    if (!readerContent) return;

    const old = document.getElementById('yjStageCardWrap');
    if (old) old.remove();

    const cur = getCurrentLesson();
    if (!cur) return;

    const record = window.LearningVault ? window.LearningVault.getGuaRecord(cur.id) : { review: {}, feynman: { framework: {} } };
    const rev = record.review || {};
    const fey = record.feynman || { framework: {} };
    const fw = fey.framework || {};

    const wrap = document.createElement('div');
    wrap.className = 'yj-stage-card-wrap';
    wrap.id = 'yjStageCardWrap';
    wrap.innerHTML = `
      <!-- 阶段三：悟道复盘 -->
      <section class="yj-stage-card" id="stage3Card">
        <div class="yj-stage-header">
          <div>
            <span class="yj-stage-tag" style="background:var(--gold-light); color:var(--gold);">阶段三 · 悟道复盘</span>
            <h2>🧠 《${cur.title}》易道心智提炼与生命对齐</h2>
            <p>古圣人作易，“反身而诚”。读毕经传宗本与时位攻防，回答三问，将卦象凝练为属于您的个人认知算法。</p>
          </div>
          <button class="mentor-btn" onclick="saveStageReview()" style="padding:8px 16px; font-size:13.5px;">💾 保存复盘心得</button>
        </div>

        <div class="yj-review-grid">
          <div class="yj-review-item">
            <label>① 照镜子（生命印证）：回顾过往，你或身边哪次重大得失刚好踩准了本卦的顺逆节奏？</label>
            <textarea id="revQ1" rows="2" placeholder="在此写下切身经历的真实印证与得失反思...">${rev.q1 || ''}</textarea>
          </div>
          <div class="yj-review-item">
            <label>② 炼心法（认知跃迁）：如果总结一条关于本卦最“反常识”的现代处事心智底牌，会是什么？</label>
            <textarea id="revQ2" rows="2" placeholder="提炼出属于你的一句话核心心法法则...">${rev.q2 || ''}</textarea>
          </div>
          <div class="yj-review-item">
            <label>③ 知行合一（行动承诺）：在未来 7 天内，你将如何在某个具体的生活/工作微习惯中践行？</label>
            <textarea id="revQ3" rows="2" placeholder="写下可检验、可量化的具体行动微动作...">${rev.q3 || ''}</textarea>
          </div>
        </div>
        <div id="revSaveTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${rev.updated_at ? `上次保存时间：${rev.updated_at}` : '尚未保存复盘'}
        </div>
      </section>

      <!-- 阶段四：费曼通关骨架 -->
      <section class="yj-stage-card" id="stage4Card">
        <div class="yj-stage-header">
          <div>
            <span class="yj-stage-tag" style="background:var(--purple-light); color:var(--purple);">阶段四 · 费曼精研输出</span>
            <h2>📝 《${cur.title}》通关认知骨架与课后笔记</h2>
            <p>真正学会这一卦，必须穿透以下四大底层认知维度。详写笔记，系统将自动绑定并永久归档。</p>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="mentor-btn outline" onclick="fillAssistantTemplate()" style="padding:8px 14px; font-size:13px;">⚡ 一键注入骨架模板</button>
            <button class="mentor-btn" onclick="saveStageFeynman()" style="padding:8px 16px; font-size:13.5px;">🏆 提交保存笔记</button>
          </div>
        </div>

        <!-- 四维通关骨架网格 (卡片化) -->
        <div class="yj-framework-grid">
          <div class="yj-framework-box">
            <div class="yj-box-title">📌 1. 卦象时势核心判据</div>
            <div class="yj-box-desc">内外卦象数表征、当前所处大势（是龙困浅滩、日丽中天、还是险阻在前？）。</div>
            <textarea id="feyCoreTrend" placeholder="输入大势判断依据...">${fw.core_trend || ''}</textarea>
          </div>

          <div class="yj-framework-box">
            <div class="yj-box-title">⚡ 2. 核心爻变拐点攻防</div>
            <div class="yj-box-desc">哪一爻是吉凶转折关键枢纽？中正当位如何取舍？最凶险与最吉利之爻的攻防要诀。</div>
            <textarea id="feyKeyYao" placeholder="输入核心爻位转折攻防要诀...">${fw.key_yao_turn || ''}</textarea>
          </div>

          <div class="yj-framework-box">
            <div class="yj-box-title">🏢 3. 现实生活/商业案例映射</div>
            <div class="yj-box-desc">将古老卦象映射到现代商业竞争、团队管理或人际博弈中的典型推演。</div>
            <textarea id="feyRealCase" placeholder="输入真实场景演练...">${fw.real_case || ''}</textarea>
          </div>

          <div class="yj-framework-box">
            <div class="yj-box-title">🧘 4. 反常识易道心智底牌</div>
            <div class="yj-box-desc">颠覆直觉常态的一条深层心法（如：亢龙有悔为何不凶？潜伏如何不沦为躺平？）。</div>
            <textarea id="feyAntiCommon" placeholder="输入反常识底牌...">${fw.anti_common_rule || ''}</textarea>
          </div>
        </div>

        <div style="margin-top:10px; display:flex; flex-direction:column; gap:8px;">
          <label style="font-size:14px; font-weight:800; color:var(--text-m);">📜 综合费曼自述全稿（用大白话向一个外行讲透此卦）：</label>
          <textarea id="feyFullText" class="mentor-textarea" rows="4" placeholder="在此用大白话向朋友通俗讲透这一卦的精髓...">${fey.full_text || ''}</textarea>
        </div>

        <div id="feySaveTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${fey.updated_at ? `上次保存时间：${fey.updated_at}` : '尚未保存笔记'}
        </div>
      </section>
    `;

    readerContent.appendChild(wrap);
  };

  window.saveStageReview = function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const q1 = document.getElementById('revQ1').value.trim();
    const q2 = document.getElementById('revQ2').value.trim();
    const q3 = document.getElementById('revQ3').value.trim();
    window.LearningVault.saveReview(cur.id, { q1, q2, q3 });
    document.getElementById('revSaveTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
    alert(`✅ 《${cur.title}》悟道复盘已成功归档并与本卦绑定！`);
  };

  window.fillAssistantTemplate = function() {
    const cur = getCurrentLesson();
    if (!cur) return;
    document.getElementById('feyCoreTrend').value = `【时势判据】本卦由${cur.upper || '上卦'}与${cur.lower || '下卦'}相叠，处于事物演进的典型关键周期。`;
    document.getElementById('feyKeyYao').value = `【关键拐点】六爻之中以九五/六五居中得正，三爻多凶危，需格外防范转折风险。`;
    document.getElementById('feyRealCase').value = `【实战案例】映射于当前团队项目或个人晋升转型中，需把握进退火候。`;
    document.getElementById('feyAntiCommon').value = `【反常识心法】不求一时之烈，而求周流不居、动合于时。`;
  };

  window.saveStageFeynman = function() {
    const cur = getCurrentLesson();
    if (!cur || !window.LearningVault) return;
    const core_trend = document.getElementById('feyCoreTrend').value.trim();
    const key_yao_turn = document.getElementById('feyKeyYao').value.trim();
    const real_case = document.getElementById('feyRealCase').value.trim();
    const anti_common_rule = document.getElementById('feyAntiCommon').value.trim();
    const full_text = document.getElementById('feyFullText').value.trim();

    window.LearningVault.saveFeynman(cur.id, {
      framework: { core_trend, key_yao_turn, real_case, anti_common_rule },
      full_text: full_text
    });
    document.getElementById('feySaveTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
    alert(`🎉 《${cur.title}》费曼通关笔记已持久归档！可在修学复习册中随心温习。`);
  };
'''

with open(target, 'a', encoding='utf-8') as f:
    f.write(part3)

print("yijing_assistant.js Part 3 追加成功！")
