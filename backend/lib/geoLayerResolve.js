const { agreementKindWhereSql } = require('./agreementPointKind');
const { bboxPredicate, throwBadRequest } = require('./queryHelpers');
const { geoMaxInputFeatures } = require('./geoConfig');

/** Core layer ids aligned with frontend LAYER_API_CONFIG / MVT layer_id. */
const GEO_LAYER_SPECS = {
  baseline: { kind: 'limit', typePrefix: 'BSL' },
  territorial_sea: { kind: 'limit', typePrefix: 'TS' },
  contiguous_zone: { kind: 'limit', typePrefix: 'CZ' },
  eez_limit: { kind: 'limit', typePrefix: 'EEZ' },
  continental_shelf: { kind: 'limit', typePrefix: 'CS' },
  landas_kontinen_ekstensi: { kind: 'limit', typePrefix: 'ECS' },
  fisheries: { kind: 'limit', typePrefix: 'FISH' },
  basepoints: { kind: 'location', locationType: 'Baseline Point' },
  titik_perjanjian_lt: { kind: 'location', locationType: 'Boundary Point', agreement: 'TS' },
  titik_perjanjian_lk: { kind: 'location', locationType: 'Boundary Point', agreement: 'CS' },
  titik_perjanjian_zee: { kind: 'location', locationType: 'Boundary Point', agreement: 'EEZ' },
};

const SUPPORTED_GEO_LAYER_IDS = Object.keys(GEO_LAYER_SPECS);

function isSupportedGeoLayerId(layerId) {
  return Object.prototype.hasOwnProperty.call(GEO_LAYER_SPECS, layerId);
}

function getLayerSpec(layerId) {
  const spec = GEO_LAYER_SPECS[layerId];
  if (!spec) {
    throwBadRequest('GEO_UNSUPPORTED_LAYER', `Unsupported layer: ${layerId}`);
  }
  return spec;
}

/** Maritime limit curves (lines) — not location points. */
function isLineGeoLayer(layerId) {
  const spec = GEO_LAYER_SPECS[layerId];
  return Boolean(spec && spec.kind === 'limit');
}

/**
 * Build parameterized subquery returning rows (fuid, geom) for one core layer.
 * @returns {{ sql: string, params: unknown[] }}
 */
function buildLayerGeomSubquery(layerId, bbox, fuids, maxFeaturesOverride, curveSaids = []) {
  const spec = getLayerSpec(layerId);
  const params = [];
  const where = [];

  if (spec.kind === 'limit') {
    params.push(`LIM_${spec.typePrefix}_%`);
    where.push(`l.fuID LIKE $${params.length}`);

    if (curveSaids.length > 0) {
      params.push(curveSaids);
      where.push(`rel.said_curve = ANY($${params.length}::text[])`);
    } else if (fuids.length > 0) {
      params.push(fuids);
      where.push(`l.fuID = ANY($${params.length}::text[])`);
    }

    if (bbox) {
      const { sql: bboxSql, params: bboxParams } = bboxPredicate('geom_data.geom', bbox, params.length + 1);
      if (bboxSql) {
        params.push(...bboxParams);
        where.push(bboxSql);
      }
    }

    const maxFeatures = maxFeaturesOverride ?? geoMaxInputFeatures();
    params.push(maxFeatures);
    const limitIdx = params.length;

    const sql = `
      SELECT l.fuID AS fuid, geom_data.geom AS geom
      FROM feature_model_limit l
      JOIN fmlimit_to_sacurve rel ON l.fuID = rel.fuid_limit
      JOIN (
        SELECT saID, geom FROM spatial_curves
        UNION ALL
        SELECT saID, geom FROM spatial_baselines
      ) geom_data ON rel.said_curve = geom_data.saID
      WHERE ${where.join(' AND ')}
      LIMIT $${limitIdx}
    `;
    return { sql, params };
  }

  params.push(spec.locationType);
  where.push(`loc.location_type_list = $${params.length}`);

  if (spec.agreement) {
    where.push(agreementKindWhereSql(spec.agreement));
  }

  if (fuids.length > 0) {
    params.push(fuids);
    where.push(`loc.fuID = ANY($${params.length}::text[])`);
  }

  if (bbox) {
    const { sql: bboxSql, params: bboxParams } = bboxPredicate('pt.geom', bbox, params.length + 1);
    if (bboxSql) {
      params.push(...bboxParams);
      where.push(bboxSql);
    }
  }

  const maxFeatures = maxFeaturesOverride ?? geoMaxInputFeatures();
  params.push(maxFeatures);
  const limitIdx = params.length;

  const sql = `
    SELECT loc.fuID AS fuid, pt.geom AS geom
    FROM feature_model_location loc
    JOIN fmlocation_to_sapoint rel ON loc.fuID = rel.fuid_location
    JOIN spatial_points pt ON rel.said_point = pt.saID
    WHERE ${where.join(' AND ')}
    LIMIT $${limitIdx}
  `;
  return { sql, params };
}

module.exports = {
  GEO_LAYER_SPECS,
  SUPPORTED_GEO_LAYER_IDS,
  isSupportedGeoLayerId,
  isLineGeoLayer,
  getLayerSpec,
  buildLayerGeomSubquery,
};
