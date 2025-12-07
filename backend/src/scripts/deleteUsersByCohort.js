const AV = require('leancloud-storage');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

AV.init({
  appId: process.env.LC_APP_ID,
  appKey: process.env.LC_APP_KEY,
  masterKey: process.env.LC_MASTER_KEY,
  serverURL: process.env.LC_SERVER_URL
});

const args = process.argv.slice(2);
const cohort = args[0];
const mode = args.includes('--delete') ? 'delete' : 'mark';
const isDryRun = args.includes('--dry');

if (!cohort) {
  console.log("Usage: node deleteUsersByCohort.js <cohort> [--delete] [--dry]");
  process.exit(1);
}

async function run() {
  try {
    console.log(`🔍 Searching for users in cohort: ${cohort}...`);
    const query = new AV.Query('_User');
    query.equalTo('cohort', cohort);
    query.limit(1000);
    
    const users = await query.find({ useMasterKey: true });
    console.log(`Found ${users.length} users.`);

    if (users.length === 0) return;

    if (isDryRun) {
      console.log("--- DRY RUN MODE (No changes made) ---");
      users.forEach(u => console.log(`[Target] ${u.get('account')} (${u.get('username')})`));
      return;
    }

    let processed = 0;
    for (const u of users) {
      if (mode === 'delete') {
        await u.destroy({ useMasterKey: true });
        console.log(`🗑️  Deleted ${u.get('account')}`);
      } else {
        u.set('isActive', false);
        await u.save(null, { useMasterKey: true });
        console.log(`🚫 Deactivated ${u.get('account')}`);
      }
      processed++;
    }
    console.log(`Done. Processed ${processed} users.`);

  } catch (err) {
    console.error(err);
  }
}

run();