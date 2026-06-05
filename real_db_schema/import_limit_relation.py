import csv

CSV_FILE = "real_db_schema/Feature Model_ LIMIT - R_ Overall_Curve.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_limit_relation.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            out_file.write("-- Membuat tabel relasi fmlimit_to_sacurve (Tanpa Strict FK)\n")
            out_file.write("CREATE TABLE IF NOT EXISTS fmlimit_to_sacurve (\n")
            out_file.write("    fuid_limit VARCHAR(50) NOT NULL,\n")
            out_file.write("    said_curve VARCHAR(50) NOT NULL,\n")
            out_file.write("    PRIMARY KEY (fuid_limit, said_curve)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data relasi\n")
            
            count = 0
            for row in csv_reader:
                fuid_limit = row.get('fuID', '').strip()
                said_curve = row.get('saID', '').strip()
                
                if fuid_limit and said_curve:
                    insert_stmt = f"INSERT INTO fmlimit_to_sacurve (fuid_limit, said_curve) VALUES ('{fuid_limit}', '{said_curve}') ON CONFLICT (fuid_limit, said_curve) DO NOTHING;\n"
                    out_file.write(insert_stmt)
                    count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} relasi)")
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    generate_sql()
