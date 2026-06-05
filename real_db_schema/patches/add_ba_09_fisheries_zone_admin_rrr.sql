-- Fisheries Zone (BA_09) + linked RRR and junction rows.
-- Idempotent: ON CONFLICT DO NOTHING
--
-- Prasyarat:
--   party(IDN), source(MOU_AUS_1981), source(IDN_AUS_FISHERIES_1993) sudah ada.
--
-- Jalankan (contoh):
--   psql ... -f real_db_schema/patches/add_ba_09_fisheries_zone_admin_rrr.sql

BEGIN;

-- ---------------------------------------------------------------------------
-- basic_administrative_unit
-- ---------------------------------------------------------------------------
INSERT INTO basic_administrative_unit (
  uID,
  basicAdministrativeUnitName,
  basicAdministrativeUnitType,
  basicAdministrativeUnitContext,
  pID
) VALUES (
  'BA_09',
  'Fisheries Zone',
  'MaritimeLimitsAndBoundaries',
  'A fisheries zone is a maritime area in which a coastal State exercises sovereign rights or exclusive jurisdiction for the conservation, management, and exploitation of living marine resources, particularly fish stocks.',
  'IDN'
) ON CONFLICT (uID) DO NOTHING;

-- ---------------------------------------------------------------------------
-- right / restriction (RRR entities)
-- ---------------------------------------------------------------------------
INSERT INTO "right" (
  rrrID,
  rightType,
  rightRestrictionResponsibilityDescription,
  rightRestrictionResponsibilityShare,
  rightRestrictionResponsibilityShareCheck,
  pID
) VALUES (
  'RIGHT-004',
  'harvestRight',
  'Rights related to the utilization of marine living resources/fisheries, with due regard to conservation and optimum utilization. Their regulation and implementation are subject to agreements or cooperative arrangements with other States.',
  1,
  TRUE,
  'IDN'
) ON CONFLICT (rrrID) DO NOTHING;

INSERT INTO restriction (
  rrrID,
  restrictionType,
  partyRequired,
  rightRestrictionResponsibilityDescription,
  rightRestrictionResponsibilityShare,
  rightRestrictionResponsibilityShareCheck,
  pID
) VALUES
(
  'RESTRICTION-009',
  'authorizedAccess',
  TRUE,
  'Fishing vessels shall not fish in areas subject to the enforcement jurisdiction of the other Party unless authorized under applicable agreements, arrangements, or laws.',
  1,
  TRUE,
  'IDN'
),
(
  'RESTRICTION-010',
  'licenseCompliance',
  TRUE,
  'Fishing vessels authorized to operate in areas subject to the enforcement jurisdiction of the other Party shall comply with the applicable laws, licence terms, and conditions of that Party.',
  1,
  TRUE,
  'IDN'
),
(
  'RESTRICTION-011',
  'accessTermsAndConditions',
  TRUE,
  'Access to fisheries resources under the jurisdiction of another Party shall be subject to agreed terms and conditions, including vessel position recording, catch and effort reporting, licence requirements, observers, and access fees.',
  1,
  TRUE,
  'IDN'
)
ON CONFLICT (rrrID) DO NOTHING;

-- ---------------------------------------------------------------------------
-- baunit_to_source
-- ---------------------------------------------------------------------------
INSERT INTO baunit_to_source (uID, sID) VALUES
  ('BA_09', 'MOU_AUS_1981')
ON CONFLICT (uID, sID) DO NOTHING;

-- ---------------------------------------------------------------------------
-- rrr_to_bau
-- ---------------------------------------------------------------------------
INSERT INTO rrr_to_bau (rrrID, uID) VALUES
  ('RIGHT-004', 'BA_09'),
  ('RESPONSIBILITY-004', 'BA_09'),
  ('RESTRICTION-009', 'BA_09'),
  ('RESTRICTION-010', 'BA_09'),
  ('RESTRICTION-011', 'BA_09')
ON CONFLICT (rrrID, uID) DO NOTHING;

-- ---------------------------------------------------------------------------
-- rrr_to_source
-- ---------------------------------------------------------------------------
INSERT INTO rrr_to_source (rrrID, sID) VALUES
  ('RIGHT-004', 'IDN_AUS_FISHERIES_1993'),
  ('RESTRICTION-009', 'IDN_AUS_FISHERIES_1993'),
  ('RESTRICTION-010', 'IDN_AUS_FISHERIES_1993'),
  ('RESTRICTION-011', 'IDN_AUS_FISHERIES_1993')
ON CONFLICT (rrrID, sID) DO NOTHING;

COMMIT;

-- Verify (opsional):
-- SELECT * FROM basic_administrative_unit WHERE uid = 'BA_09';
-- SELECT rrrid FROM rrr_to_bau WHERE uid = 'BA_09' ORDER BY rrrid;
-- SELECT * FROM rrr_to_source WHERE rrrid IN ('RIGHT-004','RESTRICTION-009','RESTRICTION-010','RESTRICTION-011');
