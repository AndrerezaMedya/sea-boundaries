const { sendError } = require('./queryHelpers');

/**
 * Protect operator routes with DATA_REQUEST_ADMIN_KEY (header X-Admin-Key).
 * When env is unset, admin routes return 503 (disabled).
 */
function requireDataRequestAdmin(req, res, next) {
  const expected = (process.env.DATA_REQUEST_ADMIN_KEY || '').trim();
  if (!expected) {
    return sendError(res, 503, 'ADMIN_DISABLED', 'Admin API is not configured');
  }
  const provided = (req.get('x-admin-key') || '').trim();
  if (!provided || provided !== expected) {
    return sendError(res, 401, 'UNAUTHORIZED', 'Invalid or missing admin key');
  }
  return next();
}

module.exports = { requireDataRequestAdmin };
