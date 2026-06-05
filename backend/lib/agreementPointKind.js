// Titik Perjanjian: classify Boundary Points into TS / CS / EEZ by fuID convention
// (see real_db_schema/S121_DATABASE_SCHEMA.md §4.2, split_cs_eez_points.sql).

const AGREEMENT_KINDS = ['TS', 'CS', 'EEZ'];

const CORE_LAYER_BY_KIND = {
  TS: 'titik_perjanjian_lt',
  CS: 'titik_perjanjian_lk',
  EEZ: 'titik_perjanjian_zee',
};

/**
 * SQL expression: 'TS' | 'CS' | 'EEZ' | NULL for a location row alias.
 * Only Boundary Point rows receive a kind; others are NULL.
 */
function agreementKindSqlExpr(locAlias = 'loc') {
  const l = locAlias;
  return `CASE
    WHEN ${l}.location_type_list <> 'Boundary Point' THEN NULL
    WHEN ${l}.fuID LIKE 'LOC\\_TS\\_%' ESCAPE '\\' OR ${l}.fuID LIKE 'P_B_TS_%' THEN 'TS'
    WHEN ${l}.fuID LIKE 'LOC\\_CS\\_%' ESCAPE '\\' OR ${l}.fuID LIKE 'P_B_CS%' THEN 'CS'
    WHEN ${l}.fuID LIKE 'LOC\\_EEZ\\_%' ESCAPE '\\' OR ${l}.fuID LIKE 'P_B_EEZ%' THEN 'EEZ'
    ELSE NULL
  END`;
}

/**
 * MVT `layer_id` for Boundary Point rows (MapLibre filter per titik_perjanjian_* layer).
 */
function boundaryPointMvtLayerIdExpr(locAlias = 'loc') {
  const l = locAlias;
  return `CASE
    WHEN ${l}.fuID LIKE 'LOC\\_TS\\_%' ESCAPE '\\' OR ${l}.fuID LIKE 'P_B_TS_%' THEN 'boundary_point_ts'
    WHEN ${l}.fuID LIKE 'LOC\\_CS\\_%' ESCAPE '\\' OR ${l}.fuID LIKE 'P_B_CS%' THEN 'boundary_point_cs'
    WHEN ${l}.fuID LIKE 'LOC\\_EEZ\\_%' ESCAPE '\\' OR ${l}.fuID LIKE 'P_B_EEZ%' THEN 'boundary_point_eez'
    ELSE 'boundary_point_other'
  END`;
}

/** WHERE fragment for collection queries (kind is validated enum). */
function agreementKindWhereSql(kind) {
  if (!AGREEMENT_KINDS.includes(kind)) {
    const err = new Error(`Invalid agreement kind: ${kind}`);
    err.statusCode = 400;
    err.code = 'INVALID_AGREEMENT';
    throw err;
  }
  const expr = agreementKindSqlExpr('loc');
  return `(${expr}) = '${kind}'`;
}

module.exports = {
  AGREEMENT_KINDS,
  CORE_LAYER_BY_KIND,
  agreementKindSqlExpr,
  agreementKindWhereSql,
  boundaryPointMvtLayerIdExpr,
};
