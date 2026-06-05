const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Build a CORS middleware honoring the `CORS_ORIGINS` env (comma-separated).
 * When unset/empty, allow all origins (dev fallback).
 */
function buildCors() {
  const raw = (process.env.CORS_ORIGINS || '').trim();
  if (!raw) {
    return cors();
  }
  const allowlist = raw.split(',').map((s) => s.trim()).filter(Boolean);
  return cors({
    origin: (origin, cb) => {
      // Allow non-browser requests (curl, server-to-server) which have no Origin.
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error(`Origin ${origin} not allowed by CORS policy`));
    },
    credentials: false,
  });
}

/** Helmet defaults; disable CSP since this API only serves JSON. */
function buildHelmet() {
  return helmet({ contentSecurityPolicy: false });
}

/** Paths excluded from the global limiter (have dedicated limiters or must stay cheap). */
function isGloballyRateLimitExempt(req) {
  const path = req.path || req.url || '';
  if (path === '/api/display/session' || path.startsWith('/api/display/session?')) return true;
  if (path === '/api/health' || path.startsWith('/api/health?')) return true;
  // MVT: dozens of tile requests per pan/zoom; protected by display token + tile limiter.
  if (path.includes('/api/tiles/') && path.endsWith('.mvt')) return true;
  return false;
}

/** Global rate limiter — applies to every request. */
function buildRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_MAX || 120);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => isGloballyRateLimitExempt(req),
    message: { error: { code: 'RATE_LIMITED', message: 'Too many requests, please retry later.' } },
  });
}

/**
 * Limiter for GeoJSON collection/detail harvest (/api/limits, /api/locations).
 * Not used for MVT tiles — see buildTileRateLimiter().
 */
function buildSpatialRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_SPATIAL_MAX || 60);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Too many spatial requests, please retry later.' } },
  });
}

/**
 * MVT tile traffic: high ceiling (normal pan/zoom = 100–500+ requests/min with many layers).
 * Abuse mitigation relies on display token + CORS + collection bbox caps, not tile throttling.
 */
function buildTileRateLimiter() {
  const windowMs = Number(process.env.RATE_LIMIT_TILE_WINDOW_MS || 60_000);
  const max = Number(process.env.RATE_LIMIT_TILE_MAX || 6_000);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Too many tile requests, please slow down pan/zoom.',
      },
    },
  });
}

/** Limit institutional data-request form submissions per IP. */
function buildRequestSubmitLimiter() {
  const windowMs = Number(process.env.REQUEST_SUBMIT_WINDOW_MS || 3_600_000);
  const max = Number(process.env.REQUEST_SUBMIT_MAX || 5);
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        code: 'RATE_LIMITED',
        message: 'Terlalu banyak pengajuan permintaan data. Coba lagi nanti.',
      },
    },
  });
}

module.exports = {
  buildCors,
  buildHelmet,
  buildRateLimiter,
  buildSpatialRateLimiter,
  buildTileRateLimiter,
  buildRequestSubmitLimiter,
};
