const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// 配置目录
const INPUT_DIR = path.join(__dirname, '../../input');
const OUTPUT_DIR = path.join(__dirname, '../data/new');

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// === 核心工具：智能分割函数 ===
// 优先级：竖线(|) > 分号(;) > 中文分号(；) > 换行(\n)
function smartSplit(text) {
  if (!text) return [];
  const str = String(text).trim();

  // 1. 如果包含竖线 |
  if (str.includes('|')) {
    return str.split('|').map(s => s.trim());
  }
  
  // 2. 如果包含分号 ; (英文或中文)
  if (str.includes(';') || str.includes('；')) {
    return str.split(/[;；]/).map(s => s.trim());
  }

  // 3. 如果包含换行符 (Alt+Enter)
  if (str.includes('\n') || str.includes('\r')) {
    return str.split(/[\r\n]+/).map(s => s.trim());
  }

  // 4. (慎用) 只有在确实没别的符号时，才考虑逗号，但为了安全，
  // 这里我们默认**不**支持逗号分隔，防止 "Washington, D.C." 被切断。
  // 如果你非常确定要用逗号，把下面这三行注释打开：
  /*
  if (str.includes(',')) {
    return str.split(',').map(s => s.trim());
  }
  */

  // 5. 如果没有分隔符，这就只是一个单项
  return [str];
}

function convert() {
  const files = fs.readdirSync(INPUT_DIR).filter(f => f.endsWith('.xlsx') || f.endsWith('.xls'));

  if (files.length === 0) {
    console.log('❌ input 文件夹里没有 Excel 文件');
    return;
  }

  console.log(`🔍 发现 ${files.length} 个 Excel 文件，开始智能转换...`);

  files.forEach(filename => {
    try {
      const filePath = path.join(INPUT_DIR, filename);
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rawData = xlsx.utils.sheet_to_json(sheet);
      
      const formattedData = rawData.map(row => {
        // 1. 处理选项 (支持 | ; ；)
        let optionsArr = smartSplit(row.options);
        let optionsZhArr = smartSplit(row.options_zh);

        // 2. 处理备选答案 (支持 | ; ；)
        let altArr = smartSplit(row.alt_answer);

        // 3. 处理正确答案 (answer)
        let answerVal = [];
        if (row.type === 'true_false' || row.type === 'truefalse') {
          // 判断题：转布尔值
          const val = String(row.answer).toLowerCase().trim();
          answerVal = (val === 'true' || val === 't' || val === 'yes' || val === '是' || val === '对');
        } else {
          // 选择题/填空题：如果是多选/多空，也支持分割
          // 如果是单选，smartSplit 会返回只有一个元素的数组 ["A"]
          answerVal = smartSplit(row.answer);
        }

        return {
          id: String(row.id).trim(),
          type: row.type ? row.type.trim() : 'choice',
          question: row.question,
          question_zh: row.question_zh || "",
          options: optionsArr,
          options_zh: optionsZhArr,
          answer: answerVal,
          alt_answer: altArr,
          blank_count: row.blank_count || (row.type === 'blank' ? 1 : 0)
        };
      });

      const outputFilename = filename.replace(/\.(xlsx|xls)$/, '.json');
      const outputPath = path.join(OUTPUT_DIR, outputFilename);

      fs.writeFileSync(outputPath, JSON.stringify(formattedData, null, 2));
      console.log(`✅ 转换成功: ${filename} -> ${outputFilename} (兼容模式)`);

    } catch (err) {
      console.error(`❌ 转换 ${filename} 失败:`, err.message);
    }
  });
}

convert();