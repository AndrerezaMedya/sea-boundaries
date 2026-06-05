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

test('GET /api/sources returns paginated items + total', async () => {
  mock.enqueue({ rows: [{ sid: 'UNCLOS' }] });
  mock.enqueue({ rows: [{ total: '51' }] });
  const res = await request(app).get('/api/sources?limit=10');
  assert.equal(res.status, 200);
  assert.deepEqual(res.body, {
    items: [{ sid: 'UNCLOS' }],
    total: 51,
    limit: 10,
    offset: 0,
  });
});

test('GET /api/sources?type=... filters', async () => {
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [{ total: '0' }] });
  await request(app).get('/api/sources?type=Treaty');
  // First call: list query — has type and pagination params.
  assert.equal(mock.calls[0].params[0], 'Treaty');
  // Second call: count query — only the type param, no pagination params.
  assert.deepEqual(mock.calls[1].params, ['Treaty']);
});

test('GET /api/sources/:sid 404 when missing', async () => {
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  const res = await request(app).get('/api/sources/UNKNOWN');
  assert.equal(res.status, 404);
});

test('GET /api/sources/:sid returns source + parties', async () => {
  mock.enqueue({ rows: [{ sid: 'UNCLOS', sourcedocumentname: 'UNCLOS 1982' }] });
  mock.enqueue({ rows: [{ pid: 'IDN' }] });
  const res = await request(app).get('/api/sources/UNCLOS');
  assert.equal(res.status, 200);
  assert.equal(res.body.sid, 'UNCLOS');
  assert.deepEqual(res.body.parties, [{ pid: 'IDN' }]);
});
