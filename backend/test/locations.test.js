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

test('GET /api/locations joins via fmlocation_to_sapoint (no loc.saID)', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/locations');
  const sql = mock.calls[0].sql;
  assert.match(sql, /fmlocation_to_sapoint/);
  assert.match(sql, /JOIN spatial_points pt ON rel\.said_point = pt\.saID/);
  // The bug we fixed: never join via loc.saID.
  assert.ok(!/loc\.saID = pt\.saID/.test(sql), 'must NOT use deprecated loc.saID join');
});

test('GET /api/locations?type=Boundary Point filters location_type_list', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/locations?type=Boundary%20Point');
  // Last 2 params are limit + offset; first is the type.
  assert.equal(mock.calls[0].params[0], 'Boundary Point');
  assert.match(mock.calls[0].sql, /loc\.location_type_list = \$1/);
});

test('GET /api/locations?agreement=CS filters titik perjanjian CS', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/locations?type=Boundary%20Point&agreement=CS');
  assert.match(mock.calls[0].sql, /LOC\\_CS\\_/);
  assert.match(mock.calls[0].sql, /P_B_CS%/);
  assert.match(mock.calls[0].sql, /\) = 'CS'/);
});

test('GET /api/locations?agreement=INVALID rejects', async () => {
  const res = await request(app).get('/api/locations?agreement=MOF');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_AGREEMENT');
});

test('GET /api/locations?type=invalid rejects', async () => {
  const res = await request(app).get('/api/locations?type=Bogus');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_TYPE');
});

test('GET /api/locations?limit=10&offset=20 enforces pagination', async () => {
  mock.enqueue(fcRow([]));
  await request(app).get('/api/locations?limit=10&offset=20');
  const params = mock.calls[0].params;
  assert.deepEqual(params.slice(-2), [10, 20]);
});

test('GET /api/locations?limit=99999 rejects above max', async () => {
  const res = await request(app).get('/api/locations?limit=99999');
  assert.equal(res.status, 400);
  assert.equal(res.body.error.code, 'INVALID_LIMIT');
});

test('GET /api/locations/:fuid 404 when not found', async () => {
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });
  const res = await request(app).get('/api/locations/LOC_DOES_NOT_EXIST');
  assert.equal(res.status, 404);
});

test('GET /api/locations/:fuid returns Feature + sources + parent_limits', async () => {
  mock.enqueue({
    rows: [{
      fuid: 'LOC_TD.001_2002',
      label: 'Tg. Berakit',
      geometry: { type: 'MultiPoint', coordinates: [[104.5, 1.2]] },
    }],
  });
  mock.enqueue({ rows: [{ sid: 'UU17_1985' }] });
  mock.enqueue({ rows: [{ fuid: 'LIM_BSL_001' }] });

  const res = await request(app).get('/api/locations/LOC_TD.001_2002');
  assert.equal(res.status, 200);
  assert.equal(res.body.type, 'Feature');
  assert.equal(res.body.properties.fuid, 'LOC_TD.001_2002');
  assert.deepEqual(res.body.parent_limits, [{ fuid: 'LIM_BSL_001' }]);
});

test('GET /api/locations/:fuid with slash in fuID (unencoded path segments)', async () => {
  const fuid = 'P_B_CS/EEZ_C3_AUS_1997';
  mock.enqueue({
    rows: [{
      fuid,
      label: 'Boundary Point',
      geometry: { type: 'MultiPoint', coordinates: [[92, 2]] },
    }],
  });
  mock.enqueue({ rows: [{ sid: 'TREATY_IDN_AUS_EEZ/CS_1997' }] });
  mock.enqueue({ rows: [] });

  const res = await request(app).get('/api/locations/P_B_CS/EEZ_C3_AUS_1997');
  assert.equal(res.status, 200);
  assert.equal(res.body.properties.fuid, fuid);
  assert.equal(mock.calls[0].params[0], fuid);
});

test('GET /api/locations/:fuid with encoded slash in fuID', async () => {
  const fuid = 'P_B_CS/EEZ_C3_AUS_1997';
  mock.enqueue({
    rows: [{ fuid, label: 'x', geometry: { type: 'MultiPoint', coordinates: [[0, 0]] } }],
  });
  mock.enqueue({ rows: [] });
  mock.enqueue({ rows: [] });

  const res = await request(app).get(`/api/locations/${encodeURIComponent(fuid)}`);
  assert.equal(res.status, 200);
  assert.equal(res.body.properties.fuid, fuid);
});
