const express = require('express');

const { buildCors, buildHelmet } = require('./lib/security');
const { enableMetadataApi } = require('./lib/displayConfig');
const { spatialAuditLogger } = require('./lib/spatialAudit');
const { httpLogger, logger } = require('./lib/logging');
const { shortCache, metadataCache } = require('./lib/cache');
const { sendError } = require('./lib/queryHelpers');

const healthRouter = require('./routes/health');
const limitsRouter = require('./routes/limits');
const locationsRouter = require('./routes/locations');
const baselinesRouter = require('./routes/baselines');
const curvesRouter = require('./routes/curves');
const partiesRouter = require('./routes/parties');
const sourcesRouter = require('./routes/sources');
const baunitsRouter = require('./routes/baunits');
const rrrRouter = require('./routes/rrr');
const dataRequestsRouter = require('./routes/dataRequests');
const displaySessionRouter = require('./routes/displaySession');
const metaRouter = require('./routes/meta');
const tilesRouter = require('./routes/tiles');
const geoRouter = require('./routes/geo');
const { requireDisplayToken } = require('./middleware/requireDisplayToken');

/**
 * Build the Express app. Side-effect-free (does NOT call listen()).
 *
 * @param {object}  [opts]
 * @param {boolean} [opts.enableRateLimit=true]  Disable for tests.
 * @param {boolean} [opts.enableHttpLogger=true] Disable for tests / silence noise.
 */
function createApp(opts = {}) {
  const { enableRateLimit = true, enableHttpLogger = true } = opts;
  const app = express();

  app.set('trust proxy', 1);

  app.use(buildHelmet());
  app.use(buildCors());
  // No global rate limit on display/MVT (see docs/MVT_MIGRATION_PLAN.md). Only POST /api/data-requests is limited.
  if (enableHttpLogger) app.use(httpLogger);
  app.use(spatialAuditLogger);
  app.use(express.json());

  app.use('/api', healthRouter);
  app.use('/api', displaySessionRouter);
  app.use('/api', dataRequestsRouter);
  app.use('/api', tilesRouter);
  app.use('/api', requireDisplayToken, metadataCache(3600), metaRouter);
  app.use('/api', requireDisplayToken, shortCache(300), limitsRouter);
  app.use('/api', requireDisplayToken, shortCache(300), locationsRouter);
  app.use('/api', requireDisplayToken, geoRouter);
  if (enableMetadataApi()) {
    app.use('/api', shortCache(300), baselinesRouter);
    app.use('/api', shortCache(300), curvesRouter);
    app.use('/api', metadataCache(3600), partiesRouter);
    app.use('/api', metadataCache(3600), sourcesRouter);
    app.use('/api', metadataCache(3600), baunitsRouter);
    app.use('/api', metadataCache(3600), rrrRouter);
  }

  app.use('/api', (_req, res) => sendError(res, 404, 'NOT_FOUND', 'Endpoint not found'));

  // eslint-disable-next-line no-unused-vars
  app.use((err, _req, res, _next) => {
    if (err && err.message && err.message.includes('CORS')) {
      return sendError(res, 403, 'CORS_REJECTED', err.message);
    }
    if (err && err.code === 'LIMIT_FILE_SIZE') {
      return sendError(res, 400, 'FILE_TOO_LARGE', 'Ukuran file melebihi 5MB');
    }
    if (err && err.name === 'MulterError') {
      return sendError(res, 400, 'UPLOAD_ERROR', err.message);
    }
    logger.error({ err }, 'Unhandled error');
    return sendError(res, 500, 'INTERNAL_ERROR', 'Internal Server Error');
  });

  return app;
}

module.exports = { createApp };
