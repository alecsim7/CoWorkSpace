const pool = require('./db');

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Errore di connessione:', err);
  } else {
    console.log('✅ Connessione al DB riuscita:', res.rows[0]);
  }
  pool.end();
});
