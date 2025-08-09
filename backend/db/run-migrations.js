const fs = require('fs');
const path = require('path');
const pool = require('../db');

(async () => {
  try {
    const migrationsDir = __dirname + '/migrations';
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running migration ${file}`);
      await pool.query(sql);
    }
    console.log('Migrations completed');
  } catch (err) {
    console.error('Migration failed', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
