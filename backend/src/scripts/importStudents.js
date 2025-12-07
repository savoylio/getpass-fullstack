const AV = require('leancloud-storage');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

// Init LeanCloud
AV.init({
  appId: process.env.LC_APP_ID,
  appKey: process.env.LC_APP_KEY,
  masterKey: process.env.LC_MASTER_KEY,
  serverURL: process.env.LC_SERVER_URL
});

const DATA_FILE = path.join(__dirname, '../data/students.json');

async function importStudents() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      throw new Error(`Data file not found: ${DATA_FILE}`);
    }
    const students = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    console.log(`🔍 Found ${students.length} students to process...`);

    let created = 0;
    let skipped = 0;

    for (const s of students) {
      // Check if account exists
      const query = new AV.Query('_User');
      query.equalTo('account', s.account);
      const exist = await query.first({ useMasterKey: true });

      if (exist) {
        console.log(`   ⏭️  Skipped existing account: ${s.account}`);
        skipped++;
        continue;
      }

      const user = new AV.User();
      user.setUsername(s.username); // Display name
      user.setPassword(s.password); // LeanCloud SDK handles bcrypt automatically
      user.set('account', s.account); // Unique ID
      user.set('cohort', s.cohort);
      user.set('role', 'user');
      user.set('isActive', true);
      // Init stats
      user.set('stats', { correct_rate: 0, total_time: 0, total_questions: 0 });
      user.set('ranking_stats', { exam_score: 0, choice_rounds: 0, blank_rounds: 0, tf_rounds: 0 });
      
      // Use random avatar
      user.set('avatar', `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.account}`);

      await user.signUp(); // signUp handles hashing
      console.log(`   ✅ Created: ${s.account} (${s.username})`);
      created++;
    }

    console.log(`\n🎉 Import Complete. Created: ${created}, Skipped: ${skipped}`);

  } catch (err) {
    console.error('❌ Import failed:', err);
  }
}

importStudents();