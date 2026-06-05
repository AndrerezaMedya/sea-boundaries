-- Transaksi pemecahan batas Continental Shelf
BEGIN;

-- 1. Update & Insert Geometri Kurva dari Curve_Revisi
UPDATE spatial_curves SET geom = ST_SetSRID(ST_GeomFromText('LINESTRING (133.3833333330001 -8.883333332999939, 133.23333333300002 -8.899999999999977, 130.16666666700007 -9.416666666999957, 128.00000000000009 -9.416666666999957, 127.93333333400005 -9.46666666699997)'), 4326) WHERE said = 'CURVE_CS_06';
UPDATE spatial_curves SET geom = ST_SetSRID(ST_GeomFromText('LINESTRING (140.80972222200012 1.0263888890000317, 140.81944444500004 0.7361111110000707, 141.4000000000001 -1.0763888889999293, 141.0250000000001 -2.1416666669999245)'), 4326) WHERE said = 'CURVE_CS_20';
INSERT INTO spatial_curves (said, location, geom) VALUES ('CURVE_CS_25', 'Pacific Ocean', ST_SetSRID(ST_GeomFromText('LINESTRING (141.0250000000001 -2.1416666669999245, 141.023016836 -2.1773636279999664, 141.01116184500006 -2.390753457999949)'), 4326)) ON CONFLICT (said) DO UPDATE SET geom = EXCLUDED.geom;

-- 2. Insert Batas Baru (LIM_CS_06N dan LIM_CS_06O)
INSERT INTO feature_model_limit (fuid, label, status, releasibility_type, limit_object_type, arc_geometry_type, start_life_span, end_life_span, horizontal_datum)
VALUES
  ('LIM_CS_06N', 'Boundary of Continental Shelf (IDN - AUS, 1972)', 'Agreement', 'Official', 'International Boundary', 'geodesic', '2026-04-24', NULL, 'WGS84 (original datum unspecified)'),
  ('LIM_CS_06O', 'Boundary of Continental Shelf (IDN - PNG, 1980)', 'Agreement', 'Official', 'International Boundary', 'geodesic', '2026-04-24', NULL, 'WGS84 (original datum unspecified)')
ON CONFLICT (fuid) DO UPDATE SET label = EXCLUDED.label;

-- 3. Update fmlimit_to_sacurve
-- Hapus relasi lama yang dipindahkan
DELETE FROM fmlimit_to_sacurve WHERE fuid_limit = 'LIM_CS_06L' AND said_curve IN ('CURVE_CS_06', 'CURVE_CS_07');
DELETE FROM fmlimit_to_sacurve WHERE fuid_limit = 'LIM_CS_06K' AND said_curve = 'CURVE_CS_20';

-- Tambah relasi baru
INSERT INTO fmlimit_to_sacurve (fuid_limit, said_curve) VALUES
  ('LIM_CS_06N', 'CURVE_CS_06'),
  ('LIM_CS_06N', 'CURVE_CS_07'),
  ('LIM_CS_06K', 'CURVE_CS_25'),
  ('LIM_CS_06O', 'CURVE_CS_20')
ON CONFLICT DO NOTHING;

-- 4. Update fmlimit_to_fmlocation
-- Hapus relasi lama untuk keempat limit ini (jika ada) untuk memastikan bersih
DELETE FROM fmlimit_to_fmlocation WHERE fuid_limit IN ('LIM_CS_06K', 'LIM_CS_06L', 'LIM_CS_06O', 'LIM_CS_06N');

-- Masukkan relasi lokasi baru
INSERT INTO fmlimit_to_fmlocation (fuid_limit, fuid_location) VALUES
  ('LIM_CS_06O', 'P_B_CS_02_PNG_1980'),
  ('LIM_CS_06O', 'P_B_CS_03_PNG_1980'),
  ('LIM_CS_06O', 'P_B_CS_01_PNG_1980'),
  ('LIM_CS_06O', 'P_B_CS_02_PNG_1971'),
  ('LIM_CS_06K', 'P_B_CS_02_PNG_1971'),
  ('LIM_CS_06K', 'LOC_CS_0037'),
  ('LIM_CS_06L', 'P_B_CS_A1_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A2_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A3_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A10_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A11_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A4_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A5_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A6_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A7_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A8_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A9_AUS_1971'),
  ('LIM_CS_06L', 'P_B_CS_A12_AUS_1971'),
  ('LIM_CS_06N', 'P_B_CS_A12_AUS_1971'),
  ('LIM_CS_06N', 'P_B_CS_A13_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A14_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A15_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A16_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A17_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A18_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A19_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A20_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A21_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A22_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A23_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A24_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A25_AUS_1972'),
  ('LIM_CS_06N', 'P_B_CS_A26_AUS_1997')
ON CONFLICT DO NOTHING;

-- 5. Update fmlimit_to_source
-- Catatan: Sesuai instruksi user, sumber hukum eksisting untuk 06K dan 06L DIBIARKAN SAMA.
-- Hanya perlu menambahkan sumber untuk 06N dan 06O.
INSERT INTO fmlimit_to_source (fuid_limit, sid, description) VALUES
  ('LIM_CS_06N', 'TREATY_AUS_CS_1972', 'International'),
  ('LIM_CS_06N', 'IDN_AUS_CS_1972', 'National'),
  ('LIM_CS_06O', 'TREATY_PNG_1980', 'International'),
  ('LIM_CS_06O', 'IDN_PNG_1980', 'National')
ON CONFLICT DO NOTHING;

COMMIT;
