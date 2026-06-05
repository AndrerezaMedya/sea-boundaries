const { parseBbox, throwBadRequest } = require('./queryHelpers');
const { geoMaxInputFeatures, geoMaxBufferKm } = require('./geoConfig');
const { isSupportedGeoLayerId, isLineGeoLayer } = require('./geoLayerResolve');

/** Optional bbox — omitted means whole layer (subject to GEO_MAX_FEATURES). */
function parseGeoBbox(raw) {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return null;
  }
  return parseBbox(raw);
}

function parseGeoLayerId(raw, fieldName = 'layerId') {
  const id = raw === undefined || raw === null ? '' : String(raw).trim();
  if (!id) {
    throwBadRequest('GEO_LAYER_REQUIRED', `${fieldName} is required`);
  }
  if (!isSupportedGeoLayerId(id)) {
    throwBadRequest('GEO_UNSUPPORTED_LAYER', `Unsupported layer: ${id}`);
  }
  return id;
}

function parseGeoLineLayerId(raw, fieldName = 'layerId') {
  const id = parseGeoLayerId(raw, fieldName);
  if (!isLineGeoLayer(id)) {
    throwBadRequest(
      'GEO_LINE_LAYER_REQUIRED',
      `${fieldName} must be a line layer (maritime limit curve), not a point layer`,
    );
  }
  return id;
}

/** Intersect without bbox must scope at least one side by fuid selection. */
function assertIntersectScope(fuidsA, fuidsB, bbox) {
  if (bbox) return;
  if (fuidsA.length === 0 && fuidsB.length === 0) {
    throwBadRequest(
      'GEO_INTERSECT_SCOPE_REQUIRED',
      'Select features on the map for at least one layer, or send a bbox',
    );
  }
}

function parseIdArray(raw, fieldName) {
  if (raw === undefined || raw === null) return [];
  if (!Array.isArray(raw)) {
    throwBadRequest('GEO_INVALID_FUIDS', `${fieldName} must be an array of strings`);
  }
  const ids = raw.map((v) => String(v).trim()).filter(Boolean);
  const max = geoMaxInputFeatures();
  if (ids.length > max) {
    throwBadRequest(
      'GEO_TOO_MANY_FEATURES',
      `At most ${max} feature ids allowed`,
    );
  }
  return ids;
}

function parseFuids(raw) {
  return parseIdArray(raw, 'fuids');
}

/** Spatial curve saID — one selected map segment on limit layers (`fuid::said`). */
function parseCurveSaids(raw) {
  return parseIdArray(raw, 'curveSaids');
}

function parseDistanceKm(raw) {
  const n = Number(raw);
  if (!Number.isFinite(n) || n <= 0) {
    throwBadRequest('GEO_INVALID_DISTANCE', 'distanceKm must be a positive number');
  }
  const max = geoMaxBufferKm();
  if (n > max) {
    throwBadRequest(
      'GEO_BUFFER_TOO_LARGE',
      `distanceKm exceeds maximum ${max} km`,
    );
  }
  return n;
}

function parseClipBy(raw) {
  const v = raw === undefined || raw === null ? 'bbox' : String(raw).trim();
  if (v !== 'bbox' && v !== 'layer') {
    throwBadRequest('GEO_INVALID_CLIP_BY', 'clipBy must be "bbox" or "layer"');
  }
  return v;
}

module.exports = {
  parseGeoBbox,
  parseGeoLayerId,
  parseGeoLineLayerId,
  parseFuids,
  parseCurveSaids,
  parseDistanceKm,
  parseClipBy,
  assertIntersectScope,
};
