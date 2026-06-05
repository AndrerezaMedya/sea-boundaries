-- Link P_B_EEZ_01..08_PHL_2014 to national source IDN_PHL_2014 (matches LIM_EEZ_06)
-- Idempotent: ON CONFLICT DO NOTHING

BEGIN;

INSERT INTO fmlocation_to_source (fuid_location, sID, description) VALUES
  ('P_B_EEZ_01_PHL_2014', 'IDN_PHL_2014', 'National'),
  ('P_B_EEZ_02_PHL_2014', 'IDN_PHL_2014', 'National'),
  ('P_B_EEZ_03_PHL_2014', 'IDN_PHL_2014', 'National'),
  ('P_B_EEZ_04_PHL_2014', 'IDN_PHL_2014', 'National'),
  ('P_B_EEZ_05_PHL_2014', 'IDN_PHL_2014', 'National'),
  ('P_B_EEZ_06_PHL_2014', 'IDN_PHL_2014', 'National'),
  ('P_B_EEZ_07_PHL_2014', 'IDN_PHL_2014', 'National'),
  ('P_B_EEZ_08_PHL_2014', 'IDN_PHL_2014', 'National')
ON CONFLICT (fuid_location, sID) DO NOTHING;

COMMIT;

-- Verify (8 rows):
-- SELECT fuid_location, sID, description FROM fmlocation_to_source
-- WHERE fuid_location LIKE 'P_B_EEZ_%_PHL_2014' AND sID = 'IDN_PHL_2014'
-- ORDER BY fuid_location;
