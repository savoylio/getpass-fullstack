const AV = require('../config/leancloud');
const { checkAnswer } = require('../utils/grading');

// 1. 获取题目
exports.getExerciseQuestions = async (req, res) => {
  const { type } = req.query; 
  try {
    const query = new AV.Query('Questions');
    if (type) query.equalTo('type', type);
    query.limit(1000);
    query.ascending('createdAt'); 
    const results = await query.find();
    
    const data = results.map(q => {
      const json = q.toJSON();
      delete json.answer; 
      return json;
    });

    console.log(`[Exercise] Loaded ${data.length} questions for type: ${type}`);
    res.json(data);
  } catch (err) {
    console.error('Fetch Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 2. 判题逻辑 (这里加了大量防崩溃检查)
exports.checkAnswer = async (req, res) => {
  const { questionId, userAnswer } = req.body;
  // 确保 userId 存在
  const userId = req.user ? req.user.id : null; 

  console.log(`[Check] User: ${userId}, Q: ${questionId}, Ans: ${userAnswer}`);

  try {
    const query = new AV.Query('Questions');
    query.equalTo('sid', questionId);
    const question = await query.first();
    
    if (!question) {
      console.error('[Check] Question not found in DB');
      return res.status(404).json({ error: 'Question not found' });
    }

    // 调用判分工具
    const isCorrect = checkAnswer(question.get('type'), question.get('answer'), userAnswer);
    console.log(`[Check] Result: ${isCorrect ? 'Correct' : 'Wrong'}`);

    // 只有在做错、且用户已登录的情况下，才写入错题本
    if (!isCorrect && userId) {
      try {
        const wbQuery = new AV.Query('WrongBook');
        wbQuery.equalTo('user', AV.Object.createWithoutData('_User', userId));
        wbQuery.equalTo('question', question);
        const existing = await wbQuery.first();
        
        if (existing) {
          existing.set('last_wrong_time', new Date());
          await existing.save();
        } else {
          const wb = new AV.Object('WrongBook');
          wb.set('user', AV.Object.createWithoutData('_User', userId));
          wb.set('question', question);
          wb.set('last_wrong_time', new Date());
          await wb.save();
        }
      } catch (wbError) {
        // 关键：如果错题本写入失败（比如权限问题），只打印日志，不让前端报错
        console.error('[WrongBook] Save failed:', wbError.message);
      }
    }

    res.json({
      isCorrect,
      correctAnswer: question.get('answer'),
      explanation: `Correct Answer: ${JSON.stringify(question.get('answer'))}`
    });

  } catch (err) {
    console.error('[Check] Server Error:', err);
    res.status(500).json({ error: err.message });
  }
};

// 3. 获取错题本
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
// ... (保留原有代码)

// 新增：完成一轮练习，增加计数
exports.finishPracticeRound = async (req, res) => {
  const { type } = req.body; // choice, blank, true_false
  const userId = req.user.id;
  
  try {
    const query = new AV.Query('_User');
    const user = await query.get(userId);
    
    const rs = user.get('ranking_stats') || {};
    
    if (type === 'choice') rs.choice_rounds = (rs.choice_rounds || 0) + 1;
    else if (type === 'blank') rs.blank_rounds = (rs.blank_rounds || 0) + 1;
    else if (type === 'true_false') rs.tf_rounds = (rs.tf_rounds || 0) + 1;
    
    user.set('ranking_stats', rs);
    await user.save(null, { useMasterKey: true });
    
    res.json({ success: true, rounds: rs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 之前的导出可能长这样，请确保加上 finishPracticeRound
// module.exports = { getExerciseQuestions, checkAnswer, getWrongBook, finishPracticeRound };