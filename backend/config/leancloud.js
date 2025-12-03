import 'dotenv/config';
import AV from 'leancloud-storage';

AV.init({
  appId: process.env.LEANCLOUD_APPID,
  appKey: process.env.LEANCLOUD_APPKEY,
  serverURL: process.env.LEANCLOUD_SERVER
});

export default AV;