const express = require('express');
const { pool } = require('../db/pool');
const {
  parseCollectionBbox,
  resolveDisplaySimplify,
  parsePagination,
  ensureEnum,
  geomDisplayExpr,
  bboxPredicate,
  sendError,
  asyncRoute,
} = require('../lib/queryHelpers');
const { displayDetailMaxSources } = require('../lib/displayConfig');
const { AGREEMENT_KINDS, agreementKindWhereSql } = require('../lib/agreementPointKind');

const router = express.Router();

const LOCATION_TYPES = ['Baseline Point', 'Boundary Point', 'Location'];

// GET /api/locations[?type=&agreement=TS|CS|EEZ&bbox=&limit=&offset=&fuid_suffix=&fuid_not_suffix=]
router.get('/locations', asyncRoute(async (req, res) => {
  const type = ensureEnum('type', req.query.type, LOCATION_TYPES);
  const agreement = ensureEnum('agreement', req.query.agreement, AGREEMENT_KINDS);
  const bbox = parseCollectionBbox(req.query.bbox);
  const tolerance = resolveDisplaySimplify(req.query.simplify);
  const { limit, offset } = parsePagination(req.query.limit, req.query.offset, 5000, 25000);

  const params = [];
  const where = [];

  const fuidSuffix = req.query.fuid_suffix;
  const fuidNotSuffix = req.query.fuid_not_suffix;

  if (fuidSuffix) {
    params.push('%' + fuidSuffix);
    where.push('loc.fuID LIKE $' + params.length);
  }
  if (fuidNotSuffix) {
    params.push('%' + fuidNotSuffix);
    where.push('loc.fuID NOT LIKE $' + params.length);
  }

  if (type) {
    params.push(type);
    where.push(`loc.location_type_list = $${params.length}`);
  }
  if (agreement) {
    where.push(agreementKindWhereSql(agreement));
  }
  if (bbox) {
    const { sql, params: bboxParams } = bboxPredicate('pt.geom', bbox, params.length + 1);
    params.push(...bboxParams);
    where.push(sql);
  }

  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const geomSql = geomDisplayExpr('pt.geom', tolerance);
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const query = `
    WITH src_agg AS (
      SELECT fuid_location, string_agg(sID, ', ' ORDER BY sID) AS source_ids
      FROM fmlocation_to_source
      GROUP BY fuid_location
    )
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE(json_agg(ST_AsGeoJSON(t.*)::json), '[]'::json)
    ) AS geojson
    FROM (
      SELECT
        loc.fuID AS fuid,
        loc.label,
        loc.location_type_list,
        loc.status,
        (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS horizontal_datum,
        pt.saID AS said,
        (SELECT location_by_text FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS point_location,
        COALESCE(src_agg.source_ids, '') AS source_ids,
        ${geomSql} AS geom
      FROM feature_model_location loc
      JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
      JOIN spatial_points pt ON rel.said_point = pt.saID
      LEFT JOIN src_agg ON src_agg.fuid_location = loc.fuID
      ${whereClause}
      ORDER BY loc.fuID
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    ) AS t;
  `;

  const { rows } = await pool.query(query, params);
  const geojson = rows[0].geojson;
  const count = Array.isArray(geojson?.features) ? geojson.features.length : 0;
  res.locals.spatialFeatureCount = count;
  res.json(geojson);
}));

const locationDetail = asyncRoute(async (req, res) => {
  const fuid = req.params.fuid ?? decodeURIComponent(req.params[0] ?? '');
  const maxSources = displayDetailMaxSources();

  const [{ rows: baseRows }, { rows: sources }, { rows: limits }] = await Promise.all([
    pool.query(
      `SELECT
         loc.fuID AS fuid,
         loc.label,
         loc.location_type_list,
         loc.status,
         (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS horizontal_datum,
         pt.saID AS said,
         (SELECT location_by_text FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS point_location,
         ST_AsGeoJSON(pt.geom)::json AS geometry
       FROM feature_model_location loc
       LEFT JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
       LEFT JOIN spatial_points pt ON rel.said_point = pt.saID
      WHERE loc.fuID = $1`,
      [fuid],
    ),
    pool.query(
      `SELECT sf.sid,
              sf.sourcedocumentname,
              sf.sourceonlineresourcelinkageurl,
              fls.description
         FROM fmlocation_to_source fls
         JOIN source_flat sf ON fls.sid = sf.sid
        WHERE fls.fuid_location = $1
        ORDER BY sf.sid
        LIMIT $2`,
      [fuid, maxSources],
    ),
    pool.query(
      `SELECT lim.fuID AS fuid,
              lim.label,
              lim.limit_object_type,
              lim.status
         FROM fmlimit_to_fmlocation rel
         JOIN feature_model_limit lim ON rel.fuid_limit = lim.fuID
        WHERE rel.fuid_location = $1
        ORDER BY lim.fuID
        LIMIT 20`,
      [fuid],
    ),
  ]);

  if (baseRows.length === 0) {
    return sendError(res, 404, 'NOT_FOUND', `Location '${fuid}' not found`);
  }

  const loc = baseRows[0];
  const geometry = loc.geometry;
  delete loc.geometry;

  res.json({
    type: 'Feature',
    geometry,
    properties: loc,
    sources,
    parent_limits: limits,
  });
});

router.get('/locations/:fuid', locationDetail);
router.get('/locations/*', locationDetail);

module.exports = router;
