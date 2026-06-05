import csv
import os

CSV_FILE = "real_db_schema/Feature Model_ LOCATION - FM_ Overall.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_location.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel feature_model_location\n")
            out_file.write("CREATE TABLE IF NOT EXISTS feature_model_location (\n")
            out_file.write("    fuID VARCHAR(50) PRIMARY KEY,\n")
            out_file.write("    label VARCHAR(255) NOT NULL,\n")
            out_file.write("    status VARCHAR(50) NOT NULL,\n")
            out_file.write("    releasibility_type VARCHAR(50) NOT NULL,\n")
            out_file.write("    location_type_list VARCHAR(100) NOT NULL,\n")
            out_file.write("    interpolation_role VARCHAR(50) NOT NULL,\n")
            out_file.write("    point_type VARCHAR(50) NOT NULL,\n")
            out_file.write("    start_life_span DATE NOT NULL,\n")
            out_file.write("    end_life_span DATE,\n")
            out_file.write("    horizontal_datum VARCHAR(50) NOT NULL,\n")
            out_file.write("    vertical_datum VARCHAR(50)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data dari CSV\n")
            
            count = 0
            for row in csv_reader:
                # Benerin format tanggal
                start_date = row['StartLifeSpan'].replace(':', '-') if row['StartLifeSpan'] else None
                end_date = row['EndLifeSpan'].replace(':', '-') if row['EndLifeSpan'] else None
                
                # Helper untuk bikin string SQL (kasih kutip kalo ada isinya, atau tulis NULL)
                def sql_val(val):
                    if not val or val == 'NULL':
                        return "NULL"
                    # Escape single quote buat SQL
                    return f"'{val.replace(chr(39), chr(39)+chr(39))}'"
                
                v_fuID = sql_val(row['fuID'])
                v_label = sql_val(row['Label'])
                v_status = sql_val(row['Status'])
                v_rel = sql_val(row['ReleasibilityType'])
                v_loc = sql_val(row['LocationTypeList'])
                v_int = sql_val(row['InterpolationRole'])
                v_point = sql_val(row['PointType'])
                v_start = sql_val(start_date)
                v_end = sql_val(end_date)
                v_hor = sql_val(row['HorizontalDatum'])
                v_ver = sql_val(row['VerticalDatum'])
                
                insert_stmt = f"INSERT INTO feature_model_location (fuID, label, status, releasibility_type, location_type_list, interpolation_role, point_type, start_life_span, end_life_span, horizontal_datum, vertical_datum) VALUES ({v_fuID}, {v_label}, {v_status}, {v_rel}, {v_loc}, {v_int}, {v_point}, {v_start}, {v_end}, {v_hor}, {v_ver}) ON CONFLICT (fuID) DO NOTHING;\n"
                
                out_file.write(insert_stmt)
                count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
