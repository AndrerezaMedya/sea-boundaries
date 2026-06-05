-- =============================================================================
-- Migrate flat `source` → normalized S-121 Source (FK to REF + SOR tables)
-- =============================================================================
--
-- URUTAN EKSEKUSI (database yang SUDAH punya tabel source lebar / seed_source.sql lama):
--
--   1. psql ... -f real_db_schema/seed_source_reference.sql
--   2. psql ... -f real_db_schema/seed_source_online_resource.sql
--   3. psql ... -f real_db_schema/patches/migrate_source_normalize.sql
--
-- JANGAN jalankan seed_source_normalized.sql sebelum langkah 3 pada DB yang sama
-- (CREATE TABLE IF NOT EXISTS tidak mengubah skema lama; INSERT akan gagal).
--
-- DB baru dari nol: cukup jalankan ketiga seed normalisasi berurutan (ganti seed_source.sql).
--
-- Regenerate mapping: python real_db_schema/patches/_gen_fk_map.py
--                    python real_db_schema/patches/build_migrate_source_normalize.py
-- =============================================================================

BEGIN;

-- Preconditions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'source_reference'
  ) THEN
    RAISE EXCEPTION 'Missing table source_reference — run seed_source_reference.sql first';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'source_online_resource'
  ) THEN
    RAISE EXCEPTION 'Missing table source_online_resource — run seed_source_online_resource.sql first';
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'source'
  ) THEN
    RAISE EXCEPTION 'Missing table source';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 1. Tambah kolom FK (idempotent)
-- ---------------------------------------------------------------------------
ALTER TABLE source ADD COLUMN IF NOT EXISTS sourceonlineresourceid VARCHAR(50);
ALTER TABLE source ADD COLUMN IF NOT EXISTS sourcereferenceid VARCHAR(50);

-- ---------------------------------------------------------------------------
-- 2. Backfill FK dari peta Source_Baru.csv (hanya jika skema legacy masih ada)
-- ---------------------------------------------------------------------------
DO $migrate$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'source'
      AND column_name = 'sourceonlineresourcelinkageurl'
  ) THEN
    RAISE NOTICE 'Legacy flat columns not found — skipping backfill/drop (already normalized?)';
    RETURN;
  END IF;
END $migrate$;

DROP TABLE IF EXISTS _source_fk_map;
CREATE TEMP TABLE _source_fk_map (
  sid     TEXT PRIMARY KEY,
  sor_id  TEXT NOT NULL,
  ref_id  TEXT NOT NULL
);

