const express = require('express');
const { pool } = require('../db/pool');
const { ensureEnum, sendError, asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

const RRR_KINDS = ['right', 'responsibility', 'restriction'];

// SQL fragment that UNIONs the 3 RRR tables with a discriminator column.
// rrrID is GLOBALLY unique across these 3 tables (per S121_DATABASE_SCHEMA.md §3).
const RRR_UNION_SQL = `
  SELECT rrrID, 'right' AS kind, rightType AS subtype, NULL::boolean AS partyRequired,
         rightRestrictionResponsibilityDescription AS description,
         rightRestrictionResponsibilityShare AS share,
         rightRestrictionResponsibilityShareCheck AS shareCheck,
         pID
    FROM "right"
  UNION ALL
  SELECT rrrID, 'responsibility' AS kind, responsibilityType AS subtype, NULL::boolean,
         rightRestrictionResponsibilityDescription,
         rightRestrictionResponsibilityShare,
         rightRestrictionResponsibilityShareCheck,
         pID
    FROM responsibility
  UNION ALL
  SELECT rrrID, 'restriction' AS kind, restrictionType AS subtype, partyRequired,
         rightRestrictionResponsibilityDescription,
         rightRestrictionResponsibilityShare,
         rightRestrictionResponsibilityShareCheck,
         pID
    FROM restriction
`;

// GET /api/rrr[?kind=right|responsibility|restriction&party=<pID>]
router.get('/rrr', asyncRoute(async (req, res) => {
  const kind = ensureEnum('kind', req.query.kind, RRR_KINDS);
  const party = req.query.party ? String(req.query.party) : null;

  const params = [];
  const where = [];
  if (kind) {
    params.push(kind);
    where.push(`r.kind = $${params.length}`);
  }
  if (party) {
    params.push(party);
    where.push(`r.pID = $${params.length}`);
  }
  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT * FROM (${RRR_UNION_SQL}) r ${whereClause} ORDER BY r.kind, r.rrrID`,
    params,
  );
  res.json({ items: rows });
}));

// GET /api/rrr/:rrrid — detail with sources & BAUs.
router.get('/rrr/:rrrid', asyncRoute(async (req, res) => {
  const rrrid = req.params.rrrid;

  const [{ rows: base }, { rows: sources }, { rows: baus }] = await Promise.all([
    pool.query(`SELECT * FROM (${RRR_UNION_SQL}) r WHERE r.rrrID = $1`, [rrrid]),
    pool.query(
      `SELECT sf.*
         FROM rrr_to_source rs
         JOIN source_flat sf ON rs.sid = sf.sid
        WHERE rs.rrrID = $1`,
      [rrrid],
    ),
    pool.query(
      `SELECT b.*
         FROM rrr_to_bau rb
         JOIN basic_administrative_unit b ON rb.uID = b.uID
        WHERE rb.rrrID = $1`,
      [rrrid],
    ),
  ]);

  if (base.length === 0) {
    return sendError(res, 404, 'NOT_FOUND', `RRR '${rrrid}' not found`);
  }
  res.json({ ...base[0], sources, baus });
}));

module.exports = router;
