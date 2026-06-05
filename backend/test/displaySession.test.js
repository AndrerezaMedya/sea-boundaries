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
  process.env.DISPLAY_MODE = 'mvt';
  process.env.DISPLAY_REQUIRE_TOKEN = 'true';
  process.env.DISPLAY_TOKEN_SECRET = 'test-display-secret';
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
});

test('GET /api/display/session returns token', async () => {
  const res = await request(app).get('/api/display/session');
  assert.equal(res.status, 200);
  assert.ok(res.body.token);
  assert.ok(res.body.expiresAt);
  assert.equal(res.body.displayMode, 'mvt');
});

test('GET /api/tiles/eez_limit/2/2/1.mvt requires token', async () => {
  const res = await request(app).get('/api/tiles/eez_limit/2/2/1.mvt');
  assert.equal(res.status, 401);
  assert.equal(res.body.error.code, 'DISPLAY_TOKEN_REQUIRED');
  assert.equal(mock.calls.length, 0);
});

test('GET /api/tiles/eez_limit/2/2/1.mvt with valid token', async () => {
  const session = await request(app).get('/api/display/session');
  const token = session.body.token;
  mock.enqueue({ rows: [{ mvt: Buffer.alloc(0) }] });
  const res = await request(app)
    .get('/api/tiles/eez_limit/2/2/1.mvt')
    .set('X-Display-Token', token);
  assert.equal(res.status, 204);
  assert.match(mock.calls[0].sql, /ST_AsMVT/);
  assert.deepEqual(mock.calls[0].params.slice(0, 4), [2, 2, 1, 'LIM_EEZ_%']);
});

test('GET /api/limits requires token when DISPLAY_REQUIRE_TOKEN=true', async () => {
  const res = await request(app).get('/api/limits?type=EEZ&bbox=106,-6,108,-4');
  assert.equal(res.status, 401);
});
