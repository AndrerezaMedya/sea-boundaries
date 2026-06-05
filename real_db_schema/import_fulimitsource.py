import csv
import os

CSV_FILE = "real_db_schema/R_ Source_Limit.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_fulimitsource.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel relasi fmlimit_to_source\n")
            out_file.write("CREATE TABLE IF NOT EXISTS fmlimit_to_source (\n")
            out_file.write("    fuid_limit VARCHAR(50) NOT NULL,\n")
            out_file.write("    sID VARCHAR(50) NOT NULL,\n")
            out_file.write("    description TEXT,\n")
            out_file.write("    PRIMARY KEY (fuid_limit, sID)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data dari CSV\n")
            
            count = 0
            for row in csv_reader:
                fuid = row.get('fuID', '').strip()
                sid = row.get('sID', '').strip()
                desc = row.get('Description', '').strip()
                
                if fuid and sid:
                    desc_val = f"'{desc.replace(chr(39), chr(39)+chr(39))}'" if desc else 'NULL'
                    insert_stmt = f"INSERT INTO fmlimit_to_source (fuid_limit, sID, description) VALUES ('{fuid}', '{sid}', {desc_val}) ON CONFLICT (fuid_limit, sID) DO NOTHING;\n"
                    out_file.write(insert_stmt)
                    count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
