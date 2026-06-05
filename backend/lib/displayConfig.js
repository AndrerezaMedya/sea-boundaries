// Display-channel policy for public WebGIS (see docs/DATA_ACCESS_SECURITY_PLAN.md).

function envFlag(name, defaultValue) {
  const raw = process.env[name];
  if (raw === undefined || raw === '') return defaultValue;
  return !['0', 'false', 'no', 'off'].includes(String(raw).toLowerCase());
}

/** Collection endpoints require ?bbox= when true (default). */
function requireBbox() {
  return envFlag('REQUIRE_BBOX', true);
}

/** Expose /api/curves, /api/sources, etc. Default false in production. */
function enableMetadataApi() {
  return envFlag('ENABLE_METADATA_API', false);
}

/** Default simplify tolerance (degrees, SRID 4326) when client omits ?simplify=. */
function defaultDisplaySimplifyTolerance() {
  const raw = process.env.DISPLAY_SIMPLIFY_TOLERANCE;
  if (raw === undefined || raw === '') return 0.0005;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return 0.0005;
  return Math.min(n, 1);
}

/** Max related sources returned on GET detail (display channel). */
function displayDetailMaxSources() {
  const n = Number(process.env.DISPLAY_DETAIL_MAX_SOURCES || 12);
  if (!Number.isInteger(n) || n < 1) return 12;
  return Math.min(n, 50);
}

/** Public map renders via PostGIS MVT tiles (see /api/tiles/...). */
function useMvtDisplay() {
  const mode = String(process.env.DISPLAY_MODE || '').trim().toLowerCase();
  if (mode === 'mvt') return true;
  if (mode === 'geojson') return false;
  return envFlag('USE_MVT_DISPLAY', false);
}

/** Spatial APIs require BFF display token when true (default on when MVT). */
function displayRequireToken() {
  if (process.env.DISPLAY_REQUIRE_TOKEN !== undefined && process.env.DISPLAY_REQUIRE_TOKEN !== '') {
    return envFlag('DISPLAY_REQUIRE_TOKEN', true);
  }
  return useMvtDisplay();
}

function displayTokenTtlSec() {
  const n = Number(process.env.DISPLAY_TOKEN_TTL_SECONDS || 3600);
  if (!Number.isFinite(n) || n < 60) return 3600;
  return Math.min(Math.floor(n), 86_400);
}

/** Express rate limit on display APIs (tiles, session, limits). Default off — MVT needs high request volume. */
function enableApiRateLimit() {
  return envFlag('ENABLE_API_RATE_LIMIT', false);
}

/** Max bbox area (deg²) for collection endpoints — rejects oversized harvest. */
function maxBboxAreaDeg2() {
  const n = Number(process.env.DISPLAY_MAX_BBOX_AREA_DEG2 || 900);
  if (!Number.isFinite(n) || n <= 0) return 25;
  return Math.min(n, 500);
}

module.exports = {
  requireBbox,
  enableMetadataApi,
  defaultDisplaySimplifyTolerance,
  displayDetailMaxSources,
  useMvtDisplay,
  displayRequireToken,
  displayTokenTtlSec,
  maxBboxAreaDeg2,
  enableApiRateLimit,
};
