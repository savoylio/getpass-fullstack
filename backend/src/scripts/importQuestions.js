import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import AV from '../config/leancloud.js';

async function importFile(jsonPath) {
  const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

  for (const item of raw) {
    const Q = new AV.Object('Questions');
    Q.set('sid', item.id);
    Q.set('type', item.type);
    Q.set('question', item.question);
    Q.set('question_zh', item.translation || item.question_zh || '');

    if (item.options) Q.set('options', item.options);
    if (item.options_translation || item.options_zh) {
      Q.set('options_zh', item.options_translation || item.options_zh);
    }

// --- 统一处理答案为数组 ---
const ans = item.correct_answer || item.answer;
if (ans !== undefined && ans !== null) {
  if (Array.isArray(ans)) {
    Q.set("answer", ans);
  } else {
    // 如果是字符串 → 包成数组
    Q.set("answer", [ans]);
  }
}

    if (item.blank_count) Q.set('blank_count', item.blank_count);
    if (item.alt_answer) Q.set('alt_answer', item.alt_answer);

    await Q.save();
    console.log("✔ 保存成功:", item.id);
  }
}

async function importAll() {
  const dataDir = path.join('src/data');
  const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));

  for (const f of files) {
    console.log(`\n=== 开始导入：${f} ===`);
    await importFile(path.join(dataDir, f));
  }

  console.log("\n🎉 所有题目导入完毕！");
  process.exit(0);
}

importAll();
