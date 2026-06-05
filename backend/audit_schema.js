/**
 * S-121 Schema Audit Script
 * -------------------------
 * Verifikasi skema aktual di Cloud SQL terhadap dokumen `real_db_schema/S121_DATABASE_SCHEMA.md`.
 *
 * Cek:
 *   1. Ekstensi PostGIS terinstal & versi.
 *   2. Inventaris tabel S-121 (+ spatial_ref_sys) di schema `public`.
 *   3. Primary Key tiap tabel.
 *   4. Foreign Key (semua FK yang dideklarasikan).
 *   5. GIST index pada kolom geometri.
 *   6. SRID kolom geom = 4326.
 *   7. Row count vs ekspektasi dokumen.
 *
 * Cara jalan (dari folder backend/):
 *   node audit_schema.js
 *
 * Pastikan Cloud SQL Proxy listening pada DB_HOST:DB_PORT (lihat .env).
 */

require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
  // statement_timeout: 30000,
});

// ----- Ekspektasi dari S121_DATABASE_SCHEMA.md ------------------------------

const EXPECTED_TABLES = [
  // Base (11)
  { name: 'party', pk: ['pID'], expectedRows: 11 },
  { name: 'right', pk: ['rrrID'], expectedRows: 3 },
  { name: 'responsibility', pk: ['rrrID'], expectedRows: 6 },
  { name: 'restriction', pk: ['rrrID'], expectedRows: 8 },
  { name: 'basic_administrative_unit', pk: ['uID'], expectedRows: 9 },
  { name: 'source_reference', pk: ['sourceReferenceID'], expectedRows: 4 },
  { name: 'source_online_resource', pk: ['sourceOnlineResourceID'], expectedRows: 51 },
  { name: 'source', pk: ['sID'], expectedRows: 51 },
  { name: 'feature_model_limit', pk: ['fuID'], expectedRows: 238 },
  { name: 'feature_model_zone', pk: ['fuID'], expectedRows: 6 },
  { name: 'governance', pk: ['govID'], expectedRows: 7 },
  { name: 'feature_model_location', pk: ['fuID'], expectedRows: 21293 },
  { name: 'spatial_points', pk: ['saID'], expectedRows: 16530, geom: true },
  { name: 'spatial_curves', pk: ['saID'], expectedRows: 89, geom: true },
  { name: 'spatial_baselines', pk: ['saID'], expectedRows: 193, geom: true },
  // Junction (12)
  { name: 'fmlocation_to_sapoint', pk: ['fuid_location', 'said_point'], expectedRows: 21293 },
  { name: 'fmlimit_to_fmlocation', pk: ['fuid_limit', 'fuid_location'], expectedRows: 21560 },
  { name: 'fmlimit_to_sacurve', pk: ['fuid_limit', 'said_curve'], expectedRows: 299 },
  { name: 'source_to_party', pk: ['sID', 'pID'], expectedRows: 103 },
  { name: 'fmlocation_to_source', pk: ['fuid_location', 'sID'], expectedRows: 42750 },
  { name: 'baunit_to_source', pk: ['uID', 'sID'], expectedRows: 19 },
  { name: 'fmlimit_to_source', pk: ['fuid_limit', 'sID'], expectedRows: 477 },
  { name: 'rrr_to_source', pk: ['rrrID', 'sID'], expectedRows: 45 },
  { name: 'rrr_to_bau', pk: ['rrrID', 'uID'], expectedRows: 47 },
  { name: 'fmzone_to_bau', pk: ['fuid_zone', 'uID'], expectedRows: 6 },
  { name: 'fmzone_to_fmlimit', pk: ['fuid_zone', 'fuid_limit'], expectedRows: 251 },
  { name: 'governance_to_bau', pk: ['govID', 'uID'], expectedRows: 27 },
];

