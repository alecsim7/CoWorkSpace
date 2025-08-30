const fs = require('fs');
const path = require('path');
const pool = require('../db');

// Script per eseguire tutte le migration SQL presenti nella cartella 'migrations'
(async () => {
  try {
    // Directory dove si trovano i file di migration
    const migrationsDir = __dirname + '/migrations';

    // Legge tutti i file .sql nella directory e li ordina
    const files = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Esegue ogni file di migration in ordine
    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      console.log(`Running migration ${file}`);
      await pool.query(sql);
    }
    console.log('Migrations completed');
  } catch (err) {
    // Logga e termina il processo in caso di errore
    console.error('Migration failed', err);
    process.exit(1);
  } finally {
    // Chiude la connessione al database
    await pool.end();
  }
})();
