#!/usr/bin/env python3
"""
Generate Zone + Governance seed SQL from spreadsheet CSV exports.

Inputs (UTF-8 with BOM OK):
  - Feature Model_ ZONE - Zone.csv
  - Feature Model_ ZONE - R_ Zone_BAU.csv
  - Feature Model_ ZONE - R_ Zone_Limit.csv   (duplicate header fuID; read by position)
  - Governance - Governance.csv
  - Governance - Gov_BA.csv

Outputs (one file per table):
  - seed_zone.sql
  - seed_zone_bau.sql
  - seed_zone_limit.sql
  - seed_governance.sql
  - seed_governance_bau.sql

Usage (from repo root):
  python real_db_schema/import_zone_governance.py
  python real_db_schema/import_zone_governance.py --validate-only
"""

from __future__ import annotations

import argparse
import csv
import sys
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent

CSV_ZONE = SCRIPT_DIR / "Feature Model_ ZONE - Zone.csv"
CSV_ZONE_BAU = SCRIPT_DIR / "Feature Model_ ZONE - R_ Zone_BAU.csv"
CSV_ZONE_LIMIT = SCRIPT_DIR / "Feature Model_ ZONE - R_ Zone_Limit.csv"
CSV_GOV = SCRIPT_DIR / "Governance - Governance.csv"
CSV_GOV_BAU = SCRIPT_DIR / "Governance - Gov_BA.csv"

OUT_ZONE = SCRIPT_DIR / "seed_zone.sql"
OUT_ZONE_BAU = SCRIPT_DIR / "seed_zone_bau.sql"
OUT_ZONE_LIMIT = SCRIPT_DIR / "seed_zone_limit.sql"
OUT_GOV = SCRIPT_DIR / "seed_governance.sql"
OUT_GOV_BAU = SCRIPT_DIR / "seed_governance_bau.sql"


def sql_val(val: str | None) -> str:
    if val is None:
        return "NULL"
    s = str(val).strip()
    if not s or s.upper() == "NULL":
        return "NULL"
    return "'" + s.replace("'", "''") + "'"


def sql_date(val: str | None) -> str:
    if val is None:
        return "NULL"
    s = str(val).strip()
    if not s:
        return "NULL"
    return sql_val(s.replace(":", "-"))


def load_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def load_zone_limit_pairs(path: Path) -> list[tuple[str, str]]:
    """CSV has two columns both named fuID; DictReader keeps only the limit id."""
    pairs: list[tuple[str, str]] = []
    with path.open(encoding="utf-8-sig", newline="") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        if not header or len(header) < 2:
            raise ValueError(f"{path.name}: expected at least 2 columns")
        for row in reader:
            if len(row) < 2:
                continue
            zone_id = row[0].strip()
            limit_id = row[1].strip()
            if zone_id and limit_id:
                pairs.append((zone_id, limit_id))
    return pairs


def validate(
    zones: list[dict[str, str]],
    zone_bau: list[dict[str, str]],
    zone_limits: list[tuple[str, str]],
    gov_rows: list[dict[str, str]],
    gov_bau: list[dict[str, str]],
) -> list[str]:
    errors: list[str] = []

    zone_ids = {r["fuID"].strip() for r in zones if r.get("fuID", "").strip()}
    if len(zone_ids) != len(zones):
        errors.append("Duplicate fuID in Zone.csv")

    for row in zone_bau:
        z = row.get("fuID", "").strip()
        u = row.get("uID", "").strip()
        if z and z not in zone_ids:
            errors.append(f"zone_bau: unknown zone fuID {z!r}")
        if not u:
            errors.append("zone_bau: row missing uID")

    seen_zl: set[tuple[str, str]] = set()
    for z, lim in zone_limits:
        if z not in zone_ids:
            errors.append(f"zone_limit: unknown zone fuID {z!r}")
        key = (z, lim)
        if key in seen_zl:
            errors.append(f"zone_limit: duplicate ({z}, {lim})")
        seen_zl.add(key)

    gov_ids: set[str] = set()
    for row in gov_rows:
        g = row.get("govID", "").strip()
        if not g:
            errors.append("governance: row missing govID")
            continue
        if g in gov_ids:
            errors.append(f"governance: duplicate govID {g}")
        gov_ids.add(g)
        if not row.get("sID", "").strip():
            errors.append(f"governance {g}: missing sID")

    for row in gov_bau:
        g = row.get("govID", "").strip()
        u = row.get("uID", "").strip()
        if g and g not in gov_ids:
            errors.append(f"governance_bau: unknown govID {g!r}")
        if not u:
            errors.append("governance_bau: row missing uID")

    return errors


