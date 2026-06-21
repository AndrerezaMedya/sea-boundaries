const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:sea%2F1boundAries@127.0.0.1:35432/postgres' });

async function run() {
  try {
    const res = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `);
    const tables = res.rows.map(r => r.table_name);
    console.log('Tables found:', tables.length);
    
    for (const table of tables) {
      // also get column info and count
      const countRes = await pool.query(`SELECT count(*) as count FROM "${table}"`);
      
      const colRes = await pool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);

      console.log(`\nTable: ${table} (${countRes.rows[0].count} records)`);
      console.log(colRes.rows.map(c => `  - ${c.column_name} (${c.data_type})`).join('\n'));
    }
  } catch (e) {
    console.error(e);
  }
  pool.end();
}
run().catch(e => { console.error(e); pool.end(); });
