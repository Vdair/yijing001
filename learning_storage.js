/**
 * 易道认知工坊 · 卦象专属修学档案核心数据引擎 (Learning Storage v2.1)
 * 
 * 核心升级：打通本地项目数据自动落盘机制 (Local Vault Auto-Sync)
 * 1. 严格与当前卦象强绑定四大来源：对话问答、课时笔记、悟道复盘、费曼通关输出
 * 2. 毫秒级优先写入浏览器 localStorage 保证离线永不丢数据
 * 3. 自动、静默、秒级触发异步落盘至项目本地目录 (data/learning_vault/*.json & *.md)
 * 4. 自动维护 64 卦总索引 index.json，支持开机自动双向拉取与融合
 */

(function(window) {
  const STORAGE_KEY_V2 = 'yijing_study_vault_v2';
  const STORAGE_KEY_V1 = 'yijing_study_vault_v1';

  const LearningVault = {
    syncListeners: [],
    lastSyncState: { online: false, message: '初始化中...' },

    addSyncListener(fn) {
      if (typeof fn === 'function') {
        this.syncListeners.push(fn);
        fn(this.lastSyncState);
      }
    },

    notifySyncListeners(state) {
      this.syncListeners.forEach(fn => {
        try { fn(state); } catch (e) {}
      });
    },

    // 获取全局所有档案
    getAllRecords() {
      try {
        let raw = localStorage.getItem(STORAGE_KEY_V2);
        if (!raw) {
          // 尝试从 v1 迁移数据
          const oldRaw = localStorage.getItem(STORAGE_KEY_V1);
          if (oldRaw) {
            const oldData = JSON.parse(oldRaw);
            const migrated = {};
            for (let id in oldData) {
              const o = oldData[id];
              migrated[id] = {
                version: '2.0.0',
                gua_id: id,
                gua_title: o.gua_id || id,
                gua_symbol: '☯️',
                created_at: o.created_at || new Date().toISOString(),
                updated_at: o.updated_at || new Date().toISOString(),
                dialogues: (o.qa_history || []).map((item, idx) => ({
                  id: item.id || `dlg_${Date.now()}_${idx}`,
                  timestamp: item.timestamp || new Date().toLocaleString(),
                  question: item.question || '',
                  answer: item.answer || ''
                })),
                notes: [],
                review: {
                  q1_mirror: (o.review && (o.review.q1 || o.review.q1_mirror)) || '',
                  q2_mindset: (o.review && (o.review.q2 || o.review.q2_mindset)) || '',
                  q3_action: (o.review && (o.review.q3 || o.review.q3_action)) || '',
                  updated_at: o.review ? o.review.updated_at : null
                },
                feynman: {
                  framework: {
                    core_trend: (o.feynman && o.feynman.framework && o.feynman.framework.core_trend) || '',
                    key_yao_turn: (o.feynman && o.feynman.framework && o.feynman.framework.key_yao_turn) || '',
                    real_case: (o.feynman && o.feynman.framework && o.feynman.framework.real_case) || '',
                    anti_common_rule: (o.feynman && o.feynman.framework && o.feynman.framework.anti_common_rule) || ''
                  },
                  full_text: (o.feynman && o.feynman.full_text) || '',
                  updated_at: o.feynman ? o.feynman.updated_at : null
                }
              };
            }
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(migrated));
            return migrated;
          }
          return {};
        }
        return JSON.parse(raw);
      } catch (e) {
        console.error('Failed to load learning vault:', e);
        return {};
      }
    },

    // 获取特定卦象的档案记录（若无则依据卦象信息初始化结构）
    getGuaRecord(guaId, meta = {}) {
      if (!guaId) return null;
      const all = this.getAllRecords();
      if (!all[guaId]) {
        all[guaId] = {
          version: '2.0.0',
          gua_id: guaId,
          gua_title: meta.title || guaId,
          gua_symbol: meta.symbol || '☯️',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          dialogues: [],
          notes: [],
          review: {
            q1_mirror: '',
            q2_mindset: '',
            q3_action: '',
            updated_at: null
          },
          feynman: {
            framework: {
              core_trend: '',
              key_yao_turn: '',
              real_case: '',
              anti_common_rule: ''
            },
            full_text: '',
            updated_at: null
          }
        };
        this.saveAllRecords(all);
      }
      return all[guaId];
    },

    saveAllRecords(all) {
      try {
        localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(all));
      } catch (e) {
        console.error('Failed to write learning vault:', e);
      }
    },

    /**
     * 核心保存入口：双轨持久化（毫秒级写入本地存储 + 自动静默落盘至项目本地文件）
     */
    saveSingleGua(guaId, record) {
      const all = this.getAllRecords();
      record.updated_at = new Date().toLocaleString();
      all[guaId] = record;
      this.saveAllRecords(all);

      // 自动静默触发本地项目文件落盘 (无感异步执行)
      this.syncToProjectFile(guaId, record);

      return record;
    },

    // 1. 对话维度保存
    appendDialogue(guaId, question, answer, meta = {}) {
      const rec = this.getGuaRecord(guaId, meta);
      const dlg = {
        id: 'dlg_' + Date.now(),
        timestamp: new Date().toLocaleString(),
        question: question.trim(),
        answer: answer.trim()
      };
      rec.dialogues.push(dlg);
      return this.saveSingleGua(guaId, rec);
    },

    clearDialogues(guaId) {
      const rec = this.getGuaRecord(guaId);
      rec.dialogues = [];
      return this.saveSingleGua(guaId, rec);
    },

    // 2. 笔记维度操作
    addNote(guaId, title, content, meta = {}) {
      const rec = this.getGuaRecord(guaId, meta);
      const note = {
        id: 'note_' + Date.now(),
        timestamp: new Date().toLocaleString(),
        title: title ? title.trim() : '随笔心得',
        content: content.trim()
      };
      rec.notes.unshift(note);
      return this.saveSingleGua(guaId, rec);
    },

    updateNote(guaId, noteId, title, content) {
      const rec = this.getGuaRecord(guaId);
      const idx = rec.notes.findIndex(n => n.id === noteId);
      if (idx !== -1) {
        rec.notes[idx].title = title.trim();
        rec.notes[idx].content = content.trim();
        rec.notes[idx].timestamp = new Date().toLocaleString() + ' (已修)';
        this.saveSingleGua(guaId, rec);
      }
      return rec;
    },

    deleteNote(guaId, noteId) {
      const rec = this.getGuaRecord(guaId);
      rec.notes = rec.notes.filter(n => n.id !== noteId);
      return this.saveSingleGua(guaId, rec);
    },

    // 3. 悟道复盘保存
    saveReview(guaId, reviewData, meta = {}) {
      const rec = this.getGuaRecord(guaId, meta);
      rec.review = {
        ...rec.review,
        ...reviewData,
        updated_at: new Date().toLocaleString()
      };
      return this.saveSingleGua(guaId, rec);
    },

    // 3.1 保存主 Agent 玄微先生对复盘的深度剖析
    saveReviewAnalysis(guaId, analysisText, meta = {}) {
      const rec = this.getGuaRecord(guaId, meta);
      if (!rec.review) rec.review = {};
      rec.review.ai_analysis = {
        content: analysisText.trim(),
        updated_at: new Date().toLocaleString()
      };
      return this.saveSingleGua(guaId, rec);
    },

    // 4. 费曼学习输出保存
    saveFeynman(guaId, feynmanData, meta = {}) {
      const rec = this.getGuaRecord(guaId, meta);
      rec.feynman = {
        ...rec.feynman,
        ...feynmanData,
        updated_at: new Date().toLocaleString()
      };
      return this.saveSingleGua(guaId, rec);
    },

    // 统计当前卦象的完成度
    getGuaStats(guaId) {
      const rec = this.getGuaRecord(guaId);
      if (!rec) return { dialoguesCount: 0, notesCount: 0, hasReview: false, hasFeynman: false };
      return {
        dialoguesCount: (rec.dialogues || []).length,
        notesCount: (rec.notes || []).length,
        hasReview: !!(rec.review && (rec.review.q1_mirror || rec.review.q2_mindset || rec.review.q3_action)),
        hasFeynman: !!(rec.feynman && (rec.feynman.full_text || (rec.feynman.framework && rec.feynman.framework.core_trend)))
      };
    },

    // 导出本卦专属 Markdown 档案
    exportGuaMarkdown(guaId) {
      const rec = this.getGuaRecord(guaId);
      if (!rec) return '';
      let md = `# ☯️ 《${rec.gua_title || guaId}》个人修学档案\n\n`;
      md += `> 归档时间：${rec.updated_at || new Date().toLocaleString()}  \n`;
      md += `> 所属体系：易道认知工坊 · 64卦全息自修档案库\n\n---\n\n`;

      // 1. 问答对话
      md += `## 💬 一、伴读叩问对话流 (${(rec.dialogues || []).length} 条)\n\n`;
      if (!rec.dialogues || rec.dialogues.length === 0) {
        md += `*(本章节尚无对话记录)*\n\n`;
      } else {
        rec.dialogues.forEach((d, idx) => {
          md += `### 对话 ${idx + 1} (${d.timestamp})\n`;
          md += `**问**：${d.question}\n\n`;
          md += `**答**：${d.answer}\n\n`;
        });
      }

      // 2. 笔记内容
      md += `## 📝 二、课时专属研习笔记 (${(rec.notes || []).length} 篇)\n\n`;
      if (!rec.notes || rec.notes.length === 0) {
        md += `*(本章节尚无专属笔记)*\n\n`;
      } else {
        rec.notes.forEach((n, idx) => {
          md += `### ${idx + 1}. ${n.title} (${n.timestamp})\n\n`;
          md += `${n.content}\n\n`;
        });
      }

      // 3. 复盘心法
      md += `## 🧠 三、易道悟道复盘（反身而诚）\n\n`;
      const rev = rec.review || {};
      md += `1. **生命印证（照镜子）**：\n   ${rev.q1_mirror || '（尚未记录）'}\n\n`;
      md += `2. **认知跃迁（炼心法）**：\n   ${rev.q2_mindset || '（尚未记录）'}\n\n`;
      md += `3. **行动承诺（知行合一）**：\n   ${rev.q3_action || '（尚未记录）'}\n\n`;
      if (rev.ai_analysis && rev.ai_analysis.content) {
        md += `### ☯️ 主 Agent 玄微先生 · 易道深度学术点评 (${rev.ai_analysis.updated_at})：\n\n`;
        md += `${rev.ai_analysis.content}\n\n`;
      }

      // 4. 费曼通关
      md += `## 🏆 四、费曼认知通关骨架\n\n`;
      const fey = rec.feynman || {};
      const fw = fey.framework || {};
      md += `- **1. 卦象时势核心判据**：${fw.core_trend || '（待输入）'}\n`;
      md += `- **2. 核心爻变拐点攻防**：${fw.key_yao_turn || '（待输入）'}\n`;
      md += `- **3. 现实生活/商业案例映射**：${fw.real_case || '（待输入）'}\n`;
      md += `- **4. 反常识易道心智底牌**：${fw.anti_common_rule || '（待输入）'}\n\n`;
      md += `### 综合通俗白话自述全稿：\n\n${fey.full_text || '（尚未完成综合自述）'}\n\n`;

      return md;
    },

    /**
     * 自动与本地项目数据服务同步，持久化写入 data/learning_vault/
     * 支持双通道端点重试（同源 + 跨域本地端口 8089）
     */
    async syncToProjectFile(guaId, customRecord = null) {
      const rec = customRecord || this.getGuaRecord(guaId);
      if (!rec) return { success: false };

      const endpoints = [
        '/api/vault/save',                         // 1. 同源相对路径 (托管模式 http://127.0.0.1:8089)
        'http://127.0.0.1:8089/api/vault/save'    // 2. 跨域绝对路径 (file:// 或其它端口打开时)
      ];

      for (let url of endpoints) {
        try {
          const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ gua_id: guaId, record: rec })
          });
          if (resp.ok) {
            const res = await resp.json();
            this.lastSyncState = {
              online: true,
              time: new Date().toLocaleTimeString(),
              file: res.file || `${guaId}.json`,
              message: '已自动落盘至项目 data/learning_vault/'
            };
            this.notifySyncListeners(this.lastSyncState);
            return { success: true, ...res };
          }
        } catch (e) {
          // 容错并尝试下一个端点
        }
      }

      this.lastSyncState = {
        online: false,
        time: new Date().toLocaleTimeString(),
        message: '本地同步守护未启动，数据已保存在浏览器中'
      };
      this.notifySyncListeners(this.lastSyncState);
      return { success: false, fallback: true, record: rec };
    },

    /**
     * 检测本地存储守护服务状态
     */
    async checkServerStatus() {
      const endpoints = ['/api/vault/status', 'http://127.0.0.1:8089/api/vault/status'];
      for (let url of endpoints) {
        try {
          const r = await fetch(url);
          if (r.ok) {
            const d = await r.json();
            this.lastSyncState = {
              online: true,
              time: new Date().toLocaleTimeString(),
              message: '本地存储守护服务在线，实时双向自动落盘已开启'
            };
            this.notifySyncListeners(this.lastSyncState);
            return true;
          }
        } catch (e) {}
      }
      this.lastSyncState = {
        online: false,
        time: new Date().toLocaleTimeString(),
        message: '本地存储服务未启动 (已保存在浏览器)'
      };
      this.notifySyncListeners(this.lastSyncState);
      return false;
    },

    /**
     * 初始化时自动从项目 data/learning_vault 拉取已有档案融合
     */
    async pullFromProjectVault() {
      const endpoints = ['/api/vault/list', 'http://127.0.0.1:8089/api/vault/list'];
      for (let url of endpoints) {
        try {
          const r = await fetch(url);
          if (r.ok) {
            const remoteRecords = await r.json();
            if (remoteRecords && Object.keys(remoteRecords).length > 0) {
              const localAll = this.getAllRecords();
              let mergedCount = 0;
              for (let gid in remoteRecords) {
                if (!localAll[gid] || (remoteRecords[gid].updated_at && remoteRecords[gid].updated_at > (localAll[gid].updated_at || ''))) {
                  localAll[gid] = remoteRecords[gid];
                  mergedCount++;
                }
              }
              if (mergedCount > 0) {
                this.saveAllRecords(localAll);
                console.log(`[LearningVault] 🟢 成功从项目目录融合 ${mergedCount} 篇修学档案！`);
              }
              return true;
            }
          }
        } catch (e) {}
      }
      return false;
    }
  };

  // 暴露到全局，并在加载时自动检测服务与双向融合
  window.LearningVault = LearningVault;
  setTimeout(() => {
    LearningVault.checkServerStatus().then(online => {
      if (online) {
        LearningVault.pullFromProjectVault();
      }
    });
  }, 600);
})(window);
