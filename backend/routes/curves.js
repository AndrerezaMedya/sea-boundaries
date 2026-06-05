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

// GET /api/curves[?bbox=&simplify=]
router.get('/curves', asyncRoute(async (req, res) => {
  const bbox = parseBbox(req.query.bbox);
  const tolerance = parseSimplifyTolerance(req.query.simplify);

  const params = [];
  const where = [];

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
      SELECT saID, location, ${geomSql} AS geom
      FROM spatial_curves
      ${whereClause}
    ) AS t;
  `;

  const { rows } = await pool.query(query, params);
  res.json(rows[0].geojson);
}));

module.exports = router;
