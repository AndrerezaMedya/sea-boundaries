const { displayRequireToken } = require('../lib/displayConfig');
const { readTokenFromRequest, verifyDisplayToken } = require('../lib/displayToken');
const { sendError } = require('../lib/queryHelpers');

/** Enforce display token when DISPLAY_REQUIRE_TOKEN is enabled. */
function requireDisplayToken(req, res, next) {
  if (!displayRequireToken()) {
    return next();
  }
  const token = readTokenFromRequest(req);
  const payload = verifyDisplayToken(token);
  if (!payload) {
    return sendError(
      res,
      401,
      'DISPLAY_TOKEN_REQUIRED',
      'Valid display session token required (X-Display-Token header or ?token=)',
    );
  }
  req.displayToken = payload;
  return next();
}

module.exports = { requireDisplayToken };
