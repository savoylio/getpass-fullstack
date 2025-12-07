const AV = require('leancloud-storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// 初始化 LeanCloud
if (!process.env.LC_APP_ID || !process.env.LC_MASTER_KEY) {
  console.error('❌ 错误：.env 文件中缺失 LC_APP_ID 或 LC_MASTER_KEY');
  process.exit(1);
}

AV.init({
  appId: process.env.LC_APP_ID,
  appKey: process.env.LC_APP_KEY,
  masterKey: process.env.LC_MASTER_KEY,
  serverURL: process.env.LC_SERVER_URL
});

const FILES_TO_UPDATE = ['choice.json', 'blank.json', 'true_false.json'];
const DATA_DIR = path.join(__dirname, '../data/current');

async function fetchAllCloudQuestions() {
  let allQuestions = [];
  let limit = 1000;
  let skip = 0;
  let hasMore = true;

  console.log('🔄 正在从 LeanCloud 拉取所有旧题目以供比对...');

  while (hasMore) {
    const query = new AV.Query('Questions');
    query.limit(limit);
    query.skip(skip);
    query.ascending('sid');
    const results = await query.find({ useMasterKey: true });
    
    allQuestions = allQuestions.concat(results);
    skip += limit;
    if (results.length < limit) hasMore = false;
    process.stdout.write(`   已拉取 ${allQuestions.length} 条...\r`);
  }
  console.log(`\n✅ 云端现有题目共: ${allQuestions.length} 条`);
  
  const map = new Map();
  allQuestions.forEach(q => map.set(q.get('sid'), q));
  return map;
}

async function runUpdate() {
  try {
    const cloudMap = await fetchAllCloudQuestions();
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalMissing = 0;

    for (const filename of FILES_TO_UPDATE) {
      const filePath = path.join(DATA_DIR, filename);
      if (!fs.existsSync(filePath)) {
        console.warn(`⚠️ 跳过：文件不存在 ${filePath}`);
        continue;
      }

      console.log(`\n📂 正在处理本地文件: ${filename}`);
      const localData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      const updates = [];

      for (const localQ of localData) {
        const sid = localQ.id;
        const cloudQ = cloudMap.get(sid);

        if (!cloudQ) {
          console.warn(`   ⚠️ 警告: 本地题目 [${sid}] 在云端不存在`);
          totalMissing++;
          continue;
        }

        let needsUpdate = false;
        const fieldsToCheck = ['type', 'question', 'question_zh', 'options', 'options_zh', 'answer', 'alt_answer', 'blank_count'];
        
        for (const field of fieldsToCheck) {
          let localVal = localQ[field] === undefined ? null : localQ[field];
          const cloudVal = cloudQ.get(field) === undefined ? null : cloudQ.get(field);

          // === 关键修复：类型强制转换 ===
          // LeanCloud 要求 answer 必须是 Array。
          // 如果本地 JSON 是 String (选择题) 或 Boolean (判断题)，强制转为 Array。
          if (field === 'answer' && localVal !== null && !Array.isArray(localVal)) {
            localVal = [localVal];
          }
          // ==========================

          // 深度比较
          if (JSON.stringify(localVal) !== JSON.stringify(cloudVal)) {
            console.log(`   📝 发现变更 [${sid}]: ${field} 已修改`);
            // console.log(`      旧值: ${JSON.stringify(cloudVal)}`);
            // console.log(`      新值: ${JSON.stringify(localVal)}`);
            
            cloudQ.set(field, localVal);
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          updates.push(cloudQ);
        } else {
          totalSkipped++;
        }
      }

      if (updates.length > 0) {
        console.log(`   🚀 正在提交 ${updates.length} 条更新到云端...`);
        // 批量保存
        try {
            await AV.Object.saveAll(updates, { useMasterKey: true });
            console.log(`   ✅ ${filename} 更新完毕！`);
            totalUpdated += updates.length;
        } catch (saveErr) {
            console.error(`   ❌ ${filename} 保存失败:`, saveErr.message);
            // 如果你只改了几个，可以尝试逐条保存来看具体哪个错了
        }
      } else {
        console.log(`   ✨ ${filename} 无需更新`);
      }
    }

    console.log('\n=======================================');
    console.log(`🎉 维护结束`);
    console.log(`   更新成功: ${totalUpdated} 条`);
    console.log(`   未变跳过: ${totalSkipped} 条`);
    console.log('=======================================');

  } catch (err) {
    console.error('❌ 脚本运行出错:', err);
  }
}

runUpdate();