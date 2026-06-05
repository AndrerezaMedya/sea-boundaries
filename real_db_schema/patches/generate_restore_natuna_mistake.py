"""Generate SQL to undo mistaken Natuna Sea bulk update on spatial_points."""
import re
from pathlib import Path

SEED = Path(__file__).resolve().parent.parent / "seed_points.sql"
OUT = Path(__file__).resolve().parent / "fix_spatial_points_natuna_mistake.sql"

rows = []
with open(SEED, encoding="utf-8") as f:
    for line in f:
        if "P_EEZ_" not in line or "INSERT" not in line:
            continue
        m = re.search(r"VALUES \('(P_EEZ_[^']+)',\s*'((?:[^']|'')*)'", line)
        if m:
            said = m.group(1)
            loc = m.group(2).replace("''", "'")
            rows.append((said, loc))

wrong = [(s, loc) for s, loc in rows if s >= "P_EEZ_070" and s <= "P_EEZ_553"]

value_rows = []
for said, loc in wrong:
    loc_esc = loc.replace("'", "''")
    value_rows.append(f"  ('{said}', '{loc_esc}')")

lines = [
    "-- Undo mistaken: location = 'Natuna Sea' WHERE said >= 'P_EEZ_070' AND said <= 'P_EEZ_553'",
    f"-- Restores {len(wrong)} rows from seed_points.sql, then sets Natuna Sea on P_EEZ_0070..P_EEZ_0553.",
    "--",
    "-- If you see 25P02: run ROLLBACK; first, then execute this whole script again.",
    "--",
    "BEGIN;",
    "",
    "CREATE TEMP TABLE _restore_location (",
    "  said TEXT PRIMARY KEY,",
    "  location TEXT NOT NULL",
    ");",
    "",
    "INSERT INTO _restore_location (said, location) VALUES",
    ",\n".join(value_rows) + ";",
    "",
    "UPDATE spatial_points sp",
    "SET location = r.location",
    "FROM _restore_location r",
    "WHERE sp.said = r.said",
    "  AND sp.location = 'Natuna Sea';",
    "",
    "UPDATE spatial_points",
    "SET location = 'Natuna Sea'",
    "WHERE said >= 'P_EEZ_0070'",
    "  AND said <= 'P_EEZ_0553';",
    "",
    "DROP TABLE _restore_location;",
    "",
    "COMMIT;",
    "",
    "-- Verify:",
    "-- SELECT COUNT(*) FROM spatial_points",
    "-- WHERE said >= 'P_EEZ_0070' AND said <= 'P_EEZ_0553' AND location = 'Natuna Sea';  -- 484",
    "-- SELECT COUNT(*) FROM spatial_points",
    "-- WHERE location = 'Natuna Sea' AND said >= 'P_EEZ_0700' AND said <= 'P_EEZ_553';  -- 0",
]

OUT.write_text("\n".join(lines), encoding="utf-8")
print(f"Wrote {OUT} ({len(wrong)} restore rows)")
