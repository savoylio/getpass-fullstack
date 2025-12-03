// getpass/backend/tools/excel-to-json.js
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

function genId(prefix='Q') { return prefix + Date.now().toString(36) + Math.floor(Math.random()*1000).toString(36); }

function parseSheet(filePath, sheetName) {
  const workbook = xlsx.readFile(filePath);
  const ws = workbook.Sheets[sheetName];
  if (!ws) return [];
  const rows = xlsx.utils.sheet_to_json(ws, {defval:''});
  const out = [];
  for (const row of rows) {
    const type = (row.type || '').toString().toLowerCase();
    if (type.includes('choice') || sheetName.toLowerCase().includes('choice')) {
      out.push({
        id: genId(),
        type: 'choice',
        question: row.question || row.Question || '',
        question_zh: row.question_zh || row.translation || '',
        options: (row.options || row.Options || '').split(';').map(s=>s.trim()).filter(Boolean),
        options_zh: (row.options_zh || row.options_translation || '').split(';').map(s=>s.trim()),
        answer: (row.answer || row.Answer || '').toString().trim()
      });
    } else if (type.includes('true') || sheetName.toLowerCase().includes('true')) {
      out.push({
        id: genId(),
        type: 'true_false',
        question: row.question || '',
        question_zh: row.question_zh || row.translation || '',
        answer: ((row.answer || '').toString().toLowerCase().startsWith('t') ? true : false)
      });
    } else if (type.includes('blank') || sheetName.toLowerCase().includes('blank')) {
      out.push({
        id: genId(),
        type: 'blank',
        question: row.question || '',
        question_zh: row.question_zh || row.translation || '',
        blank_count: Number(row.blank_count || 1),
        answer: (row.answer || '').toString().split(';').map(s=>s.trim()).filter(Boolean),
        alt_answer: (row.alt_answer || '').toString().split(';').map(s=>s.trim()).filter(Boolean)
      });
    } else {
      // skip or log
    }
  }
  return out;
}

function convertAll(inputDir='./input', outDir='./output') {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});
  const files = fs.readdirSync(inputDir).filter(f=>f.endsWith('.xlsx') || f.endsWith('.xls'));
  files.forEach(file => {
    const fp = path.join(inputDir, file);
    const wb = xlsx.readFile(fp);
    wb.SheetNames.forEach(sheet => {
      const json = parseSheet(fp, sheet);
      if (json.length>0) {
        const outFile = path.join(outDir, `${path.parse(file).name}_${sheet}.json`);
        fs.writeFileSync(outFile, JSON.stringify(json, null, 2), 'utf8');
        console.log('Wrote', outFile, 'count=', json.length);
      }
    });
  });
}

if (require.main === module) convertAll();