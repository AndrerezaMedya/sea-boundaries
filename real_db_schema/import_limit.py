import csv
import os

CSV_FILE = "real_db_schema/Feature Model_ LIMIT - FM_ Overall.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_limit.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel feature_model_limit\n")
            out_file.write("CREATE TABLE IF NOT EXISTS feature_model_limit (\n")
            out_file.write("    fuID VARCHAR(50) PRIMARY KEY,\n")
            out_file.write("    label VARCHAR(255) NOT NULL,\n")
            out_file.write("    status VARCHAR(50) NOT NULL,\n")
            out_file.write("    releasibility_type VARCHAR(50) NOT NULL,\n")
            out_file.write("    limit_object_type VARCHAR(100) NOT NULL,\n")
            out_file.write("    arc_geometry_type VARCHAR(50) NOT NULL,\n")
            out_file.write("    start_life_span DATE NOT NULL,\n")
            out_file.write("    end_life_span DATE,\n")
            out_file.write("    horizontal_datum VARCHAR(50) NOT NULL\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data dari CSV\n")
            
            count = 0
            for row in csv_reader:
                # Benerin format tanggal (biasanya YYYY:MM:DD diubah ke YYYY-MM-DD)
                start_date = row['StartLifeSpan'].replace(':', '-') if row.get('StartLifeSpan') else None
                end_date = row['EndLifeSpan'].replace(':', '-') if row.get('EndLifeSpan') else None
                
                def sql_val(val):
                    if not val or str(val).strip().upper() == 'NULL':
                        return "NULL"
                    return f"'{str(val).replace(chr(39), chr(39)+chr(39))}'"
                
                v_fuID = sql_val(row.get('fuID'))
                v_label = sql_val(row.get('Label'))
                v_status = sql_val(row.get('Status'))
                v_rel = sql_val(row.get('ReleasibilityType'))
                v_limit_obj = sql_val(row.get('LimitObjectType'))
                v_arc_geom = sql_val(row.get('ArcGeometryType'))
                v_start = sql_val(start_date)
                v_end = sql_val(end_date)
                v_hor = sql_val(row.get('HorizontalDatum'))
                
                insert_stmt = f"INSERT INTO feature_model_limit (fuID, label, status, releasibility_type, limit_object_type, arc_geometry_type, start_life_span, end_life_span, horizontal_datum) VALUES ({v_fuID}, {v_label}, {v_status}, {v_rel}, {v_limit_obj}, {v_arc_geom}, {v_start}, {v_end}, {v_hor}) ON CONFLICT (fuID) DO NOTHING;\n"
                
                out_file.write(insert_stmt)
                count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
