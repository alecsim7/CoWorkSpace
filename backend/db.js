const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { Pool } = require('pg');

const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];

requiredEnvVars.forEach((envVar) => {
  const value = process.env[envVar];
  if (value === undefined || value === '') {
    throw new Error(`${envVar} is missing`);
  }
});

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

module.exports = pool;
