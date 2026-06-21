import shapefile
import json

def to_wkt_point(shape):
    return f"POINT({shape.points[0][0]} {shape.points[0][1]})"

def to_wkt_linestring(shape):
    points = ", ".join([f"{p[0]} {p[1]}" for p in shape.points])
    return f"LINESTRING({points})"

with open(r'd:\web\coba-gis\sea-boundaries\patch_geom.sql', 'w') as f:
    # Read Point
    point_shp = shapefile.Reader(r"d:\web\coba-gis\sea-boundaries\real_db_schema\patches\revisi point dan curve\Revisi_Point_CS\Revisi_Point_CS.shp")
    point_records = point_shp.shapeRecords()
    p_record = point_records[0]
    p_wkt = to_wkt_point(p_record.shape)
    p_attr = p_record.record.as_dict()
    
    f.write(f"DELETE FROM spatial_points WHERE said = '{p_attr['saID']}';\n")
    # Note: escaping single quotes for the degree symbols
    lat = p_attr['Latitude'].replace("'", "''")
    lon = p_attr['Longitude'].replace("'", "''")
    f.write(f"INSERT INTO spatial_points (said, latitude, longitude, geom) VALUES ('{p_attr['saID']}', '{lat}', '{lon}', ST_GeomFromText('{p_wkt}', 4326));\n\n")

    # Read Curve
    curve_shp = shapefile.Reader(r"d:\web\coba-gis\sea-boundaries\real_db_schema\patches\revisi point dan curve\CS_Revisi\CS_Revisi.shp")
    curve_records = curve_shp.shapeRecords()
    c_record = curve_records[0]
    c_wkt = to_wkt_linestring(c_record.shape)
    c_attr = c_record.record.as_dict()
    
    f.write(f"DELETE FROM spatial_curves WHERE said = '{c_attr['saID']}';\n")
    f.write(f"INSERT INTO spatial_curves (said, location, geom) VALUES ('{c_attr['saID']}', '{c_attr.get('Location', '')}', ST_GeomFromText('{c_wkt}', 4326));\n")

print("Generated patch_geom.sql")
