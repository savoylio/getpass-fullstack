const AV = require('../config/leancloud');
const fs = require('fs');
const path = require('path');

// 辅助函数：智能寻找最新文件
function findLatestFile(keyword) {
  // 🔍 搜索路径列表（优先级从高到低）
  const searchPaths = [
    path.join(__dirname, '../data/new'), // 优先级 1: 我们约定的新题目录
    path.join(__dirname, '../data'),     // 优先级 2: 旧数据目录
    process.cwd()                        // 优先级 3: 项目根目录 (防止脚本跑偏)
  ];

  let candidates = [];

  console.log(`🔎 正在以下目录寻找包含 "${keyword}" 的 JSON 文件:`);
  
  searchPaths.forEach(dir => {
    if (fs.existsSync(dir)) {
      // console.log(`   - 扫描: ${dir}`); // 调试用
      const files = fs.readdirSync(dir)
        .filter(f => f.includes(keyword) && f.endsWith('.json'))
        .map(f => ({
          name: f,
          fullPath: path.join(dir, f),
          time: fs.statSync(path.join(dir, f)).mtime.getTime()
        }));
      candidates = candidates.concat(files);
    }
  });

  // 按时间倒序，取最新的
  candidates.sort((a, b) => b.time - a.time);

  if (candidates.length > 0) {
    console.log(`   ✅ 找到: ${candidates[0].fullPath}`);
    return candidates[0];
  } else {
    return null;
  }
}

async function importFile(type, keyword) {
  // 1. 自动寻找文件
  const fileObj = findLatestFile(keyword);
  if (!fileObj) {
    console.error(`❌ 未找到包含 "${keyword}" 的 JSON 文件，跳过。`);
    return;
  }

  const { fullPath, name } = fileObj;
  
  try {
    const rawData = fs.readFileSync(fullPath, 'utf8');
    const questions = JSON.parse(rawData);
    console.log(`📄 开始导入: ${name} (${questions.length} 题)...`);

    const batchSize = 20;
    let successCount = 0;

    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      
      const objects = batch.map(q => {
        const Q = new AV.Object('Questions');
        
        // --- 核心映射逻辑 ---
        Q.set('sid', String(q.id)); 
        Q.set('type', q.type); // choice, blank, true_false
        Q.set('question', q.question);
        Q.set('question_zh', q.question_zh || "");
        Q.set('options', q.options || []);
        Q.set('options_zh', q.options_zh || []);
        Q.set('blank_count', q.blank_count || 0);
        Q.set('alt_answer', q.alt_answer || []);

        // ==========================================
        // 🛠️ 关键修复：答案格式适配 LeanCloud Array 类型
        // ==========================================
        let finalAnswer = q.answer;

        // 无论原本是 boolean (false) 还是 string ("A")，统统包进数组
        if (!Array.isArray(finalAnswer)) {
          finalAnswer = [finalAnswer];
        }
        
        Q.set('answer', finalAnswer);
        // ==========================================

        return Q;
      });

      try {
        await AV.Object.saveAll(objects);
        successCount += objects.length;
        process.stdout.write(`\r  ✅ 已导入: ${successCount}/${questions.length}`);
      } catch (e) {
        console.error(`\n  ❌ 批次上传失败 (索引 ${i}): ${e.message}`);
        if (e.results) console.error(`     原因: ${JSON.stringify(e.results[0])}`);
      }
    }
    console.log(`\n🎉 ${name} 导入完成。\n`);

  } catch (err) {
    console.error(`❌ 读取文件失败: ${err.message}`);
  }
}

async function run() {
  console.log('🚀 启动导入脚本...\n');

  // 这里的关键词必须和你的文件名匹配
  await importFile('choice', 'choice');
  await importFile('blank', 'blank');
  await importFile('true_false', 'true_false'); 

  console.log('🏁 所有任务执行完成。');
}

run();