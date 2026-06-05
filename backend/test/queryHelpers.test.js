const { test } = require('node:test');
const assert = require('node:assert/strict');

const {
  parseBbox,
  parseSimplifyTolerance,
  parsePagination,
  ensureEnum,
  bboxPredicate,
  geomExpr,
} = require('../lib/queryHelpers');

test('parseBbox returns null for empty input', () => {
  assert.equal(parseBbox(undefined), null);
  assert.equal(parseBbox(''), null);
});

test('parseBbox parses valid bbox', () => {
  const b = parseBbox('95,-10,141,6');
  assert.deepEqual(b, { minLon: 95, minLat: -10, maxLon: 141, maxLat: 6 });
});

test('parseBbox rejects non-4-part input', () => {
  assert.throws(() => parseBbox('1,2,3'), /4 comma-separated/);
});

test('parseBbox rejects min >= max', () => {
  assert.throws(() => parseBbox('100,5,99,6'), /min must be strictly less/);
});

test('parseBbox rejects out-of-range bbox', () => {
  assert.throws(() => parseBbox('-180,-80,180,80'), /must fall within/);
});

test('parseSimplifyTolerance caps at 1.0', () => {
  assert.equal(parseSimplifyTolerance('5'), 1);
  assert.equal(parseSimplifyTolerance('0.001'), 0.001);
  assert.equal(parseSimplifyTolerance(undefined), null);
});

test('parseSimplifyTolerance rejects negative', () => {
  assert.throws(() => parseSimplifyTolerance('-1'), /non-negative/);
});

test('parsePagination defaults', () => {
  assert.deepEqual(parsePagination(undefined, undefined, 100, 500), { limit: 100, offset: 0 });
});

test('parsePagination rejects out-of-range limit', () => {
  assert.throws(() => parsePagination('501', undefined, 100, 500), /between 1 and 500/);
  assert.throws(() => parsePagination('0', undefined, 100, 500), /between 1 and 500/);
});

test('ensureEnum', () => {
  assert.equal(ensureEnum('type', 'EEZ', ['EEZ', 'TS']), 'EEZ');
  assert.equal(ensureEnum('type', undefined, ['EEZ']), null);
  assert.throws(() => ensureEnum('type', 'NOPE', ['EEZ']), /must be one of/);
});

test('bboxPredicate emits parameterized SQL with correct $-indexes', () => {
  const r = bboxPredicate('geom', { minLon: 1, minLat: 2, maxLon: 3, maxLat: 4 }, 5);
  assert.match(r.sql, /ST_Intersects\(geom, ST_MakeEnvelope\(\$5, \$6, \$7, \$8, 4326\)\)/);
  assert.deepEqual(r.params, [1, 2, 3, 4]);
});

test('bboxPredicate with no bbox returns empty', () => {
  const r = bboxPredicate('geom', null, 1);
  assert.equal(r.sql, '');
  assert.deepEqual(r.params, []);
});

test('geomExpr passes through when no tolerance', () => {
  assert.equal(geomExpr('geom', null), 'geom');
  assert.equal(geomExpr('geom', 0), 'geom');
});

test('geomExpr wraps with ST_SimplifyPreserveTopology', () => {
  assert.equal(geomExpr('geom', 0.01), 'ST_SimplifyPreserveTopology(geom, 0.01)');
});