INSERT INTO _source_fk_map (sid, sor_id, ref_id) VALUES
  ('UNCLOS1982', 'SOR_UNCLOS1982', 'REF_001'),
  ('UU17_1985', 'SOR_UU17_1985', 'REF_002'),
  ('PP38_2002', 'SOR_PP38_2002', 'REF_002'),
  ('PP37_2008', 'SOR_PP37_2008', 'REF_002'),
  ('DEPOSIT_INDONESIA_2009', 'SOR_DEPOSIT_INDONESIA_2009', 'REF_003'),
  ('UU06_1996', 'SOR_UU06_1996', 'REF_002'),
  ('UU32_2014', 'SOR_UU32_2014', 'REF_002'),
  ('IDN_MYS_CS_1969', 'SOR_IDN_MYS_CS_1969', 'REF_002'),
  ('TREATY_MYS_CS_1969', 'SOR_TREATY_MYS_CS_1969', 'REF_003'),
  ('IDN_MYS_TS_1971', 'SOR_IDN_MYS_TS_1971', 'REF_002'),
  ('TREATY_MYS_TS_1970', 'SOR_TREATY_MYS_TS_1970', 'REF_004'),
  ('IDN_SGP_TS_1973', 'SOR_IDN_SGP_TS_1973', 'REF_002'),
  ('TREATY_SGP_TS_1973', 'SOR_TREATY_SGP_TS_1973', 'REF_004'),
  ('IDN_SGP_TS_W_2010', 'SOR_IDN_SGP_TS_W_2010', 'REF_002'),
  ('TREATY_SGP_TS_W_2009', 'SOR_TREATY_SGP_TS_W_2009', 'REF_004'),
  ('IDN_SGP_TS_E_2017', 'SOR_IDN_SGP_TS_E_2017', 'REF_002'),
  ('ANNEX_IDN_SGP_TS_E_2017', 'SOR_ANNEX_IDN_SGP_TS_E_2017', 'REF_002'),
  ('TREATY_SGP_TS_E_2014', 'SOR_TREATY_SGP_TS_E_2014', 'REF_003'),
  ('IDN_AUS_CS_1971', 'SOR_IDN_AUS_CS_1971', 'REF_002'),
  ('TREATY_AUS_CS_1971', 'SOR_TREATY_AUS_CS_1971', 'REF_003'),
  ('TREATY_AUS_CS_1972', 'SOR_TREATY_AUS_CS_1972', 'REF_003'),
  ('IDN_AUS_CS_1972', 'SOR_IDN_AUS_CS_1972', 'REF_002'),
  ('ANNEX_IDN_AUS_CS_1972', 'SOR_ANNEX_IDN_AUS_CS_1972', 'REF_002'),
  ('IDN_AUS_CS_1973', 'SOR_IDN_AUS_CS_1973', 'REF_002'),
  ('TREATY_AUS_CS_1973', 'SOR_TREATY_AUS_CS_1973', 'REF_003'),
  ('IDN_AUS_FISHERIES_1993', 'SOR_IDN_AUS_FISHERIES_1993', 'REF_002'),
  ('MOU_AUS_1981', 'SOR_MOU_AUS_1981', 'REF_004'),
  ('TREATY_IDN_AUS_EEZ/CS_1997', 'SOR_TREATY_IDN_AUS_EEZ/CS_1997', 'REF_003'),
  ('IDN_MYS_THA_1972', 'SOR_IDN_MYS_THA_1972', 'REF_002'),
  ('TREATY_IDN_MYS_THA_1971', 'SOR_TREATY_IDN_MYS_THA_1971', 'REF_004'),
  ('IDN_THA_1972', 'SOR_IDN_THA_1972', 'REF_002'),
  ('TREATY_THA_CS_1971', 'SOR_TREATY_THA_CS_1971', 'REF_003'),
  ('IDN_THA_1977', 'SOR_IDN_THA_1977', 'REF_002'),
  ('TREATY_THA_CS_1975', 'SOR_TREATY_THA_CS_1975', 'REF_003'),
  ('IDN_IND_1974', 'SOR_IDN_IND_1974', 'REF_002'),
  ('TREATY_IND_CS_1974', 'SOR_TREATY_IND_CS_1974', 'REF_004'),
  ('IDN_IND_1977', 'SOR_IDN_IND_1977', 'REF_002'),
  ('TREATY_IND_CS_1977', 'SOR_TREATY_IND_CS_1977', 'REF_003'),
  ('IDN_TRI_1978', 'SOR_IDN_TRI_1978', 'REF_002'),
  ('TREATY_TRI_1978', 'SOR_TREATY_TRI_1978', 'REF_003'),
  ('IDN_VNM_2007', 'SOR_IDN_VNM_2007', 'REF_002'),
  ('TREATY_VNM_CS_2003', 'SOR_TREATY_VNM_CS_2003', 'REF_003'),
  ('IDN_PHL_2014', 'SOR_IDN_PHL_2014', 'REF_002'),
  ('TREATY_PHL_EEZ_2014', 'SOR_TREATY_PHL_EEZ_2014', 'REF_003'),
  ('IDN_PNG_1980', 'SOR_IDN_PNG_1980', 'REF_002'),
  ('TREATY_PNG_1980', 'SOR_TREATY_PNG_1980', 'REF_004'),
  ('PP36_2002', 'SOR_PP36_2002', 'REF_002'),
  ('PP37_2002', 'SOR_PP37_2002', 'REF_002'),
  ('CLCS_SUM_2008', 'SOR_CLCS_SUM_2008', 'REF_003'),
  ('UU16_2023', 'SOR_UU16_2023', 'REF_002'),
  ('UU43_2008', 'SOR_UU43_2008', 'REF_002');

UPDATE source AS s
   SET sourceonlineresourceid = m.sor_id,
       sourcereferenceid = m.ref_id
  FROM _source_fk_map AS m
 WHERE s.sid = m.sid;

