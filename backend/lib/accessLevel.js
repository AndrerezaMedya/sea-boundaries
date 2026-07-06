/**
 * Access level constants and SQL helpers for status-based data restriction.
 *
 * Business rule (per thesis advisor revision):
 *   Objects whose status is NOT in PUBLIC_ALLOWED_STATUSES are legally
 *   self-claims by Indonesia without binding bilateral force. Showing them
 *   to unauthenticated public users is considered inappropriate.
 *
 * Authenticated users (Firebase login) see all statuses.
 * Public users (no login) see only: Agreement, Unilateral.
 */

/** @type {'public' | 'authenticated'} */
const ACCESS_PUBLIC = 'public';
const ACCESS_AUTH = 'authenticated';

/** Statuses visible to everyone including public. */
const PUBLIC_ALLOWED_STATUSES = ['Agreement', 'Unilateral'];

/**
 * Build a SQL snippet that restricts rows to PUBLIC_ALLOWED_STATUSES
 * when accessLevel is 'public'. Returns { sql, params }.
 *
 * `sql`    — the WHERE condition string (empty string when no restriction needed)
 * `params` — parameter values to append to the outer query params array
 *
 * Usage:
 *   const { sql, params: apParams } = accessLevelStatusClause(req.accessLevel, 'l', params.length + 1);
 *   params.push(...apParams);
 *   if (sql) where.push(sql);
 *
 * @param {'public'|'authenticated'} accessLevel
 * @param {string} tableAlias  — e.g. 'l' for feature_model_limit, 'loc' for feature_model_location
 * @param {number} startParamIdx — 1-based index of the next SQL parameter
 */
function accessLevelStatusClause(accessLevel, tableAlias, startParamIdx) {
  if (accessLevel === ACCESS_AUTH) {
    return { sql: '', params: [] };
  }
  // Public: whitelist approach — only show allowed statuses
  const placeholders = PUBLIC_ALLOWED_STATUSES
    .map((_, i) => `$${startParamIdx + i}`)
    .join(', ');
  return {
    sql: `${tableAlias}.status IN (${placeholders})`,
    params: PUBLIC_ALLOWED_STATUSES,
  };
}

module.exports = {
  ACCESS_PUBLIC,
  ACCESS_AUTH,
  PUBLIC_ALLOWED_STATUSES,
  accessLevelStatusClause,
};
