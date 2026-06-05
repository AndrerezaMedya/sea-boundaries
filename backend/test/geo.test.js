const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { mockPool, buildTestApp } = require('./helpers');

let app;
let mock;
const prev = {};

beforeEach(() => {
  prev.DISPLAY_MODE = process.env.DISPLAY_MODE;
  prev.DISPLAY_REQUIRE_TOKEN = process.env.DISPLAY_REQUIRE_TOKEN;
  prev.DISPLAY_TOKEN_SECRET = process.env.DISPLAY_TOKEN_SECRET;
  prev.GEO_MAX_BBOX_AREA_DEG2 = process.env.GEO_MAX_BBOX_AREA_DEG2;
  process.env.DISPLAY_MODE = 'mvt';
  process.env.DISPLAY_REQUIRE_TOKEN = 'true';
  process.env.DISPLAY_TOKEN_SECRET = 'test-display-secret';
  process.env.GEO_MAX_BBOX_AREA_DEG2 = '5';
  mock = mockPool();
  app = buildTestApp();
});

afterEach(() => {
  mock.reset();
  if (prev.DISPLAY_MODE === undefined) delete process.env.DISPLAY_MODE;
  else process.env.DISPLAY_MODE = prev.DISPLAY_MODE;
  if (prev.DISPLAY_REQUIRE_TOKEN === undefined) delete process.env.DISPLAY_REQUIRE_TOKEN;
  else process.env.DISPLAY_REQUIRE_TOKEN = prev.DISPLAY_REQUIRE_TOKEN;
  if (prev.DISPLAY_TOKEN_SECRET === undefined) delete process.env.DISPLAY_TOKEN_SECRET;
  else process.env.DISPLAY_TOKEN_SECRET = prev.DISPLAY_TOKEN_SECRET;
  if (prev.GEO_MAX_BBOX_AREA_DEG2 === undefined) delete process.env.GEO_MAX_BBOX_AREA_DEG2;
  else process.env.GEO_MAX_BBOX_AREA_DEG2 = prev.GEO_MAX_BBOX_AREA_DEG2;
});

const SMALL_BBOX = '106,-6,108,-4';
const HUGE_BBOX = '60,-25,160,20';

async function getToken() {
  const session = await request(app).get('/api/display/session');
  return session.body.token;
}

test('POST /api/geo/measure requires token', async () => {
  const res = await request(app)
    .post('/api/geo/measure')
    .send({ operation: 'length', layerId: 'baseline', bbox: SMALL_BBOX });
  assert.equal(res.status, 401);
  assert.equal(mock.calls.length, 0);
});

test('POST /api/geo/measure works without bbox', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{ value: 1, feature_count: 1 }],
  });
  const res = await request(app)
    .post('/api/geo/measure')
    .set('X-Display-Token', token)
    .send({ operation: 'length', layerId: 'baseline' });
  assert.equal(res.status, 200);
  assert.ok(mock.calls.length > 0);
  assert.doesNotMatch(mock.calls[0].sql, /ST_Intersects/);
});

test('POST /api/geo/measure length returns numeric result', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{ value: 12.5, feature_count: 2 }],
  });
  const res = await request(app)
    .post('/api/geo/measure')
    .set('X-Display-Token', token)
    .send({ operation: 'length', layerId: 'baseline', bbox: SMALL_BBOX });
  assert.equal(res.status, 200);
  assert.equal(res.body.operation, 'length');
  assert.equal(res.body.unit, 'km');
  assert.equal(res.body.value, 12.5);
  assert.equal(res.body.featureCount, 2);
  assert.match(mock.calls[0].sql, /ST_Length/);
});

test('POST /api/geo/measure area returns km2', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{ value: 0, feature_count: 3 }],
  });
  const res = await request(app)
    .post('/api/geo/measure')
    .set('X-Display-Token', token)
    .send({ operation: 'area', layerId: 'eez_limit', bbox: SMALL_BBOX });
  assert.equal(res.status, 200);
  assert.equal(res.body.unit, 'km2');
  assert.match(mock.calls[0].sql, /ST_Area/);
});

test('POST /api/geo/measure length rejects point layer', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/api/geo/measure')
    .set('X-Display-Token', token)
    .send({ operation: 'length', layerId: 'basepoints', bbox: SMALL_BBOX });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'GEO_LINE_LAYER_REQUIRED');
});

