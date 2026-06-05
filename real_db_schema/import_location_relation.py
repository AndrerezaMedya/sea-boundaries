import csv
import os

CSV_FILE = "real_db_schema/Feature Model_ LOCATION - R_ FM_SA.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_location_relation.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel relasi feature_model_location ke spatial_points\n")
            out_file.write("CREATE TABLE IF NOT EXISTS fmlocation_to_sapoint (\n")
            out_file.write("    fuid_location VARCHAR(50) NOT NULL,\n")
            out_file.write("    said_point VARCHAR(50) NOT NULL,\n")
            out_file.write("    PRIMARY KEY (fuid_location, said_point)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data relasi dari CSV\n")
            
            count = 0
            for row in csv_reader:
                def sql_val(val):
                    if not val or val == 'NULL':
                        return "NULL"
                    return f"'{val.replace(chr(39), chr(39)+chr(39))}'"
                
                v_fuid = sql_val(row['fuID'])
                v_said = sql_val(row['saID'])
                
                insert_stmt = f"INSERT INTO fmlocation_to_sapoint (fuid_location, said_point) VALUES ({v_fuid}, {v_said}) ON CONFLICT DO NOTHING;\n"
                
                out_file.write(insert_stmt)
                count += 1
                
        print(f"Selesai! File SQL relasi berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
