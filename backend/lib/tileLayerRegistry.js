// Core layer ids (WebGIS) → SQL filters for MVT generation.

const LIMIT_PREFIX = {
  baseline: 'BSL',
  territorial_sea: 'TS',
  contiguous_zone: 'CZ',
  eez_limit: 'EEZ',
  continental_shelf: 'CS',
  landas_kontinen_ekstensi: 'ECS',
  fisheries: 'FISH',
};

const LOCATION_TYPE = {
  basepoints: 'Baseline Point',
  titik_perjanjian_lt: 'Boundary Point',
  titik_perjanjian_lk: 'Boundary Point',
  titik_perjanjian_zee: 'Boundary Point',
};

/** MapLibre vector source-layer name inside each .mvt file. */
const MVT_SOURCE_LAYER = 'display';

/** Combined tile endpoints (Fase 4). */
const MVT_TILESETS = ['boundaries', 'points'];

const BOUNDARY_LAYER_IDS = Object.keys(LIMIT_PREFIX);

const POINT_LAYER_IDS = Object.keys(LOCATION_TYPE);

/** MVT property `layer_id` for MapLibre filters (titik layers share boundary_point). */
const MVT_LAYER_KEY = {
  baseline: 'baseline',
  territorial_sea: 'territorial_sea',
  contiguous_zone: 'contiguous_zone',
  eez_limit: 'eez_limit',
  continental_shelf: 'continental_shelf',
  landas_kontinen_ekstensi: 'landas_kontinen_ekstensi',
  fisheries: 'fisheries',
  basepoints: 'basepoints',
  titik_perjanjian_lt: 'boundary_point_ts',
  titik_perjanjian_lk: 'boundary_point_cs',
  titik_perjanjian_zee: 'boundary_point_eez',
};

function getMvtLayerKey(layerId) {
  return MVT_LAYER_KEY[layerId] || layerId;
}

function getTilesetForLayer(layerId) {
  if (LIMIT_PREFIX[layerId]) return 'boundaries';
  if (LOCATION_TYPE[layerId]) return 'points';
  return null;
}

function isKnownTileset(tileset) {
  return MVT_TILESETS.includes(tileset);
}

function isKnownTileLayer(layerId) {
  return Boolean(LIMIT_PREFIX[layerId] || LOCATION_TYPE[layerId]);
}

function getTileLayerSpec(layerId) {
  if (LIMIT_PREFIX[layerId]) {
    return { kind: 'limit', limitPrefix: LIMIT_PREFIX[layerId] };
  }
  if (LOCATION_TYPE[layerId]) {
    return { kind: 'location', locationType: LOCATION_TYPE[layerId] };
  }
  return null;
}

module.exports = {
  MVT_SOURCE_LAYER,
  MVT_TILESETS,
  BOUNDARY_LAYER_IDS,
  POINT_LAYER_IDS,
  MVT_LAYER_KEY,
  getMvtLayerKey,
  getTilesetForLayer,
  isKnownTileset,
  isKnownTileLayer,
  getTileLayerSpec,
  LIMIT_PREFIX,
};
