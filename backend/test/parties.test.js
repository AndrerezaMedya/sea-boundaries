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

test('GET /api/parties returns items array', async () => {
  mock.enqueue({ rows: [{ pid: 'IDN', partyname: 'Indonesia' }] });
  const res = await request(app).get('/api/parties');
  assert.equal(res.status, 200);
  assert.equal(res.body.items.length, 1);
  // Metadata cache header (1h).
  assert.match(res.headers['cache-control'], /max-age=3600/);
});

test('GET /api/parties/:pid 404 when missing', async () => {
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  const res = await request(app).get('/api/parties/UNKNOWN');
  assert.equal(res.status, 404);
});

test('GET /api/parties/:pid returns party + sources', async () => {
  mock.enqueue({ rows: [{ pid: 'IDN', partyname: 'Indonesia' }] });
  mock.enqueue({ rows: [{ sid: 'UNCLOS' }] });
  const res = await request(app).get('/api/parties/IDN');
  assert.equal(res.status, 200);
  assert.equal(res.body.pid, 'IDN');
  assert.deepEqual(res.body.sources, [{ sid: 'UNCLOS' }]);
});
