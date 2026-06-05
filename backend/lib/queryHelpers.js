// Shared query helpers used by spatial route handlers.
const {
  requireBbox: displayRequiresBbox,
  defaultDisplaySimplifyTolerance,
  maxBboxAreaDeg2,
  useMvtDisplay,
} = require('./displayConfig');

// Indonesian bbox guard rail (lon 88..145, lat -15..10) — used to reject
// pathological bbox values that would force full-table scans without GIST.
const BBOX_BOUNDS = { minLon: 60, maxLon: 160, minLat: -25, maxLat: 20 };

/**
 * Parse a `bbox=minLon,minLat,maxLon,maxLat` query string. Returns null if
 * absent, or { minLon, minLat, maxLon, maxLat } if valid. Throws an Error with
 * `.statusCode = 400` on malformed input.
 */
function parseBbox(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const parts = String(raw).split(',').map((v) => Number(v.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) {
    throwBadRequest('INVALID_BBOX', 'bbox must be 4 comma-separated numbers: minLon,minLat,maxLon,maxLat');
  }
  const [minLon, minLat, maxLon, maxLat] = parts;
  if (minLon >= maxLon || minLat >= maxLat) {
    throwBadRequest('INVALID_BBOX', 'bbox min must be strictly less than max');
  }
  if (
    minLon < BBOX_BOUNDS.minLon || maxLon > BBOX_BOUNDS.maxLon ||
    minLat < BBOX_BOUNDS.minLat || maxLat > BBOX_BOUNDS.maxLat
  ) {
    throwBadRequest(
      'INVALID_BBOX',
      `bbox must fall within [lon ${BBOX_BOUNDS.minLon}..${BBOX_BOUNDS.maxLon}, lat ${BBOX_BOUNDS.minLat}..${BBOX_BOUNDS.maxLat}]`,
    );
  }
  return { minLon, minLat, maxLon, maxLat };
}

/** Shrink bbox toward center until area ≤ maxAreaDeg2 (same rules as frontend clampBboxArea). */
function clampBboxAreaDeg2(bbox, maxAreaDeg2) {
  const area = (bbox.maxLon - bbox.minLon) * (bbox.maxLat - bbox.minLat);
  if (area <= maxAreaDeg2) return bbox;
  const scale = Math.sqrt(maxAreaDeg2 / area);
  const cx = (bbox.minLon + bbox.maxLon) / 2;
  const cy = (bbox.minLat + bbox.maxLat) / 2;
  const halfLon = ((bbox.maxLon - bbox.minLon) / 2) * scale;
  const halfLat = ((bbox.maxLat - bbox.minLat) / 2) * scale;
  return {
    minLon: Math.max(BBOX_BOUNDS.minLon, cx - halfLon),
    minLat: Math.max(BBOX_BOUNDS.minLat, cy - halfLat),
    maxLon: Math.min(BBOX_BOUNDS.maxLon, cx + halfLon),
    maxLat: Math.min(BBOX_BOUNDS.maxLat, cy + halfLat),
  };
}

/** Parse and clamp the `simplify=<tolerance>` query (in SRID 4326 degrees). */
function parseSimplifyTolerance(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) {
    throwBadRequest('INVALID_SIMPLIFY', 'simplify must be a non-negative number (SRID 4326 degrees)');
  }
  // Cap at 1 degree (~111 km) to prevent absurd over-simplification.
  return Math.min(n, 1);
}

/** Parse pagination params: limit (1..10000), offset (>=0). */
function parsePagination(rawLimit, rawOffset, defaultLimit = 1000, maxLimit = 10000) {
  let limit = defaultLimit;
  let offset = 0;
  if (rawLimit !== undefined) {
    const n = Number(rawLimit);
    if (!Number.isInteger(n) || n < 1 || n > maxLimit) {
      throwBadRequest('INVALID_LIMIT', `limit must be an integer between 1 and ${maxLimit}`);
    }
    limit = n;
  }
  if (rawOffset !== undefined) {
    const n = Number(rawOffset);
    if (!Number.isInteger(n) || n < 0) {
      throwBadRequest('INVALID_OFFSET', 'offset must be a non-negative integer');
    }
    offset = n;
  }
  return { limit, offset };
}

