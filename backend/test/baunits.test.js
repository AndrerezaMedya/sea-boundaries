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

test('GET /api/baunits returns items', async () => {
  mock.enqueue({ rows: [{ uid: 'BA_01' }] });
  const res = await request(app).get('/api/baunits');
  assert.equal(res.status, 200);
  assert.equal(res.body.items.length, 1);
});

test('GET /api/baunits/:uid unions 3 RRR tables with kind discriminator', async () => {
  mock.enqueue({ rows: [{ uid: 'BA_01' }] });
  mock.enqueue({ rows: [{ sid: 'UU17' }] });
  mock.enqueue({ rows: [{ rrrid: 'R-1', kind: 'right' }] });
  const res = await request(app).get('/api/baunits/BA_01');
  assert.equal(res.status, 200);
  // Inspect the RRR query (3rd call).
  const rrrSql = mock.calls[2].sql;
  assert.match(rrrSql, /FROM "right"/);
  assert.match(rrrSql, /UNION ALL[\s\S]*FROM responsibility/);
  assert.match(rrrSql, /UNION ALL[\s\S]*FROM restriction/);
});

test('GET /api/baunits/:uid 404 when missing', async () => {
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  const res = await request(app).get('/api/baunits/UNKNOWN');
  assert.equal(res.status, 404);
});
