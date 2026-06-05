-- Migration 001 — Performance indexes for S-121 backend.
-- Idempotent (CREATE INDEX IF NOT EXISTS). Safe to re-run.
-- Apply once after seeding completes.

-- ── GIST spatial indexes ─────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_spatial_points_geom
  ON spatial_points USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_spatial_curves_geom
  ON spatial_curves USING GIST (geom);

CREATE INDEX IF NOT EXISTS idx_spatial_baselines_geom
  ON spatial_baselines USING GIST (geom);

-- ── B-Tree indexes on junction FK columns ───────────────────────────────────
-- Composite PKs already cover the leading column; add indexes on the other column.
CREATE INDEX IF NOT EXISTS idx_fmloc_to_sapoint_said
  ON fmlocation_to_sapoint (said_point);

CREATE INDEX IF NOT EXISTS idx_fmlimit_to_sacurve_said
  ON fmlimit_to_sacurve (said_curve);

CREATE INDEX IF NOT EXISTS idx_fmlimit_to_fmlocation_loc
  ON fmlimit_to_fmlocation (fuid_location);

CREATE INDEX IF NOT EXISTS idx_fmloc_to_source_sid
  ON fmlocation_to_source (sID);

CREATE INDEX IF NOT EXISTS idx_fmlimit_to_source_sid
  ON fmlimit_to_source (sID);

CREATE INDEX IF NOT EXISTS idx_baunit_to_source_sid
  ON baunit_to_source (sID);

CREATE INDEX IF NOT EXISTS idx_source_to_party_pid
  ON source_to_party (pID);

CREATE INDEX IF NOT EXISTS idx_rrr_to_source_sid
  ON rrr_to_source (sID);

CREATE INDEX IF NOT EXISTS idx_rrr_to_bau_uid
  ON rrr_to_bau (uID);

-- ── B-Tree indexes on commonly filtered columns ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_feature_model_limit_status
  ON feature_model_limit (status);

CREATE INDEX IF NOT EXISTS idx_feature_model_limit_object_type
  ON feature_model_limit (limit_object_type);

CREATE INDEX IF NOT EXISTS idx_feature_model_location_type
  ON feature_model_location (location_type_list);

CREATE INDEX IF NOT EXISTS idx_spatial_baselines_bsl_type
  ON spatial_baselines (bsl_type);

-- ── Refresh planner statistics ──────────────────────────────────────────────
ANALYZE spatial_points;
ANALYZE spatial_curves;
ANALYZE spatial_baselines;
ANALYZE feature_model_limit;
ANALYZE feature_model_location;
ANALYZE fmlocation_to_sapoint;
ANALYZE fmlimit_to_sacurve;
ANALYZE fmlimit_to_fmlocation;
ANALYZE fmlocation_to_source;
ANALYZE fmlimit_to_source;
ANALYZE rrr_to_source;
ANALYZE rrr_to_bau;
