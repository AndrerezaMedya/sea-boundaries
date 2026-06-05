const express = require('express');
const { pool } = require('../db/pool');
const { sendError, asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

// GET /api/parties — list all parties.
router.get('/parties', asyncRoute(async (_req, res) => {
  const { rows } = await pool.query(
    `SELECT pID, partyName, partyRole, partyType
       FROM party
      ORDER BY pID`,
  );
  res.json({ items: rows });
}));

// GET /api/parties/:pid — single party with related sources.
router.get('/parties/:pid', asyncRoute(async (req, res) => {
  const pid = req.params.pid;
  const [{ rows: base }, { rows: sources }] = await Promise.all([
    pool.query(`SELECT * FROM party WHERE pID = $1`, [pid]),
    pool.query(
      `SELECT sf.*
         FROM source_to_party stp
         JOIN source_flat sf ON stp.sid = sf.sid
        WHERE stp.pID = $1`,
      [pid],
    ),
  ]);
  if (base.length === 0) {
    return sendError(res, 404, 'NOT_FOUND', `Party '${pid}' not found`);
  }
  res.json({ ...base[0], sources });
}));

module.exports = router;
