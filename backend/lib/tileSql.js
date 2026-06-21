const { MVT_SOURCE_LAYER } = require('./tileLayerRegistry');
const { defaultDisplaySimplifyTolerance } = require('./displayConfig');
const { agreementKindSqlExpr, boundaryPointMvtLayerIdExpr } = require('./agreementPointKind');

const BOUNDARY_LAYER_ID_CASE = `
  CASE
    WHEN l.fuID LIKE 'LIM_BSL_%' THEN 'baseline'
    WHEN l.fuID LIKE 'LIM_TS_%' THEN 'territorial_sea'
    WHEN l.fuID LIKE 'LIM_CZ_%' THEN 'contiguous_zone'
    WHEN l.fuID LIKE 'LIM_EEZ_%' THEN 'eez_limit'
    WHEN l.fuID LIKE 'LIM_CS_%' THEN 'continental_shelf'
    WHEN l.fuID LIKE 'LIM_ECS_%' THEN 'landas_kontinen_ekstensi'
    WHEN l.fuID LIKE 'LIM_FISH_%' THEN 'fisheries'
    ELSE 'limit_other'
  END`;

/**
 * Combined boundaries tile — all limit types in one MVT.
 * Params: [z, x, y, simplifyTolerance]
 */
function buildBoundariesTilesetQuery() {
  const tolerance = defaultDisplaySimplifyTolerance();
  return {
    sql: `
      WITH tile AS (
        SELECT ST_TileEnvelope($1::int, $2::int, $3::int) AS env3857
      ),
      rows AS (
        SELECT
          ${BOUNDARY_LAYER_ID_CASE} AS layer_id,
          l.fuID AS fuid,
          geom_data.saID AS said,
          l.label,
          l.limit_object_type,
          l.status,
            l.end_life_span,
          (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlimit_to_siid j ON j.siid = si.siid WHERE j.fuid_limit = l.fuID LIMIT 1) AS horizontal_datum,
          l.fuID || '::' || geom_data.saID AS "_rowId",
          ST_AsMVTGeom(
            ST_Transform(
              ST_SimplifyPreserveTopology(geom_data.geom, $4::float8),
              3857
            ),
            tile.env3857,
            4096,
            256,
            true
          ) AS geom
        FROM feature_model_limit l
        JOIN fmlimit_to_sacurve rel ON l.fuID = rel.fuid_limit
        JOIN (
          SELECT saID, geom FROM spatial_curves
          UNION ALL
          SELECT saID, geom FROM spatial_baselines
        ) geom_data ON rel.said_curve = geom_data.saID
        CROSS JOIN tile
        WHERE l.fuID LIKE 'LIM_%'
          AND geom_data.geom IS NOT NULL
          AND ST_Intersects(ST_Transform(geom_data.geom, 3857), tile.env3857)
      )
      SELECT ST_AsMVT(rows.*, '${MVT_SOURCE_LAYER}', 4096, 'geom') AS mvt
      FROM rows
      WHERE geom IS NOT NULL;
    `,
    params: (z, x, y) => [z, x, y, tolerance],
  };
}

/** MVT buffer grows slightly with z so points are not clipped at mid-zoom tiles. */
function pointTileBuffer(z) {
  return Math.min(1024, 192 + z * 64);
}

/**
 * Combined points tile — basepoints + boundary points.
 * Points are NOT simplified/reduced (breaks MVT at some native zoom levels).
 * Params: [z, x, y]
 */
function buildPointsTilesetQuery(z) {
  const buffer = pointTileBuffer(z);
  return {
    sql: `
      WITH tile AS (
        SELECT ST_TileEnvelope($1::int, $2::int, $3::int) AS env3857
      ),
      point_src AS (
        SELECT
          loc.fuID,
          loc.label,
          loc.location_type_list,
          loc.status,
            loc.end_life_span,
          (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS horizontal_datum,
          pt.saID,
          (SELECT location_by_text FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS point_location,
          ST_Centroid(pt.geom) AS geom_4326
        FROM feature_model_location loc
        JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
        JOIN spatial_points pt ON rel.said_point = pt.saID
        WHERE loc.location_type_list IN ('Baseline Point', 'Boundary Point', 'Location')
          AND pt.geom IS NOT NULL
          AND NOT ST_IsEmpty(pt.geom)
      ),
      rows AS (
        SELECT
          CASE
            WHEN ps.location_type_list = 'Baseline Point' THEN 'basepoints'
            WHEN ps.location_type_list = 'Boundary Point' THEN ${boundaryPointMvtLayerIdExpr('ps')}
            WHEN ps.location_type_list = 'Location' THEN 'titik_referensi'
            ELSE 'location_other'
          END AS layer_id,
          ps.fuID AS fuid,
          ps.saID AS said,
          ps.label,
          ps.location_type_list,
          ps.status,
          ps.end_life_span,
          ps.horizontal_datum,
          ps.point_location,
          ${agreementKindSqlExpr('ps')} AS agreement_kind,
          ps.fuID AS "_rowId",
          ST_AsMVTGeom(
            ST_Transform(ps.geom_4326, 3857),
            tile.env3857,
            4096,
            ${buffer},
            true
          ) AS geom
        FROM point_src ps
        CROSS JOIN tile
        WHERE ST_Intersects(ST_Transform(ps.geom_4326, 3857), tile.env3857)
      )
      SELECT ST_AsMVT(rows.*, '${MVT_SOURCE_LAYER}', 4096, 'geom') AS mvt
      FROM rows
      WHERE geom IS NOT NULL;
    `,
    params: (z, x, y) => [z, x, y],
  };
}

