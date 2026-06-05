const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { mockPool, buildTestApp } = require('./helpers');
const { clearTileCache } = require('../lib/tileCache');

let app;
let mock;
const prev = {};

beforeEach(() => {
  prev.DISPLAY_MODE = process.env.DISPLAY_MODE;
  prev.DISPLAY_TOKEN_SECRET = process.env.DISPLAY_TOKEN_SECRET;
  process.env.DISPLAY_MODE = 'mvt';
  process.env.DISPLAY_REQUIRE_TOKEN = 'true';
  process.env.DISPLAY_TOKEN_SECRET = 'test-display-secret';
  clearTileCache();
  mock = mockPool();
  app = buildTestApp();
});
afterEach(() => {
  mock.reset();
  clearTileCache();
  if (prev.DISPLAY_MODE === undefined) delete process.env.DISPLAY_MODE;
  else process.env.DISPLAY_MODE = prev.DISPLAY_MODE;
  if (prev.DISPLAY_TOKEN_SECRET === undefined) delete process.env.DISPLAY_TOKEN_SECRET;
  else process.env.DISPLAY_TOKEN_SECRET = prev.DISPLAY_TOKEN_SECRET;
});

test('GET /api/tiles/boundaries returns MVT and caches', async () => {
  const session = await request(app).get('/api/display/session');
  const token = session.body.token;
  mock.enqueue({ rows: [{ mvt: Buffer.from([0x1a]) }] });

  const first = await request(app)
    .get('/api/tiles/boundaries/2/2/1.mvt')
    .set('X-Display-Token', token);
  assert.equal(first.status, 200);
  assert.equal(first.headers['x-cache'], 'MISS');
  assert.match(mock.calls[0].sql, /layer_id/);

  const second = await request(app)
    .get('/api/tiles/boundaries/2/2/1.mvt')
    .set('X-Display-Token', token);
  assert.equal(second.status, 200);
  assert.equal(second.headers['x-cache'], 'HIT');
  assert.equal(mock.calls.length, 1);
});

test('GET /api/tiles/points uses location tables', async () => {
  const session = await request(app).get('/api/display/session');
  mock.enqueue({ rows: [{ mvt: Buffer.alloc(0) }] });
  const res = await request(app)
    .get('/api/tiles/points/3/4/5.mvt')
    .set('X-Display-Token', session.body.token);
  assert.equal(res.status, 204);
  assert.match(mock.calls[0].sql, /feature_model_location/);
  assert.match(mock.calls[0].sql, /point_location/);
  assert.match(mock.calls[0].sql, /horizontal_datum/);
  assert.match(mock.calls[0].sql, /agreement_kind/);
  assert.match(mock.calls[0].sql, /boundary_point_ts/);
  assert.match(mock.calls[0].sql, /ST_Centroid/);
  assert.doesNotMatch(mock.calls[0].sql, /SimplifyPreserveTopology\(pt\.geom/);
});
