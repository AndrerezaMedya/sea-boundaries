const express = require('express');
const { pool } = require('../db/pool');
const {
  parseCollectionBbox,
  resolveDisplaySimplify,
  ensureEnum,
  geomDisplayExpr,
  bboxPredicate,
  sendError,
  asyncRoute,
} = require('../lib/queryHelpers');
const { displayDetailMaxSources } = require('../lib/displayConfig');

const router = express.Router();

// Limit type prefixes per S121_DATABASE_SCHEMA.md §4.1
const LIMIT_TYPE_PREFIXES = ['BSL', 'TS', 'CZ', 'EEZ', 'CS', 'ECS', 'FISH', 'MOF'];

// GET /api/limits[?type=&status=&bbox=&simplify=]
// Display channel: bbox required (when REQUIRE_BBOX), simplified/reduced geometry, whitelisted attributes.
router.get('/limits', asyncRoute(async (req, res) => {
  const type = ensureEnum('type', req.query.type, LIMIT_TYPE_PREFIXES);
  const status = req.query.status ? String(req.query.status) : null;
  const bbox = parseCollectionBbox(req.query.bbox);
  const tolerance = resolveDisplaySimplify(req.query.simplify);

  const params = [];
  const where = [];

  if (type) {
    params.push(`LIM_${type}_%`);
    where.push(`l.fuID LIKE $${params.length}`);
  }
  if (status) {
    params.push(status);
    where.push(`l.status = $${params.length}`);
  }

  if (bbox) {
    const { sql, params: bboxParams } = bboxPredicate('geom_data.geom', bbox, params.length + 1);
    params.push(...bboxParams);
    where.push(sql);
  }

  const geomSql = geomDisplayExpr('geom_data.geom', tolerance);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const query = `
    WITH src_agg AS (
      SELECT fuid_limit, string_agg(sID, ', ' ORDER BY sID) AS source_ids
      FROM fmlimit_to_source
      GROUP BY fuid_limit
    )
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
    ) AS geojson
    FROM (
      SELECT
        l.fuID AS fuid,
        l.label,
        l.limit_object_type,
        l.status,
        l.releasibility_type,
        (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlimit_to_siid j ON j.siid = si.siid WHERE j.fuid_limit = l.fuID LIMIT 1) AS horizontal_datum,
        geom_data.saID AS said,
        COALESCE(src_agg.source_ids, '') AS source_ids,
        ${geomSql} AS geom
      FROM feature_model_limit l
      JOIN fmlimit_to_sacurve rel ON l.fuID = rel.fuid_limit
      JOIN (
        SELECT saID, geom FROM spatial_curves
        UNION ALL
        SELECT saID, geom FROM spatial_baselines
      ) geom_data ON rel.said_curve = geom_data.saID
      LEFT JOIN src_agg ON src_agg.fuid_limit = l.fuID
      ${whereClause}
    ) AS t;
  `;

  const { rows } = await pool.query(query, params);
  const geojson = rows[0].geojson;
  const count = Array.isArray(geojson?.features) ? geojson.features.length : 0;
  res.locals.spatialFeatureCount = count;
  res.json(geojson);
}));

// GET /api/limits/:fuid — display detail (reduced geometry; slim related records).
const limitDetail = asyncRoute(async (req, res) => {
  const fuid = req.params.fuid ?? decodeURIComponent(req.params[0] ?? '');
  const maxSources = displayDetailMaxSources();

  const [{ rows: baseRows }, { rows: sources }] = await Promise.all([
    pool.query(
      `SELECT
         l.fuID AS fuid,
         l.label,
         l.limit_object_type,
         l.status,
         l.releasibility_type,
         (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlimit_to_siid j ON j.siid = si.siid WHERE j.fuid_limit = l.fuID LIMIT 1) AS horizontal_datum,
         ST_AsGeoJSON(ST_Union(geom_data.geom))::json AS geometry
       FROM feature_model_limit l
       LEFT JOIN fmlimit_to_sacurve rel ON l.fuID = rel.fuid_limit
       LEFT JOIN (
         SELECT saID, geom FROM spatial_curves
         UNION ALL
         SELECT saID, geom FROM spatial_baselines
       ) geom_data ON rel.said_curve = geom_data.saID
      WHERE l.fuID = $1
      GROUP BY l.fuID, l.label, l.limit_object_type, l.status, l.releasibility_type`,
      [fuid],
    ),
    pool.query(
      `SELECT sf.sid,
              sf.sourcedocumentname,
              sf.sourceonlineresourcelinkageurl,
              fls.description
         FROM fmlimit_to_source fls
         JOIN source_flat sf ON fls.sid = sf.sid
        WHERE fls.fuid_limit = $1
        ORDER BY sf.sid
        LIMIT $2`,
      [fuid, maxSources],
    ),
  ]);

  if (baseRows.length === 0) {
    return sendError(res, 404, 'NOT_FOUND', `Limit '${fuid}' not found`);
  }

  const limit = baseRows[0];
  const geometry = limit.geometry;
  delete limit.geometry;

  res.json({
    type: 'Feature',
    geometry,
    properties: limit,
    sources,
    vertices: [],
  });
});

router.get('/limits/:fuid', limitDetail);
router.get('/limits/*', limitDetail);

module.exports = router;
