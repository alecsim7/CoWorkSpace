const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];

const env = {};
requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(`${envVar} is missing`);
  }
  env[envVar] = value.trim();
});

const port = parseInt(env.DB_PORT, 10);
if (Number.isNaN(port)) {
  throw new Error('DB_PORT must be a number');
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
  user: env.DB_USER,
  host: env.DB_HOST,
  database: env.DB_NAME,
  password: env.DB_PASSWORD,
  port,
});

module.exports = pool;