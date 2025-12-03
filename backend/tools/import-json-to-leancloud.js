// getpass/backend/tools/import-json-to-leancloud.js
require('dotenv').config();
const AV = require('../src/config/leancloud'); // 见下一步 leancloud 初始化文件
const fs = require('fs');
const path = require('path');

async function importFile(jsonPath) {
  const arr = JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  for (const item of arr) {
    const Q = AV.Object.extend('Questions');
    const q = new Q();
    q.set('sid', item.id);
    q.set('type', item.type);
    q.set('question', item.question);
    q.set('question_zh', item.question_zh || '');
    if (item.options) q.set('options', item.options);
    if (item.options_zh) q.set('options_zh', item.options_zh);
    if (item.answer !== undefined) q.set('answer', item.answer);
    if (item.blank_count) q.set('blank_count', item.blank_count);
    if (item.alt_answer) q.set('alt_answer', item.alt_answer);
    await q.save(null, {useMasterKey:true});
    console.log('Saved', item.id);
  }
}

async function importAll() {
  const dir = path.join(__dirname, '../output');
  const files = fs.readdirSync(dir).filter(f=>f.endsWith('.json'));
  for (const f of files) {
    console.log('Importing', f);
    await importFile(path.join(dir,f));
  }
  console.log('Done.');
  process.exit(0);
}

importAll().catch(e=>{ console.error(e); process.exit(1);});