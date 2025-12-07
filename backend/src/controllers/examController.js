const AV = require('../config/leancloud');
const { calculateExamScore } = require('../utils/grading');

// 获取当前北京时间日期字符串 (YYYY-MM-DD)
const getBeijingDateStr = () => {
  return new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-');
};

async function getRandom(type, count) {
  const query = new AV.Query('Questions');
  query.equalTo('type', type);
  const total = await query.count();
  const skip = total > count ? Math.floor(Math.random() * (total - count)) : 0;
  query.skip(skip);
  query.limit(count);
  return await query.find();
}

exports.generateExam = async (req, res) => {
  try {
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
    res.json({ questions: all });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.submitExam = async (req, res) => {
  const { answers, usedTime } = req.body;
  const userId = req.user.id;
  const todayStr = getBeijingDateStr();

  try {
    const sids = Object.keys(answers);
    const query = new AV.Query('Questions');
    query.containedIn('sid', sids);
    query.limit(100);
    const questionsDb = await query.find();

    const { score, wrongList } = calculateExamScore(questionsDb, answers);

    const userQuery = new AV.Query('_User');
    const user = await userQuery.get(userId);

    // 更新基础统计 (累计)
    const stats = user.get('stats') || { correct_rate: 0, total_time: 0, total_questions: 0 };
    const newTotalQ = (stats.total_questions || 0) + questionsDb.length;
    const correctCount = questionsDb.length - wrongList.length;
    const oldCorrect = Math.round((stats.correct_rate || 0) * (stats.total_questions || 0));
    const newRate = (oldCorrect + correctCount) / newTotalQ;

    const newStats = {
      correct_rate: newRate || 0,
      total_time: (stats.total_time || 0) + usedTime,
      total_questions: newTotalQ,
      bio: stats.bio // 保持 bio 不变
    };
    user.set('stats', newStats);

    // --- 排行榜逻辑 (每日重置) ---
    const rs = user.get('ranking_stats') || {};
    
    // 检查是否是今天的成绩
    if (rs.exam_date !== todayStr) {
      // 不是今天的，重置分数，直接设为当前分
      rs.exam_score = score;
      rs.exam_date = todayStr;
    } else {
      // 是今天的，取最高分
      if (score > (rs.exam_score || 0)) {
        rs.exam_score = score;
      }
    }
    
    user.set('ranking_stats', rs);
    await user.save(null, { useMasterKey: true });

    // 保存考试记录
    const Record = new AV.Object('ExamRecord');
    Record.set('user', user);
    Record.set('score', score);
    Record.set('used_time', usedTime);
    Record.set('wrong_list', wrongList);
    Record.set('exam_date', todayStr); // 记录日期
    await Record.save(null, { useMasterKey: true });

    // 错题本逻辑 (省略详细代码，保持原逻辑)
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
                } catch (e) { console.error(e) }
            }
        })();
    }

    // 计算今日排名
    const rankQuery = new AV.Query('_User');
    rankQuery.equalTo('ranking_stats.exam_date', todayStr); // 仅限今日
    rankQuery.greaterThan('ranking_stats.exam_score', score);
    const count = await rankQuery.count({ useMasterKey: true });

    res.json({ score, wrongList, newStats, myRank: count + 1 });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};