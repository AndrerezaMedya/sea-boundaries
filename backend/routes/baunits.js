const express = require('express');
const { pool } = require('../db/pool');
const { sendError, asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

// GET /api/baunits — list all BasicAdministrativeUnits.
router.get('/baunits', asyncRoute(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT uID, basicAdministrativeUnitName, basicAdministrativeUnitType,
            basicAdministrativeUnitContext, pID
       FROM basic_administrative_unit
      ORDER BY uID`,
  );
  res.json({ items: rows });
}));

// GET /api/baunits/:uid — full BAU + sources + RRRs (UNION right/responsibility/restriction).
router.get('/baunits/:uid', asyncRoute(async (req, res) => {
  const uid = req.params.uid;

  const [{ rows: base }, { rows: sources }, { rows: rrrs }] = await Promise.all([
    pool.query(`SELECT * FROM basic_administrative_unit WHERE uID = $1`, [uid]),
    pool.query(
      `SELECT sf.*
         FROM baunit_to_source bs
         JOIN source_flat sf ON bs.sid = sf.sid
        WHERE bs.uID = $1`,
      [uid],
    ),
    pool.query(
      `SELECT r.* FROM (
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
       ) r
       JOIN rrr_to_bau rb ON r.rrrID = rb.rrrID
       WHERE rb.uID = $1`,
      [uid],
    ),
  ]);

  if (base.length === 0) {
    return sendError(res, 404, 'NOT_FOUND', `BAU '${uid}' not found`);
  }
  res.json({ ...base[0], sources, rrrs });
}));

module.exports = router;
