const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',           // <-- usa l'utente con cui hai fatto il login
  host: 'localhost',
  database: 'coworkspace',
  password: 'teiubesc1', // <-- inserisci la password che hai usato prima
  port: 5432,
});

module.exports = pool;
