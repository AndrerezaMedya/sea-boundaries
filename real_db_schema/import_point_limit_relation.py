import csv

CSV_FILE = "real_db_schema/Feature Model_ LIMIT - R_ Point_Limit.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_point_limit_relation.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.reader(file)
            header = next(csv_reader)  # Skip header karena isinya 'fuID,fuID'
            
            out_file.write("-- Membuat tabel relasi fmlimit_to_fmlocation\n")
            out_file.write("CREATE TABLE IF NOT EXISTS fmlimit_to_fmlocation (\n")
            out_file.write("    fuid_limit VARCHAR(50) NOT NULL,\n")
            out_file.write("    fuid_location VARCHAR(50) NOT NULL,\n")
            out_file.write("    PRIMARY KEY (fuid_limit, fuid_location)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data relasi\n")
            
            count = 0
            for row in csv_reader:
                if len(row) >= 2:
                    fuid_limit = row[0].strip()
                    fuid_location = row[1].strip()
                    
                    if fuid_limit and fuid_location:
                        insert_stmt = f"INSERT INTO fmlimit_to_fmlocation (fuid_limit, fuid_location) VALUES ('{fuid_limit}', '{fuid_location}') ON CONFLICT (fuid_limit, fuid_location) DO NOTHING;\n"
                        out_file.write(insert_stmt)
                        count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} relasi)")
        
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    generate_sql()
