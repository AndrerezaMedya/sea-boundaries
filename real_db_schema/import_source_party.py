import csv
import os

CSV_FILE = "real_db_schema/R_Source_Party.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_source_party.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel relasi source_to_party\n")
            out_file.write("CREATE TABLE IF NOT EXISTS source_to_party (\n")
            out_file.write("    sID VARCHAR(50) NOT NULL,\n")
            out_file.write("    pID VARCHAR(50) NOT NULL,\n")
            out_file.write("    PRIMARY KEY (sID, pID)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data dari CSV\n")
            
            count = 0
            for row in csv_reader:
                sid = row.get('sID', '').strip()
                pid = row.get('pID', '').strip()
                
                if sid and pid:
                    insert_stmt = f"INSERT INTO source_to_party (sID, pID) VALUES ('{sid}', '{pid}') ON CONFLICT (sID, pID) DO NOTHING;\n"
                    out_file.write(insert_stmt)
                    count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
