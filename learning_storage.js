/**
 * 易道认知工坊 · 学员修学档案与复习系统数据核心 (Learning Storage)
 * 每个卦象拥有独立的结构化研习资产库，支持持久化、复习回溯与全量导出。
 */

const STORAGE_KEY = 'yijing_study_vault_v1';

const LearningVault = {
  // 获取所有卦象的档案库
  getAllRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.error('Failed to read vault:', e);
      return {};
    }
  },

  // 获取特定卦象的档案
  getGuaRecord(guaId) {
    const all = this.getAllRecords();
    return all[guaId] || {
      gua_id: guaId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      qa_history: [], // 阶段一&二：伴读提问与实战对局记录
      review: { // 阶段三：悟道复盘
        q1: '',
        q2: '',
        q3: '',
        ai_insight: '',
        updated_at: null
      },
      feynman: { // 阶段四：费曼结构化笔记与AI多维考评
        framework: {
          core_trend: '',       // 1. 卦象时势核心判据（时空位标）
          key_yao_turn: '',     // 2. 核心爻变拐点攻防（吉凶转折处）
          real_case: '',        // 3. 现实生活/商业案例映射
          anti_common_rule: ''  // 4. 反常识易道心智底牌
        },
        full_text: '',
        score_result: null,     // AI 多维评分结果与徽章
        updated_at: null
      }
    };
  },

  // 保存特定卦象的提问记录
  appendQA(guaId, qaItem) {
    const all = this.getAllRecords();
    const record = this.getGuaRecord(guaId);
    record.qa_history.push({
      id: 'qa_' + Date.now(),
      timestamp: new Date().toLocaleString(),
      ...qaItem
    });
    record.updated_at = new Date().toISOString();
    all[guaId] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return record;
  },

  // 保存阶段三：复盘
  saveReview(guaId, reviewData) {
    const all = this.getAllRecords();
    const record = this.getGuaRecord(guaId);
    record.review = {
      ...record.review,
      ...reviewData,
      updated_at: new Date().toLocaleString()
    };
    record.updated_at = new Date().toISOString();
    all[guaId] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return record;
  },

  // 保存阶段四：费曼结构化笔记与考评
  saveFeynman(guaId, feynmanData) {
    const all = this.getAllRecords();
    const record = this.getGuaRecord(guaId);
    record.feynman = {
      ...record.feynman,
      ...feynmanData,
      updated_at: new Date().toLocaleString()
    };
    record.updated_at = new Date().toISOString();
    all[guaId] = record;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    return record;
  },

  // 统计已沉淀笔记或复盘的卦象数量
  getStats() {
    const all = this.getAllRecords();
    let reviewedCount = 0;
    let noteCount = 0;
    let totalQA = 0;
    for (let id in all) {
      const rec = all[id];
      if (rec.review && (rec.review.q1 || rec.review.q2)) reviewedCount++;
      if (rec.feynman && rec.feynman.full_text) noteCount++;
      if (rec.qa_history) totalQA += rec.qa_history.length;
    }
    return { reviewedCount, noteCount, totalQA };
  }
};

window.LearningVault = LearningVault;
