const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({ connectionString: 'postgresql://postgres:sea%2F1boundAries@127.0.0.1:35432/postgres' });

async function run() {
  try {
    const sql1 = fs.readFileSync('../real_db_schema/patches/add_lifespan_columns.sql', 'utf8');
    console.log('Running add_lifespan_columns.sql...');
    await pool.query(sql1);
    console.log('Done add_lifespan_columns.');

    const sql2 = fs.readFileSync('../patch_geom.sql', 'utf8');
    console.log('Running patch_geom.sql...');
    await pool.query(sql2);
    console.log('Done patch_geom.');

  } catch (e) {
    console.error('Error:', e);
  } finally {
    pool.end();
  }
}

run();
