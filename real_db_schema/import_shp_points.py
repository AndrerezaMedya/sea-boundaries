import geopandas as gpd

SHP_FILE = "real_db_schema/shp/Point_Database/Point_Database.shp"
SQL_OUTPUT_FILE = "real_db_schema/seed_points.sql"

def generate_shp_sql():
    try:
        # Baca shapefile
        print("Membaca file Shapefile (ini mungkin makan waktu beberapa detik)...")
        gdf = gpd.read_file(SHP_FILE)
        
        # Pastikan data berada pada proyeksi WGS84 (EPSG:4326) yang sesuai dengan PostGIS default
        if gdf.crs and gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
            
        with open(SQL_OUTPUT_FILE, 'w', encoding='utf-8') as out_file:
            out_file.write("-- Membuat tabel spatial_points (tabel utama yang memegang koordinat Geometri)\n")
            out_file.write("CREATE TABLE IF NOT EXISTS spatial_points (\n")
            out_file.write("    saID VARCHAR(50) PRIMARY KEY,\n")
            out_file.write("    location VARCHAR(255),\n")
            out_file.write("    latitude VARCHAR(50),\n")
            out_file.write("    longitude VARCHAR(50),\n")
            out_file.write("    geom GEOMETRY(Point, 4326)\n")
            out_file.write(");\n\n")
            
            out_file.write("-- Memasukkan data spasial beserta kolom Geometri-nya\n")
            
            count = 0
            for idx, row in gdf.iterrows():
                # Helper function untuk nulis NULL atau string dengan aman
                def sql_val(val):
                    import math
                    if val is None or str(val).strip() == '' or (isinstance(val, float) and math.isnan(val)):
                        return "NULL"
                    return f"'{str(val).replace(chr(39), chr(39)+chr(39))}'"

                # Sesuai dengan kolom di gambar yang kamu kirim
                saID = sql_val(row.get('saID'))
                loc = sql_val(row.get('Location'))
                lat = sql_val(row.get('Latitude'))
                lon = sql_val(row.get('Longitude'))
                
                # Mengubah geometri ke WKT (Well-Known Text) buat dibaca PostGIS
                wkt = row.geometry.wkt if row.geometry else None
                if wkt:
                    # Menggunakan fungsi bawaan PostGIS untuk mengubah WKT jadi tipe Geometry
                    geom_sql = f"ST_SetSRID(ST_GeomFromText('{wkt}'), 4326)"
                else:
                    geom_sql = "NULL"
                
                insert_stmt = f"INSERT INTO spatial_points (saID, location, latitude, longitude, geom) VALUES ({saID}, {loc}, {lat}, {lon}, {geom_sql}) ON CONFLICT (saID) DO NOTHING;\n"
                out_file.write(insert_stmt)
                count += 1
                
        print(f"Selesai! File SQL ber-geometri berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} titik)")
        print("Langkah selanjutnya: kamu bisa masukin file seed_points.sql ini ke Cloud SQL pakai DBeaver!")
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    generate_shp_sql()
