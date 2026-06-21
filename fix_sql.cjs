const fs = require('fs');
let sql = fs.readFileSync('real_db_schema/seed_reference_transaction.sql', 'utf8');

// 1. Remove horizontal_datum, vertical_datum from INSERT statement
sql = sql.replace(/, horizontal_datum, vertical_datum\) VALUES/g, ') VALUES');

// 2. Remove 'WGS84', NULL from values
sql = sql.replace(/, 'WGS84', NULL\) ON CONFLICT/g, ') ON CONFLICT');

// 3. Extract the fuIDs to generate fmlocation_to_siid inserts
const matches = [...sql.matchAll(/INSERT INTO feature_model_location \(fuID.*?VALUES \('([^']+)'/g)];
const fuids = matches.map(m => m[1]);

// 4. spatial_points: remove `location` column
sql = sql.replace(/INSERT INTO spatial_points \(saID, location, latitude, longitude, geom\) VALUES/g, 'INSERT INTO spatial_points (saID, latitude, longitude, geom) VALUES');

// 5. spatial_points: remove the second string argument which is the location text (e.g. 'Tg. Berakit', etc.)
// Format: VALUES ('TR.001', 'Tg. Berakit', '1A...', '104A...', ST_SetSRID...
sql = sql.replace(/VALUES \('([^']+)', '[^']*', '([^']+)', '([^']+)', ST_SetSRID/g, "VALUES ('$1', '$2', '$3', ST_SetSRID");

const relations = fuids.map(fuid => 
  `INSERT INTO fmlocation_to_siid (fuid_location, siid) SELECT '${fuid}', siid FROM spatial_information_type WHERE horizontal_datum = 'WGS84' AND location_by_text IS NULL LIMIT 1 ON CONFLICT DO NOTHING;`
).join('\n');

sql = sql.replace('COMMIT;', '-- Add fmlocation_to_siid relations\n' + relations + '\n\nCOMMIT;');

fs.writeFileSync('real_db_schema/seed_reference_transaction_fixed.sql', sql, 'utf8');
console.log('Fixed SQL written to seed_reference_transaction_fixed.sql');