def write_zone_sql(rows: list[dict[str, str]], out: Path) -> int:
    cols = [
        "fuID",
        "label",
        "releasibility_type",
        "zone_object_type",
        "jurisdiction_domain_type_list",
        "surface_relation",
        "horizontal_datum",
        "start_life_span",
        "end_life_span",
    ]
    csv_map = {
        "fuID": "fuID",
        "label": "Label",
        "releasibility_type": "ReleasibilityType",
        "zone_object_type": "ZoneObjectType",
        "jurisdiction_domain_type_list": "JurisdictionDomainTypeList",
        "surface_relation": "SurfaceRelation",
        "horizontal_datum": "HorizontalDatum",
        "start_life_span": "StartLifeSpan",
        "end_life_span": "EndLifeSpan",
    }
    date_cols = {"start_life_span", "end_life_span"}

    with out.open("w", encoding="utf-8") as f:
        f.write("-- S-121 Feature Model::Zone\n")
        f.write("-- Generated by import_zone_governance.py\n\n")
        f.write("CREATE TABLE IF NOT EXISTS feature_model_zone (\n")
        f.write("    fuID VARCHAR(50) PRIMARY KEY,\n")
        f.write("    label VARCHAR(255) NOT NULL,\n")
        f.write("    releasibility_type VARCHAR(50) NOT NULL,\n")
        f.write("    zone_object_type VARCHAR(100) NOT NULL,\n")
        f.write("    jurisdiction_domain_type_list VARCHAR(100) NOT NULL,\n")
        f.write("    surface_relation VARCHAR(50) NOT NULL,\n")
        f.write("    horizontal_datum VARCHAR(50) NOT NULL,\n")
        f.write("    start_life_span DATE NOT NULL,\n")
        f.write("    end_life_span DATE\n")
        f.write(");\n\n")
        f.write("-- Memasukkan data dari Feature Model_ ZONE - Zone.csv\n")
        for row in rows:
            vals = []
            for c in cols:
                raw = row.get(csv_map[c], "")
                if c in date_cols:
                    vals.append(sql_date(raw))
                else:
                    vals.append(sql_val(raw))
            f.write(
                f"INSERT INTO feature_model_zone ({', '.join(cols)}) "
                f"VALUES ({', '.join(vals)}) "
                f"ON CONFLICT (fuID) DO NOTHING;\n"
            )
    return len(rows)


def write_zone_bau_sql(rows: list[dict[str, str]], out: Path) -> int:
    with out.open("w", encoding="utf-8") as f:
        f.write("-- Relasi Zone -> Basic Administrative Unit\n")
        f.write("-- Generated by import_zone_governance.py\n")
        f.write("-- Prasyarat: seed_zone.sql, seed_baunit.sql\n\n")
        f.write("CREATE TABLE IF NOT EXISTS fmzone_to_bau (\n")
        f.write("    fuid_zone VARCHAR(50) NOT NULL,\n")
        f.write("    uID VARCHAR(50) NOT NULL,\n")
        f.write("    PRIMARY KEY (fuid_zone, uID)\n")
        f.write(");\n\n")
        f.write("-- Memasukkan data dari Feature Model_ ZONE - R_ Zone_BAU.csv\n")
        count = 0
        for row in rows:
            z = row.get("fuID", "").strip()
            u = row.get("uID", "").strip()
            if z and u:
                f.write(
                    f"INSERT INTO fmzone_to_bau (fuid_zone, uID) "
                    f"VALUES ({sql_val(z)}, {sql_val(u)}) "
                    f"ON CONFLICT (fuid_zone, uID) DO NOTHING;\n"
                )
                count += 1
    return count


