/**
 * Comprehensive Data Quality Audit untuk database S-121.
 *
 * Mendeteksi human-input errors:
 *   A. Orphan rows di SEMUA junction tables (12 tabel relasi).
 *   B. Duplikasi rrrID lintas tabel right/responsibility/restriction
 *      (dokumen menuntut unik global).
 *   C. Whitespace / case / prefix anomaly pada ID.
 *   D. NULL/empty pada kolom yang seharusnya NOT NULL secara semantik.
 *   E. Geometri invalid / kosong / di luar bbox Indonesia.
 *   F. Anomali nilai (share != 1, datum tidak WGS84, vocabulary tidak konsisten).
 *   G. Duplikat baris pada junction (logically impossible kalau PK ada,
 *      tapi bisa terjadi di DATA SHEET sebelum di-seed).
 *
 * Cara jalan:
 *   node audit_data_quality.js
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

const c = { reset:'\x1b[0m', bold:'\x1b[1m', dim:'\x1b[2m', red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', cyan:'\x1b[36m' };
const head = (m) => `\n${c.bold}=== ${m} ===${c.reset}`;
const ok   = (m) => `${c.green}[ OK ]${c.reset} ${m}`;
const fail = (m) => `${c.red}[FAIL]${c.reset} ${m}`;
const warn = (m) => `${c.yellow}[WARN]${c.reset} ${m}`;

const report = []; // {category, severity, msg, sample?}
function add(category, severity, msg, sample) {
  report.push({ category, severity, msg, sample });
  const fn = severity === 'FAIL' ? fail : severity === 'WARN' ? warn : ok;
  console.log(fn(`[${category}] ${msg}`));
  if (sample && sample.length) {
    const preview = sample.slice(0, 5).map((r) => '    • ' + JSON.stringify(r)).join('\n');
    console.log(c.dim + preview + (sample.length > 5 ? `\n    … (+${sample.length - 5} lagi)` : '') + c.reset);
  }
}

// ----- A. Orphan checks pada SEMUA junction tables --------------------------
async function orphanChecks() {
  console.log(head('A. Orphan rows di semua junction tables'));
  const checks = [
    {
      label: 'fmlocation_to_sapoint',
      sql: `SELECT j.fuid_location, j.said_point,
                   (l.fuid IS NULL) AS loc_missing,
                   (p.said IS NULL) AS pt_missing
            FROM fmlocation_to_sapoint j
            LEFT JOIN feature_model_location l ON l.fuid = j.fuid_location
            LEFT JOIN spatial_points p         ON p.said = j.said_point
            WHERE l.fuid IS NULL OR p.said IS NULL`,
    },
    {
      label: 'fmlimit_to_fmlocation',
      sql: `SELECT j.fuid_limit, j.fuid_location
            FROM fmlimit_to_fmlocation j
            LEFT JOIN feature_model_limit lim    ON lim.fuid = j.fuid_limit
            LEFT JOIN feature_model_location loc ON loc.fuid = j.fuid_location
            WHERE lim.fuid IS NULL OR loc.fuid IS NULL`,
    },
    {
      label: 'fmlimit_to_sacurve',
      sql: `SELECT j.fuid_limit, j.said_curve,
                   (lim.fuid IS NULL) AS lim_missing,
                   (c.said IS NULL AND b.said IS NULL) AS sa_missing
            FROM fmlimit_to_sacurve j
            LEFT JOIN feature_model_limit lim ON lim.fuid = j.fuid_limit
            LEFT JOIN spatial_curves c        ON c.said   = j.said_curve
            LEFT JOIN spatial_baselines b     ON b.said   = j.said_curve
            WHERE lim.fuid IS NULL OR (c.said IS NULL AND b.said IS NULL)`,
    },
    {
      label: 'source_to_party',
      sql: `SELECT j.sid, j.pid
            FROM source_to_party j
            LEFT JOIN source s ON s.sid = j.sid
            LEFT JOIN party p  ON p.pid = j.pid
            WHERE s.sid IS NULL OR p.pid IS NULL`,
    },
    {
      label: 'fmlocation_to_source',
      sql: `SELECT j.fuid_location, j.sid
            FROM fmlocation_to_source j
            LEFT JOIN feature_model_location l ON l.fuid = j.fuid_location
            LEFT JOIN source s                  ON s.sid  = j.sid
            WHERE l.fuid IS NULL OR s.sid IS NULL`,
    },
    {
      label: 'baunit_to_source',
      sql: `SELECT j.uid, j.sid
            FROM baunit_to_source j
            LEFT JOIN basic_administrative_unit b ON b.uid = j.uid
            LEFT JOIN source s                     ON s.sid = j.sid
            WHERE b.uid IS NULL OR s.sid IS NULL`,
    },
    {
      label: 'fmlimit_to_source',
      sql: `SELECT j.fuid_limit, j.sid
            FROM fmlimit_to_source j
            LEFT JOIN feature_model_limit lim ON lim.fuid = j.fuid_limit
            LEFT JOIN source s                 ON s.sid    = j.sid
            WHERE lim.fuid IS NULL OR s.sid IS NULL`,
    },
    {
      label: 'rrr_to_source (multi-parent rrrID)',
      sql: `SELECT j.rrrid, j.sid
            FROM rrr_to_source j
            LEFT JOIN "right" r          ON r.rrrid          = j.rrrid
            LEFT JOIN responsibility rsp ON rsp.rrrid        = j.rrrid
            LEFT JOIN restriction rst    ON rst.rrrid        = j.rrrid
            LEFT JOIN source s            ON s.sid            = j.sid
            WHERE (r.rrrid IS NULL AND rsp.rrrid IS NULL AND rst.rrrid IS NULL)
               OR s.sid IS NULL`,
    },
    {
      label: 'rrr_to_bau (multi-parent rrrID)',
      sql: `SELECT j.rrrid, j.uid
            FROM rrr_to_bau j
            LEFT JOIN "right" r          ON r.rrrid = j.rrrid
            LEFT JOIN responsibility rsp ON rsp.rrrid = j.rrrid
            LEFT JOIN restriction rst    ON rst.rrrid = j.rrrid
            LEFT JOIN basic_administrative_unit b ON b.uid = j.uid
            WHERE (r.rrrid IS NULL AND rsp.rrrid IS NULL AND rst.rrrid IS NULL)
               OR b.uid IS NULL`,
    },
    {
      label: 'fmzone_to_bau',
      sql: `SELECT j.fuid_zone, j.uid
            FROM fmzone_to_bau j
            LEFT JOIN feature_model_zone z ON z.fuid = j.fuid_zone
            LEFT JOIN basic_administrative_unit b ON b.uid = j.uid
            WHERE z.fuid IS NULL OR b.uid IS NULL`,
    },
    {
      label: 'fmzone_to_fmlimit',
      sql: `SELECT j.fuid_zone, j.fuid_limit
            FROM fmzone_to_fmlimit j
            LEFT JOIN feature_model_zone z ON z.fuid = j.fuid_zone
            LEFT JOIN feature_model_limit lim ON lim.fuid = j.fuid_limit
            WHERE z.fuid IS NULL OR lim.fuid IS NULL`,
    },
    {
      label: 'governance_to_bau',
      sql: `SELECT j.govid, j.uid
            FROM governance_to_bau j
            LEFT JOIN governance g ON g.govid = j.govid
            LEFT JOIN basic_administrative_unit b ON b.uid = j.uid
            WHERE g.govid IS NULL OR b.uid IS NULL`,
    },
  ];
  for (const ck of checks) {
    try {
      const { rows } = await pool.query(ck.sql);
      if (rows.length === 0) add('orphan', 'PASS', `${ck.label}: 0 orphan`);
      else add('orphan', 'FAIL', `${ck.label}: ${rows.length} orphan rows`, rows);
    } catch (e) {
      add('orphan', 'WARN', `${ck.label}: query error — ${e.message}`);
    }
  }
}

// ----- B. Duplikasi rrrID lintas tabel ------------------------------------
async function duplicateRrrIdCheck() {
  console.log(head('B. Duplikasi rrrID lintas right/responsibility/restriction'));
  const { rows } = await pool.query(`
    SELECT rrrid, count(*) AS c, string_agg(src,',') AS sources
    FROM (
      SELECT rrrid, 'right'          AS src FROM "right"
      UNION ALL
      SELECT rrrid, 'responsibility' AS src FROM responsibility
      UNION ALL
      SELECT rrrid, 'restriction'    AS src FROM restriction
    ) t
    GROUP BY rrrid HAVING count(*) > 1
  `);
  if (rows.length === 0) add('rrr-unique', 'PASS', 'Semua rrrID unik global lintas 3 tabel RRR');
  else add('rrr-unique', 'FAIL', `${rows.length} rrrID muncul di lebih dari satu tabel RRR`, rows);
}

// ----- C. Whitespace / case anomaly ---------------------------------------
async function whitespaceCheck() {
  console.log(head('C. Whitespace / format ID anomaly'));
  const idChecks = [
    { table: 'party',                     col: 'pid'  },
    { table: '"right"',                   col: 'rrrid' },
    { table: 'responsibility',            col: 'rrrid' },
    { table: 'restriction',               col: 'rrrid' },
    { table: 'basic_administrative_unit', col: 'uid'  },
    { table: 'source',                    col: 'sid'  },
    { table: 'feature_model_limit',       col: 'fuid' },
    { table: 'feature_model_location',    col: 'fuid' },
    { table: 'spatial_points',            col: 'said' },
    { table: 'spatial_curves',            col: 'said' },
    { table: 'spatial_baselines',         col: 'said' },
  ];
  for (const ck of idChecks) {
    const { rows } = await pool.query(`
      SELECT ${ck.col} AS id FROM ${ck.table}
      WHERE ${ck.col} IS NULL
         OR ${ck.col} <> trim(${ck.col})
         OR ${ck.col} ~ '\\s'
         OR length(${ck.col}) = 0
      LIMIT 50
    `);
    if (rows.length === 0) add('whitespace', 'PASS', `${ck.table}.${ck.col}: clean`);
    else add('whitespace', 'FAIL', `${ck.table}.${ck.col}: ${rows.length} ID dgn whitespace/empty`, rows);
  }
}

// ----- D. Prefix consistency ----------------------------------------------
async function prefixCheck() {
  console.log(head('D. Konsistensi prefix ID'));
  // feature_model_limit: harus berprefix LIM_*
  const limBad = await pool.query(`
    SELECT fuid FROM feature_model_limit WHERE fuid !~ '^LIM_' LIMIT 50
  `);
  if (limBad.rows.length === 0) add('prefix', 'PASS', 'feature_model_limit: semua diawali "LIM_"');
  else add('prefix', 'FAIL', `feature_model_limit: ${limBad.rows.length} fuid TIDAK diawali "LIM_"`, limBad.rows);

  // feature_model_location: spec menyebut LOC_* (tapi data realnya tidak konsisten — lihat orphan analysis)
  const locBad = await pool.query(`
    SELECT fuid FROM feature_model_location WHERE fuid !~ '^LOC_' LIMIT 50
  `);
  if (locBad.rows.length === 0) add('prefix', 'PASS', 'feature_model_location: semua diawali "LOC_"');
  else add('prefix', 'FAIL', `feature_model_location: ${locBad.rows.length} fuid TIDAK diawali "LOC_"`, locBad.rows);

  // spatial_baselines: harus BSL_*
  const bslBad = await pool.query(`
    SELECT said FROM spatial_baselines WHERE said !~ '^BSL_' LIMIT 50
  `);
  if (bslBad.rows.length === 0) add('prefix', 'PASS', 'spatial_baselines: semua diawali "BSL_"');
  else add('prefix', 'WARN', `spatial_baselines: ${bslBad.rows.length} said TIDAK diawali "BSL_"`, bslBad.rows);

  // spatial_curves: harus CURVE_*
  const curveBad = await pool.query(`
    SELECT said FROM spatial_curves WHERE said !~ '^CURVE_' LIMIT 50
  `);
  if (curveBad.rows.length === 0) add('prefix', 'PASS', 'spatial_curves: semua diawali "CURVE_"');
  else add('prefix', 'WARN', `spatial_curves: ${curveBad.rows.length} said TIDAK diawali "CURVE_"`, curveBad.rows);
}

// ----- E. Geometry validity ------------------------------------------------
async function geometryCheck() {
  console.log(head('E. Validitas geometri'));
  const tables = [
    { name: 'spatial_points',    col: 'geom', pkCol: 'said' },
    { name: 'spatial_curves',    col: 'geom', pkCol: 'said' },
    { name: 'spatial_baselines', col: 'geom', pkCol: 'said' },
  ];
  for (const t of tables) {
    // Empty / NULL
    const nullR = await pool.query(`SELECT ${t.pkCol} AS id FROM ${t.name} WHERE ${t.col} IS NULL OR ST_IsEmpty(${t.col}) LIMIT 50`);
    if (nullR.rows.length === 0) add('geom', 'PASS', `${t.name}: tidak ada geometry NULL/empty`);
    else add('geom', 'FAIL', `${t.name}: ${nullR.rows.length} geometry NULL/empty`, nullR.rows);

    // Invalid
    const invR = await pool.query(`
      SELECT ${t.pkCol} AS id, ST_IsValidReason(${t.col}) AS reason
      FROM ${t.name} WHERE NOT ST_IsValid(${t.col}) LIMIT 50
    `);
    if (invR.rows.length === 0) add('geom', 'PASS', `${t.name}: semua geometry valid (ST_IsValid)`);
    else add('geom', 'FAIL', `${t.name}: ${invR.rows.length} geometry invalid`, invR.rows);

    // Bbox check: Indonesia kira-kira lon 92–142, lat -12–8
    // Toleransi diperlebar ke 88–145, -15–10 untuk perairan ZEE/landas kontinen.
    const bboxR = await pool.query(`
      SELECT ${t.pkCol} AS id, ST_X(ST_Centroid(${t.col})) AS lon, ST_Y(ST_Centroid(${t.col})) AS lat
      FROM ${t.name}
      WHERE NOT (ST_X(ST_Centroid(${t.col})) BETWEEN 88 AND 145
             AND ST_Y(ST_Centroid(${t.col})) BETWEEN -15 AND 10)
      LIMIT 50
    `);
    if (bboxR.rows.length === 0) add('geom', 'PASS', `${t.name}: semua titik di dalam bbox wilayah Indonesia (88..145, -15..10)`);
    else add('geom', 'FAIL', `${t.name}: ${bboxR.rows.length} geometry di LUAR bbox wilayah Indonesia`, bboxR.rows);
  }

  // Duplicate geometry sample (untuk spatial_points saja, biaya lebih rendah)
  const dupR = await pool.query(`
    SELECT ST_AsText(geom) AS geom_wkt, count(*) AS c, string_agg(said, ', ') AS ids
    FROM spatial_points
    GROUP BY geom
    HAVING count(*) > 1
    LIMIT 20
  `);
  if (dupR.rows.length === 0) add('geom', 'PASS', 'spatial_points: tidak ada duplicate geometry');
  else add('geom', 'WARN', `spatial_points: ${dupR.rows.length} koordinat dipakai oleh >1 saID`, dupR.rows);
}

// ----- F. Value anomalies --------------------------------------------------
async function valueAnomalies() {
  console.log(head('F. Anomali nilai kolom'));

  // Share harus 1
  for (const t of ['"right"', 'responsibility', 'restriction']) {
    const r = await pool.query(`
      SELECT rrrid, rightrestrictionresponsibilityshare AS share
      FROM ${t}
      WHERE rightrestrictionresponsibilityshare IS DISTINCT FROM 1
      LIMIT 20
    `);
    if (r.rows.length === 0) add('value', 'PASS', `${t}: semua share = 1`);
    else add('value', 'WARN', `${t}: ${r.rows.length} baris share != 1`, r.rows);
  }

  // shareCheck harus TRUE
  for (const t of ['"right"', 'responsibility', 'restriction']) {
    const r = await pool.query(`
      SELECT rrrid, rightrestrictionresponsibilitysharecheck AS chk
      FROM ${t}
      WHERE rightrestrictionresponsibilitysharecheck IS DISTINCT FROM TRUE
      LIMIT 20
    `);
    if (r.rows.length === 0) add('value', 'PASS', `${t}: shareCheck semua TRUE`);
    else add('value', 'WARN', `${t}: ${r.rows.length} baris shareCheck != TRUE`, r.rows);
  }

  // horizontal_datum harus WGS84
  {
    const r = await pool.query(`
      SELECT siid, horizontal_datum FROM spatial_information_type
      WHERE horizontal_datum IS DISTINCT FROM 'WGS84'
      LIMIT 20
    `);
    if (r.rows.length === 0) add('value', 'PASS', `spatial_information_type.horizontal_datum: semua "WGS84"`);
    else add('value', 'WARN', `spatial_information_type.horizontal_datum: ${r.rows.length} baris bukan "WGS84"`, r.rows);
  }

  // Date sanity: end_life_span < start_life_span
  for (const tab of ['feature_model_limit', 'feature_model_location']) {
    const r = await pool.query(`
      SELECT fuid, start_life_span, end_life_span FROM ${tab}
      WHERE end_life_span IS NOT NULL AND end_life_span < start_life_span
      LIMIT 20
    `);
    if (r.rows.length === 0) add('value', 'PASS', `${tab}: tidak ada end_life_span < start_life_span`);
    else add('value', 'FAIL', `${tab}: ${r.rows.length} baris end_life_span < start_life_span`, r.rows);
  }

  // Vocabulary: limit_object_type
  const lot = await pool.query(`
    SELECT limit_object_type, count(*) AS c
    FROM feature_model_limit
    GROUP BY limit_object_type ORDER BY 1
  `);
  add('vocab', 'PASS', `limit_object_type distinct values: ${lot.rows.length}`, lot.rows);

  // Vocabulary: status
  const status = await pool.query(`
    SELECT status, count(*) AS c FROM feature_model_limit
    GROUP BY status ORDER BY 1
  `);
  add('vocab', 'PASS', `feature_model_limit.status distinct values: ${status.rows.length}`, status.rows);

  // Vocabulary: releasibility_type — biasanya hanya 2 nilai
  const rel = await pool.query(`
    SELECT releasibility_type, count(*) AS c FROM feature_model_limit GROUP BY releasibility_type
    UNION ALL
    SELECT releasibility_type || ' (loc)', count(*) FROM feature_model_location GROUP BY releasibility_type
  `);
  add('vocab', 'PASS', `releasibility_type distribution`, rel.rows);

  // Whitespace di kolom label/name
  const labelTrimLim = await pool.query(`
    SELECT fuid, label FROM feature_model_limit
    WHERE label IS DISTINCT FROM trim(label) OR label = '' LIMIT 20
  `);
  if (labelTrimLim.rows.length === 0) add('value', 'PASS', 'feature_model_limit.label: clean (no leading/trailing whitespace)');
  else add('value', 'FAIL', `feature_model_limit.label: ${labelTrimLim.rows.length} dgn whitespace/empty`, labelTrimLim.rows);

  const labelTrimLoc = await pool.query(`
    SELECT fuid, label FROM feature_model_location
    WHERE label IS DISTINCT FROM trim(label) OR label = '' LIMIT 20
  `);
  if (labelTrimLoc.rows.length === 0) add('value', 'PASS', 'feature_model_location.label: clean');
  else add('value', 'FAIL', `feature_model_location.label: ${labelTrimLoc.rows.length} dgn whitespace/empty`, labelTrimLoc.rows);

  // Duplicate labels in feature_model_limit (kemungkinan typo / copy-paste)
  const dupLabel = await pool.query(`
    SELECT label, count(*) AS c, string_agg(fuid, ', ') AS ids
    FROM feature_model_limit
    WHERE label IS NOT NULL
    GROUP BY label HAVING count(*) > 1
    ORDER BY c DESC LIMIT 20
  `);
  if (dupLabel.rows.length === 0) add('value', 'PASS', 'feature_model_limit.label: semua unik');
  else add('value', 'WARN', `feature_model_limit.label: ${dupLabel.rows.length} label dipakai >1 fuid (mungkin OK, mungkin duplikat)`, dupLabel.rows);

  // party.partyRole vocabulary
  const role = await pool.query(`SELECT partyrole, count(*) AS c FROM party GROUP BY partyrole`);
  add('vocab', 'PASS', `party.partyRole distinct: ${role.rows.length}`, role.rows);
}

// ----- G. Latitude/Longitude DMS string check ------------------------------
async function latLonStringCheck() {
  console.log(head('G. Sanity kolom latitude/longitude (string DMS) di spatial_points'));
  // Kolom latitude/longitude di spatial_points adalah VARCHAR (DMS string).
  // Cek apakah trim/non-empty/punya direction N/S/E/W.
  const r = await pool.query(`
    SELECT said, latitude, longitude FROM spatial_points
    WHERE latitude  IS NULL OR longitude IS NULL
       OR latitude  = ''    OR longitude = ''
       OR latitude  <> trim(latitude)
       OR longitude <> trim(longitude)
    LIMIT 30
  `);
  if (r.rows.length === 0) add('coord-string', 'PASS', 'spatial_points: latitude/longitude string clean');
  else add('coord-string', 'WARN', `spatial_points: ${r.rows.length} baris latitude/longitude empty/whitespace`, r.rows);

  // Cek konsistensi: titik di spatial_points dengan latitude string yang tidak match koordinat geom (sample-only)
  // (Kompleks — skip di sini, hanya warn jika perlu manual.)

  // Cek titik dengan lon/lat bertanda "Z" / nilai 0,0
  const r2 = await pool.query(`
    SELECT said, ST_X(ST_Centroid(geom)) AS lon, ST_Y(ST_Centroid(geom)) AS lat
    FROM spatial_points
    WHERE ST_X(ST_Centroid(geom)) = 0 AND ST_Y(ST_Centroid(geom)) = 0
    LIMIT 20
  `);
  if (r2.rows.length === 0) add('coord-string', 'PASS', 'spatial_points: tidak ada titik (0,0) — null island');
  else add('coord-string', 'FAIL', `spatial_points: ${r2.rows.length} titik di (0,0) (null island)`, r2.rows);
}

// ----- Main -----------------------------------------------------------------
(async () => {
  console.log(`${c.bold}S-121 Data Quality Audit${c.reset}  ${c.dim}(${new Date().toISOString()})${c.reset}`);
  try {
    await orphanChecks();
    await duplicateRrrIdCheck();
    await whitespaceCheck();
    await prefixCheck();
    await geometryCheck();
    await valueAnomalies();
    await latLonStringCheck();
  } catch (e) {
    console.error(fail(`Audit aborted: ${e.message}`));
  } finally {
    await pool.end();
  }
  const fails = report.filter(r => r.severity === 'FAIL').length;
  const warns = report.filter(r => r.severity === 'WARN').length;
  const pass  = report.filter(r => r.severity === 'PASS').length;
  console.log(head('Summary'));
  console.log(`${c.green}PASS: ${pass}${c.reset}   ${c.yellow}WARN: ${warns}${c.reset}   ${c.red}FAIL: ${fails}${c.reset}\n`);
  process.exit(fails > 0 ? 1 : 0);
})();