-- Fail fast jika ada baris tanpa FK
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'source'
      AND column_name = 'sourceonlineresourcelinkageurl'
  ) AND EXISTS (
    SELECT 1 FROM source
    WHERE sourceonlineresourceid IS NULL OR sourcereferenceid IS NULL
  ) THEN
    RAISE EXCEPTION 'Backfill incomplete: NULL FK on source';
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. Hapus kolom flatten (legacy onlineResource + responsibleParty*)
-- ---------------------------------------------------------------------------
ALTER TABLE source DROP COLUMN IF EXISTS sourceonlineresourcelinkageurl;
ALTER TABLE source DROP COLUMN IF EXISTS sourceonlineresourceprotocol;
ALTER TABLE source DROP COLUMN IF EXISTS sourceonlineresourceapplicationprofile;
ALTER TABLE source DROP COLUMN IF EXISTS sourceonlineresourcename;
ALTER TABLE source DROP COLUMN IF EXISTS sourceonlineresourcedescription;
ALTER TABLE source DROP COLUMN IF EXISTS sourceonlineresourcefunction;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactonline;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartyonlineprotocol;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartyonlineapplicationprofile;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartyonlinecontactname;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartyonlinedescription;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartyoganizationname;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartypositionname;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactphone;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartyrole;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactaddresscountry;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactaddressdeliverypoint;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactaddresscity;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactelectronicmailaddress;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactaddressadministrativearea;
ALTER TABLE source DROP COLUMN IF EXISTS responsiblepartycontactaddresspostalcode;

-- ---------------------------------------------------------------------------
-- 4. NOT NULL + FK (idempotent)
-- ---------------------------------------------------------------------------
ALTER TABLE source ALTER COLUMN sourceonlineresourceid SET NOT NULL;
ALTER TABLE source ALTER COLUMN sourcereferenceid SET NOT NULL;

ALTER TABLE source DROP CONSTRAINT IF EXISTS fk_source_online_resource;
ALTER TABLE source
  ADD CONSTRAINT fk_source_online_resource
  FOREIGN KEY (sourceonlineresourceid)
  REFERENCES source_online_resource(sourceonlineresourceid)
  ON DELETE RESTRICT;

ALTER TABLE source DROP CONSTRAINT IF EXISTS fk_source_reference;
ALTER TABLE source
  ADD CONSTRAINT fk_source_reference
  FOREIGN KEY (sourcereferenceid)
  REFERENCES source_reference(sourcereferenceid)
  ON DELETE RESTRICT;

-- ---------------------------------------------------------------------------
-- 5. View kompatibilitas API / laporan (bentuk flat lama via JOIN)
-- ---------------------------------------------------------------------------
CREATE OR REPLACE VIEW source_flat AS
SELECT
  s.sid,
  s.sourcedocumentname,
  s.sourceregistrynumber,
  s.sourceadministrativedatestamp,
  s.sourceauthoritativedate,
  s.sourcedocumenttype,
  s.sourceavailabilitystatus,
  s.administrativesourcetype,
  s.spatialsourcetype,
  s.sourcetype,
  s.sourcerecordation,
  s.sourceonlineresourceid,
  s.sourcereferenceid,
  sor.sourceonlineresourcelinkageurl,
  sor.sourceonlineresourceprotocol,
  sor.sourceonlineresourceapplicationprofile,
  sor.sourceonlineresourcename,
  sor.sourceonlineresourcedescription,
  sor.sourceonlineresourcefunction,
  ref.responsiblepartyoganizationname,
  ref.responsiblepartypositionname,
  ref.responsiblepartyrole,
  ref.responsiblepartycontactonline,
  ref.responsiblepartycontactphone,
  ref.responsiblepartycontactaddresscountry,
  ref.responsiblepartycontactaddressdeliverypoint,
  ref.responsiblepartycontactaddresscity,
  ref.responsiblepartycontactelectronicmailaddress,
  ref.responsiblepartycontactaddressadministrativearea,
  ref.responsiblepartycontactaddresspostalcode
FROM source s
JOIN source_online_resource sor
  ON s.sourceonlineresourceid = sor.sourceonlineresourceid
JOIN source_reference ref
  ON s.sourcereferenceid = ref.sourcereferenceid;

COMMIT;

-- Verify:
-- SELECT COUNT(*) FROM source;
-- SELECT sid, sourceonlineresourceid, sourcereferenceid FROM source LIMIT 5;
-- SELECT * FROM source_flat WHERE sid = 'UNCLOS1982';
