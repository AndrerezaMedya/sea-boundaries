const { logger } = require('./logging');

/** Approximate bbox area in square degrees (for scrape monitoring, not cartographic measure). */
function bboxAreaDeg2(raw) {
  if (!raw) return null;
  const parts = String(raw).split(',').map((v) => Number(v.trim()));
  if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) return null;
  const [minLon, minLat, maxLon, maxLat] = parts;
  return Math.max(0, maxLon - minLon) * Math.max(0, maxLat - minLat);
}

/**
 * Log structured spatial access after response (Cloud Logging / Pino).
 * Routes should set `res.locals.spatialFeatureCount` when known.
 */
function spatialAuditLogger(req, res, next) {
  const started = Date.now();
  res.on('finish', () => {
    const path = req.originalUrl || req.url || '';
    if (!/^\/api\/(limits|locations)(\?|$|\/)|^\/api\/geo\//.test(path)) return;

    logger.info({
      event: 'spatial_access',
      method: req.method,
      path,
      statusCode: res.statusCode,
      bbox: req.query.bbox || req.body?.bbox || null,
      bboxAreaDeg2: bboxAreaDeg2(req.query.bbox || req.body?.bbox),
      type: req.query.type || null,
      featureCount: res.locals.spatialFeatureCount ?? null,
      durationMs: Date.now() - started,
      ip: req.ip,
    });
  });
  next();
}

module.exports = { spatialAuditLogger, bboxAreaDeg2 };
