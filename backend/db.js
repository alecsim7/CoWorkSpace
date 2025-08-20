const path = require('path');

// Carica le variabili d'ambiente dal file .env SOLO se non siamo in ambiente CI
if (!process.env.CI) {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
}

const { Pool } = require('pg');

// Elenco delle variabili d'ambiente richieste per la connessione al database
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];

// Controlla che tutte le variabili richieste siano presenti
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} is missing`);
  }
});

// Crea il pool di connessione PostgreSQL usando le variabili d'ambiente
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  ssl: false
});

// Verifica immediatamente la connessione al database.
pool
  .connect()
  .then((client) => {
    client.release();
  })
  .catch((err) => {
    console.error('Errore di connessione al database:', err.message);
    process.exit(1);
  });

module.exports = pool;
