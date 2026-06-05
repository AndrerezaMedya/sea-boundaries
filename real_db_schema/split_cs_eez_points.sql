BEGIN;

-- ============================================================================
-- 1. DUPLIKASI TITIK KE 'feature_model_location'
-- ============================================================================

-- A. Membuat salinan titik untuk CS (Continental Shelf)
INSERT INTO feature_model_location (
    fuid, label, status, releasibility_type, location_type_list, 
    interpolation_role, point_type, start_life_span, end_life_span, 
    horizontal_datum, vertical_datum
)
SELECT 
    REPLACE(fuid, 'CS/EEZ', 'CS'), 
    'Boundary Point of Continental Shelf',
    status, releasibility_type, location_type_list, 
    interpolation_role, point_type, start_life_span, end_life_span, 
    horizontal_datum, vertical_datum
FROM feature_model_location
WHERE fuid LIKE '%P_B_CS/EEZ_C%';

-- B. Membuat salinan titik untuk EEZ (Exclusive Economic Zone)
INSERT INTO feature_model_location (
    fuid, label, status, releasibility_type, location_type_list, 
    interpolation_role, point_type, start_life_span, end_life_span, 
    horizontal_datum, vertical_datum
)
SELECT 
    REPLACE(fuid, 'CS/EEZ', 'EEZ'), 
    'Boundary Point of Exclusive Economic Zone (IDN - AUS, 1997)',
    status, releasibility_type, location_type_list, 
    interpolation_role, point_type, start_life_span, end_life_span, 
    horizontal_datum, vertical_datum
FROM feature_model_location
WHERE fuid LIKE '%P_B_CS/EEZ_C%';

-- ============================================================================
-- 2. DUPLIKASI RELASI KE 'fmlocation_to_sapoint' (GEOMETRI)
-- ============================================================================

INSERT INTO fmlocation_to_sapoint (fuid_location, said_point)
SELECT REPLACE(fuid_location, 'CS/EEZ', 'CS'), said_point
FROM fmlocation_to_sapoint
WHERE fuid_location LIKE '%P_B_CS/EEZ_C%';

INSERT INTO fmlocation_to_sapoint (fuid_location, said_point)
SELECT REPLACE(fuid_location, 'CS/EEZ', 'EEZ'), said_point
FROM fmlocation_to_sapoint
WHERE fuid_location LIKE '%P_B_CS/EEZ_C%';

-- ============================================================================
-- 3. UPDATE RELASI GARIS BATAS ('fmlimit_to_fmlocation')
-- ============================================================================

-- Garis CS (LIM_CS_*) diarahkan ke titik CS yang baru
UPDATE fmlimit_to_fmlocation
SET fuid_location = REPLACE(fuid_location, 'CS/EEZ', 'CS')
WHERE fuid_location LIKE '%P_B_CS/EEZ_C%' AND fuid_limit LIKE 'LIM_CS%';

-- Garis EEZ (LIM_EEZ_*) diarahkan ke titik EEZ yang baru
UPDATE fmlimit_to_fmlocation
SET fuid_location = REPLACE(fuid_location, 'CS/EEZ', 'EEZ')
WHERE fuid_location LIKE '%P_B_CS/EEZ_C%' AND fuid_limit LIKE 'LIM_EEZ%';

-- ============================================================================
-- 4. DUPLIKASI RELASI SUMBER HUKUM ('fmlocation_to_source')
-- ============================================================================

INSERT INTO fmlocation_to_source (fuid_location, sid, description)
SELECT REPLACE(fuid_location, 'CS/EEZ', 'CS'), sid, description
FROM fmlocation_to_source
WHERE fuid_location LIKE '%P_B_CS/EEZ_C%';

INSERT INTO fmlocation_to_source (fuid_location, sid, description)
SELECT REPLACE(fuid_location, 'CS/EEZ', 'EEZ'), sid, description
FROM fmlocation_to_source
WHERE fuid_location LIKE '%P_B_CS/EEZ_C%';

-- ============================================================================
-- 5. PEMBERSIHAN (HAPUS TITIK LAMA YANG MENGANDUNG 'CS/EEZ')
-- ============================================================================

-- Karena kita sudah memisahkan relasinya (UPDATE pada tabel limit),
-- dan menggunakan klausa CASCADE di Foreign Key, menghapus titik induk 
-- akan otomatis membersihkan sisa relasi di fmlocation_to_sapoint & fmlocation_to_source.
DELETE FROM feature_model_location
WHERE fuid LIKE '%P_B_CS/EEZ_C%';

COMMIT;
