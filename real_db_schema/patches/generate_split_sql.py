import geopandas as gpd
import os

SHP_FILE = "d:/web/coba-gis/sea-boundaries/real_db_schema/shp/Curve_Revisi/Curve_Revisi.shp"
SQL_OUTPUT_FILE = "d:/web/coba-gis/sea-boundaries/real_db_schema/patches/split_cs_limits.sql"

def sql_val(val):
    if val is None or str(val).strip() == '':
        return "NULL"
    return f"'{str(val).replace(chr(39), chr(39)+chr(39))}'"

def generate_sql():
    print("Membaca Shapefile...")
    gdf = gpd.read_file(SHP_FILE)
    if gdf.crs and gdf.crs.to_epsg() != 4326:
        gdf = gdf.to_crs(epsg=4326)
        
    geom_dict = {}
    for idx, row in gdf.iterrows():
        said = str(row.get('saID')).strip()
        loc = sql_val(row.get('Location'))
        wkt = row.geometry.wkt if row.geometry else None
        if wkt:
            geom_sql = f"ST_SetSRID(ST_GeomFromText('{wkt}'), 4326)"
            geom_dict[said] = (loc, geom_sql)

    print("Menyusun SQL...")
    
    with open(SQL_OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("-- Transaksi pemecahan batas Continental Shelf\n")
        f.write("BEGIN;\n\n")
        
        f.write("-- 1. Update & Insert Geometri Kurva dari Curve_Revisi\n")
        
        # CURVE_CS_06
        if 'CURVE_CS_06' in geom_dict:
            f.write(f"UPDATE spatial_curves SET geom = {geom_dict['CURVE_CS_06'][1]} WHERE said = 'CURVE_CS_06';\n")
        # CURVE_CS_20
        if 'CURVE_CS_20' in geom_dict:
            f.write(f"UPDATE spatial_curves SET geom = {geom_dict['CURVE_CS_20'][1]} WHERE said = 'CURVE_CS_20';\n")
        # CURVE_CS_25
        if 'CURVE_CS_25' in geom_dict:
            loc, geom = geom_dict['CURVE_CS_25']
            f.write(f"INSERT INTO spatial_curves (said, location, geom) VALUES ('CURVE_CS_25', {loc}, {geom}) ON CONFLICT (said) DO UPDATE SET geom = EXCLUDED.geom;\n\n")

        f.write("-- 2. Insert Batas Baru (LIM_CS_06N dan LIM_CS_06O)\n")
        f.write("INSERT INTO feature_model_limit (fuid, label, status, releasibility_type, limit_object_type, arc_geometry_type, start_life_span, end_life_span, horizontal_datum)\n")
        f.write("VALUES\n")
        f.write("  ('LIM_CS_06N', 'Boundary of Continental Shelf (IDN - AUS, 1972)', 'Agreement', 'Official', 'International Boundary', 'geodesic', '2026-04-24', NULL, 'WGS84 (original datum unspecified)'),\n")
        f.write("  ('LIM_CS_06O', 'Boundary of Continental Shelf (IDN - PNG, 1980)', 'Agreement', 'Official', 'International Boundary', 'geodesic', '2026-04-24', NULL, 'WGS84 (original datum unspecified)')\n")
        f.write("ON CONFLICT (fuid) DO UPDATE SET label = EXCLUDED.label;\n\n")

        f.write("-- 3. Update fmlimit_to_sacurve\n")
        f.write("-- Hapus relasi lama yang dipindahkan\n")
        f.write("DELETE FROM fmlimit_to_sacurve WHERE fuid_limit = 'LIM_CS_06L' AND said_curve IN ('CURVE_CS_06', 'CURVE_CS_07');\n")
        f.write("DELETE FROM fmlimit_to_sacurve WHERE fuid_limit = 'LIM_CS_06K' AND said_curve = 'CURVE_CS_20';\n\n")

        f.write("-- Tambah relasi baru\n")
        f.write("INSERT INTO fmlimit_to_sacurve (fuid_limit, said_curve) VALUES\n")
        f.write("  ('LIM_CS_06N', 'CURVE_CS_06'),\n")
        f.write("  ('LIM_CS_06N', 'CURVE_CS_07'),\n")
        f.write("  ('LIM_CS_06K', 'CURVE_CS_25'),\n")
        f.write("  ('LIM_CS_06O', 'CURVE_CS_20')\n")
        f.write("ON CONFLICT DO NOTHING;\n\n")

        f.write("-- 4. Update fmlimit_to_fmlocation\n")
        f.write("-- Hapus relasi lama untuk keempat limit ini (jika ada) untuk memastikan bersih\n")
        f.write("DELETE FROM fmlimit_to_fmlocation WHERE fuid_limit IN ('LIM_CS_06K', 'LIM_CS_06L', 'LIM_CS_06O', 'LIM_CS_06N');\n\n")
        
        f.write("-- Masukkan relasi lokasi baru\n")
        f.write("INSERT INTO fmlimit_to_fmlocation (fuid_limit, fuid_location) VALUES\n")
        f.write("  ('LIM_CS_06O', 'P_B_CS_02_PNG_1980'),\n")
        f.write("  ('LIM_CS_06O', 'P_B_CS_03_PNG_1980'),\n")
        f.write("  ('LIM_CS_06O', 'P_B_CS_01_PNG_1980'),\n")
        f.write("  ('LIM_CS_06O', 'P_B_CS_02_PNG_1971'),\n")
        f.write("  ('LIM_CS_06K', 'P_B_CS_02_PNG_1971'),\n")
        f.write("  ('LIM_CS_06K', 'LOC_CS_0037'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A1_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A2_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A3_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A10_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A11_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A4_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A5_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A6_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A7_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A8_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A9_AUS_1971'),\n")
        f.write("  ('LIM_CS_06L', 'P_B_CS_A12_AUS_1971'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A12_AUS_1971'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A13_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A14_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A15_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A16_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A17_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A18_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A19_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A20_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A21_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A22_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A23_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A24_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A25_AUS_1972'),\n")
        f.write("  ('LIM_CS_06N', 'P_B_CS_A26_AUS_1997')\n")
        f.write("ON CONFLICT DO NOTHING;\n\n")

        f.write("-- 5. Update fmlimit_to_source\n")
        f.write("-- Catatan: Sesuai instruksi user, sumber hukum eksisting untuk 06K dan 06L DIBIARKAN SAMA.\n")
        f.write("-- Hanya perlu menambahkan sumber untuk 06N dan 06O.\n")
        f.write("INSERT INTO fmlimit_to_source (fuid_limit, sid, description) VALUES\n")
        f.write("  ('LIM_CS_06N', 'TREATY_AUS_CS_1972', 'International'),\n")
        f.write("  ('LIM_CS_06N', 'IDN_AUS_CS_1972', 'National'),\n")
        f.write("  ('LIM_CS_06O', 'TREATY_PNG_1980', 'International'),\n")
        f.write("  ('LIM_CS_06O', 'IDN_PNG_1980', 'National')\n")
        f.write("ON CONFLICT DO NOTHING;\n\n")

        f.write("COMMIT;\n")
        print("SQL transaction script created!")

if __name__ == "__main__":
    generate_sql()
