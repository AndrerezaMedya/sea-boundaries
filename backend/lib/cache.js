// Cache-Control middleware factories. All values are conservative; rely on
// CDN/browser revalidation rather than long max-age since data CAN change
// (seed re-runs are idempotent but possible).

function shortCache(maxAgeSeconds = 300) {
  return (_req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, must-revalidate`);
    next();
  };
}

function metadataCache(maxAgeSeconds = 3600) {
  return (_req, res, next) => {
    res.set('Cache-Control', `public, max-age=${maxAgeSeconds}, must-revalidate`);
    next();
  };
}

module.exports = { shortCache, metadataCache };
