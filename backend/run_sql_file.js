const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 35432,
  user: 'postgres',
  database: 'postgres',
  password: 'sea/1boundAries'
});

async function run() {
  const sqlFile = process.argv[2];
  console.log(`Running SQL file: ${sqlFile}`);
  try {
    const sql = fs.readFileSync(sqlFile, 'utf8');
    await pool.query(sql);
    console.log('SQL executed successfully!');
  } catch (err) {
    console.error('Error executing SQL:', err);
  } finally {
    await pool.end();
  }
}

run();
