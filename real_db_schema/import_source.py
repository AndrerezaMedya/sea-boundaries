import csv
import os

CSV_FILE = "real_db_schema/Source Block - Source.csv"
SQL_OUTPUT_FILE = "real_db_schema/seed_source.sql"

def generate_sql():
    try:
        with open(CSV_FILE, mode='r', encoding='utf-8-sig') as file, \
             open(SQL_OUTPUT_FILE, mode='w', encoding='utf-8') as out_file:
            
            csv_reader = csv.DictReader(file)
            
            # 1. Tulis CREATE TABLE
            out_file.write("-- Membuat tabel source\n")
            out_file.write("CREATE TABLE IF NOT EXISTS source (\n")
            out_file.write("    sID VARCHAR(50) PRIMARY KEY,\n")
            out_file.write("    sourceDocumentName TEXT NOT NULL,\n")
            out_file.write("    sourceOnlineResourceLinkageURL TEXT NOT NULL,\n")
            out_file.write("    sourceOnlineResourceProtocol VARCHAR(50),\n")
            out_file.write("    sourceOnlineResourceApplicationProfile VARCHAR(100),\n")
            out_file.write("    sourceOnlineResourceName TEXT,\n")
            out_file.write("    sourceOnlineResourceDescription TEXT,\n")
            out_file.write("    sourceOnlineResourceFunction VARCHAR(100),\n")
            out_file.write("    sourceRegistryNumber TEXT,\n")
            out_file.write("    sourceAdministrativeDateStamp DATE,\n")
            out_file.write("    sourceAuthoritativeDate DATE,\n")
            out_file.write("    sourceDocumentType VARCHAR(100) NOT NULL,\n")
            out_file.write("    sourceAvailabilityStatus VARCHAR(50),\n")
            out_file.write("    administrativeSourceType VARCHAR(50),\n")
            out_file.write("    spatialSourceType VARCHAR(50),\n")
            out_file.write("    sourceType VARCHAR(50),\n")
            out_file.write("    sourceRecordation DATE,\n")
            out_file.write("    responsiblePartyContactOnline TEXT,\n")
            out_file.write("    responsiblePartyOnlineProtocol VARCHAR(50),\n")
            out_file.write("    responsiblePartyOnlineApplicationProfile VARCHAR(100),\n")
            out_file.write("    responsiblePartyOnlineContactName TEXT,\n")
            out_file.write("    responsiblePartyOnlineDescription TEXT,\n")
            out_file.write("    responsiblePartyOganizationName TEXT,\n")
            out_file.write("    responsiblePartyPositionName TEXT,\n")
            out_file.write("    responsiblePartyContactPhone VARCHAR(50),\n")
            out_file.write("    responsiblePartyRole VARCHAR(50),\n")
            out_file.write("    responsiblePartyContactAddressCountry VARCHAR(100),\n")
            out_file.write("    responsiblePartyContactAddressDeliveryPoint TEXT,\n")
            out_file.write("    responsiblePartyContactAddressCity VARCHAR(100),\n")
            out_file.write("    responsiblePartyContactElectronicMailAddress VARCHAR(255),\n")
            out_file.write("    responsiblePartyContactAddressAdministrativeArea VARCHAR(100),\n")
            out_file.write("    responsiblePartyContactAddressPostalCode VARCHAR(50)\n")
            out_file.write(");\n\n")

            out_file.write("-- Memasukkan data dari CSV\n")
            
            count = 0
            for row in csv_reader:
                # Helper untuk bikin string SQL
                def sql_val(val):
                    if not val or str(val).strip() == '' or val == 'NULL':
                        return "NULL"
                    return f"'{str(val).replace(chr(39), chr(39)+chr(39))}'"
                
                # Definisikan kolom-kolom
                cols = [
                    'sID', 'sourceDocumentName', 'sourceOnlineResourceLinkageURL', 'sourceOnlineResourceProtocol',
                    'sourceOnlineResourceApplicationProfile', 'sourceOnlineResourceName', 'sourceOnlineResourceDescription',
                    'sourceOnlineResourceFunction', 'sourceRegistryNumber', 'sourceAdministrativeDateStamp',
                    'sourceAuthoritativeDate', 'sourceDocumentType', 'sourceAvailabilityStatus',
                    'administrativeSourceType', 'spatialSourceType', 'sourceType', 'sourceRecordation',
                    'responsiblePartyContactOnline', 'responsiblePartyOnlineProtocol', 'responsiblePartyOnlineApplicationProfile',
                    'responsiblePartyOnlineContactName', 'responsiblePartyOnlineDescription', 'responsiblePartyOganizationName',
                    'responsiblePartyPositionName', 'responsiblePartyContactPhone', 'responsiblePartyRole',
                    'responsiblePartyContactAddressCountry', 'responsiblePartyContactAddressDeliveryPoint',
                    'responsiblePartyContactAddressCity', 'responsiblePartyContactElectronicMailAddress',
                    'responsiblePartyContactAddressAdministrativeArea', 'responsiblePartyContactAddressPostalCode'
                ]
                
                vals = []
                for c in cols:
                    # Beberapa tanggal mungkin ada separator ':', biarkan string helper yang menanganinya nanti atau DB parser
                    raw_val = row.get(c, '')
                    if c in ['sourceAdministrativeDateStamp', 'sourceAuthoritativeDate', 'sourceRecordation']:
                         raw_val = raw_val.replace(':', '-') if raw_val else ''
                    vals.append(sql_val(raw_val))
                
                insert_stmt = f"INSERT INTO source ({', '.join(cols)}) VALUES ({', '.join(vals)}) ON CONFLICT (sID) DO NOTHING;\n"
                
                out_file.write(insert_stmt)
                count += 1
                
        print(f"Selesai! File SQL berhasil di-generate di: {SQL_OUTPUT_FILE} (Total {count} baris)")
        
    except Exception as e:
        print("Waduh, ada error:", e)

if __name__ == "__main__":
    generate_sql()
