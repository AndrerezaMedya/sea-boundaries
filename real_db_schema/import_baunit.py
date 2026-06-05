import csv
import os

CSV_FILE = "real_db_schema/BAUnit Block - BAUnit.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_baunit.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel basic_administrative_unit\n")
            out_file.write("CREATE TABLE IF NOT EXISTS basic_administrative_unit (\n")
            out_file.write("    uID VARCHAR(50) PRIMARY KEY,\n")
            out_file.write("    basicAdministrativeUnitName VARCHAR(255) NOT NULL,\n")
            out_file.write("    basicAdministrativeUnitType VARCHAR(100) NOT NULL,\n")
            out_file.write("    basicAdministrativeUnitContext TEXT,\n")
            out_file.write("    pID VARCHAR(50)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data dari CSV\n")
            
            count = 0
            for row in csv_reader:
                def sql_val(val):
                    if not val or str(val).strip() == '' or val == 'NULL':
                        return "NULL"
                    return f"'{str(val).replace(chr(39), chr(39)+chr(39))}'"
                
                cols = ['uID', 'basicAdministrativeUnitName', 'basicAdministrativeUnitType', 'basicAdministrativeUnitContext', 'pID']
                
                vals = [sql_val(row.get(c, '')) for c in cols]
                
                insert_stmt = f"INSERT INTO basic_administrative_unit ({', '.join(cols)}) VALUES ({', '.join(vals)}) ON CONFLICT (uID) DO NOTHING;\n"
                
                out_file.write(insert_stmt)
                count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