function buildLimitMvtQuery(limitPrefix) {
  const tolerance = defaultDisplaySimplifyTolerance();
  return {
    sql: `
      WITH tile AS (
        SELECT ST_TileEnvelope($1::int, $2::int, $3::int) AS env3857
      ),
      rows AS (
        SELECT
          l.fuID AS fuid,
          geom_data.saID AS said,
          l.label,
          l.limit_object_type,
          l.status,
            l.end_life_span,
          (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlimit_to_siid j ON j.siid = si.siid WHERE j.fuid_limit = l.fuID LIMIT 1) AS horizontal_datum,
          l.fuID || '::' || geom_data.saID AS "_rowId",
          ST_AsMVTGeom(
            ST_Transform(
              ST_SimplifyPreserveTopology(geom_data.geom, $5::float8),
              3857
            ),
            tile.env3857,
            4096,
            256,
            true
          ) AS geom
        FROM feature_model_limit l
        JOIN fmlimit_to_sacurve rel ON l.fuID = rel.fuid_limit
        JOIN (
          SELECT saID, geom FROM spatial_curves
          UNION ALL
          SELECT saID, geom FROM spatial_baselines
        ) geom_data ON rel.said_curve = geom_data.saID
        CROSS JOIN tile
        WHERE l.fuID LIKE $4
          AND geom_data.geom IS NOT NULL
          AND ST_Intersects(ST_Transform(geom_data.geom, 3857), tile.env3857)
      )
      SELECT ST_AsMVT(rows.*, '${MVT_SOURCE_LAYER}', 4096, 'geom') AS mvt
      FROM rows
      WHERE geom IS NOT NULL;
    `,
    params: (z, x, y, limitPrefix) => [
      z, x, y, `LIM_${limitPrefix}_%`, tolerance,
    ],
  };
}

function buildLocationMvtQuery() {
  const tolerance = defaultDisplaySimplifyTolerance();
  return {
    sql: `
      WITH tile AS (
        SELECT ST_TileEnvelope($1::int, $2::int, $3::int) AS env3857
      ),
      rows AS (
        SELECT
          loc.fuID AS fuid,
          pt.saID AS said,
          loc.label,
          loc.location_type_list,
          loc.status,
            loc.end_life_span,
          (SELECT horizontal_datum FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS horizontal_datum,
          (SELECT location_by_text FROM spatial_information_type si JOIN fmlocation_to_siid j ON j.siid = si.siid WHERE j.fuid_location = loc.fuID LIMIT 1) AS point_location,
          loc.fuID AS "_rowId",
          ST_AsMVTGeom(
            ST_Transform(
              ST_SimplifyPreserveTopology(pt.geom, $5::float8),
              3857
            ),
            tile.env3857,
            4096,
            256,
            true
          ) AS geom
        FROM feature_model_location loc
        JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
        JOIN spatial_points pt ON rel.said_point = pt.saID
        CROSS JOIN tile
        WHERE loc.location_type_list = $4
          AND pt.geom IS NOT NULL
          AND ST_Intersects(ST_Transform(pt.geom, 3857), tile.env3857)
      )
      SELECT ST_AsMVT(rows.*, '${MVT_SOURCE_LAYER}', 4096, 'geom') AS mvt
      FROM rows
      WHERE geom IS NOT NULL;
    `,
    params: (z, x, y, locationType) => [
      z, x, y, locationType, tolerance,
    ],
  };
}

function buildTilesetQuery(tileset, z) {
  if (tileset === 'boundaries') return buildBoundariesTilesetQuery();
  if (tileset === 'points') return buildPointsTilesetQuery(z);
  throw new Error(`Unknown tileset: ${tileset}`);
}

function buildMvtQuery(layerId, spec) {
  if (spec.kind === 'limit') {
    return buildLimitMvtQuery(spec.limitPrefix);
  }
  if (spec.kind === 'location') {
    return buildLocationMvtQuery();
  }
  throw new Error(`Unsupported tile layer: ${layerId}`);
}

module.exports = {
  buildTilesetQuery,
  buildMvtQuery,
};
