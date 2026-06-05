// Shared test helpers. Mocks the pg pool and builds an Express app suitable
// for supertest. Routes import { pool } from '../db/pool', so we monkey-patch
// the singleton's `query` method.

const { pool } = require('../db/pool');
const { createApp } = require('../app');

/**
 * Replace pool.query with a programmable mock.
 *
 *   const mock = mockPool();
 *   mock.enqueue({ rows: [...] });               // FIFO response queue
 *   mock.respond((sql, params) => ({ rows: ... })); // dynamic responder
 *
 * After each test, call `mock.reset()` to restore the original method.
 */
function mockPool() {
  const original = pool.query.bind(pool);
  const calls = [];
  const queue = [];
  let dynamic = null;

  pool.query = async (sql, params = []) => {
    calls.push({ sql, params });
    if (dynamic) {
      const r = dynamic(sql, params);
      if (r && typeof r.then === 'function') return r;
      return r;
    }
    if (queue.length === 0) {
      throw new Error(
        `mockPool: no queued response for query:\n${sql.slice(0, 200)}`,
      );
    }
    const next = queue.shift();
    if (next instanceof Error) throw next;
    return next;
  };

  return {
    calls,
    enqueue(result) {
      queue.push(result);
    },
    enqueueError(err) {
      queue.push(err instanceof Error ? err : new Error(err));
    },
    respond(fn) {
      dynamic = fn;
    },
    reset() {
      pool.query = original;
    },
  };
}

/** Build an app with rate-limit + http logger disabled for clean test output. */
function buildTestApp() {
  process.env.REQUIRE_BBOX = 'false';
  process.env.ENABLE_METADATA_API = 'true';
  return createApp({ enableRateLimit: false, enableHttpLogger: false });
}

/** Convenience: a GeoJSON FeatureCollection with the given feature properties. */
function fcRow(features = []) {
  return {
    rows: [
      {
        geojson: {
          type: 'FeatureCollection',
          features,
        },
      },
    ],
  };
}

module.exports = { mockPool, buildTestApp, fcRow };