def write_zone_limit_sql(pairs: list[tuple[str, str]], out: Path) -> int:
    with out.open("w", encoding="utf-8") as f:
        f.write("-- Relasi Zone -> Feature Model Limit\n")
        f.write("-- Generated by import_zone_governance.py\n")
        f.write("-- Prasyarat: seed_zone.sql, seed_limit.sql\n\n")
        f.write("CREATE TABLE IF NOT EXISTS fmzone_to_fmlimit (\n")
        f.write("    fuid_zone VARCHAR(50) NOT NULL,\n")
        f.write("    fuid_limit VARCHAR(50) NOT NULL,\n")
        f.write("    PRIMARY KEY (fuid_zone, fuid_limit)\n")
        f.write(");\n\n")
        f.write("-- Memasukkan data dari Feature Model_ ZONE - R_ Zone_Limit.csv\n")
        for z, lim in pairs:
            f.write(
                f"INSERT INTO fmzone_to_fmlimit (fuid_zone, fuid_limit) "
                f"VALUES ({sql_val(z)}, {sql_val(lim)}) "
                f"ON CONFLICT (fuid_zone, fuid_limit) DO NOTHING;\n"
            )
    return len(pairs)


def write_governance_sql(rows: list[dict[str, str]], out: Path) -> int:
    cols = [
        "govID",
        "reference_number",
        "label",
        "name",
        "governance_title",
        "governance_description",
        "releasibility_type",
        "date_approved",
        "date_introduced",
        "sID",
    ]
    csv_map = {
        "govID": "govID",
        "reference_number": "referenceNumber",
        "label": "Label",
        "name": "Name",
        "governance_title": "GovernanceTitle",
        "governance_description": "GovernanceDescription",
        "releasibility_type": "ReleasibilityType",
        "date_approved": "DateApproved",
        "date_introduced": "DateIntroduced",
        "sID": "sID",
    }
    date_cols = {"date_approved", "date_introduced"}

    with out.open("w", encoding="utf-8") as f:
        f.write("-- S-121 Administrative Group::Governance\n")
        f.write("-- Generated by import_zone_governance.py\n")
        f.write("-- Prasyarat: source (atau source_flat / seed source)\n\n")
        f.write("CREATE TABLE IF NOT EXISTS governance (\n")
        f.write("    govID VARCHAR(50) PRIMARY KEY,\n")
        f.write("    reference_number VARCHAR(100) NOT NULL,\n")
        f.write("    label VARCHAR(255) NOT NULL,\n")
        f.write("    name VARCHAR(255) NOT NULL,\n")
        f.write("    governance_title TEXT NOT NULL,\n")
        f.write("    governance_description TEXT,\n")
        f.write("    releasibility_type VARCHAR(50) NOT NULL,\n")
        f.write("    date_approved DATE,\n")
        f.write("    date_introduced DATE,\n")
        f.write("    sID VARCHAR(50) NOT NULL\n")
        f.write(");\n\n")
        f.write("-- Memasukkan data dari Governance - Governance.csv\n")
        for row in rows:
            vals = []
            for c in cols:
                raw = row.get(csv_map[c], "")
                if c in date_cols:
                    vals.append(sql_date(raw))
                else:
                    vals.append(sql_val(raw))
            f.write(
                f"INSERT INTO governance ({', '.join(cols)}) "
                f"VALUES ({', '.join(vals)}) "
                f"ON CONFLICT (govID) DO NOTHING;\n"
            )
    return len(rows)


