const crypto = require('crypto');
const { displayRequireToken, displayTokenTtlSec } = require('./displayConfig');

const VERSION = 1;

function resolveSecret() {
  const configured = (process.env.DISPLAY_TOKEN_SECRET || '').trim();
  if (configured) return configured;
  if (displayRequireToken() && process.env.NODE_ENV === 'production') {
    throw new Error('DISPLAY_TOKEN_SECRET must be set when DISPLAY_REQUIRE_TOKEN is enabled in production');
  }
  return 'dev-display-token-secret-change-me';
}

function signBody(body) {
  return crypto.createHmac('sha256', resolveSecret()).update(body).digest('base64url');
}

/** Issue a short-lived display-channel token (BFF session). */
function issueDisplayToken() {
  const ttl = displayTokenTtlSec();
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    v: VERSION,
    iat: now,
    exp: now + ttl,
    n: crypto.randomBytes(10).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = signBody(body);
  return {
    token: `${body}.${signature}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
    expiresIn: ttl,
  };
}

function safeEqual(a, b) {
  const left = Buffer.from(String(a));
  const right = Buffer.from(String(b));
  if (left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

/** Verify token string; returns decoded payload or null. */
function verifyDisplayToken(token) {
  if (!token || typeof token !== 'string') return null;
  const trimmed = token.trim();
  const dot = trimmed.lastIndexOf('.');
  if (dot <= 0) return null;
  const body = trimmed.slice(0, dot);
  const signature = trimmed.slice(dot + 1);
  if (!body || !signature) return null;
  const expected = signBody(body);
  if (!safeEqual(signature, expected)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.v !== VERSION) return null;
    const now = Math.floor(Date.now() / 1000);
    if (!Number.isFinite(payload.exp) || payload.exp <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

function readTokenFromRequest(req) {
  const header = req.get('X-Display-Token') || req.get('x-display-token');
  if (header) return String(header).trim();
  if (req.query && req.query.token) return String(req.query.token).trim();
  return '';
}

module.exports = {
  issueDisplayToken,
  verifyDisplayToken,
  readTokenFromRequest,
};
