# -*- coding: utf-8 -*-
import os

target = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai_study_system.js')

part3 = r'''
  // 3. 动态渲染正文底部的【阶段三·复盘】与【阶段四·费曼骨架】
  window.renderBottomStages = function() {
    const readerContent = document.getElementById('readerContent');
    if (!readerContent) return;

    // 避免重复挂载
    const old = document.getElementById('bottomStagesContainer');
    if (old) old.remove();

    const cur = getCurrentGua();
    if (!cur) return;

    const record = window.LearningVault ? window.LearningVault.getGuaRecord(cur.id) : { review: {}, feynman: { framework: {} } };
    const rev = record.review || {};
    const fey = record.feynman || { framework: {} };
    const fw = fey.framework || {};

    const bottomDiv = document.createElement('div');
    bottomDiv.id = 'bottomStagesContainer';
    bottomDiv.innerHTML = `
      <!-- 阶段三：悟道复盘 -->
      <section class="bottom-study-stage stage-review" id="stage3ReviewSection">
        <div class="stage-title-wrap">
          <div>
            <span class="stage-badge-large" style="background:var(--gold-light); color:var(--gold);">阶段三 · 悟道复盘</span>
            <h2>🧠 《${cur.title}》易道心智提炼与生命对齐</h2>
          </div>
          <button class="mentor-btn" onclick="saveBottomReview()">💾 保存复盘心得</button>
        </div>
        <p style="font-size:14px; color:var(--text-sub); line-height:1.7;">
          学易之道，“反身而诚”。读毕本卦经传与时位攻防，请回答以下三个苏格拉底式启发问题，将古老卦气转化为个人的认知算法。
        </p>

        <div style="display:flex; flex-direction:column; gap:16px;">
          <div class="mentor-input-group">
            <label style="font-size:14px; font-weight:800; color:var(--gold);">① 照镜子（生命印证）：回顾过往，你或身边哪次重大得失刚好踩准了本卦的顺逆节奏？</label>
            <textarea id="bottomRevQ1" class="mentor-textarea" rows="2" placeholder="在此写下切身印证的经历与反思...">${rev.q1 || ''}</textarea>
          </div>
          <div class="mentor-input-group">
            <label style="font-size:14px; font-weight:800; color:var(--gold);">② 炼心法（认知跃迁）：如果总结一条关于本卦最“反常识”的现代处事心智底牌，会是什么？</label>
            <textarea id="bottomRevQ2" class="mentor-textarea" rows="2" placeholder="提炼出属于你的一句话核心心法...">${rev.q2 || ''}</textarea>
          </div>
          <div class="mentor-input-group">
            <label style="font-size:14px; font-weight:800; color:var(--gold);">③ 知行合一（行动承诺）：在未来 7 天内，你将如何在某个具体的生活/工作微习惯中践行？</label>
            <textarea id="bottomRevQ3" class="mentor-textarea" rows="2" placeholder="写下可检验的具体行动动作...">${rev.q3 || ''}</textarea>
          </div>
        </div>
        <div id="bottomReviewTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${rev.updated_at ? `上次保存时间：${rev.updated_at}` : '尚未保存复盘'}
        </div>
      </section>

      <!-- 阶段四：费曼输出与通关骨架 -->
      <section class="bottom-study-stage stage-feynman" id="stage4FeynmanSection">
        <div class="stage-title-wrap">
          <div>
            <span class="stage-badge-large" style="background:var(--purple-light); color:var(--purple);">阶段四 · 费曼精研输出</span>
            <h2>📝 《${cur.title}》通关认知骨架与课后笔记</h2>
          </div>
          <div style="display:flex; gap:10px;">
            <button class="mentor-btn outline" onclick="fillFrameworkTemplate()">⚡ 一键注入骨架模板</button>
            <button class="mentor-btn" onclick="saveBottomFeynman()">🏆 提交保存与评分</button>
          </div>
        </div>
        <p style="font-size:14px; color:var(--text-sub); line-height:1.7;">
          <b>真正学会这一卦，必须穿透以下四大底层认知维度</b>。按此结构详写您的课后笔记，系统将自动绑定并提供评分与归档：
        </p>

        <!-- 四维通关骨架输入格 -->
        <div class="feynman-framework-grid">
          <div class="framework-cell">
            <div class="framework-cell-title">📌 1. 卦象时势核心判据</div>
            <div class="framework-cell-desc">上下卦五行表征、当前所处大势（是龙困浅滩、日丽中天、还是险阻在前？）。</div>
            <textarea id="feyCoreTrend" class="framework-cell-input" placeholder="输入大势判断依据...">${fw.core_trend || ''}</textarea>
          </div>

          <div class="framework-cell">
            <div class="framework-cell-title">⚡ 2. 核心爻变拐点攻防</div>
            <div class="framework-cell-desc">哪一爻是吉凶转折关键枢纽？中正当位如何取舍？最凶险与最吉利之爻的攻防要诀。</div>
            <textarea id="feyKeyYao" class="framework-cell-input" placeholder="输入核心爻位转折攻防...">${fw.key_yao_turn || ''}</textarea>
          </div>

          <div class="framework-cell">
            <div class="framework-cell-title">🏢 3. 现实生活/商业案例映射</div>
            <div class="framework-cell-desc">将古老卦象映射到现代商业竞争、团队管理或人际博弈中的典型推演。</div>
            <textarea id="feyRealCase" class="framework-cell-input" placeholder="输入真实场景演练...">${fw.real_case || ''}</textarea>
          </div>

          <div class="framework-cell">
            <div class="framework-cell-title">🧘 4. 反常识易道心智底牌</div>
            <div class="framework-cell-desc">颠覆直觉常态的一条易理决策心法（如：亢龙有悔为何不凶？潜伏如何不沦为躺平？）。</div>
            <textarea id="feyAntiCommon" class="framework-cell-input" placeholder="输入反常识底牌...">${fw.anti_common_rule || ''}</textarea>
          </div>
        </div>

        <div class="mentor-input-group" style="margin-top:10px;">
          <label style="font-size:14px; font-weight:800; color:var(--text-m);">📜 综合费曼自述讲解全稿（大白话通俗输出）：</label>
          <textarea id="feyFullText" class="mentor-textarea" rows="4" placeholder="在此用大白话向一个没有学过易经的朋友，通俗讲透这一卦...">${fey.full_text || ''}</textarea>
        </div>

        <div id="bottomFeynmanTip" style="font-size:12px; color:var(--text-faint); text-align:right;">
          ${fey.updated_at ? `上次保存时间：${fey.updated_at}` : '尚未保存笔记'}
        </div>
      </section>
    `;

    readerContent.appendChild(bottomDiv);
  };

  window.saveBottomReview = function() {
    const cur = getCurrentGua();
    if (!cur) return;
    const q1 = document.getElementById('bottomRevQ1').value.trim();
    const q2 = document.getElementById('bottomRevQ2').value.trim();
    const q3 = document.getElementById('bottomRevQ3').value.trim();
    if (window.LearningVault) {
      window.LearningVault.saveReview(cur.id, { q1, q2, q3 });
      document.getElementById('bottomReviewTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
      alert(`✅ 《${cur.title}》悟道复盘已与本卦绑定保存！可在复习册中随时回溯。`);
    }
  };

  window.fillFrameworkTemplate = function() {
    const cur = getCurrentGua();
    if (!cur) return;
    document.getElementById('feyCoreTrend').value = `【时势判据】本卦由${cur.upper || '上卦'}与${cur.lower || '下卦'}相叠，处于事物演进的典型周期。`;
    document.getElementById('feyKeyYao').value = `【关键拐点】六爻之中以九五/六五居中得正，三爻多凶危，需格外防范转折风险。`;
    document.getElementById('feyRealCase').value = `【实战案例】映射于当前团队项目或个人晋升转型中，需把握进退火候。`;
    document.getElementById('feyAntiCommon').value = `【反常识心法】不求一时之烈，而求周流不居、动合于时。`;
  };

  window.saveBottomFeynman = function() {
    const cur = getCurrentGua();
    if (!cur) return;
    const core_trend = document.getElementById('feyCoreTrend').value.trim();
    const key_yao_turn = document.getElementById('feyKeyYao').value.trim();
    const real_case = document.getElementById('feyRealCase').value.trim();
    const anti_common_rule = document.getElementById('feyAntiCommon').value.trim();
    const full_text = document.getElementById('feyFullText').value.trim();

    if (window.LearningVault) {
      window.LearningVault.saveFeynman(cur.id, {
        framework: { core_trend, key_yao_turn, real_case, anti_common_rule },
        full_text: full_text
      });
      document.getElementById('bottomFeynmanTip').innerText = `已于 ${new Date().toLocaleTimeString()} 保存成功！`;
      alert(`🎉 《${cur.title}》费曼通关笔记已与本卦持久绑定！已计入您的专属修学档案。`);
    }
  };
'''

with open(target, 'a', encoding='utf-8') as f:
    f.write(part3)

print("Part 3 追加成功！")
