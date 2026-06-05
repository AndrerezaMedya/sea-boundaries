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
  const res1 = await pool.query('SELECT DISTINCT limit_object_type FROM feature_model_limit');
  console.log('Limit Types:', res1.rows.map(r => r.limit_object_type));

  const res2 = await pool.query('SELECT DISTINCT location_type_list FROM feature_model_location');
  console.log('Location Types:', res2.rows.map(r => r.location_type_list));
  await pool.end();
})();
