// Geoprocessing policy (stricter than display collection harvest).

function envNumber(name, fallback, { min, max } = {}) {
  const n = Number(process.env[name] ?? fallback);
  if (!Number.isFinite(n)) return fallback;
  let v = n;
  if (min !== undefined) v = Math.max(min, v);
  if (max !== undefined) v = Math.min(max, v);
  return v;
}

/** Max bbox area (deg²) for /api/geo — same order of magnitude as display MVT harvest (default 25). */
function geoMaxBboxAreaDeg2() {
  return envNumber('GEO_MAX_BBOX_AREA_DEG2', 25, { min: 0.01, max: 500 });
}

function geoMaxInputFeatures() {
  return envNumber('GEO_MAX_FEATURES', 500, { min: 1, max: 5000 });
}

function geoMaxOutputFeatures() {
  return envNumber('GEO_MAX_OUTPUT_FEATURES', 100, { min: 1, max: 500 });
}

function geoMaxBufferKm() {
  return envNumber('GEO_MAX_BUFFER_KM', 500, { min: 0.001, max: 2000 });
}

/** Per-layer cap for intersect (whole-layer runs are expensive). */
function geoMaxIntersectInputFeatures() {
  return envNumber('GEO_MAX_INTERSECT_FEATURES', 75, { min: 1, max: 500 });
}

/** Max candidate segment pairs before intersection. */
function geoMaxIntersectPairs() {
  return envNumber('GEO_MAX_INTERSECT_PAIRS', 2500, { min: 10, max: 50000 });
}

module.exports = {
  geoMaxBboxAreaDeg2,
  geoMaxInputFeatures,
  geoMaxOutputFeatures,
  geoMaxBufferKm,
  geoMaxIntersectInputFeatures,
  geoMaxIntersectPairs,
};
