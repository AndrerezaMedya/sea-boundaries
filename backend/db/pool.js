const { Pool } = require('pg');

const dbConfig = {
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  max: Number(process.env.DB_POOL_MAX || 10),
  idleTimeoutMillis: Number(process.env.DB_IDLE_TIMEOUT_MS || 30000),
  connectionTimeoutMillis: Number(process.env.DB_CONNECT_TIMEOUT_MS || 5000),
};

// Cloud Run + Cloud SQL (pick one):
//   INSTANCE_UNIX_SOCKET=/cloudsql/project:region:instance
//   DB_HOST=/cloudsql/project:region:instance  (+ DB_PORT=5432) — used by deploy.bat
// Local dev: DB_HOST=127.0.0.1, DB_PORT=35432 (via cloud-sql-proxy).
if (process.env.INSTANCE_UNIX_SOCKET) {
  dbConfig.host = process.env.INSTANCE_UNIX_SOCKET;
} else {
  dbConfig.host = process.env.DB_HOST;
  if (process.env.DB_PORT) {
    dbConfig.port = Number(process.env.DB_PORT);
  }
}

const pool = new Pool(dbConfig);

pool.on('error', (err) => {
  console.error('Unexpected idle client error', err);
});

module.exports = { pool };
