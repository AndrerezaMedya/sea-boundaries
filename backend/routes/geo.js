const express = require('express');
const {
  parseGeoBbox,
  parseGeoLayerId,
  parseGeoLineLayerId,
  parseFuids,
  parseCurveSaids,
  parseDistanceKm,
  parseClipBy,
  assertIntersectScope,
} = require('../lib/geoPolicy');
const {
  runMeasure,
  runBuffer,
  runIntersect,
  runClip,
} = require('../lib/geoSql');
const {
  geoMaxInputFeatures,
  geoMaxOutputFeatures,
  geoMaxBufferKm,
} = require('../lib/geoConfig');
const { asyncRoute, throwBadRequest } = require('../lib/queryHelpers');

const router = express.Router();

// GET /api/geo/info — capability probe (bbox optional on POST since v2)
router.get('/geo/info', (_req, res) => {
  res.json({
    version: 2,
    bboxRequired: false,
    operations: ['length', 'area', 'buffer'],
    maxInputFeatures: geoMaxInputFeatures(),
    maxOutputFeatures: geoMaxOutputFeatures(),
    maxBufferKm: geoMaxBufferKm(),
  });
});

function bboxFromBody(body) {
  return parseGeoBbox(body.bbox);
}

// POST /api/geo/measure — length or area (numeric result only)
router.post('/geo/measure', asyncRoute(async (req, res) => {
  const body = req.body || {};
  const operation = String(body.operation || '').trim();
  if (operation !== 'length' && operation !== 'area') {
    throwBadRequest('GEO_INVALID_OPERATION', 'operation must be "length" or "area"');
  }
  const layerId =
    operation === 'length'
      ? parseGeoLineLayerId(body.layerId)
      : parseGeoLineLayerId(body.layerId, 'layerId');
  const bbox = bboxFromBody(body);
  const fuids = parseFuids(body.fuids);
  const curveSaids = parseCurveSaids(body.curveSaids);

  const result = await runMeasure(operation, layerId, bbox, fuids, curveSaids);
  res.locals.spatialFeatureCount = result.featureCount;
  res.json(result);
}));

// POST /api/geo/buffer
router.post('/geo/buffer', asyncRoute(async (req, res) => {
  const body = req.body || {};
  const layerId = parseGeoLayerId(body.layerId);
  const bbox = bboxFromBody(body);
  const fuids = parseFuids(body.fuids);
  const curveSaids = parseCurveSaids(body.curveSaids);
  const distanceKm = parseDistanceKm(body.distanceKm);

  const { geojson, meta } = await runBuffer(layerId, bbox, fuids, distanceKm, curveSaids);
  const count = Array.isArray(geojson?.features) ? geojson.features.length : 0;
  res.locals.spatialFeatureCount = count;
  res.json({ ...geojson, meta });
}));

// POST /api/geo/intersect
router.post('/geo/intersect', asyncRoute(async (req, res) => {
  const body = req.body || {};
  const layerA = parseGeoLineLayerId(body.layerA, 'layerA');
  const layerB = parseGeoLineLayerId(body.layerB, 'layerB');
  const bbox = bboxFromBody(body);
  const fuidsA = parseFuids(body.fuidsA);
  const fuidsB = parseFuids(body.fuidsB);
  assertIntersectScope(fuidsA, fuidsB, bbox);

  const { geojson, meta } = await runIntersect(layerA, layerB, bbox, fuidsA, fuidsB);
  const count = Array.isArray(geojson?.features) ? geojson.features.length : 0;
  res.locals.spatialFeatureCount = count;
  res.json({ ...geojson, meta });
}));

// POST /api/geo/clip
router.post('/geo/clip', asyncRoute(async (req, res) => {
  const body = req.body || {};
  const layerId = parseGeoLineLayerId(body.layerId);
  const bbox = bboxFromBody(body);
  const fuids = parseFuids(body.fuids);
  const clipBy = parseClipBy(body.clipBy);
  const clipLayerId =
    clipBy === 'layer' ? parseGeoLineLayerId(body.clipLayerId, 'clipLayerId') : null;
  if (clipBy === 'bbox' && !bbox) {
    throwBadRequest('GEO_CLIP_BBOX_REQUIRED', 'clipBy bbox requires bbox; use clipBy layer');
  }

  const { geojson, meta } = await runClip(layerId, bbox, fuids, clipBy, clipLayerId);
  const count = Array.isArray(geojson?.features) ? geojson.features.length : 0;
  res.locals.spatialFeatureCount = count;
  res.json({ ...geojson, meta });
}));

module.exports = router;
