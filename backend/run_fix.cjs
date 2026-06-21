const { Pool } = require('pg');
const fs = require('fs');
const pool = new Pool({host: '127.0.0.1', port: 35432, user: 'postgres', database: 'postgres', password: 'sea/1boundAries'});
async function run() {
  await pool.query('ALTER TABLE spatial_points ADD COLUMN location VARCHAR;');
  
  let sql = fs.readFileSync('real_db_schema/seed_reference_transaction.sql', 'utf8');
  sql = sql.replace(/, horizontal_datum, vertical_datum\) VALUES/g, ') VALUES');
  sql = sql.replace(/, 'WGS84', NULL\) ON CONFLICT/g, ') ON CONFLICT');
  
  const matches = [...sql.matchAll(/INSERT INTO feature_model_location \(fuID.*?VALUES \('([^']+)'/g)];
  const fuids = matches.map(m => m[1]);
  const relations = fuids.map(fuid => 
    `INSERT INTO fmlocation_to_siid (fuid_location, siid) SELECT '${fuid}', siid FROM spatial_information_type WHERE horizontal_datum = 'WGS84' AND location_by_text IS NULL LIMIT 1 ON CONFLICT DO NOTHING;`
  ).join('\n');
  sql = sql.replace('COMMIT;', '-- Add fmlocation_to_siid relations\n' + relations + '\n\nCOMMIT;');
  
  await pool.query(sql);
  
  await pool.query('ALTER TABLE spatial_points DROP COLUMN location;');
  console.log('Successfully inserted reference transactions and dropped location column.');
  await pool.end();
}
run().catch(console.error);
