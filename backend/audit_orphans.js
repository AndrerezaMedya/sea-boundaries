/**
 * Klasifikasi orphan rows pada fmlimit_to_fmlocation.
 * Memisahkan baris orphan menjadi:
 *   (A) fuid_limit tidak ada di feature_model_limit
 *   (B) fuid_location tidak ada di feature_model_location
 *   (C) keduanya hilang
 *
 * Juga cek apakah `fuid_limit` orphan tsb benar-benar tidak ada,
 * atau ada dengan ejaan/prefix berbeda (mis. tanpa "LIM_").
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
});

(async () => {
  // 1. Klasifikasi
  const { rows } = await pool.query(`
    SELECT j.fuid_limit, j.fuid_location,
           (l.fuid IS NULL) AS limit_missing,
           (loc.fuid IS NULL) AS location_missing
    FROM fmlimit_to_fmlocation j
    LEFT JOIN feature_model_limit l    ON l.fuid    = j.fuid_limit
    LEFT JOIN feature_model_location loc ON loc.fuid = j.fuid_location
    WHERE l.fuid IS NULL OR loc.fuid IS NULL
    ORDER BY j.fuid_limit, j.fuid_location;
  `);

  const byLimit = {};
  for (const r of rows) {
    const key = r.fuid_limit;
    if (!byLimit[key]) byLimit[key] = { limit_missing: r.limit_missing, location_missing_count: 0, locations: [], all_loc_missing: true };
    byLimit[key].locations.push(r.fuid_location);
    if (r.location_missing) byLimit[key].location_missing_count++;
    else byLimit[key].all_loc_missing = false;
  }

  console.log('\n=== Klasifikasi orphan (per fuid_limit) ===');
  for (const [lim, v] of Object.entries(byLimit)) {
    const limStatus = v.limit_missing ? 'LIMIT MISSING' : 'limit OK';
    console.log(`\n• ${lim}  [${limStatus}]  loc_missing=${v.location_missing_count}/${v.locations.length}`);
    for (const loc of v.locations.slice(0, 5)) console.log(`    - ${loc}`);
    if (v.locations.length > 5) console.log(`    … (+${v.locations.length - 5} lagi)`);
  }

  // 2. Cek apakah fuid_limit yang missing punya kemiripan di tabel feature_model_limit
  const missingLimits = [...new Set(rows.filter(r => r.limit_missing).map(r => r.fuid_limit))];
  if (missingLimits.length) {
    console.log('\n=== fuid_limit yang tidak ada di feature_model_limit ===');
    for (const lim of missingLimits) {
      const sim = await pool.query(
        `SELECT fuid FROM feature_model_limit
         WHERE fuid ILIKE $1 OR fuid ILIKE $2 LIMIT 5`,
        [`%${lim}%`, `${lim}%`]
      );
      console.log(`  ${lim}  →  similar in feature_model_limit: ${
        sim.rows.length ? sim.rows.map(x => x.fuid).join(', ') : '(none)'
      }`);
    }
  }

  // 3. Cek apakah fuid_location yang missing punya kemiripan
  const missingLocs = [...new Set(rows.filter(r => r.location_missing).map(r => r.fuid_location))];
  console.log(`\n=== fuid_location missing: ${missingLocs.length} unik ===`);
  // Sampling: cek apakah cukup dengan menambah prefix "LOC_" sudah ketemu
  const noLocPrefix = missingLocs.filter(x => !x.startsWith('LOC_'));
  console.log(`  • Tidak diawali "LOC_" : ${noLocPrefix.length}`);
  if (noLocPrefix.length) {
    const sample = noLocPrefix.slice(0, 3);
    for (const loc of sample) {
      const tryPrefixed = await pool.query(
        `SELECT fuid FROM feature_model_location WHERE fuid = $1 LIMIT 1`,
        [`LOC_${loc}`]
      );
      console.log(`    "${loc}" → "LOC_${loc}" exists? ${tryPrefixed.rows.length > 0}`);
    }
  }

  // 4. Total ringkasan
  const stats = {
    total: rows.length,
    limit_missing_only:    rows.filter(r =>  r.limit_missing && !r.location_missing).length,
    location_missing_only: rows.filter(r => !r.limit_missing &&  r.location_missing).length,
    both_missing:          rows.filter(r =>  r.limit_missing &&  r.location_missing).length,
  };
  console.log('\n=== Total ===');
  console.table(stats);

  await pool.end();
})().catch(e => { console.error(e); process.exit(1); });
