import geopandas as gpd

SHP_FILE = "real_db_schema/shp/Baseline_Database/Baseline_Database.shp"
SQL_OUTPUT_FILE = "real_db_schema/seed_baselines.sql"

def generate_shp_sql():
    try:
        print("Membaca file Shapefile Baseline...")
        gdf = gpd.read_file(SHP_FILE)
        
        # Pastikan data berada pada proyeksi WGS84 (EPSG:4326)
        if gdf.crs and gdf.crs.to_epsg() != 4326:
            gdf = gdf.to_crs(epsg=4326)
            
        with open(SQL_OUTPUT_FILE, 'w', encoding='utf-8') as out_file:
            out_file.write("-- Membuat tabel spatial_baselines\n")
            out_file.write("CREATE TABLE IF NOT EXISTS spatial_baselines (\n")
            out_file.write("    saID VARCHAR(50) PRIMARY KEY,\n")
            out_file.write("    location VARCHAR(255),\n")
            out_file.write("    bsl_type VARCHAR(255),\n")
            out_file.write("    geom GEOMETRY(Geometry, 4326)\n")
            out_file.write(");\n\n")
            
            out_file.write("-- Memasukkan data spasial beserta kolom Geometri-nya\n")
            
            count = 0
            for idx, row in gdf.iterrows():
                def sql_val(val):
                    import math
                    if val is None or str(val).strip() == '' or (isinstance(val, float) and math.isnan(val)):
                        return "NULL"
                    return f"'{str(val).replace(chr(39), chr(39)+chr(39))}'"

                saID = sql_val(row.get('saID'))
                loc = sql_val(row.get('Location'))
                bsl_type = sql_val(row.get('BSL_Type'))
                
                # WKT geometri
                wkt = row.geometry.wkt if row.geometry else None
                if wkt:
                    geom_sql = f"ST_SetSRID(ST_GeomFromText('{wkt}'), 4326)"
                else:
                    geom_sql = "NULL"
                
                insert_stmt = f"INSERT INTO spatial_baselines (saID, location, bsl_type, geom) VALUES ({saID}, {loc}, {bsl_type}, {geom_sql}) ON CONFLICT (saID) DO NOTHING;\n"
                out_file.write(insert_stmt)
                count += 1
                
        print(f"Selesai! File SQL ber-geometri berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baseline)")
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    generate_shp_sql()
