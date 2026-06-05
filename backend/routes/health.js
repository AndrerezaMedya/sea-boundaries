const express = require('express');
const { pool } = require('../db/pool');
const { asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

// GET /api/health — liveness + DB ping.
router.get('/health', asyncRoute(async (_req, res) => {
  await pool.query('SELECT 1');
  res.status(200).json({ status: 'OK', message: 'Backend is running', db: 'reachable' });
}));

module.exports = router;
