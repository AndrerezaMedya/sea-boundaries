-- IHO S-121 Foreign Key Constraints Script
-- Menambahkan relasi fisik antar tabel agar terhubung di ERD DBeaver secara otomatis.
--
-- PENTING (PostgreSQL):
-- Kolom dari seed SQL tanpa tanda kutip disimpan lowercase (fuid, pid, sid, said, uid).
-- Jangan pakai "fuID" / "pID" — itu akan error "column does not exist".
--
-- Prasyarat: jalankan audit orphan dulu (backend: node audit_data_quality.js).
-- Beberapa FK polymorphic (rrrID, said_curve) sengaja tidak dibuat — lihat bagian 3.

-- =======================================================================================
-- 1. TABEL MASTER YANG MERUJUK KE party
-- =======================================================================================
ALTER TABLE "right"
    ADD CONSTRAINT fk_right_party
    FOREIGN KEY (pid) REFERENCES party(pid) ON DELETE CASCADE;

ALTER TABLE responsibility
    ADD CONSTRAINT fk_responsibility_party
    FOREIGN KEY (pid) REFERENCES party(pid) ON DELETE CASCADE;

ALTER TABLE restriction
    ADD CONSTRAINT fk_restriction_party
    FOREIGN KEY (pid) REFERENCES party(pid) ON DELETE CASCADE;

ALTER TABLE basic_administrative_unit
    ADD CONSTRAINT fk_baunit_party
    FOREIGN KEY (pid) REFERENCES party(pid) ON DELETE CASCADE;

-- =======================================================================================
-- 2. TABEL RELASI (JUNCTION TABLES)
-- =======================================================================================

-- a. source_to_party
ALTER TABLE source_to_party
    ADD CONSTRAINT fk_stp_source
    FOREIGN KEY (sid) REFERENCES source(sid) ON DELETE CASCADE,
    ADD CONSTRAINT fk_stp_party
    FOREIGN KEY (pid) REFERENCES party(pid) ON DELETE CASCADE;

-- b. baunit_to_source
ALTER TABLE baunit_to_source
    ADD CONSTRAINT fk_bts_baunit
    FOREIGN KEY (uid) REFERENCES basic_administrative_unit(uid) ON DELETE CASCADE,
    ADD CONSTRAINT fk_bts_source
    FOREIGN KEY (sid) REFERENCES source(sid) ON DELETE CASCADE;

-- c. fmlocation_to_sapoint
ALTER TABLE fmlocation_to_sapoint
    ADD CONSTRAINT fk_flsp_location
    FOREIGN KEY (fuid_location) REFERENCES feature_model_location(fuid) ON DELETE CASCADE,
    ADD CONSTRAINT fk_flsp_point
    FOREIGN KEY (said_point) REFERENCES spatial_points(said) ON DELETE CASCADE;

-- d. fmlimit_to_fmlocation
ALTER TABLE fmlimit_to_fmlocation
    ADD CONSTRAINT fk_flfl_limit
    FOREIGN KEY (fuid_limit) REFERENCES feature_model_limit(fuid) ON DELETE CASCADE,
    ADD CONSTRAINT fk_flfl_location
    FOREIGN KEY (fuid_location) REFERENCES feature_model_location(fuid) ON DELETE CASCADE;

-- e. fmlocation_to_source
-- Catatan: sid → source mungkin sudah ada (fk_floc_src_sid). Lewati baris fk_fls_source jika error duplicate.
ALTER TABLE fmlocation_to_source
    ADD CONSTRAINT fk_fls_location
    FOREIGN KEY (fuid_location) REFERENCES feature_model_location(fuid) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_fls_source'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_floc_src_sid'
  ) THEN
    ALTER TABLE fmlocation_to_source
      ADD CONSTRAINT fk_fls_source
      FOREIGN KEY (sid) REFERENCES source(sid) ON DELETE CASCADE;
  END IF;
END $$;

-- f. fmlimit_to_source
ALTER TABLE fmlimit_to_source
    ADD CONSTRAINT fk_flimits_limit
    FOREIGN KEY (fuid_limit) REFERENCES feature_model_limit(fuid) ON DELETE CASCADE;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_flimits_source'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_flim_src_sid'
  ) THEN
    ALTER TABLE fmlimit_to_source
      ADD CONSTRAINT fk_flimits_source
      FOREIGN KEY (sid) REFERENCES source(sid) ON DELETE CASCADE;
  END IF;
END $$;

-- =======================================================================================
-- 3. TABEL POLYMORPHIC — FK PARSIAL SAJA
-- =======================================================================================
-- rrrID → right | responsibility | restriction (tidak bisa satu FK Postgres)
-- said_curve → spatial_curves | spatial_baselines

ALTER TABLE rrr_to_source
    ADD CONSTRAINT fk_rts_source
    FOREIGN KEY (sid) REFERENCES source(sid) ON DELETE CASCADE;

ALTER TABLE rrr_to_bau
    ADD CONSTRAINT fk_rtb_baunit
    FOREIGN KEY (uid) REFERENCES basic_administrative_unit(uid) ON DELETE CASCADE;

ALTER TABLE fmlimit_to_sacurve
    ADD CONSTRAINT fk_flsc_limit
    FOREIGN KEY (fuid_limit) REFERENCES feature_model_limit(fuid) ON DELETE CASCADE;

-- =======================================================================================
-- Virtual FK di DBeaver (rrrID, said_curve) — lihat komentar di versi sebelumnya / S121_DATABASE_SCHEMA.md
-- =======================================================================================
