const { pool } = require('../db/pool');
const {
  geomDisplayExpr,
  resolveDisplaySimplify,
  throwBadRequest,
} = require('./queryHelpers');
const {
  geoMaxInputFeatures,
  geoMaxOutputFeatures,
  geoMaxIntersectInputFeatures,
  geoMaxIntersectPairs,
} = require('./geoConfig');
const { buildLayerGeomSubquery } = require('./geoLayerResolve');

function maybeTruncated(inputCount) {
  return inputCount >= geoMaxInputFeatures();
}

function inputCte(layerId, bbox, fuids, maxFeaturesOverride, curveSaids = []) {
  const { sql, params } = buildLayerGeomSubquery(layerId, bbox, fuids, maxFeaturesOverride, curveSaids);
  return {
    cte: `input_features AS (${sql})`,
    params,
  };
}

/** Safe FeatureCollection JSON from rows with geom + properties json. */
function buildFeatureCollectionQuery(innerSelectSql) {
  return `
    SELECT json_build_object(
      'type', 'FeatureCollection',
      'features', COALESCE((
        SELECT json_agg(
          json_build_object(
            'type', 'Feature',
            'geometry', ST_AsGeoJSON(row.geom)::json,
            'properties', row.props
          )
        )
        FROM (${innerSelectSql}) AS row
        WHERE row.geom IS NOT NULL AND NOT ST_IsEmpty(row.geom)
      ), '[]'::json)
    ) AS geojson
  `;
}

async function runMeasure(operation, layerId, bbox, fuids, curveSaids = []) {
  const isLength = operation === 'length';
  const { cte, params } = inputCte(layerId, bbox, fuids, undefined, curveSaids);

  const valueExpr = isLength
    ? `COALESCE(SUM(
        CASE
          WHEN GeometryType(geom) IN ('LINESTRING', 'MULTILINESTRING')
          THEN ST_Length(geom::geography) / 1000.0
          ELSE 0
        END
      ), 0)`
    : `COALESCE(SUM(
        CASE
          WHEN GeometryType(geom) IN ('POLYGON', 'MULTIPOLYGON')
          THEN ST_Area(geom::geography) / 1000000.0
          ELSE 0
        END
      ), 0)`;

  const query = `
    WITH ${cte}
    SELECT
      ${valueExpr}::float8 AS value,
      COUNT(*)::int AS feature_count
    FROM input_features
    WHERE geom IS NOT NULL
  `;

  const { rows } = await pool.query(query, params);
  const row = rows[0] || { value: 0, feature_count: 0 };

  if (row.feature_count === 0) {
    throwBadRequest('GEO_NO_FEATURES', 'No features found for this layer');
  }

  const value = Number(row.value);
  return {
    operation,
    unit: isLength ? 'km' : 'km2',
    value,
    featureCount: row.feature_count,
    emptyResult: value === 0,
  };
}

async function runBuffer(layerId, bbox, fuids, distanceKm, curveSaids = []) {
  const tolerance = resolveDisplaySimplify();
  const geomOut = geomDisplayExpr('geom', tolerance);
  const maxOut = geoMaxOutputFeatures();
  const distanceM = distanceKm * 1000;
  const { cte, params } = inputCte(layerId, bbox, fuids, undefined, curveSaids);
  params.push(distanceM);
  const distIdx = params.length;
  params.push(maxOut);
  const limitIdx = params.length;

  const inner = `
    SELECT
      ${geomOut} AS geom,
      json_build_object(
        'fuid', fuid,
        'operation', 'buffer',
        'distance_km', ${distanceKm}::float8
      ) AS props
    FROM (
      SELECT fuid, ST_Buffer(geom::geography, $${distIdx})::geometry AS geom
      FROM input_features
      WHERE geom IS NOT NULL
    ) buffered
    WHERE geom IS NOT NULL AND NOT ST_IsEmpty(geom)
    LIMIT $${limitIdx}
  `;

  const query = `
    WITH ${cte},
    fc AS (${buildFeatureCollectionQuery(inner)})
    SELECT
      fc.geojson,
      (SELECT COUNT(*)::int FROM input_features) AS input_count,
      (SELECT json_array_length(fc.geojson->'features'))::int AS output_count
    FROM fc
  `;

  const { rows } = await pool.query(query, params);
  const geojson = rows[0].geojson;
  const inputCount = rows[0].input_count ?? 0;

  if (inputCount === 0) {
    throwBadRequest('GEO_NO_FEATURES', 'No features found for this layer');
  }

  return {
    geojson,
    meta: {
      operation: 'buffer',
      distanceKm,
      inputCount,
      outputCount: rows[0].output_count ?? 0,
      simplified: true,
      inputTruncated: maybeTruncated(inputCount),
    },
  };
}

