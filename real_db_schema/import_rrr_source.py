import csv
import os

CSV_FILE = "real_db_schema/R_RRR_Source.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_rrr_source.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel relasi rrr_to_source\n")
            out_file.write("CREATE TABLE IF NOT EXISTS rrr_to_source (\n")
            out_file.write("    rrrID VARCHAR(50) NOT NULL,\n")
            out_file.write("    sID VARCHAR(50) NOT NULL,\n")
            out_file.write("    PRIMARY KEY (rrrID, sID)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data dari CSV\n")
            
            count = 0
            for row in csv_reader:
                rrrid = row.get('rrrID', '').strip()
                sid = row.get('sID', '').strip()
                
                if rrrid and sid:
                    insert_stmt = f"INSERT INTO rrr_to_source (rrrID, sID) VALUES ('{rrrid}', '{sid}') ON CONFLICT (rrrID, sID) DO NOTHING;\n"
                    out_file.write(insert_stmt)
                    count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
