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

test('GET /api/health returns 200 with db status', async () => {
  mock.enqueue({ rows: [{ '?column?': 1 }] });
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.status, 'OK');
  assert.equal(res.body.db, 'reachable');
});

test('GET /api/health returns 500 when DB ping fails', async () => {
  mock.enqueueError(new Error('DB down'));
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 500);
  assert.equal(res.body.error.code, 'INTERNAL_ERROR');
});

test('Unknown /api/* path returns 404', async () => {
  const res = await request(app).get('/api/does-not-exist');
  assert.equal(res.status, 404);
  assert.equal(res.body.error.code, 'NOT_FOUND');
});
