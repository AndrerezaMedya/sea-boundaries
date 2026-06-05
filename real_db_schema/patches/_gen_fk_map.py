import csv
from pathlib import Path

csv_path = Path(__file__).resolve().parent.parent / "Source Block - Source_Baru.csv"
rows = list(csv.DictReader(csv_path.open(encoding="utf-8-sig")))
vals = []
for r in rows:
    sid = r["sID"].replace("'", "''")
    sor = r["sourceOnlineResourceID"].replace("'", "''")
    ref = r["sourceReferenceID"].replace("'", "''")
    vals.append(f"  ('{sid}', '{sor}', '{ref}')")
Path(__file__).with_name("_fk_map_snippet.sql").write_text(
    "INSERT INTO _source_fk_map (sid, sor_id, ref_id) VALUES\n" + ",\n".join(vals) + ";\n",
    encoding="utf-8",
)
print(len(vals), "rows")
