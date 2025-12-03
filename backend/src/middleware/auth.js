const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  // 从 header 获取 token
  const token = req.header('x-auth-token');

  if (!token) {
    return res.status(401).json({ msg: '无 Token，拒绝访问' });
  }

  try {
    // 验证 Token（这里的密钥必须和登录时一致）
    // 临时使用 'super_secret_key_for_session'，建议放入 .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_for_session');
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token 无效' });
  }
};

module.exports = authMiddleware;