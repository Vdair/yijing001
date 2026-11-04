#!/usr/bin/env python3
# -*- coding: utf-8 -*-

with open('yijing_assistant.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 1. Update bottomRevAnalysisCard header & body
old_bottom = """            <div class="yj-analysis-title">
              <span>☯️</span>
              <span>玄微先生 · 易道学术四维深度点评</span>
            </div>
            <span id="bottomRevAnalysisTime" style="font-size:12px; color:var(--text-faint);">${rev.ai_analysis && rev.ai_analysis.updated_at ? '剖析于 ' + rev.ai_analysis.updated_at : ''}</span>
          </div>
          <div class="yj-analysis-body" id="bottomRevAnalysisContent">${(rev.ai_analysis && rev.ai_analysis.content ? rev.ai_analysis.content : '').replace(/\\n/g, '<br>')}</div>"""

new_bottom = """            <div class="yj-analysis-title">
              <span>☯️</span>
              <span>玄微先生 · 易道学术多维深度比对诊断</span>
            </div>
            <span id="bottomRevAnalysisTime" style="font-size:12px; color:var(--text-faint);">${rev.ai_analysis && rev.ai_analysis.updated_at ? '剖析于 ' + rev.ai_analysis.updated_at : ''}</span>
          </div>
          <div class="yj-analysis-body" id="bottomRevAnalysisContent">${(rev.ai_analysis && rev.ai_analysis.content ? (window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(rev.ai_analysis.content) : rev.ai_analysis.content.replace(/\\n/g, '<br>')) : '')}</div>"""

if old_bottom in js:
    js = js.replace(old_bottom, new_bottom)
    print("Replaced bottomRevAnalysisCard body and header.")
else:
    print("Warning: old_bottom not found!")

# 2. Update requestBottomMasterAgentReview streaming & done handlers
old_req = """          onContent: (chunk, fullContent) => {
            if (body) {
              body.innerHTML = fullContent.replace(/\\n/g, '<br>');
            }
          },
          onDone: ({ content }) => {
            if (body) body.classList.remove('yj-typing-cursor');
            const nowTime = new Date().toLocaleString();
            if (timeEl) timeEl.innerText = `剖析于 ${nowTime}`;

            // 保存到档案与磁盘
            window.LearningVault.saveReviewAnalysis(cur.id, content, cur);
            window.LearningVault.appendDialogue(
              cur.id,
              `【提请复盘深度剖析】研习《${cur.title}》专属反思与费曼自述`,
              content,
              cur
            );
            // 同步模态框显示
            const vBody = document.getElementById('vRevAnalysisContent');
            const vTime = document.getElementById('vRevAnalysisTime');
            const vCard = document.getElementById('vRevAnalysisCard');
            if (vBody && vCard) {
              vCard.style.display = 'flex';
              vBody.innerHTML = content.replace(/\\n/g, '<br>');
              if (vTime) vTime.innerText = `剖析于 ${nowTime}`;
            }
          },"""

new_req = """          onContent: (chunk, fullContent) => {
            if (body) {
              body.innerHTML = window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(fullContent) : fullContent.replace(/\\n/g, '<br>');
            }
          },
          onDone: ({ content }) => {
            if (body) {
              body.classList.remove('yj-typing-cursor');
              body.innerHTML = window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(content) : content.replace(/\\n/g, '<br>');
            }
            const nowTime = new Date().toLocaleString();
            if (timeEl) timeEl.innerText = `剖析于 ${nowTime}`;

            // 保存到档案与磁盘
            window.LearningVault.saveReviewAnalysis(cur.id, content, cur);
            window.LearningVault.appendDialogue(
              cur.id,
              `【提请复盘深度剖析】研习《${cur.title}》专属反思与费曼自述`,
              content,
              cur
            );
            // 同步模态框显示
            const vBody = document.getElementById('vRevAnalysisContent');
            const vTime = document.getElementById('vRevAnalysisTime');
            const vCard = document.getElementById('vRevAnalysisCard');
            if (vBody && vCard) {
              vCard.style.display = 'flex';
              vBody.innerHTML = window.formatMasterAnalysisHtml ? window.formatMasterAnalysisHtml(content) : content.replace(/\\n/g, '<br>');
              if (vTime) vTime.innerText = `剖析于 ${nowTime}`;
            }
          },"""

if old_req in js:
    js = js.replace(old_req, new_req)
    print("Replaced requestBottomMasterAgentReview handlers.")
else:
    print("Warning: old_req not found!")

# 3. Update vRevAnalysisCard title
old_modal_title = "<span>玄微先生 · 易道学术四维深度点评</span>"
new_modal_title = "<span>玄微先生 · 易道学术多维深度比对诊断</span>"
if old_modal_title in js:
    js = js.replace(old_modal_title, new_modal_title)
    print("Replaced modal title.")

with open('yijing_assistant.js', 'w', encoding='utf-8') as f:
    f.write(js)

print("Patching completed successfully!")

