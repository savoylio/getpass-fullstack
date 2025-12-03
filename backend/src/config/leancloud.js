const AV = require('leancloud-storage');
const dotenv = require('dotenv');

dotenv.config();

// 初始化 LeanCloud
// 必须传入 masterKey，后端才有权限修改用户数据
AV.init({
  appId: process.env.LC_APP_ID,
  appKey: process.env.LC_APP_KEY,
  masterKey: process.env.LC_MASTER_KEY, // ✅ 加上这一行
  serverURL: process.env.LC_SERVER_URL
});

module.exports = AV;