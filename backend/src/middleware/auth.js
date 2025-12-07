// backend/src/middleware/auth.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');

  // 严厉拒绝无 Token 请求，没有任何例外
  if (!token) {
    return res.status(401).json({ msg: '未授权：请先登录' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_key_for_session');
    
    // 强制检查：如果 token 解析出的 role 是 guest (防止旧 token 混入)，也拒绝
    if (decoded.user && decoded.user.role === 'guest') {
      return res.status(403).json({ msg: '游客权限已停用，请注册账号' });
    }

    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token 无效或已过期' });
  }
};

module.exports = authMiddleware;