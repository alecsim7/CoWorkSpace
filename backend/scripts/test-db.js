const pool = require('../db');

// Esegue una query di test per verificare la connessione al database
// Utilizzo: node scripts/test-db.js
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    // Logga errore se la connessione fallisce
    console.error('❌ Errore di connessione:', err);
  } else {
    // Logga la data/ora corrente se la connessione riesce
    console.log('✅ Connessione al DB riuscita:', res.rows[0]);
  }
  // Chiude la connessione al pool
  pool.end();
});