test('POST /api/geo/buffer returns FeatureCollection', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{
      geojson: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: null, properties: {} }] },
      input_count: 1,
      output_count: 1,
    }],
  });
  const res = await request(app)
    .post('/api/geo/buffer')
    .set('X-Display-Token', token)
    .send({ layerId: 'baseline', bbox: SMALL_BBOX, distanceKm: 10 });
  assert.equal(res.status, 200);
  assert.equal(res.body.type, 'FeatureCollection');
  assert.equal(res.body.meta.operation, 'buffer');
  assert.match(mock.calls[0].sql, /ST_Buffer/);
});

test('GET /api/geo/info reports v2 without bbox', async () => {
  const token = await getToken();
  const res = await request(app)
    .get('/api/geo/info')
    .set('X-Display-Token', token);
  assert.equal(res.status, 200);
  assert.equal(res.body.version, 2);
  assert.equal(res.body.bboxRequired, false);
});

test('POST /api/geo/buffer works without bbox', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{
      geojson: { type: 'FeatureCollection', features: [] },
      input_count: 2,
      output_count: 0,
    }],
  });
  const res = await request(app)
    .post('/api/geo/buffer')
    .set('X-Display-Token', token)
    .send({ layerId: 'eez_limit', distanceKm: 10, fuids: [] });
  assert.equal(res.status, 200);
  assert.equal(res.body.meta.operation, 'buffer');
});

test('POST /api/geo/measure rejects unsupported layer', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/api/geo/measure')
    .set('X-Display-Token', token)
    .send({ operation: 'length', layerId: 'user_layer', bbox: SMALL_BBOX });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'GEO_UNSUPPORTED_LAYER');
});

test('POST /api/geo/intersect requires selection or bbox', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/api/geo/intersect')
    .set('X-Display-Token', token)
    .send({ layerA: 'eez_limit', layerB: 'fisheries' });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'GEO_INTERSECT_SCOPE_REQUIRED');
  assert.equal(mock.calls.length, 0);
});

test('POST /api/geo/intersect returns FeatureCollection', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{
      geojson: { type: 'FeatureCollection', features: [] },
      input_a_count: 1,
      input_b_count: 1,
      output_count: 0,
    }],
  });
  const res = await request(app)
    .post('/api/geo/intersect')
    .set('X-Display-Token', token)
    .send({
      layerA: 'eez_limit',
      layerB: 'fisheries',
      fuidsA: ['LIM_EEZ_001'],
    });
  assert.equal(res.status, 200);
  assert.equal(res.body.type, 'FeatureCollection');
  assert.equal(res.body.meta.operation, 'intersect');
  assert.match(mock.calls[0].sql, /ST_Intersection/);
});

test('POST /api/geo/clip rejects point mask layer', async () => {
  const token = await getToken();
  const res = await request(app)
    .post('/api/geo/clip')
    .set('X-Display-Token', token)
    .send({
      layerId: 'territorial_sea',
      clipBy: 'layer',
      clipLayerId: 'titik_perjanjian_zee',
    });
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'GEO_LINE_LAYER_REQUIRED');
});

test('POST /api/geo/clip by layer returns FeatureCollection', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{
      geojson: { type: 'FeatureCollection', features: [] },
      input_count: 2,
      output_count: 1,
    }],
  });
  const res = await request(app)
    .post('/api/geo/clip')
    .set('X-Display-Token', token)
    .send({
      layerId: 'territorial_sea',
      clipBy: 'layer',
      clipLayerId: 'eez_limit',
    });
  assert.equal(res.status, 200);
  assert.equal(res.body.meta.operation, 'clip');
  assert.equal(res.body.meta.clipBy, 'layer');
  assert.match(mock.calls[0].sql, /ST_Intersection/);
});

test('POST /api/geo/measure with fuids filters by fuid', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{ value: 5, feature_count: 1 }],
  });
  const res = await request(app)
    .post('/api/geo/measure')
    .set('X-Display-Token', token)
    .send({
      operation: 'length',
      layerId: 'baseline',
      fuids: ['LIM_BSL_001'],
    });
  assert.equal(res.status, 200);
  assert.match(mock.calls[0].sql, /= ANY/);
});

test('POST /api/geo/buffer with curveSaids filters one segment', async () => {
  const token = await getToken();
  mock.enqueue({
    rows: [{
      geojson: { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: null, properties: {} }] },
      input_count: 1,
      output_count: 1,
    }],
  });
  const res = await request(app)
    .post('/api/geo/buffer')
    .set('X-Display-Token', token)
    .send({
      layerId: 'territorial_sea',
      distanceKm: 10,
      curveSaids: ['CURVE_TS_001'],
    });
  assert.equal(res.status, 200);
  assert.match(mock.calls[0].sql, /rel\.said_curve = ANY/);
  assert.doesNotMatch(mock.calls[0].sql, /l\.fuID = ANY/);
});
