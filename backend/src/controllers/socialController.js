const AV = require('../config/leancloud');

// 获取北京时间日期字符串 (YYYY-MM-DD)
const getBeijingDateStr = () => {
  return new Date().toLocaleDateString('zh-CN', { timeZone: 'Asia/Shanghai' }).replace(/\//g, '-');
};

// 获取排行榜
exports.getLeaderboard = async (req, res) => {
  const { type } = req.query; // exam, choice, blank, true_false
  const todayStr = getBeijingDateStr();

  console.log(`[Leaderboard] Fetching ${type} at ${todayStr}`);

  try {
    const query = new AV.Query('_User');
    
    // 排序规则
    if (type === 'exam') {
      // 考试榜只看今天的成绩 (或保留历史最高但只比今天的? 根据之前逻辑是存了 exam_date)
      // 这里逻辑保持：显示所有有过考试记录的用户，按最高分排，但互动数按今天算
      query.descending('ranking_stats.exam_score');
    } else if (type === 'choice') {
      query.descending('ranking_stats.choice_rounds');
    } else if (type === 'blank') {
      query.descending('ranking_stats.blank_rounds');
    } else if (type === 'true_false') {
      query.descending('ranking_stats.tf_rounds');
    } else {
      query.descending('stats.correct_rate');
    }

    query.limit(50);
    const users = await query.find({ useMasterKey: true });

    const data = users.map((u, index) => {
      const rs = u.get('ranking_stats') || {};
      // 获取互动数据
      const iStats = u.get('interaction_stats') || {};
      
      // --- 关键逻辑：处理互动数据 ---
      let likes = 0;
      let angries = 0;

      if (type === 'exam') {
        // 考试榜：必须是今天的互动才显示，否则归零
        if (iStats.exam_date === todayStr) {
          likes = iStats.exam_likes || 0;
          angries = iStats.exam_angries || 0;
        } else {
          likes = 0; // 不是今天，归零
          angries = 0;
        }
      } else {
        // 练习榜：累计显示 (choice/blank/tf 共用 practice 统计，或者分开)
        // 这里简化为：所有练习榜共用 practice_likes
        likes = iStats.practice_likes || 0;
        angries = iStats.practice_angries || 0;
      }

      // --- 处理分数显示 ---
      let scoreDisplay = 0;
      if (type === 'exam') scoreDisplay = rs.exam_score || 0;
      else if (type === 'choice') scoreDisplay = rs.choice_rounds || 0;
      else if (type === 'blank') scoreDisplay = rs.blank_rounds || 0;
      else if (type === 'true_false') scoreDisplay = rs.tf_rounds || 0;

      return {
        rank: index + 1,
        userId: u.id,
        username: u.get('username') || '神秘学霸',
        avatar: u.get('avatar'),
        score: scoreDisplay,
        likes,
        angries
      };
    });

    res.json(data);
  } catch (err) {
    console.error('[Leaderboard Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// 发送互动 (点赞/愤怒) - 修复变量名引用错误
exports.sendMessage = async (req, res) => {
  const { toUserId, type, boardType } = req.body; 
  const fromUserId = req.user.id;
  const todayStr = getBeijingDateStr();

  const isExam = boardType === 'exam';
  const category = isExam ? 'exam' : 'practice';

  try {
    // 1. 防刷检查 (含 404 容错)
    const checkQuery = new AV.Query('Interaction');
    checkQuery.equalTo('fromUser', AV.Object.createWithoutData('_User', fromUserId));
    checkQuery.equalTo('toUser', AV.Object.createWithoutData('_User', toUserId));
    checkQuery.equalTo('category', category);
    checkQuery.equalTo('dateStr', todayStr);

    let hasInteracted = 0;
    try {
      hasInteracted = await checkQuery.count({ useMasterKey: true });
    } catch (queryErr) {
      if (queryErr.code === 101 || queryErr.message.includes('404')) {
        hasInteracted = 0;
      } else {
        throw queryErr; 
      }
    }

    if (hasInteracted > 0) {
      return res.status(429).json({ error: '今天已经互动过了，明天再来吧！' });
    }

    // 2. 更新目标用户计数
    const toUserQuery = new AV.Query('_User');
    const toUser = await toUserQuery.get(toUserId, { useMasterKey: true });
    
    // 变量名定义为 iStats
    let iStats = toUser.get('interaction_stats') || {};

    if (isExam) {
      if (iStats.exam_date !== todayStr) {
        iStats.exam_date = todayStr;
        iStats.exam_likes = 0;
        iStats.exam_angries = 0;
      }
      if (type === 'like') iStats.exam_likes++;
      else iStats.exam_angries++;
    } else {
      if (type === 'like') iStats.practice_likes = (iStats.practice_likes || 0) + 1;
      else iStats.practice_angries = (iStats.practice_angries || 0) + 1;
    }

    toUser.set('interaction_stats', iStats);
    await toUser.save(null, { useMasterKey: true });

    // 3. 记录互动历史
    const Interaction = new AV.Object('Interaction');
    Interaction.set('fromUser', AV.Object.createWithoutData('_User', fromUserId));
    Interaction.set('toUser', toUser);
    Interaction.set('type', type);
    Interaction.set('category', category); 
    Interaction.set('sourceBoard', boardType);
    Interaction.set('dateStr', todayStr);
    await Interaction.save(null, { useMasterKey: true });

    // 4. 发送通知
    const fromUserQuery = new AV.Query('_User');
    const fromUser = await fromUserQuery.get(fromUserId);
    
    const boardNameMap = { 
      'exam': '考试榜', 'choice': '选择题榜', 
      'blank': '填空题榜', 'true_false': '判断题榜' 
    };
    const bName = boardNameMap[boardType] || '排行榜';
    const content = type === 'like' ? '哇，膜拜大佬！' : '亲爱的别卷了！';

    const Message = new AV.Object('Message');
    Message.set('from_user', fromUser);
    Message.set('to_user', toUser);
    Message.set('type', type);
    Message.set('read', false); 
    Message.set('content', `${bName}：用户 ${fromUser.get('username')} 对你表示${type==='like'?'赞赏':'愤怒'}并说：“${content}”`);
    await Message.save(null, { useMasterKey: true });

    // ✅ 修复点：这里原来写成了 interaction，改为 iStats
    res.json({ success: true, newCounts: iStats });

  } catch (err) {
    console.error('[Interaction Error]', err);
    res.status(500).json({ error: err.message });
  }
};

// 获取我的消息 (自动过滤未读/已读，但在前端展示)
exports.getMyMessages = async (req, res) => {
  try {
    const query = new AV.Query('Message');
    query.equalTo('to_user', AV.Object.createWithoutData('_User', req.user.id));
    query.descending('createdAt');
    query.include('from_user');
    query.limit(20);
    const msgs = await query.find({ useMasterKey: true });
    
    const data = msgs.map(m => {
      const from = m.get('from_user');
      return {
        id: m.id,
        content: m.get('content'),
        createdAt: m.createdAt,
        read: m.get('read') || false, // 确保有值
        type: m.get('type'),
        from_user: from ? { username: from.get('username'), avatar: from.get('avatar') } : { username: '未知用户' }
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 新增：标记所有消息为已读
exports.markAllRead = async (req, res) => {
  try {
    const query = new AV.Query('Message');
    query.equalTo('to_user', AV.Object.createWithoutData('_User', req.user.id));
    query.equalTo('read', false);
    const unreadMsgs = await query.find({ useMasterKey: true });
    
    if (unreadMsgs.length > 0) {
      unreadMsgs.forEach(m => m.set('read', true));
      await AV.Object.saveAll(unreadMsgs, { useMasterKey: true });
    }
    
    res.json({ success: true, count: unreadMsgs.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};