/** Validate that `value` is one of `allowed`; throw 400 otherwise. */
function ensureEnum(paramName, value, allowed) {
  if (value === undefined || value === null || value === '') return null;
  const str = String(value);
  if (!allowed.includes(str)) {
    throwBadRequest('INVALID_' + paramName.toUpperCase(), `${paramName} must be one of: ${allowed.join(', ')}`);
  }
  return str;
}

function throwBadRequest(code, message) {
  const err = new Error(message);
  err.statusCode = 400;
  err.code = code;
  throw err;
}

/**
 * Build a SQL geometry expression that optionally applies
 * `ST_SimplifyPreserveTopology` when `tolerance` is provided.
 * Returns the SQL fragment (no leading "AS").
 */
function geomExpr(column, tolerance) {
  if (tolerance && tolerance > 0) {
    return `ST_SimplifyPreserveTopology(${column}, ${tolerance})`;
  }
  return column;
}

/** Display-channel geometry: optional simplify only (full coordinate precision retained). */
function geomDisplayExpr(column, tolerance) {
  let expr = column;
  const tol = tolerance && tolerance > 0 ? tolerance : null;
  if (tol) {
    expr = `ST_SimplifyPreserveTopology(${expr}, ${tol})`;
  }
  return expr;
}

/**
 * Parse bbox for collection endpoints; enforces presence when REQUIRE_BBOX is enabled.
 */
function parseCollectionBbox(raw) {
  const bbox = parseBbox(raw);
  // MVT map geometry is served via /api/tiles; collection harvest may omit bbox.
  if (!bbox && displayRequiresBbox() && !useMvtDisplay()) {
    throwBadRequest(
      'BBOX_REQUIRED',
      'bbox query parameter is required: minLon,minLat,maxLon,maxLat',
    );
  }
  if (bbox && useMvtDisplay()) {
    const area = (bbox.maxLon - bbox.minLon) * (bbox.maxLat - bbox.minLat);
    const maxArea = maxBboxAreaDeg2();
    if (area > maxArea) {
      throwBadRequest(
        'BBOX_TOO_LARGE',
        `bbox area ${area.toFixed(2)} deg² exceeds limit ${maxArea} deg²`,
      );
    }
  }
  return bbox;
}

/** Resolve simplify tolerance: explicit query param, else display default. */
function resolveDisplaySimplify(raw) {
  const explicit = parseSimplifyTolerance(raw);
  if (explicit !== null) return explicit;
  return defaultDisplaySimplifyTolerance();
}

/**
 * Build a parameterized `ST_Intersects(geom, ST_MakeEnvelope(...))` predicate.
 * Returns { sql, params } where params should be appended to the outer query
 * starting from `startIdx` (1-based).
 */
function bboxPredicate(geomColumn, bbox, startIdx) {
  if (!bbox) return { sql: '', params: [] };
  const i = startIdx;
  return {
    sql: `ST_Intersects(${geomColumn}, ST_MakeEnvelope($${i}, $${i + 1}, $${i + 2}, $${i + 3}, 4326))`,
    params: [bbox.minLon, bbox.minLat, bbox.maxLon, bbox.maxLat],
  };
}

/** Standardized error response envelope. */
function sendError(res, statusCode, code, message, details) {
  const body = { error: { code, message } };
  if (details !== undefined) body.error.details = details;
  res.status(statusCode).json(body);
}

/** Wrap an async route handler so thrown errors flow to a single catch. */
function asyncRoute(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err) => {
      if (err && err.statusCode === 400) {
        return sendError(res, 400, err.code || 'BAD_REQUEST', err.message);
      }
      console.error(`Error in ${req.method} ${req.originalUrl}:`, err);
      return sendError(res, 500, 'INTERNAL_ERROR', 'Internal Server Error');
    });
  };
}

module.exports = {
  parseBbox,
  clampBboxAreaDeg2,
  parseCollectionBbox,
  parseSimplifyTolerance,
  resolveDisplaySimplify,
  parsePagination,
  ensureEnum,
  throwBadRequest,
  geomExpr,
  geomDisplayExpr,
  bboxPredicate,
  sendError,
  asyncRoute,
};
