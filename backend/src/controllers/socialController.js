const AV = require('../config/leancloud');

// 获取多维排行榜
exports.getLeaderboard = async (req, res) => {
  const { type } = req.query; // exam, choice, blank, true_false
  
  console.log(`[Leaderboard] Fetching for type: ${type}`);

  try {
    const query = new AV.Query('_User');
    
    // 关键修改1：不做 exists 限制，防止新用户搜不到
    // query.exists('ranking_stats'); 
    
    // 排序逻辑
    if (type === 'exam') {
      query.descending('ranking_stats.exam_score');
    } else if (type === 'choice') {
      query.descending('ranking_stats.choice_rounds');
    } else if (type === 'blank') {
      query.descending('ranking_stats.blank_rounds');
    } else if (type === 'true_false') {
      query.descending('ranking_stats.tf_rounds');
    } else {
      // 默认按正确率
      query.descending('stats.correct_rate');
    }

    query.limit(50);

    // 🌟 关键修改2：使用 MasterKey 强制查询所有用户
    // 如果不加这个，LeanCloud 会因为权限问题拒绝返回用户列表，导致 500 错误
    const users = await query.find({ useMasterKey: true });

    console.log(`[Leaderboard] Found ${users.length} users`);

    const data = users.map((u, index) => {
      // 关键修改3：极其保守的防崩溃取值
      // 就算数据库里是空的，这里也会给默认值，绝不报错
      const rs = u.get('ranking_stats') || {};
      const interaction = u.get('interaction_stats') || {};
      const stats = u.get('stats') || {}; // 获取基础 stats 防止 correct_rate 报错
      
      let scoreDisplay = 0;
      
      // 根据类型决定显示什么分数
      if (type === 'exam') scoreDisplay = rs.exam_score || 0;
      else if (type === 'choice') scoreDisplay = rs.choice_rounds || 0;
      else if (type === 'blank') scoreDisplay = rs.blank_rounds || 0;
      else if (type === 'true_false') scoreDisplay = rs.tf_rounds || 0;
      else scoreDisplay = stats.correct_rate ? (stats.correct_rate * 100).toFixed(1) + '%' : '0%';

      return {
        rank: index + 1,
        userId: u.id,
        username: u.get('username') || '无名大侠',
        avatar: u.get('avatar'), // 直接读取字符串
        score: scoreDisplay,
        likes: interaction.likes || 0,
        angries: interaction.angries || 0
      };
    });

    res.json(data);
  } catch (err) {
    // 打印详细错误日志到后端终端
    console.error('[Leaderboard Error] Full Stack:', err);
    res.status(500).json({ error: '获取排行榜失败，请查看后端日志', details: err.message });
  }
};

// 点赞/愤怒交互
exports.sendMessage = async (req, res) => {
  const { toUserId, type, boardType } = req.body; 
  const fromUserId = req.user.id;

  try {
    const fromUserQuery = new AV.Query('_User');
    const fromUser = await fromUserQuery.get(fromUserId);
    
    const toUserQuery = new AV.Query('_User');
    const toUser = await toUserQuery.get(toUserId);

    // 初始化交互数据
    let interaction = toUser.get('interaction_stats');
    if (!interaction) interaction = { likes: 0, angries: 0 };

    if (type === 'like') interaction.likes = (interaction.likes || 0) + 1;
    else interaction.angries = (interaction.angries || 0) + 1;
    
    toUser.set('interaction_stats', interaction);
    // 关键修改：保存也需要 MasterKey
    await toUser.save(null, { useMasterKey: true });

    const boardNameMap = { 'exam': '考试榜', 'choice': '选择题榜', 'blank': '填空题榜', 'true_false': '判断题榜' };
    const bName = boardNameMap[boardType] || '排行榜';
    const content = type === 'like' ? '哇，膜拜大佬！' : '亲爱的别卷了！';
    
    const Message = new AV.Object('Message');
    Message.set('from_user', fromUser);
    Message.set('to_user', toUser);
    Message.set('type', type);
    Message.set('content', `${bName} 对你表示${type === 'like' ? '赞赏' : '愤怒'}并说：${content}`);
    Message.set('read', false);
    await Message.save();

    res.json({ success: true, newCounts: interaction });
  } catch (err) {
    console.error('[Interaction Error]:', err);
    res.status(500).json({ error: err.message });
  }
};

exports.getMyMessages = async (req, res) => {
  try {
    const query = new AV.Query('Message');
    query.equalTo('to_user', AV.Object.createWithoutData('_User', req.user.id));
    query.descending('createdAt');
    query.include('from_user');
    query.limit(20);
    const msgs = await query.find();
    
    const data = msgs.map(m => {
      const from = m.get('from_user');
      return {
        id: m.id,
        content: m.get('content'),
        createdAt: m.createdAt,
        read: m.get('read'),
        type: m.get('type'),
        from_user: from ? { username: from.get('username'), avatar: from.get('avatar') } : { username: '未知用户' }
      };
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};