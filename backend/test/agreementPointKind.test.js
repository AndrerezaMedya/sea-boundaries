const { test } = require('node:test');
const assert = require('node:assert/strict');
const {
  AGREEMENT_KINDS,
  agreementKindSqlExpr,
  agreementKindWhereSql,
  boundaryPointMvtLayerIdExpr,
} = require('../lib/agreementPointKind');

test('agreementKindSqlExpr references Boundary Point and fuID patterns', () => {
  const sql = agreementKindSqlExpr('loc');
  assert.match(sql, /Boundary Point/);
  assert.match(sql, /LOC\\_TS\\_/);
  assert.match(sql, /P_B_EEZ%/);
  assert.match(sql, /THEN 'TS'/);
  assert.match(sql, /THEN 'CS'/);
  assert.match(sql, /THEN 'EEZ'/);
});

test('agreementKindWhereSql builds predicate per kind', () => {
  for (const kind of AGREEMENT_KINDS) {
    const sql = agreementKindWhereSql(kind);
    assert.match(sql, new RegExp(`= '${kind}'`));
  }
});

test('boundaryPointMvtLayerIdExpr emits per-kind layer ids', () => {
  const sql = boundaryPointMvtLayerIdExpr('loc');
  assert.match(sql, /boundary_point_ts/);
  assert.match(sql, /boundary_point_cs/);
  assert.match(sql, /boundary_point_eez/);
});

test('agreementKindWhereSql rejects invalid kind', () => {
  assert.throws(() => agreementKindWhereSql('MOF'), (err) => err.statusCode === 400);
});
