# Database Index Recommendations

To support the Phase 2 query builder, create the following indexes in Postgres:

```sql
-- Cursor pagination for alphabetical sort
CREATE INDEX IF NOT EXISTS companies_company_name_id_idx
  ON companies (company_name, id);

-- Geography filters by state
CREATE INDEX IF NOT EXISTS facilities_state_idx
  ON facilities (state);

-- Capability booleans (partial indexes keep them small)
CREATE INDEX IF NOT EXISTS capabilities_smt_idx
  ON capabilities (company_id)
  WHERE pcb_assembly_smt = true;

CREATE INDEX IF NOT EXISTS capabilities_through_hole_idx
  ON capabilities (company_id)
  WHERE pcb_assembly_through_hole = true;

CREATE INDEX IF NOT EXISTS capabilities_mixed_idx
  ON capabilities (company_id)
  WHERE pcb_assembly_mixed = true;

CREATE INDEX IF NOT EXISTS capabilities_fine_pitch_idx
  ON capabilities (company_id)
  WHERE pcb_assembly_fine_pitch = true;

CREATE INDEX IF NOT EXISTS capabilities_box_build_idx
  ON capabilities (company_id)
  WHERE box_build_assembly = true;

CREATE INDEX IF NOT EXISTS capabilities_cable_harness_idx
  ON capabilities (company_id)
  WHERE cable_harness_assembly = true;
```

These cover the boolean filters used by `companySearch` and keep pagination responsive even as the dataset grows.