def write_governance_bau_sql(rows: list[dict[str, str]], out: Path) -> int:
    with out.open("w", encoding="utf-8") as f:
        f.write("-- Relasi Governance -> Basic Administrative Unit\n")
        f.write("-- Generated by import_zone_governance.py\n")
        f.write("-- Prasyarat: seed_governance.sql, seed_baunit.sql\n\n")
        f.write("CREATE TABLE IF NOT EXISTS governance_to_bau (\n")
        f.write("    govID VARCHAR(50) NOT NULL,\n")
        f.write("    uID VARCHAR(50) NOT NULL,\n")
        f.write("    PRIMARY KEY (govID, uID)\n")
        f.write(");\n\n")
        f.write("-- Memasukkan data dari Governance - Gov_BA.csv\n")
        count = 0
        for row in rows:
            g = row.get("govID", "").strip()
            u = row.get("uID", "").strip()
            if g and u:
                f.write(
                    f"INSERT INTO governance_to_bau (govID, uID) "
                    f"VALUES ({sql_val(g)}, {sql_val(u)}) "
                    f"ON CONFLICT (govID, uID) DO NOTHING;\n"
                )
                count += 1
    return count


def print_stats(
    zones: list[dict[str, str]],
    zone_bau: list[dict[str, str]],
    zone_limits: list[tuple[str, str]],
    gov_rows: list[dict[str, str]],
    gov_bau: list[dict[str, str]],
) -> None:
    by_zone: dict[str, int] = {}
    for z, _ in zone_limits:
        by_zone[z] = by_zone.get(z, 0) + 1

    print("--- Ringkasan CSV ---")
    print(f"  feature_model_zone     : {len(zones)} baris")
    print(f"  fmzone_to_bau          : {len(zone_bau)} baris")
    print(f"  fmzone_to_fmlimit      : {len(zone_limits)} baris")
    for zid in sorted(by_zone):
        print(f"    {zid}: {by_zone[zid]} limit(s)")
    print(f"  governance             : {len(gov_rows)} baris")
    print(f"  governance_to_bau      : {len(gov_bau)} baris")


def main() -> int:
    parser = argparse.ArgumentParser(description="Generate zone + governance seed SQL")
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Only validate CSV; do not write SQL",
    )
    args = parser.parse_args()

    inputs = (
        CSV_ZONE,
        CSV_ZONE_BAU,
        CSV_ZONE_LIMIT,
        CSV_GOV,
        CSV_GOV_BAU,
    )
    for path in inputs:
        if not path.is_file():
            print(f"Missing file: {path}", file=sys.stderr)
            return 1

    zones = load_csv(CSV_ZONE)
    zone_bau = load_csv(CSV_ZONE_BAU)
    zone_limits = load_zone_limit_pairs(CSV_ZONE_LIMIT)
    gov_rows = load_csv(CSV_GOV)
    gov_bau = load_csv(CSV_GOV_BAU)

    print_stats(zones, zone_bau, zone_limits, gov_rows, gov_bau)

    errors = validate(zones, zone_bau, zone_limits, gov_rows, gov_bau)
    if errors:
        print("\nValidation FAILED:", file=sys.stderr)
        for e in errors:
            print(f"  - {e}", file=sys.stderr)
        return 1

    print("\nValidation OK.")

    if args.validate_only:
        return 0

    n_zone = write_zone_sql(zones, OUT_ZONE)
    n_zb = write_zone_bau_sql(zone_bau, OUT_ZONE_BAU)
    n_zl = write_zone_limit_sql(zone_limits, OUT_ZONE_LIMIT)
    n_gov = write_governance_sql(gov_rows, OUT_GOV)
    n_gb = write_governance_bau_sql(gov_bau, OUT_GOV_BAU)

    print("\nGenerated:")
    print(f"  {OUT_ZONE.name} ({n_zone} rows)")
    print(f"  {OUT_ZONE_BAU.name} ({n_zb} rows)")
    print(f"  {OUT_ZONE_LIMIT.name} ({n_zl} rows)")
    print(f"  {OUT_GOV.name} ({n_gov} rows)")
    print(f"  {OUT_GOV_BAU.name} ({n_gb} rows)")
    print("\nEksekusi (setelah party, baunit, limit, source):")
    print("  1. seed_zone.sql")
    print("  2. seed_zone_bau.sql")
    print("  3. seed_zone_limit.sql")
    print("  4. seed_governance.sql")
    print("  5. seed_governance_bau.sql")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
