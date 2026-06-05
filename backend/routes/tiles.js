const express = require('express');
const { pool } = require('../db/pool');
const { buildTilesetQuery, buildMvtQuery } = require('../lib/tileSql');
const {
  isKnownTileset,
  isKnownTileLayer,
  getTileLayerSpec,
} = require('../lib/tileLayerRegistry');
const { getCachedTile, setCachedTile, tileCacheControlMaxAge } = require('../lib/tileCache');
const { useMvtDisplay } = require('../lib/displayConfig');
const { requireDisplayToken } = require('../middleware/requireDisplayToken');
const { sendError, asyncRoute } = require('../lib/queryHelpers');

const router = express.Router();

function parseTileIndex(raw, name) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 0) {
    const err = new Error(`${name} must be a non-negative integer`);
    err.statusCode = 400;
    err.code = 'INVALID_TILE';
    throw err;
  }
  return n;
}

function parseZoom(raw) {
  const z = parseTileIndex(raw, 'z');
  if (z > 22) {
    const err = new Error('z must be between 0 and 22');
    err.statusCode = 400;
    err.code = 'INVALID_TILE';
    throw err;
  }
  return z;
}

function parseTileCoords(req) {
  const z = parseZoom(req.params.z);
  const x = parseTileIndex(req.params.x, 'x');
  const y = parseTileIndex(req.params.y, 'y');
  const maxIndex = 2 ** z;
  if (x >= maxIndex || y >= maxIndex) {
    const err = new Error('tile x/y out of range for zoom level');
    err.statusCode = 400;
    err.code = 'INVALID_TILE';
    throw err;
  }
  return { z, x, y };
}

function sendMvtResponse(res, buf, cacheStatus) {
  const maxAge = tileCacheControlMaxAge();
  res.set('Content-Type', 'application/vnd.mapbox-vector-tile');
  res.set('Cache-Control', `public, max-age=${maxAge}`);
  res.set('X-Cache', cacheStatus);
  if (!buf || buf.length === 0) {
    res.set('Cache-Control', 'no-store');
    return res.status(204).end();
  }
  res.locals.spatialFeatureCount = 1;
  return res.send(buf);
}

async function fetchTilesetMvt(tileset, z, x, y) {
  const cached = getCachedTile(tileset, z, x, y);
  if (cached.hit) {
    return { buffer: cached.empty ? null : cached.buffer, cacheStatus: 'HIT' };
  }
  const { sql, params } = buildTilesetQuery(tileset, z);
  const { rows } = await pool.query(sql, params(z, x, y));
  const buf = rows[0]?.mvt ?? null;
  setCachedTile(tileset, z, x, y, buf);
  return { buffer: buf, cacheStatus: 'MISS' };
}

// GET /api/tiles/:tilesetOrLayer/:z/:x/:y.mvt
router.get(
  '/tiles/:tilesetOrLayer/:z/:x/:y.mvt',
  (_req, res, next) => {
    if (!useMvtDisplay()) {
      return sendError(res, 404, 'NOT_FOUND', 'MVT display mode is not enabled');
    }
    return next();
  },
  requireDisplayToken,
  asyncRoute(async (req, res) => {
    const id = req.params.tilesetOrLayer;
    const { z, x, y } = parseTileCoords(req);

    if (isKnownTileset(id)) {
      const { buffer, cacheStatus } = await fetchTilesetMvt(id, z, x, y);
      return sendMvtResponse(res, buffer, cacheStatus);
    }

    if (isKnownTileLayer(id)) {
      const spec = getTileLayerSpec(id);
      const { sql, params } = buildMvtQuery(id, spec);
      const queryParams = params(
        z,
        x,
        y,
        spec.kind === 'limit' ? spec.limitPrefix : spec.locationType,
      );
      const { rows } = await pool.query(sql, queryParams);
      return sendMvtResponse(res, rows[0]?.mvt, 'BYPASS');
    }

    return sendError(res, 404, 'UNKNOWN_TILE', `Unknown tileset or layer: ${id}`);
  }),
);

module.exports = router;
