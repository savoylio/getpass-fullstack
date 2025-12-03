const AV = require('../config/leancloud');
const { calculateExamScore } = require('../utils/grading');

// 辅助：随机抽题
async function getRandom(type, count) {
  const query = new AV.Query('Questions');
  query.equalTo('type', type);
  const total = await query.count();
  // 防止数量不足导致负数 skip
  const skip = total > count ? Math.floor(Math.random() * (total - count)) : 0;
  query.skip(skip);
  query.limit(count);
  return await query.find();
}

exports.generateExam = async (req, res) => {
  try {
    // 这里的 true_false 必须和数据库一致
    const [choice, blank, tf] = await Promise.all([
      getRandom('choice', 30),
      getRandom('blank', 15),
      getRandom('true_false', 10) 
    ]);

    const all = [...choice, ...blank, ...tf].map(q => {
      const j = q.toJSON();
      delete j.answer;
      return j;
    });

    console.log(`[Exam] Generated ${all.length} questions.`);
    res.json({ questions: all });
  } catch (err) {
    console.error('[Exam] Generate Error:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.submitExam = async (req, res) => {
  const { answers, usedTime } = req.body;
  const userId = req.user.id;

  console.log(`[Exam] Submitting for User: ${userId}`);

  try {
    // 1. 获取题目信息进行判分
    const sids = Object.keys(answers);
    const query = new AV.Query('Questions');
    query.containedIn('sid', sids);
    query.limit(100); // 确保能拉取所有相关题目
    const questionsDb = await query.find();

    // 2. 计算分数
    const { score, wrongList } = calculateExamScore(questionsDb, answers);
    console.log(`[Exam] Score: ${score}, Wrong: ${wrongList.length}`);

    // 3. 获取用户对象 (关键修复：不能用 AV.User.current())
    const userQuery = new AV.Query('_User');
    const user = await userQuery.get(userId);

    // 4. 更新用户统计数据
    const stats = user.get('stats') || { correct_rate: 0, total_time: 0, total_questions: 0 };
    const newTotalQ = (stats.total_questions || 0) + questionsDb.length;
    const correctCount = questionsDb.length - wrongList.length;
    
    // 计算新的正确率 (累计正确数 / 累计总题数)
    // 估算历史正确数
    const oldCorrect = Math.round((stats.correct_rate || 0) * (stats.total_questions || 0));
    const newRate = (oldCorrect + correctCount) / newTotalQ;

    const newStats = {
      correct_rate: newRate || 0,
      total_time: (stats.total_time || 0) + usedTime,
      total_questions: newTotalQ
    };

    // 保存用户数据 (使用 masterKey 忽略权限限制，防止 403)
    // 注意：在后端使用 SDK 可以配置 useMasterKey，但为了简单，我们直接 save
    user.set('stats', newStats);
    await user.save(null, { useMasterKey: true }); 

    // 5. 保存考试记录
    const Record = new AV.Object('ExamRecord');
    Record.set('user', user);
    Record.set('score', score);
    Record.set('used_time', usedTime);
    Record.set('wrong_list', wrongList);
    await Record.save(null, { useMasterKey: true });

    // ... 前面的代码不变 ...

    // 6. 更新排行榜 (Exam Leaderboard - Max Score)
    try {
      const rs = user.get('ranking_stats') || {};
      const currentHigh = rs.exam_score || 0;
      
      // 只有新分数更高时才更新
      if (score > currentHigh) {
        rs.exam_score = score;
        user.set('ranking_stats', rs);
        await user.save(null, { useMasterKey: true });
      }
      
      // 计算排名 (查有多少人分数比我高)
      const rankQuery = new AV.Query('_User');
      rankQuery.greaterThan('ranking_stats.exam_score', score);
      const rankCount = await rankQuery.count();
      const myRank = rankCount + 1;
      
      // 将排名返回给前端
      res.json({ score, wrongList, newStats, myRank }); // 记得这里要把 myRank 返回
      return; // 结束函数

    } catch (lbError) {
      console.error('[Exam] Rank update failed:', lbError.message);
    }

    // ...

    // 7. 写入错题本 (异步处理，不阻塞返回)
    // 只有当 wrongList 不为空时才处理
    if (wrongList.length > 0) {
        (async () => {
            for (const sid of wrongList) {
                try {
                    const qObj = questionsDb.find(q => q.get('sid') === sid);
                    if (qObj) {
                        const wbQuery = new AV.Query('WrongBook');
                        wbQuery.equalTo('user', user);
                        wbQuery.equalTo('question', qObj);
                        const exist = await wbQuery.first();
                        if (exist) {
                            exist.set('last_wrong_time', new Date());
                            await exist.save(null, { useMasterKey: true });
                        } else {
                            const nw = new AV.Object('WrongBook');
                            nw.set('user', user);
                            nw.set('question', qObj);
                            nw.set('last_wrong_time', new Date());
                            await nw.save(null, { useMasterKey: true });
                        }
                    }
                } catch (e) {
                    console.error(`[WrongBook] Failed for ${sid}`, e.message);
                }
            }
        })();
    }

    // 8. 成功返回
    res.json({ score, wrongList, newStats });

  } catch (err) {
    console.error('[Exam] Submit Fatal Error:', err);
    res.status(500).json({ error: err.message });
  }
};