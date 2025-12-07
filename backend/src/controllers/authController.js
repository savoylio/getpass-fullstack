const AV = require('../config/leancloud');
const jwt = require('jsonwebtoken');
const { verifyCaptcha } = require('./captchaController');

// Helper: JWT Sign
const signToken = (user) => {
  return jwt.sign(
    { user: { id: user.id, role: user.get('role') } },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  );
};

// Pre-import system: No public register endpoint generally.
// But if you need an "Activation" endpoint, it's essentially Login + Change Password.
// We disable the old public register.
exports.register = async (req, res) => {
  res.status(403).json({ error: 'Public registration is closed. Please use your student account.' });
};

exports.login = async (req, res) => {
  const { account, password, captchaId, captchaAnswer } = req.body;

  try {
    // 1. Verify Captcha
    if (!captchaId || !captchaAnswer) {
      return res.status(400).json({ error: '验证码不能为空' });
    }
    const isValidCaptcha = await verifyCaptcha(captchaId, captchaAnswer);
    if (!isValidCaptcha) {
      return res.status(400).json({ error: '验证码错误或已过期' });
    }

    // 2. Login by Account (Student ID)
    // LeanCloud default logIn uses 'username', so we must query by account first
    const query = new AV.Query('_User');
    query.equalTo('account', account);
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      return res.status(400).json({ error: '学号不存在' });
    }

    // Check if Active
    if (user.get('isActive') === false) {
      return res.status(403).json({ error: '账号已被禁用' });
    }

    // Verify Password
    // Since we can't use AV.User.logIn with 'account' directly without hacking, 
    // we use the standard logIn but pass the USERNAME associated with that account.
    // However, user might change username.
    // BETTER WAY: Use AV.User.logIn with the fetched user's *username* and the provided password.
    // Because LeanCloud enforces username+password auth.
    try {
      const loggedInUser = await AV.User.logIn(user.get('username'), password);
      
      // Update Audit Log
      loggedInUser.set('lastLoginAt', new Date());
      await loggedInUser.save();

      const token = signToken(loggedInUser);
      
      res.json({ 
        token, 
        user: {
          id: loggedInUser.id,
          username: loggedInUser.getUsername(),
          account: loggedInUser.get('account'), // Return immutable ID
          avatar: loggedInUser.get('avatar'),
          role: loggedInUser.get('role') || 'user',
          stats: loggedInUser.get('stats')
        }
      });
    } catch (loginErr) {
      return res.status(400).json({ error: '密码错误' });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
};

// ... getProfile, updateProfile (keep existing logic but prevent account change) ...
exports.getProfile = async (req, res) => {
  try {
    const query = new AV.Query('_User');
    const user = await query.get(req.user.id);
    // Explicitly return account
    res.json({
      ...user.toJSON(),
      account: user.get('account')
    });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

exports.updateProfile = async (req, res) => {
  const { username, bio, avatarBase64, account } = req.body;
  
  if (account) {
    return res.status(400).json({ error: '学号 (Account) 不可修改' });
  }

  try {
    const query = new AV.Query('_User');
    const user = await query.get(req.user.id);
    
    if (username) user.setUsername(username);
    const stats = user.get('stats') || {};
    if (bio) stats.bio = bio;
    user.set('stats', stats);
    if (avatarBase64) user.set('avatar', avatarBase64);
    
    await user.save(null, { useMasterKey: true });
    
    res.json({ success: true, user: { username: user.getUsername(), avatar: user.get('avatar'), stats } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ... changePassword (Keep existing) ...
exports.changePassword = async (req, res) => {
  const { newPassword } = req.body;
  try {
    const user = await AV.User.current().fetch(); // Or query by ID
    user.setPassword(newPassword);
    await user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ... (保留上方已有代码) ...

// [Admin] 根据学号查询用户信息 (用于重置前的确认)
exports.adminGetUser = async (req, res) => {
  const { studentId } = req.body;
  
  // 简单的权限检查 (实际项目中建议在 middleware 做，这里双重保险)
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足：仅管理员可用' });
  }

  try {
    const query = new AV.Query('_User');
    query.equalTo('account', studentId); // account 即学号
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      return res.status(404).json({ error: '未找到该学号的用户' });
    }

    res.json({
      id: user.id,
      account: user.get('account'),
      username: user.get('username'),
      isActive: user.get('isActive'),
      createdAt: user.createdAt,
      lastLoginAt: user.get('lastLoginAt')
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// [Admin] 重置密码 (核心无损操作)
exports.adminResetPassword = async (req, res) => {
  const { studentId, newPassword } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: '权限不足' });
  }

  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: '新密码长度至少需6位' });
  }

  try {
    const query = new AV.Query('_User');
    query.equalTo('account', studentId);
    const user = await query.first({ useMasterKey: true });

    if (!user) {
      return res.status(404).json({ error: '用户不存在，无法重置' });
    }

    // --- 核心操作：仅设置新密码 ---
    user.setPassword(newPassword);
    
    // 使用 MasterKey 保存，确保绕过 ACL 限制
    // LeanCloud 的 save 操作是增量更新的，不会覆盖其他字段
    await user.save(null, { useMasterKey: true });

    console.log(`[Admin] Password reset for user: ${studentId}`);
    res.json({ success: true, message: `用户 ${studentId} 密码已重置` });

  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ error: '重置失败，请查看后端日志' });
  }
};