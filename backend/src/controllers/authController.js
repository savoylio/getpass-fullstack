const AV = require('../config/leancloud');
const jwt = require('jsonwebtoken');

const getRandomAvatar = () => `https://api.dicebear.com/7.x/avataaars/svg?seed=${Date.now()}`;

exports.register = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = new AV.User();
    user.setUsername(username);
    user.setPassword(password);
    user.set('avatar', getRandomAvatar());
    user.set('stats', { correct_rate: 0, total_time: 0, total_questions: 0 });
    // 排行榜数据初始化 (0分，0次练习)
    user.set('ranking_stats', { exam_score: 0, choice_rounds: 0, blank_rounds: 0, tf_rounds: 0 });
    await user.signUp();
    res.json({ msg: '注册成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await AV.User.logIn(username, password);
    const payload = { user: { id: user.id, username: user.getUsername() } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' },
      (err, token) => {
        if (err) throw err;
        res.json({ 
          token, 
          user: {
            id: user.id,
            username: user.getUsername(),
            avatar: user.get('avatar'),
            stats: user.get('stats')
          }
        });
      }
    );
  } catch (err) {
    res.status(400).json({ error: '用户名或密码错误' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const query = new AV.Query('_User');
    const user = await query.get(req.user.id);
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// 修复：使用 masterKey 更新资料
exports.updateProfile = async (req, res) => {
  const { username, bio, avatarBase64 } = req.body;
  try {
    const query = new AV.Query('_User');
    const user = await query.get(req.user.id);
    
    if (username) user.setUsername(username);
    
    const stats = user.get('stats') || {};
    if (bio) stats.bio = bio;
    user.set('stats', stats);

    // 关键修改：直接存字符串，不创建 AV.File
    if (avatarBase64) {
      user.set('avatar', avatarBase64); 
    }
    
    await user.save(null, { useMasterKey: true });
    
    res.json({ success: true, user: { username: user.getUsername(), avatar: user.get('avatar'), stats } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const query = new AV.Query('_User');
    const user = await query.get(req.user.id);
    user.setPassword(newPassword);
    await user.save(null, { useMasterKey: true });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};