-- Correct fmlimit_to_fmlocation for LIM_BSL_135–136 (see seed / spreadsheet)
-- Each limit may link to MULTIPLE locations; PK is (fuid_limit, fuid_location).
-- Use INSERT for missing pairs — do NOT UPDATE fuid_location when 2+ rows exist per limit.

BEGIN;

INSERT INTO fmlimit_to_fmlocation (fuid_limit, fuid_location) VALUES
  ('LIM_BSL_135', 'LOC_TD.140_2008'),
  ('LIM_BSL_135', 'LOC_TD.141_2008'),
  ('LIM_BSL_136', 'LOC_TD.141_2008'),
  ('LIM_BSL_136', 'LOC_TD.142_2008')
ON CONFLICT (fuid_limit, fuid_location) DO NOTHING;

COMMIT;

-- Verify (4 rows for 135–136):
-- SELECT fuid_limit, fuid_location FROM fmlimit_to_fmlocation
-- WHERE fuid_limit IN ('LIM_BSL_135', 'LIM_BSL_136')
-- ORDER BY fuid_limit, fuid_location;
