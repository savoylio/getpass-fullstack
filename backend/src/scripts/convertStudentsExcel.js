const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

// Usage: node src/scripts/convertStudentsExcel.js <input_file>
const inputFile = process.argv[2] || path.join(__dirname, '../../input/students.xlsx');
const outputFile = path.join(__dirname, '../data/students.json');

// Ensure output dir exists
if (!fs.existsSync(path.dirname(outputFile))) {
  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
}

try {
  if (!fs.existsSync(inputFile)) {
    console.error(`❌ Input file not found: ${inputFile}`);
    process.exit(1);
  }

  const workbook = xlsx.readFile(inputFile);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Expect headers: account, password, cohort, username (optional)
  const rawData = xlsx.utils.sheet_to_json(sheet);

  const cleanData = rawData.map(row => {
    if (!row.account || !row.password) {
      console.warn(`⚠️ Skipping row missing account or password: ${JSON.stringify(row)}`);
      return null;
    }
    return {
      account: String(row.account).trim(),
      password: String(row.password).trim(), // Plain text here, will hash in import
      cohort: row.cohort ? String(row.cohort).trim() : new Date().getFullYear().toString(),
      username: row.username ? String(row.username).trim() : `Student_${String(row.account).slice(-4)}`
    };
  }).filter(r => r !== null);

  fs.writeFileSync(outputFile, JSON.stringify(cleanData, null, 2));
  console.log(`✅ Converted ${cleanData.length} students to ${outputFile}`);

} catch (err) {
  console.error('❌ Conversion failed:', err);
}