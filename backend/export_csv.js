const fs = require('fs');
const { Pool } = require('pg');

const pool = new Pool({
  host: '127.0.0.1',
  port: 35432,
  user: 'postgres',
  database: 'postgres',
  password: 'sea/1boundAries'
});

async function exportTable(query, filename) {
  const { rows } = await pool.query(query);
  if (rows.length === 0) {
    console.log('No data for ' + filename);
    return;
  }
  const headers = Object.keys(rows[0]).join(',');
  const lines = rows.map(r => Object.values(r).map(v => {
    if (v === null || v === undefined) return '';
    const str = String(v);
    if (str.includes(',') || str.includes('\"') || str.includes('\n')) {
      return '\"' + str.replace(/\"/g, '\"\"') + '\"';
    }
    return str;
  }).join(','));
  const csv = headers + '\n' + lines.join('\n');
  fs.writeFileSync('d:/web/coba-gis/sea-boundaries/real_db_schema/' + filename, csv, 'utf8');
  console.log('Exported ' + rows.length + ' rows to ' + filename);
}

async function run() {
  try {
    await exportTable('SELECT * FROM spatial_information_type ORDER BY siid', 'spatial_information_type.csv');
    await exportTable('SELECT * FROM fmlimit_to_siid ORDER BY fuid_limit, siid', 'fmlimit_to_siid.csv');
    await exportTable('SELECT * FROM fmzone_to_siid ORDER BY fuid_zone, siid', 'fmzone_to_siid.csv');
    await exportTable('SELECT * FROM fmlocation_to_siid ORDER BY fuid_location, siid', 'fmlocation_to_siid.csv');
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}
run();
