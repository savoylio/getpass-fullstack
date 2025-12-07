const AV = require('../config/leancloud');
const { checkAnswer } = require('../utils/grading');

// 1. 获取题目 (完美保留了你的错题重练模式)
exports.getExerciseQuestions = async (req, res) => {
  const { type, mode } = req.query; 
  
  try {
    let data = [];

    // --- 模式 A: 错题重练 (Mode = wrong) ---
    if (mode === 'wrong') {
      const query = new AV.Query('WrongBook');
      query.equalTo('user', AV.Object.createWithoutData('_User', req.user.id));
      query.include('question');
      query.limit(1000); // 拉取所有错题
      query.descending('updatedAt');
      const results = await query.find();
      
      // 提取题目并格式化
      data = results.map(wb => {
        const q = wb.get('question');
        if (!q) return null;
        const json = q.toJSON();
        delete json.answer; // 隐藏答案
        // 标记这是错题本来源
        json._wrongBookId = wb.id; 
        return json;
      }).filter(item => item !== null);
      
      console.log(`[Exercise] Fetched ${data.length} questions from WrongBook.`);
    } 
    // --- 模式 B: 专项练习 (Normal) ---
    else {
      const query = new AV.Query('Questions');
      if (type) query.equalTo('type', type);
      query.limit(1000);
      query.ascending('createdAt'); 
      const results = await query.find();
      
      data = results.map(q => {
        const json = q.toJSON();
        delete json.answer; 
        return json;
      });
      console.log(`[Exercise] Fetched ${data.length} questions for type: ${type}`);
    }

    res.json(data);
  } catch (err) {
    console.error('[Exercise] Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 2. 判题逻辑 (重点修复区域：权限与容错)
exports.checkAnswer = async (req, res) => {
  const { questionId, userAnswer } = req.body;
  const userId = req.user ? req.user.id : null; 

  console.log(`[Check] User: ${userId}, Q: ${questionId}, Ans:`, userAnswer);

  try {
    const query = new AV.Query('Questions');
    query.equalTo('sid', questionId);
    const question = await query.first();
    
    if (!question) {
      console.error('[Check] Question not found in DB');
      return res.status(404).json({ error: 'Question not found' });
    }

    const dbAnswer = question.get('answer');
    const type = question.get('type');

    // 调用判分工具
    const isCorrect = checkAnswer(type, dbAnswer, userAnswer);
    console.log(`[Check] Result: ${isCorrect ? 'Correct' : 'Wrong'}`);

    // 只有在做错、且用户已登录的情况下，才写入错题本
    if (userId) {
      try {
        const wbQuery = new AV.Query('WrongBook');
        wbQuery.equalTo('user', AV.Object.createWithoutData('_User', userId));
        wbQuery.equalTo('question', question);
        const existing = await wbQuery.first();

        if (!isCorrect) {
          // ❌ 答错：加入/更新错题本
          if (existing) {
            existing.set('last_wrong_time', new Date());
            // 【修复关键点】增加 useMasterKey: true
            await existing.save(null, { useMasterKey: true });
          } else {
            const wb = new AV.Object('WrongBook');
            wb.set('user', AV.Object.createWithoutData('_User', userId));
            wb.set('question', question);
            wb.set('last_wrong_time', new Date());
            // 【修复关键点】增加 useMasterKey: true
            await wb.save(null, { useMasterKey: true });
          }
        } else {
          // ✅ 答对：(可选) 如果需要“答对即从错题本移除”，取消下面注释
          // if (existing) { await existing.destroy({ useMasterKey: true }); }
        }
      } catch (wbError) {
        // 如果写入错题本失败（非关键路径），打印日志但不报错给前端
        console.error('[WrongBook] Save failed (Ignored):', wbError.message);
      }
    }

    res.json({
      isCorrect,
      correctAnswer: dbAnswer,
      explanation: `Correct Answer: ${JSON.stringify(dbAnswer)}`
    });

  } catch (err) {
    console.error('[Check] Fatal Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 3. 获取错题本列表 (保持不变)
exports.getWrongBook = async (req, res) => {
  try {
    const query = new AV.Query('WrongBook');
    query.equalTo('user', AV.Object.createWithoutData('_User', req.user.id));
    query.include('question');
    query.descending('last_wrong_time');
    query.limit(100);
    const results = await query.find();

    const data = results.map(wb => {
      const q = wb.get('question');
      if(!q) return null;
      return {
        id: wb.id,
        lastWrong: wb.get('last_wrong_time'),
        question: {
          sid: q.get('sid'),
          type: q.get('type'),
          question: q.get('question'),
          question_zh: q.get('question_zh'),
          options: q.get('options'),
          answer: q.get('answer') 
        }
      };
    }).filter(item => item !== null);

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 4. 完成练习并返回排名 (保留了你的排名计算逻辑)
exports.finishPracticeRound = async (req, res) => {
  const { type } = req.body; 
  const userId = req.user.id;
  
  // 仅针对三大题型计算排名
  if (!['choice', 'blank', 'true_false'].includes(type)) {
    return res.json({ success: true, message: 'Skip ranking for mixed/wrong mode' });
  }

  try {
    const query = new AV.Query('_User');
    const user = await query.get(userId);
    
    const rs = user.get('ranking_stats') || {};
    
    // 增加对应类型的轮数
    if (type === 'choice') rs.choice_rounds = (rs.choice_rounds || 0) + 1;
    else if (type === 'blank') rs.blank_rounds = (rs.blank_rounds || 0) + 1;
    else if (type === 'true_false') rs.tf_rounds = (rs.tf_rounds || 0) + 1;
    
    user.set('ranking_stats', rs);
    // 【修复关键点】增加 useMasterKey
    await user.save(null, { useMasterKey: true });
    
    // 计算实时排名 (比我轮数多的人数 + 1)
    const fieldMap = { 'choice': 'choice_rounds', 'blank': 'blank_rounds', 'true_false': 'tf_rounds' };
    const field = `ranking_stats.${fieldMap[type]}`;
    const myScore = rs[fieldMap[type]];

    const rankQuery = new AV.Query('_User');
    rankQuery.greaterThan(field, myScore);
    const count = await rankQuery.count(); // count 不需要 masterKey，读权限通常是公开的
    
    res.json({ success: true, myRank: count + 1, rounds: myScore });
  } catch (err) {
    console.error('[Finish] Error:', err);
    res.status(500).json({ error: err.message });
  }
};