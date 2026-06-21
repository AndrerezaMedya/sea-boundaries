const { test, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');

const { buildTestApp, mockPool } = require('./helpers');

let mock;

afterEach(() => {
	if (mock) mock.reset();
});

test('GET /api/meta/filter-options returns distinct values', async () => {
	mock = mockPool();
	mock.enqueue({ rows: [{ value: 'WGS84' }, { value: 'WGS84 (original datum unspecified)' }] });
	mock.enqueue({ rows: [{ value: 'Laut Jawa' }, { value: 'Selat Malaka' }] });
	mock.enqueue({
		rows: [
			{ value: 'Agreement' },
			{ value: 'Proposed' },
			{ value: 'Unilateral — Proposed' },
		],
	});
	mock.enqueue({ rows: [{ value: 'Agreement' }] });
	mock.enqueue({
		rows: [
			{ value: 'Outer Limit of Exclusive Economic Zone' },
			{ value: 'Normal Baseline (Garis Pangkal Normal)' },
		],
	});
	mock.enqueue({
		rows: [{ value: 'Baseline Point' }, { value: 'Boundary Point' }],
	});

	const app = buildTestApp();
	const res = await request(app).get('/api/meta/filter-options');

	assert.equal(res.status, 200);
	assert.deepEqual(res.body.horizontal_datum, ['WGS84', 'WGS84 (original datum unspecified)']);
	assert.deepEqual(res.body.point_location, ['Laut Jawa', 'Selat Malaka']);
	assert.deepEqual(res.body.status_limit, ['Agreement', 'Proposed', 'Unilateral — Proposed']);
	assert.deepEqual(res.body.status_point, ['Agreement']);
	assert.deepEqual(res.body.limit_object_type, [
		'Outer Limit of Exclusive Economic Zone',
		'Normal Baseline (Garis Pangkal Normal)',
	]);
	assert.deepEqual(res.body.location_type_list, ['Baseline Point', 'Boundary Point']);
});
