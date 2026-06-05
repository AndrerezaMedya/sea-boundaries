const express = require('express');
const { pool } = require('../db/pool');
const {
  parseBbox,
  parseSimplifyTolerance,
  geomExpr,
  bboxPredicate,
  asyncRoute,
} = require('../lib/queryHelpers');

const router = express.Router();

// GET /api/baselines[?bsl_type=&bbox=&simplify=]
router.get('/baselines', asyncRoute(async (req, res) => {
  const bslType = req.query.bsl_type ? String(req.query.bsl_type) : null;
  const bbox = parseBbox(req.query.bbox);
  const tolerance = parseSimplifyTolerance(req.query.simplify);

  const params = [];
  const where = [];

  if (bslType) {
    params.push(bslType);
    where.push(`bsl_type = $${params.length}`);
  }
  if (bbox) {
    const { sql, params: bboxParams } = bboxPredicate('geom', bbox, params.length + 1);
    params.push(...bboxParams);
    where.push(sql);
  }

  const geomSql = geomExpr('geom', tolerance);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const query = `
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
    ) AS geojson
    FROM (
      SELECT saID, location, bsl_type, ${geomSql} AS geom
      FROM spatial_baselines
      ${whereClause}
    ) AS t;
  `;

  const { rows } = await pool.query(query, params);
  res.json(rows[0].geojson);
}));

module.exports = router;
