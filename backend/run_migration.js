/**
 * Apply a SQL migration file using backend/.env DB settings.
 *
 *   node run_migration.js migrations/002_data_requests.sql
 *   node run_migration.js                    # defaults to 001_indexes.sql
 */
const { readFileSync } = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const fileArg = process.argv[2] || 'migrations/001_indexes.sql';
const migrationPath = path.resolve(__dirname, fileArg);

async function runMigration() {
  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT || 5432),
  });

  try {
    console.log(`Reading ${migrationPath}...`);
    const sql = readFileSync(migrationPath, 'utf8');
    console.log('Applying migration...');
    await pool.query(sql);
    console.log('Migration applied successfully.');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

runMigration();