// FK yang seharusnya ada (child_table.col -> parent_table.col).
// `parents` artinya FK ini valid jika menunjuk ke salah satu dari beberapa parent
// (mis. rrrID di rrr_to_source bisa ke right/responsibility/restriction — desain
// concrete-table-inheritance — secara teknis FK fisik biasanya tidak bisa multi-parent,
// jadi entri ini hanya untuk informasi).
const EXPECTED_FKS = [
  { table: 'right', column: 'pID', refTable: 'party', refColumn: 'pID' },
  { table: 'responsibility', column: 'pID', refTable: 'party', refColumn: 'pID' },
  { table: 'restriction', column: 'pID', refTable: 'party', refColumn: 'pID' },
  { table: 'basic_administrative_unit', column: 'pID', refTable: 'party', refColumn: 'pID' },
  { table: 'fmlocation_to_sapoint', column: 'fuid_location', refTable: 'feature_model_location', refColumn: 'fuID' },
  { table: 'fmlocation_to_sapoint', column: 'said_point', refTable: 'spatial_points', refColumn: 'saID' },
  { table: 'fmlimit_to_fmlocation', column: 'fuid_limit', refTable: 'feature_model_limit', refColumn: 'fuID' },
  { table: 'fmlimit_to_fmlocation', column: 'fuid_location', refTable: 'feature_model_location', refColumn: 'fuID' },
  { table: 'fmlimit_to_sacurve', column: 'fuid_limit', refTable: 'feature_model_limit', refColumn: 'fuID' },
  { table: 'source_to_party', column: 'sID', refTable: 'source', refColumn: 'sID' },
  { table: 'source_to_party', column: 'pID', refTable: 'party', refColumn: 'pID' },
  { table: 'fmlocation_to_source', column: 'fuid_location', refTable: 'feature_model_location', refColumn: 'fuID' },
  { table: 'fmlocation_to_source', column: 'sID', refTable: 'source', refColumn: 'sID' },
  { table: 'baunit_to_source', column: 'uID', refTable: 'basic_administrative_unit', refColumn: 'uID' },
  { table: 'baunit_to_source', column: 'sID', refTable: 'source', refColumn: 'sID' },
  { table: 'fmlimit_to_source', column: 'fuid_limit', refTable: 'feature_model_limit', refColumn: 'fuID' },
  { table: 'fmlimit_to_source', column: 'sID', refTable: 'source', refColumn: 'sID' },
  { table: 'rrr_to_source', column: 'sID', refTable: 'source', refColumn: 'sID' },
  { table: 'rrr_to_bau', column: 'uID', refTable: 'basic_administrative_unit', refColumn: 'uID' },
];

// ----- Helper formatting ----------------------------------------------------

const c = {
  reset: '\x1b[0m', bold: '\x1b[1m', dim: '\x1b[2m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m',
  cyan: '\x1b[36m', gray: '\x1b[90m',
};
const ok = (m) => `${c.green}[ OK ]${c.reset} ${m}`;
const fail = (m) => `${c.red}[FAIL]${c.reset} ${m}`;
const warn = (m) => `${c.yellow}[WARN]${c.reset} ${m}`;
const info = (m) => `${c.cyan}[INFO]${c.reset} ${m}`;
const head = (m) => `\n${c.bold}=== ${m} ===${c.reset}`;

const stats = { pass: 0, fail: 0, warn: 0 };
const PASS = (m) => { stats.pass++; console.log(ok(m)); };
const FAIL = (m) => { stats.fail++; console.log(fail(m)); };
const WARN = (m) => { stats.warn++; console.log(warn(m)); };

// ----- Audit checks ---------------------------------------------------------

async function checkConnection() {
  console.log(head('1. Database Connection'));
  const r = await pool.query('SELECT current_database() db, current_user usr, version() v');
  PASS(`Connected to "${r.rows[0].db}" as "${r.rows[0].usr}"`);
  console.log(c.dim + '       ' + r.rows[0].v + c.reset);
}

async function checkPostGIS() {
  console.log(head('2. PostGIS Extension'));
  const r = await pool.query(
    "SELECT extname, extversion FROM pg_extension WHERE extname IN ('postgis','postgis_topology')"
  );
  if (r.rows.find((x) => x.extname === 'postgis')) {
    const pg = r.rows.find((x) => x.extname === 'postgis');
    PASS(`postgis v${pg.extversion} installed`);
  } else {
    FAIL('postgis extension NOT installed');
  }
}

