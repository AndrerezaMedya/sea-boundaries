const express = require('express');
const { pool } = require('../db/pool');
const { parsePagination, sendError, asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

// GET /api/sources[?type=&limit=&offset=]
router.get('/sources', asyncRoute(async (req, res) => {
  const type = req.query.type ? String(req.query.type) : null;
  const { limit, offset } = parsePagination(req.query.limit, req.query.offset, 100, 500);

  const params = [];
  const where = [];
  if (type) {
    params.push(type);
    where.push(`sourcedocumenttype = $${params.length}`);
  }
  params.push(limit);
  const limitIdx = params.length;
  params.push(offset);
  const offsetIdx = params.length;

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT sid, sourcedocumentname, sourcedocumenttype, sourceauthoritativedate,
            sourceonlineresourcelinkageurl
       FROM source_flat
       ${whereClause}
       ORDER BY sid
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
    params,
  );

  const { rows: countRows } = await pool.query(
    `SELECT COUNT(*) AS total FROM source_flat ${whereClause}`,
    params.slice(0, params.length - 2),
  );

  res.json({ items: rows, total: Number(countRows[0].total), limit, offset });
}));

// GET /api/sources/:sid — full record + parties (sID may contain '/').
const sourceDetail = asyncRoute(async (req, res) => {
  const sid = req.params.sid ?? decodeURIComponent(req.params[0] ?? '');
  const [{ rows: base }, { rows: parties }] = await Promise.all([
    pool.query(`SELECT * FROM source_flat WHERE sid = $1`, [sid]),
    pool.query(
      `SELECT p.*
         FROM source_to_party stp
         JOIN party p ON stp.pID = p.pID
        WHERE stp.sID = $1`,
      [sid],
    ),
  ]);
  if (base.length === 0) {
    return sendError(res, 404, 'NOT_FOUND', `Source '${sid}' not found`);
  }
  res.json({ ...base[0], parties });
});

router.get('/sources/:sid', sourceDetail);
router.get('/sources/*', sourceDetail);

module.exports = router;
