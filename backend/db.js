const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Load environment variables from backend/.env if present
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
} else {
  console.warn(`⚠️  Missing ${envPath}. Using process environment variables.`);
}

// Ensure the required variables are available
const requiredEnvVars = ['DB_USER', 'DB_PASSWORD', 'DB_HOST', 'DB_PORT', 'DB_NAME'];
const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);
if (missing.length > 0) {
  throw new Error(
    `Missing environment variables: ${missing.join(', ')}. ` +
    'Create backend/.env (see backend/.env.example) and set them.'
  );
}

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432,
});

module.exports = pool;