async function runIntersect(layerA, layerB, bbox, fuidsA, fuidsB) {
  const tolerance = resolveDisplaySimplify();
  const geomOut = geomDisplayExpr('ix.geom', tolerance);
  const maxOut = geoMaxOutputFeatures();
  const maxIn = geoMaxIntersectInputFeatures();
  const maxPairs = geoMaxIntersectPairs();

  const a = inputCte(layerA, bbox, fuidsA, maxIn);
  const aCte = a.cte.replace('input_features', 'features_a');
  const b = buildLayerGeomSubquery(layerB, bbox, fuidsB, maxIn);

  const params = [...a.params, ...b.params];
  params.push(maxPairs);
  const pairsLimitIdx = params.length;
  params.push(maxOut);
  const outLimitIdx = params.length;

  const inner = `
    SELECT
      ${geomOut} AS geom,
      json_build_object(
        'fuid_a', ix.fuid_a,
        'fuid_b', ix.fuid_b,
        'operation', 'intersect'
      ) AS props
    FROM (
      SELECT fuid_a, fuid_b, geom
      FROM (
        SELECT
          a.fuid AS fuid_a,
          b.fuid AS fuid_b,
          ST_MakeValid(ST_Intersection(a.geom, b.geom)) AS geom
        FROM features_a a
        INNER JOIN features_b b ON ST_Intersects(a.geom, b.geom)
        WHERE a.geom IS NOT NULL AND b.geom IS NOT NULL
        LIMIT $${pairsLimitIdx}
      ) pairs
      WHERE geom IS NOT NULL AND NOT ST_IsEmpty(geom)
    ) ix
    LIMIT $${outLimitIdx}
  `;

  const query = `
    WITH ${aCte},
    features_b AS (${b.sql}),
    fc AS (${buildFeatureCollectionQuery(inner)})
    SELECT
      fc.geojson,
      (SELECT COUNT(*)::int FROM features_a) AS input_a_count,
      (SELECT COUNT(*)::int FROM features_b) AS input_b_count,
      (SELECT json_array_length(fc.geojson->'features'))::int AS output_count
    FROM fc
  `;

  const { rows } = await pool.query(query, params);
  const geojson = rows[0].geojson;

  if ((rows[0].input_a_count ?? 0) === 0 || (rows[0].input_b_count ?? 0) === 0) {
    throwBadRequest('GEO_NO_FEATURES', 'No features found for one or both layers');
  }

  const inputACount = rows[0].input_a_count ?? 0;
  const inputBCount = rows[0].input_b_count ?? 0;
  const pairsCapped = inputACount * inputBCount > maxPairs;

  return {
    geojson,
    meta: {
      operation: 'intersect',
      layerA,
      layerB,
      inputACount,
      inputBCount,
      outputCount: rows[0].output_count ?? 0,
      simplified: true,
      inputTruncated:
        maybeTruncated(inputACount)
        || maybeTruncated(inputBCount)
        || inputACount >= maxIn
        || inputBCount >= maxIn,
      pairsCapped,
      resultHint: 'line_intersection',
    },
  };
}

async function runClip(layerId, bbox, fuids, clipBy, clipLayerId) {
  const tolerance = resolveDisplaySimplify();
  const geomOut = geomDisplayExpr('cl.geom', tolerance);
  const maxOut = geoMaxOutputFeatures();
  const { cte, params } = inputCte(layerId, bbox, fuids);

  let clipMaskSql;
  if (clipBy === 'bbox') {
    if (!bbox) {
      throwBadRequest('GEO_CLIP_BBOX_REQUIRED', 'clipBy bbox requires a bbox; use clipBy layer instead');
    }
    params.push(bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat);
    const i = params.length - 3;
    clipMaskSql = `ST_MakeEnvelope($${i}, $${i + 1}, $${i + 2}, $${i + 3}, 4326)`;
  } else {
    const clip = buildLayerGeomSubquery(clipLayerId, bbox, [], geoMaxIntersectInputFeatures());
    const base = params.length;
    let clipSql = clip.sql;
    if (clip.params.length > 0) {
      clipSql = clipSql.replace(/\$(\d+)/g, (_, n) => `$${base + Number(n)}`);
    }
    clipMaskSql = `(SELECT ST_Union(geom) FROM (${clipSql}) clip_sub)`;
    params.push(...clip.params);
  }

  params.push(maxOut);
  const limitIdx = params.length;

  const inner = `
    SELECT
      ${geomOut} AS geom,
      json_build_object('fuid', cl.fuid, 'operation', 'clip') AS props
    FROM (
      SELECT
        i.fuid,
        ST_MakeValid(ST_Intersection(i.geom, m.geom)) AS geom
      FROM input_features i
      CROSS JOIN clip_mask m
      WHERE i.geom IS NOT NULL AND m.geom IS NOT NULL
        AND ST_Intersects(i.geom, m.geom)
    ) cl
    WHERE cl.geom IS NOT NULL AND NOT ST_IsEmpty(cl.geom)
    LIMIT $${limitIdx}
  `;

  const query = `
    WITH ${cte},
    clip_mask AS (
      SELECT ${clipMaskSql} AS geom
    ),
    fc AS (${buildFeatureCollectionQuery(inner)})
    SELECT
      fc.geojson,
      (SELECT COUNT(*)::int FROM input_features) AS input_count,
      (SELECT json_array_length(fc.geojson->'features'))::int AS output_count
    FROM fc
  `;

  const { rows } = await pool.query(query, params);
  const geojson = rows[0].geojson;

  if ((rows[0].input_count ?? 0) === 0) {
    throwBadRequest('GEO_NO_FEATURES', 'No features found for this layer');
  }

  const inputCount = rows[0].input_count ?? 0;
  return {
    geojson,
    meta: {
      operation: 'clip',
      clipBy,
      clipLayerId: clipBy === 'layer' ? clipLayerId : null,
      inputCount,
      outputCount: rows[0].output_count ?? 0,
      simplified: true,
      inputTruncated: maybeTruncated(inputCount),
      resultHint: 'line_clip',
    },
  };
}

module.exports = {
  runMeasure,
  runBuffer,
  runIntersect,
  runClip,
};
