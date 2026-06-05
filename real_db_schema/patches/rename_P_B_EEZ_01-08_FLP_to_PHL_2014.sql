-- Fix Philippines EEZ boundary points: FLP → PHL in fuID, PHA → PHL in label
-- P_B_EEZ_01_FLP_2014 .. P_B_EEZ_08_FLP_2014 (8 rows)
-- Run in DBeaver. If 25P02: ROLLBACK; then re-run entire script.

BEGIN;

-- ── 1. Junction tables ───────────────────────────────────────────────────────

UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_01_PHL_2014' WHERE fuid_location = 'P_B_EEZ_01_FLP_2014';
UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_02_PHL_2014' WHERE fuid_location = 'P_B_EEZ_02_FLP_2014';
UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_03_PHL_2014' WHERE fuid_location = 'P_B_EEZ_03_FLP_2014';
UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_04_PHL_2014' WHERE fuid_location = 'P_B_EEZ_04_FLP_2014';
UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_05_PHL_2014' WHERE fuid_location = 'P_B_EEZ_05_FLP_2014';
UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_06_PHL_2014' WHERE fuid_location = 'P_B_EEZ_06_FLP_2014';
UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_07_PHL_2014' WHERE fuid_location = 'P_B_EEZ_07_FLP_2014';
UPDATE fmlocation_to_sapoint SET fuid_location = 'P_B_EEZ_08_PHL_2014' WHERE fuid_location = 'P_B_EEZ_08_FLP_2014';

UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_01_PHL_2014' WHERE fuid_location = 'P_B_EEZ_01_FLP_2014';
UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_02_PHL_2014' WHERE fuid_location = 'P_B_EEZ_02_FLP_2014';
UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_03_PHL_2014' WHERE fuid_location = 'P_B_EEZ_03_FLP_2014';
UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_04_PHL_2014' WHERE fuid_location = 'P_B_EEZ_04_FLP_2014';
UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_05_PHL_2014' WHERE fuid_location = 'P_B_EEZ_05_FLP_2014';
UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_06_PHL_2014' WHERE fuid_location = 'P_B_EEZ_06_FLP_2014';
UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_07_PHL_2014' WHERE fuid_location = 'P_B_EEZ_07_FLP_2014';
UPDATE fmlocation_to_source SET fuid_location = 'P_B_EEZ_08_PHL_2014' WHERE fuid_location = 'P_B_EEZ_08_FLP_2014';

UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_01_PHL_2014' WHERE fuid_location = 'P_B_EEZ_01_FLP_2014';
UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_02_PHL_2014' WHERE fuid_location = 'P_B_EEZ_02_FLP_2014';
UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_03_PHL_2014' WHERE fuid_location = 'P_B_EEZ_03_FLP_2014';
UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_04_PHL_2014' WHERE fuid_location = 'P_B_EEZ_04_FLP_2014';
UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_05_PHL_2014' WHERE fuid_location = 'P_B_EEZ_05_FLP_2014';
UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_06_PHL_2014' WHERE fuid_location = 'P_B_EEZ_06_FLP_2014';
UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_07_PHL_2014' WHERE fuid_location = 'P_B_EEZ_07_FLP_2014';
UPDATE fmlimit_to_fmlocation SET fuid_location = 'P_B_EEZ_08_PHL_2014' WHERE fuid_location = 'P_B_EEZ_08_FLP_2014';

-- ── 2. Master: feature_model_location (fuID + label) ───────────────────────────

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_01_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_01_FLP_2014';

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_02_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_02_FLP_2014';

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_03_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_03_FLP_2014';

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_04_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_04_FLP_2014';

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_05_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_05_FLP_2014';

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_06_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_06_FLP_2014';

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_07_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_07_FLP_2014';

UPDATE feature_model_location
SET
  fuID = 'P_B_EEZ_08_PHL_2014',
  label = 'Boundary Point of Exclusive Economic Zone (IDN - PHL, 2014)'
WHERE fuID = 'P_B_EEZ_08_FLP_2014';

COMMIT;

-- Verify:
-- SELECT fuID, label FROM feature_model_location
-- WHERE fuID LIKE 'P_B_EEZ_%_PHL_2014' ORDER BY fuID;
-- SELECT fuID FROM feature_model_location WHERE fuID LIKE '%_FLP_2014';  -- 0 rows
