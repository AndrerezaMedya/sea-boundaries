const { Pool } = require('pg');
const pool = new Pool({
  host: '127.0.0.1',
  port: 35432,
  user: 'postgres',
  database: 'postgres',
  password: 'sea/1boundAries'
});

async function run() {
  try {
    const q = process.argv[2];
    const res = await pool.query(q);
    console.log(JSON.stringify(res.rows, null, 2));
  } catch (err) {
    console.error(err.message);
  } finally {
    await pool.end();
  }
}
run();
