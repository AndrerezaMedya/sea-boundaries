const express = require('express');
const { issueDisplayToken } = require('../lib/displayToken');
const { useMvtDisplay } = require('../lib/displayConfig');
const { asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

// GET /api/display/session — BFF issues short-lived token for MVT + spatial APIs.
// No rate limit here (one call per page load; zoom must not trigger 429).
router.get('/display/session', asyncRoute(async (_req, res) => {
  const issued = issueDisplayToken();
  res.json({
    token: issued.token,
    expiresAt: issued.expiresAt,
    expiresIn: issued.expiresIn,
    displayMode: useMvtDisplay() ? 'mvt' : 'geojson',
  });
}));

module.exports = router;
