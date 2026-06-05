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

test('GET /api/curves returns FeatureCollection', async () => {
  mock.enqueue(fcRow([]));
  const res = await request(app).get('/api/curves');
  assert.equal(res.status, 200);
  assert.match(mock.calls[0].sql, /FROM spatial_curves/);
});

test('GET /api/curves?simplify=invalid rejects', async () => {
  const res = await request(app).get('/api/curves?simplify=-5');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_SIMPLIFY');
});
