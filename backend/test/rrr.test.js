const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { mockPool, buildTestApp } = require('./helpers');

let app;
let mock;

beforeEach(() => {
  mock = mockPool();
  app = buildTestApp();
});
afterEach(() => mock.reset());

test('GET /api/rrr unions 3 tables', async () => {
  mock.enqueue({ rows: [] });
  await request(app).get('/api/rrr');
  const sql = mock.calls[0].sql;
  assert.match(sql, /FROM "right"/);
  assert.match(sql, /FROM responsibility/);
  assert.match(sql, /FROM restriction/);
});

test('GET /api/rrr?kind=right filters by discriminator', async () => {
  mock.enqueue({ rows: [] });
  await request(app).get('/api/rrr?kind=right');
  assert.deepEqual(mock.calls[0].params, ['right']);
  assert.match(mock.calls[0].sql, /r\.kind = \$1/);
});

test('GET /api/rrr?kind=invalid rejects', async () => {
  const res = await request(app).get('/api/rrr?kind=bogus');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_KIND');
});

test('GET /api/rrr?party=IDN filters', async () => {
  mock.enqueue({ rows: [] });
  await request(app).get('/api/rrr?party=IDN');
  assert.deepEqual(mock.calls[0].params, ['IDN']);
});

test('GET /api/rrr?kind=right&party=IDN combines filters', async () => {
  mock.enqueue({ rows: [] });
  await request(app).get('/api/rrr?kind=right&party=IDN');
  assert.deepEqual(mock.calls[0].params, ['right', 'IDN']);
});

test('GET /api/rrr/:rrrid 404 when missing', async () => {
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  const res = await request(app).get('/api/rrr/RIGHT-999');
  assert.equal(res.status, 404);
});

test('GET /api/rrr/:rrrid returns row + sources + baus', async () => {
  mock.enqueue({ rows: [{ rrrid: 'RIGHT-001', kind: 'right' }] });
  mock.enqueue({ rows: [{ sid: 'UNCLOS' }] });
  mock.enqueue({ rows: [{ uid: 'BA_01' }] });
  const res = await request(app).get('/api/rrr/RIGHT-001');
  assert.equal(res.status, 200);
  assert.equal(res.body.rrrid, 'RIGHT-001');
  assert.deepEqual(res.body.baus, [{ uid: 'BA_01' }]);
});
