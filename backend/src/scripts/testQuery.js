import 'dotenv/config';
import AV from '../config/leancloud.js';

async function test() {
  const query = new AV.Query('Questions');
  const result = await query.limit(5).find();
  console.log(result);
}

test();