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

test('GET /api/baselines returns FeatureCollection', async () => {
  mock.enqueue(fcRow([]));
  const res = await request(app).get('/api/baselines');
  assert.equal(res.status, 200);
  assert.equal(res.body.type, 'FeatureCollection');
  assert.match(mock.calls[0].sql, /FROM spatial_baselines/);
});

test('GET /api/baselines?bsl_type=... filters', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/baselines?bsl_type=Common%20Baseline');
  assert.deepEqual(mock.calls[0].params, ['Common Baseline']);
  assert.match(mock.calls[0].sql, /bsl_type = \$1/);
});

test('GET /api/baselines?simplify=0.01 wraps geometry', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/baselines?simplify=0.01');
  assert.match(mock.calls[0].sql, /ST_SimplifyPreserveTopology\(geom, 0\.01\)/);
});

test('GET /api/baselines?bbox=... uses spatial predicate', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/baselines?bbox=95,-10,141,6');
  assert.match(mock.calls[0].sql, /ST_Intersects\(geom/);
});
