-- Rename feature_model_location.fuID: P_B_MOF_12..20_AUS_1997 → _1981
-- Run in DBeaver against Cloud SQL (sea-boundaries). Review SELECT previews first.
-- Idempotent: safe to re-run only if old IDs still exist (will no-op after success).

BEGIN;

-- ── Preview (optional — run before COMMIT block) ─────────────────────────────
-- SELECT fuID, label FROM feature_model_location
-- WHERE fuID IN (
--   'P_B_MOF_12_AUS_1997','P_B_MOF_13_AUS_1997','P_B_MOF_14_AUS_1997','P_B_MOF_15_AUS_1997',
--   'P_B_MOF_16_AUS_1997','P_B_MOF_17_AUS_1997','P_B_MOF_18_AUS_1997','P_B_MOF_19_AUS_1997',
--   'P_B_MOF_20_AUS_1997'
-- );

-- ── 1. Junction tables (fuid_location is part of composite PK) ───────────────

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_12_AUS_1981'
WHERE fuid_location = 'P_B_MOF_12_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_13_AUS_1981'
WHERE fuid_location = 'P_B_MOF_13_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_14_AUS_1981'
WHERE fuid_location = 'P_B_MOF_14_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_15_AUS_1981'
WHERE fuid_location = 'P_B_MOF_15_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_16_AUS_1981'
WHERE fuid_location = 'P_B_MOF_16_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_17_AUS_1981'
WHERE fuid_location = 'P_B_MOF_17_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_18_AUS_1981'
WHERE fuid_location = 'P_B_MOF_18_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_19_AUS_1981'
WHERE fuid_location = 'P_B_MOF_19_AUS_1997';

UPDATE fmlocation_to_sapoint
SET fuid_location = 'P_B_MOF_20_AUS_1981'
WHERE fuid_location = 'P_B_MOF_20_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_12_AUS_1981'
WHERE fuid_location = 'P_B_MOF_12_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_13_AUS_1981'
WHERE fuid_location = 'P_B_MOF_13_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_14_AUS_1981'
WHERE fuid_location = 'P_B_MOF_14_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_15_AUS_1981'
WHERE fuid_location = 'P_B_MOF_15_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_16_AUS_1981'
WHERE fuid_location = 'P_B_MOF_16_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_17_AUS_1981'
WHERE fuid_location = 'P_B_MOF_17_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_18_AUS_1981'
WHERE fuid_location = 'P_B_MOF_18_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_19_AUS_1981'
WHERE fuid_location = 'P_B_MOF_19_AUS_1997';

UPDATE fmlocation_to_source
SET fuid_location = 'P_B_MOF_20_AUS_1981'
WHERE fuid_location = 'P_B_MOF_20_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_12_AUS_1981'
WHERE fuid_location = 'P_B_MOF_12_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_13_AUS_1981'
WHERE fuid_location = 'P_B_MOF_13_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_14_AUS_1981'
WHERE fuid_location = 'P_B_MOF_14_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_15_AUS_1981'
WHERE fuid_location = 'P_B_MOF_15_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_16_AUS_1981'
WHERE fuid_location = 'P_B_MOF_16_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_17_AUS_1981'
WHERE fuid_location = 'P_B_MOF_17_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_18_AUS_1981'
WHERE fuid_location = 'P_B_MOF_18_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_19_AUS_1981'
WHERE fuid_location = 'P_B_MOF_19_AUS_1997';

UPDATE fmlimit_to_fmlocation
SET fuid_location = 'P_B_MOF_20_AUS_1981'
WHERE fuid_location = 'P_B_MOF_20_AUS_1997';

-- ── 2. Master table + label tahun perjanjian ─────────────────────────────────

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_12_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_12_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_13_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_13_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_14_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_14_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_15_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_15_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_16_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_16_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_17_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_17_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_18_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_18_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_19_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_19_AUS_1997';

UPDATE feature_model_location
SET
  fuID = 'P_B_MOF_20_AUS_1981',
  label = 'Boundary Point of Fisheries Zone (IDN - AUS, 1981)'
WHERE fuID = 'P_B_MOF_20_AUS_1997';

COMMIT;

-- ── Verify (run after COMMIT) ───────────────────────────────────────────────
-- SELECT fuID, label FROM feature_model_location
-- WHERE fuID LIKE 'P_B_MOF_1_' || '%' AND fuID LIKE '%AUS%'
-- ORDER BY fuID;
--
-- Orphan check — should return 0 rows each:
-- SELECT fuid_location FROM fmlocation_to_sapoint
-- WHERE fuid_location NOT IN (SELECT fuID FROM feature_model_location);
-- SELECT fuid_location FROM fmlocation_to_source
-- WHERE fuid_location NOT IN (SELECT fuID FROM feature_model_location);
-- SELECT fuid_location FROM fmlimit_to_fmlocation
-- WHERE fuid_location NOT IN (SELECT fuID FROM feature_model_location);
