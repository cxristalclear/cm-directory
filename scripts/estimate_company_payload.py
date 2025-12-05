"""Estimate Supabase payload size for the reduced company column set."""
from __future__ import annotations

import csv
import json
from collections import defaultdict
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "EMS_Companies_Database_-_DB_Export.csv"


def load_payload() -> list[dict]:
    """Load and assemble company records from a CSV file (DATA_PATH) into a nested list of dictionaries.
    Parameters:
        - None: This function takes no parameters; it reads rows from the module-level DATA_PATH CSV file.
    Returns:
        - list[dict]: A list of company records where each dict contains company fields and nested lists:
            - "facilities": list[dict] of facility records
            - "capabilities": list containing a single capabilities dict (or empty list)
            - "certifications": list[dict] of certification records
            - "industries": list[dict] of industry records
        The payload is sorted by the company_name field."""
    companies: dict[str, dict] = {}
    facilities: dict[str, list[dict]] = defaultdict(list)
    capabilities: dict[str, dict] = {}
    certifications: dict[str, list[dict]] = defaultdict(list)
    industries: dict[str, list[dict]] = defaultdict(list)

    with DATA_PATH.open(newline="") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            table_name = row["table_name"]

            if table_name == "companies":
                company_id = row["companies.id"]
                companies[company_id] = {
                    "id": company_id,
                    "slug": row["companies.slug"],
                    "company_name": row["companies.company_name"],
                    "dba_name": row["companies.dba_name"],
                    "description": row["companies.description"],
                    "employee_count_range": row["companies.employee_count_range"],
                    "is_active": row["companies.is_active"],
                    "website_url": row["companies.website_url"],
                    "updated_at": row["companies.updated_at"],
                }
            elif table_name == "facilities":
                company_id = row["company_id"]
                facilities[company_id].append(
                    {
                        "id": row["id"],
                        "company_id": company_id,
                        "city": row["city"],
                        "state": row["state"],
                        "country": row["country"],
                        "latitude": row["latitude"],
                        "longitude": row["longitude"],
                        "facility_type": row["facility_type"],
                        "is_primary": row["is_primary"],
                    }
                )
            elif table_name == "capabilities":
                company_id = row["company_id"]
                capabilities[company_id] = {
                    "pcb_assembly_smt": row["pcb_assembly_smt"],
                    "pcb_assembly_through_hole": row["pcb_assembly_through_hole"],
                    "cable_harness_assembly": row["cable_harness_assembly"],
                    "box_build_assembly": row["box_build_assembly"],
                    "prototyping": row["prototyping"],
                    "low_volume_production": row["low_volume_production"],
                    "medium_volume_production": row["medium_volume_production"],
                    "high_volume_production": row["high_volume_production"],
                }
            elif table_name == "certifications":
                company_id = row["company_id"]
                certifications[company_id].append(
                    {
                        "id": row["id"],
                        "certification_type": row["certification_type"],
                        "certification_name": row["certification_type"],
                    }
                )
            elif table_name == "industries":
                company_id = row["company_id"]
                industries[company_id].append(
                    {
                        "id": row["id"],
                        "industry_name": row["industry_name"],
                    }
                )

    payload: list[dict] = []
    for company_id, company in companies.items():
        record = dict(company)
        record["facilities"] = facilities.get(company_id, [])
        capability = capabilities.get(company_id)
        record["capabilities"] = [capability] if capability else []
        record["certifications"] = certifications.get(company_id, [])
        record["industries"] = industries.get(company_id, [])
        payload.append(record)

    payload.sort(key=lambda c: c.get("company_name") or "")
    return payload


def main() -> None:
    """Compute and print size statistics for a loaded payload of company data.
    Parameters:
        - None: This function takes no parameters; it obtains data by calling load_payload().
    Returns:
        - None: Prints company count, total payload size (bytes and KB), and approximate per-company footprint to stdout."""
    payload = load_payload()
    json_blob = json.dumps(payload, ensure_ascii=False)
    size_bytes = len(json_blob.encode("utf-8"))
    per_company = size_bytes / max(len(payload), 1)
    print(f"Companies analysed: {len(payload)}")
    print(f"Payload size: {size_bytes} bytes (~{size_bytes / 1024:.1f} KB)")
    print(f"Approx per-company footprint: {per_company:.1f} bytes")


if __name__ == "__main__":
    main()
