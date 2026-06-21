const { Pool } = require('pg');
const pool = new Pool({ connectionString: 'postgresql://postgres:sea%2F1boundAries@127.0.0.1:35432/postgres' });

async function run() {
  // Check fmlimit_to_source columns
  const { rows: cols } = await pool.query(`SELECT column_name FROM information_schema.columns WHERE table_name = 'fmlimit_to_source' ORDER BY ordinal_position`);
  console.log('fmlimit_to_source columns:', cols.map(c => c.column_name));

  // Sample
  const { rows: sample } = await pool.query(`SELECT * FROM fmlimit_to_source LIMIT 3`);
  console.table(sample);

  // Count limits with no source relation
  const { rows: noSource } = await pool.query(`
    SELECT count(*) as c FROM feature_model_limit lim
    WHERE NOT EXISTS (SELECT 1 FROM fmlimit_to_source rel WHERE rel.fuid_limit = lim.fuid)
  `);
  console.log('Limits without source relation:', noSource[0].c);

  // Count limits that already have source
  const { rows: hasSource } = await pool.query(`
    SELECT count(DISTINCT fuid_limit) as c FROM fmlimit_to_source
  `);
  console.log('Limits with source relation:', hasSource[0].c);

  // Total limits
  const { rows: total } = await pool.query(`SELECT count(*) as c FROM feature_model_limit`);
  console.log('Total limits:', total[0].c);

  pool.end();
}
run().catch(e => { console.error(e); pool.end(); });