async function checkTables() {
  console.log(head('3. Table Inventory (20 S-121 tables)'));
  const r = await pool.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema='public' AND table_type='BASE TABLE'
    ORDER BY table_name
  `);
  const actual = new Set(r.rows.map((x) => x.table_name));
  const expected = new Set(EXPECTED_TABLES.map((t) => t.name));

  for (const t of EXPECTED_TABLES) {
    if (actual.has(t.name)) PASS(`table "${t.name}" exists`);
    else FAIL(`table "${t.name}" MISSING`);
  }
  // Tabel ekstra (selain spatial_ref_sys)
  for (const name of actual) {
    if (!expected.has(name) && name !== 'spatial_ref_sys') {
      WARN(`extra table not in spec: "${name}"`);
    }
  }
}

async function checkPrimaryKeys() {
  console.log(head('4. Primary Keys'));
  const r = await pool.query(`
    SELECT tc.table_name, kcu.column_name, kcu.ordinal_position
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema   = kcu.table_schema
    WHERE tc.constraint_type='PRIMARY KEY' AND tc.table_schema='public'
    ORDER BY tc.table_name, kcu.ordinal_position
  `);
  const pkMap = {};
  for (const row of r.rows) {
    (pkMap[row.table_name] ||= []).push(row.column_name);
  }
  for (const t of EXPECTED_TABLES) {
    const actualPk = pkMap[t.name] || [];
    const expPkLower = t.pk.map((x) => x.toLowerCase());
    const actPkLower = actualPk.map((x) => x.toLowerCase());
    if (actualPk.length === 0) {
      FAIL(`"${t.name}" has NO primary key (expected: ${t.pk.join(', ')})`);
    } else if (
      expPkLower.length === actPkLower.length &&
      expPkLower.every((col, i) => col === actPkLower[i])
    ) {
      PASS(`"${t.name}" PK = (${actualPk.join(', ')})`);
    } else {
      WARN(`"${t.name}" PK mismatch — expected (${t.pk.join(', ')}), got (${actualPk.join(', ')})`);
    }
  }
}

async function checkForeignKeys() {
  console.log(head('5. Foreign Keys'));
  const r = await pool.query(`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name  AS ref_table,
      ccu.column_name AS ref_column
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage ccu
      ON ccu.constraint_name = tc.constraint_name AND ccu.table_schema = tc.table_schema
    WHERE tc.constraint_type='FOREIGN KEY' AND tc.table_schema='public'
  `);
  const has = (fk) => r.rows.some(
    (x) =>
      x.table_name.toLowerCase() === fk.table.toLowerCase() &&
      x.column_name.toLowerCase() === fk.column.toLowerCase() &&
      x.ref_table.toLowerCase() === fk.refTable.toLowerCase() &&
      x.ref_column.toLowerCase() === fk.refColumn.toLowerCase()
  );
  for (const fk of EXPECTED_FKS) {
    const desc = `${fk.table}.${fk.column} → ${fk.refTable}.${fk.refColumn}`;
    if (has(fk)) PASS(`FK ${desc}`);
    else FAIL(`FK MISSING: ${desc}`);
  }

  console.log(info(`Total FK terdaftar di DB: ${r.rows.length}`));
  // Catatan RRR: rrrID di rrr_to_source / rrr_to_bau dirancang multi-parent (3 tabel).
  // FK fisik biasanya tidak bisa multi-parent — laporkan saja apakah ada FK rrrID:
  const rrrFks = r.rows.filter((x) => x.column_name.toLowerCase() === 'rrrid');
  if (rrrFks.length === 0) {
    WARN('Tidak ada FK fisik untuk kolom rrrID (sesuai desain concrete-table-inheritance — integritas dijaga app-level)');
  } else {
    console.log(info(`FK fisik untuk rrrID: ${rrrFks.length} (perlu cek manual jika benar-benar diinginkan)`));
  }
}

async function checkGeometryAndGist() {
  console.log(head('6. Geometry Columns, SRID & GIST Indexes'));
  // Ambil kolom geometri dari geometry_columns view PostGIS.
  const gcols = await pool.query(`
    SELECT f_table_name AS table_name, f_geometry_column AS column_name, srid, type
    FROM geometry_columns
    WHERE f_table_schema='public'
  `);
  const expectedGeomTables = ['spatial_points', 'spatial_curves', 'spatial_baselines'];
  for (const t of expectedGeomTables) {
    const gc = gcols.rows.find((x) => x.table_name === t);
    if (!gc) {
      FAIL(`"${t}" tidak punya kolom geometry`);
      continue;
    }
    if (gc.srid !== 4326)
      FAIL(`"${t}.${gc.column_name}" SRID=${gc.srid} (expected 4326)`);
    else
      PASS(`"${t}.${gc.column_name}" SRID=4326, type=${gc.type}`);
  }

  // Cek GIST index
  const idx = await pool.query(`
    SELECT
      t.relname  AS table_name,
      i.relname  AS index_name,
      am.amname  AS method,
      pg_get_indexdef(i.oid) AS def
    FROM pg_class t
    JOIN pg_index ix      ON t.oid = ix.indrelid
    JOIN pg_class i       ON i.oid = ix.indexrelid
    JOIN pg_am am         ON am.oid = i.relam
    JOIN pg_namespace n   ON n.oid = t.relnamespace
    WHERE n.nspname='public' AND t.relname = ANY($1)
  `, [expectedGeomTables]);
  for (const t of expectedGeomTables) {
    const gistIdx = idx.rows.filter((x) => x.table_name === t && x.method === 'gist');
    if (gistIdx.length > 0) {
      PASS(`"${t}" has GIST index: ${gistIdx.map((g) => g.index_name).join(', ')}`);
    } else {
      FAIL(`"${t}" NO GIST index on geometry → spatial query akan lambat`);
    }
  }
}

async function checkRowCounts() {
  console.log(head('7. Row Counts vs Ekspektasi Dokumen'));
  for (const t of EXPECTED_TABLES) {
    try {
      const q = `SELECT count(*)::bigint AS n FROM "${t.name}"`;
      const { rows } = await pool.query(q);
      const n = Number(rows[0].n);
      const exp = t.expectedRows;
      // Toleransi ±2% untuk count besar, atau ±2 untuk count kecil.
      const tol = exp >= 100 ? Math.max(2, Math.round(exp * 0.02)) : 2;
      const diff = n - exp;
      const within = Math.abs(diff) <= tol;
      const sign = diff >= 0 ? '+' : '';
      const msg = `"${t.name}" rows=${n}  (expected ~${exp}, Δ=${sign}${diff})`;
      if (n === 0) FAIL(msg + ' — kosong!');
      else if (within) PASS(msg);
      else WARN(msg);
    } catch (e) {
      FAIL(`"${t.name}" gagal di-query: ${e.message}`);
    }
  }
}

async function checkOrphans() {
  console.log(head('8. Sanity: Orphan Rows pada Junction Utama'));
  // Hanya beberapa cek sampling (cepat).
  const checks = [
    {
      label: 'fmlocation_to_sapoint → spatial_points missing',
      sql: `SELECT count(*)::bigint AS n FROM fmlocation_to_sapoint j
            LEFT JOIN spatial_points p ON p.said = j.said_point
            WHERE p.said IS NULL`,
    },
    {
      label: 'fmlimit_to_sacurve → curve/baseline missing',
      sql: `SELECT count(*)::bigint AS n FROM fmlimit_to_sacurve j
            LEFT JOIN spatial_curves c    ON c.said = j.said_curve
            LEFT JOIN spatial_baselines b ON b.said = j.said_curve
            WHERE c.said IS NULL AND b.said IS NULL`,
    },
    {
      label: 'fmlimit_to_fmlocation → location missing',
      sql: `SELECT count(*)::bigint AS n FROM fmlimit_to_fmlocation j
            LEFT JOIN feature_model_location l ON l.fuid = j.fuid_location
            WHERE l.fuid IS NULL`,
    },
  ];
  for (const ck of checks) {
    try {
      const { rows } = await pool.query(ck.sql);
      const n = Number(rows[0].n);
      if (n === 0) PASS(`${ck.label}: 0`);
      else FAIL(`${ck.label}: ${n} orphan rows`);
    } catch (e) {
      WARN(`${ck.label}: query error — ${e.message}`);
    }
  }
}

// ----- Main -----------------------------------------------------------------

(async () => {
  const t0 = Date.now();
  console.log(`${c.bold}S-121 Schema Audit${c.reset}  ${c.dim}(${new Date().toISOString()})${c.reset}`);
  console.log(c.dim + `Target: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}` + c.reset);

  try {
    await checkConnection();
    await checkPostGIS();
    await checkTables();
    await checkPrimaryKeys();
    await checkForeignKeys();
    await checkGeometryAndGist();
    await checkRowCounts();
    await checkOrphans();
  } catch (e) {
    console.error(fail(`Audit aborted: ${e.message}`));
    stats.fail++;
  } finally {
    await pool.end();
  }

  const dt = ((Date.now() - t0) / 1000).toFixed(2);
  console.log(head('Summary'));
  console.log(`${c.green}PASS: ${stats.pass}${c.reset}   ${c.yellow}WARN: ${stats.warn}${c.reset}   ${c.red}FAIL: ${stats.fail}${c.reset}   ${c.dim}(${dt}s)${c.reset}\n`);
  process.exit(stats.fail > 0 ? 1 : 0);
})();
