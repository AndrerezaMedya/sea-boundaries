import geopandas as gpd

def main():
    shp_path = r'real_db_schema/shp/Revisi_Curve_1/Revisi_Curve_1.shp'
    try:
        df = gpd.read_file(shp_path)
    except Exception as e:
        print(f"Error reading shapefile: {e}")
        return

    filtered = df[(df['saID'] == 'CURVE_CS_08') & (df['Location'] == 'Indian Ocean')]
    
    if len(filtered) == 0:
        print("Feature not found!")
        return

    wkt = filtered.iloc[0].geometry.wkt
    
    sql = f"""-- Seed data update for CURVE_CS_08 in Indian Ocean
DELETE FROM spatial_curves WHERE said = 'CURVE_CS_08' AND location = 'Indian Ocean';

INSERT INTO spatial_curves (said, location, geometry)
VALUES ('CURVE_CS_08', 'Indian Ocean', ST_GeomFromText('{wkt}', 4326));
"""
    
    out_path = 'real_db_schema/seed_curve_cs_08.sql'
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write(sql)
    print(f"Success! Output written to {out_path}")

if __name__ == '__main__':
    main()
