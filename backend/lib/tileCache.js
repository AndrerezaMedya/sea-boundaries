// In-memory LRU cache for MVT protobuf tiles (Fase 4).

const EMPTY = Symbol('EMPTY_TILE');

function tileCacheMaxEntries() {
  const n = Number(process.env.TILE_CACHE_MAX_ENTRIES || 8000);
  if (!Number.isFinite(n) || n < 100) return 8000;
  return Math.min(Math.floor(n), 50_000);
}

function tileCacheTtlMs() {
  const sec = Number(process.env.TILE_CACHE_TTL_SECONDS || 3600);
  if (!Number.isFinite(sec) || sec < 0) return 3600_000;
  return Math.min(Math.floor(sec), 86_400) * 1000;
}

function tileCacheControlMaxAge() {
  const sec = Number(process.env.TILE_CACHE_HTTP_MAX_AGE || 3600);
  if (!Number.isFinite(sec) || sec < 0) return 3600;
  return Math.min(Math.floor(sec), 86_400);
}

/** Bump when tile SQL / classification changes (invalidates in-memory MVT cache). */
function tileCacheSchemaVersion() {
  return String(process.env.TILE_CACHE_SCHEMA_VERSION || '8').trim() || '8';
}

function cacheKey(tileset, z, x, y) {
  return `${tileCacheSchemaVersion()}:${tileset}:${z}:${x}:${y}`;
}

/** @type {Map<string, { value: Buffer | typeof EMPTY, expiresAt: number }>} */
const store = new Map();

function touch(key, entry) {
  store.delete(key);
  store.set(key, entry);
}

function evictExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.expiresAt <= now) store.delete(key);
  }
}

function evictOldest() {
  const first = store.keys().next().value;
  if (first !== undefined) store.delete(first);
}

/**
 * @param {string} tileset
 * @param {number} z
 * @param {number} x
 * @param {number} y
 */
function getCachedTile(tileset, z, x, y) {
  const key = cacheKey(tileset, z, x, y);
  const entry = store.get(key);
  if (!entry) return { hit: false };
  if (entry.expiresAt <= Date.now()) {
    store.delete(key);
    return { hit: false };
  }
  touch(key, entry);
  if (entry.value === EMPTY) {
    return { hit: true, empty: true };
  }
  return { hit: true, buffer: entry.value };
}

/**
 * @param {string} tileset
 * @param {number} z
 * @param {number} x
 * @param {number} y
 * @param {Buffer|null|undefined} buffer
 */
function setCachedTile(tileset, z, x, y, buffer) {
  // Do not cache empty tiles — prevents long-lived 204 responses after SQL/data fixes.
  if (!buffer || buffer.length === 0) {
    return;
  }
  evictExpired();
  while (store.size >= tileCacheMaxEntries()) {
    evictOldest();
  }
  const key = cacheKey(tileset, z, x, y);
  touch(key, {
    value: buffer,
    expiresAt: Date.now() + tileCacheTtlMs(),
  });
}

function clearTileCache() {
  store.clear();
}

module.exports = {
  getCachedTile,
  setCachedTile,
  clearTileCache,
  tileCacheControlMaxAge,
};
