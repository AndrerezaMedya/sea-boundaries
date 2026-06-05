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
    let res = await pool.query("SELECT * FROM fmlocation_to_source WHERE fuid_location LIKE '%P_B_CS/EEZ_C%' LIMIT 1");
    console.log('fmlocation_to_source columns:', Object.keys(res.rows[0]));
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
