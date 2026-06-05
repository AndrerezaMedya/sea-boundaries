const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { mockPool, buildTestApp, fcRow } = require('./helpers');

let app;
let mock;

beforeEach(() => {
  mock = mockPool();
  app = buildTestApp();
});
afterEach(() => mock.reset());

test('GET /api/limits returns FeatureCollection', async () => {
  mock.enqueue(fcRow([{ type: 'Feature', properties: { fuid: 'LIM_EEZ_01' } }]));
  const res = await request(app).get('/api/limits');
  assert.equal(res.status, 200);
  assert.equal(res.body.type, 'FeatureCollection');
  assert.equal(res.body.features.length, 1);
  // No filters → no parameters and no LIKE clause.
  assert.equal(mock.calls[0].params.length, 0);
  assert.ok(!mock.calls[0].sql.includes('LIKE'));
  // Cache header applied.
  assert.match(res.headers['cache-control'], /max-age=300/);
});

test('GET /api/limits?type=EEZ injects LIKE pattern', async () => {
  mock.enqueue(fcRow([]));
  const res = await request(app).get('/api/limits?type=EEZ');
  assert.equal(res.status, 200);
  assert.deepEqual(mock.calls[0].params, ['LIM_EEZ_%']);
  assert.match(mock.calls[0].sql, /l\.fuID LIKE \$1/);
});

test('GET /api/limits?type=ECS injects LIM_ECS_% pattern', async () => {
  mock.enqueue(fcRow([]));
  const res = await request(app).get('/api/limits?type=ECS');
  assert.equal(res.status, 200);
  assert.deepEqual(mock.calls[0].params, ['LIM_ECS_%']);
  assert.match(mock.calls[0].sql, /l\.fuID LIKE \$1/);
});

test('GET /api/limits?type=INVALID rejects with 400', async () => {
  const res = await request(app).get('/api/limits?type=INVALID');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_TYPE');
  assert.equal(mock.calls.length, 0);
});

test('GET /api/limits?bbox=... uses pushdown predicate', async () => {
  mock.enqueue(fcRow([]));
  const res = await request(app).get('/api/limits?bbox=95,-10,141,6');
  assert.equal(res.status, 200);
  assert.match(mock.calls[0].sql, /ST_Intersects\(geom_data\.geom/);
  assert.deepEqual(mock.calls[0].params, [95, -10, 141, 6]);
});

test('GET /api/limits?type=EEZ&status=Unilateral combines filters', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/limits?type=EEZ&status=Unilateral');
  assert.deepEqual(mock.calls[0].params, ['LIM_EEZ_%', 'Unilateral']);
  assert.match(mock.calls[0].sql, /l\.fuID LIKE \$1[\s\S]*l\.status = \$2/);
});

test('GET /api/limits?bbox=invalid rejects with 400', async () => {
  const res = await request(app).get('/api/limits?bbox=1,2,3');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_BBOX');
});

function restoreEnv(key, prev) {
  if (prev === undefined) delete process.env[key];
  else process.env[key] = prev;
}

test('GET /api/limits without bbox rejects when REQUIRE_BBOX=true (geojson)', async () => {
  const prevReq = process.env.REQUIRE_BBOX;
  const prevMode = process.env.DISPLAY_MODE;
  process.env.REQUIRE_BBOX = 'true';
  process.env.DISPLAY_MODE = 'geojson';
  const res = await request(app).get('/api/limits?type=EEZ');
  restoreEnv('REQUIRE_BBOX', prevReq);
  restoreEnv('DISPLAY_MODE', prevMode);
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'BBOX_REQUIRED');
  assert.equal(mock.calls.length, 0);
});

test('GET /api/limits without bbox allowed when DISPLAY_MODE=mvt', async () => {
  const prevReq = process.env.REQUIRE_BBOX;
  const prevMode = process.env.DISPLAY_MODE;
  const prevToken = process.env.DISPLAY_REQUIRE_TOKEN;
  process.env.REQUIRE_BBOX = 'true';
  process.env.DISPLAY_MODE = 'mvt';
  process.env.DISPLAY_REQUIRE_TOKEN = 'false';
  mock.enqueue(fcRow([]));
  const res = await request(app).get('/api/limits?type=EEZ');
  restoreEnv('REQUIRE_BBOX', prevReq);
  restoreEnv('DISPLAY_MODE', prevMode);
  restoreEnv('DISPLAY_REQUIRE_TOKEN', prevToken);
  assert.equal(res.status, 200);
  assert.equal(mock.calls.length, 1);
});

test('GET /api/limits applies display geometry transforms in SQL', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/limits?bbox=95,-10,141,6');
  assert.doesNotMatch(mock.calls[0].sql, /ST_ReducePrecision/);
  assert.match(mock.calls[0].sql, /ST_SimplifyPreserveTopology/);
});

test('GET /api/limits/:fuid returns 404 when not found', async () => {
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  const res = await request(app).get('/api/limits/LIM_EEZ_999');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});

test('GET /api/limits/:fuid returns Feature with sources (display channel)', async () => {
  mock.enqueue({
    rows: [{
      fuid: 'LIM_EEZ_01',
      label: 'test',
      geometry: { type: 'MultiLineString', coordinates: [] },
    }],
  });
  mock.enqueue({ rows: [{ sID: 'UNCLOS' }] });

  const res = await request(app).get('/api/limits/LIM_EEZ_01');
  assert.equal(res.status, 200);
  assert.equal(res.body.type, 'Feature');
  assert.equal(res.body.geometry.type, 'MultiLineString');
  assert.equal(res.body.properties.fuid, 'LIM_EEZ_01');
  assert.deepEqual(res.body.sources, [{ sID: 'UNCLOS' }]);
  assert.deepEqual(res.body.vertices, []);
});
