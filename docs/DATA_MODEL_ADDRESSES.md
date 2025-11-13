# Facilities Address Data Model

This document describes how address-related fields are used for the `facilities` table.

The goal is to have **clear roles** for each field and to mark old fields that we plan to remove.

---

## Overview

We use these groups of fields:

- Country: `country`, `country_code`
- State / Province: `state_province`, `state_code`, (legacy: `state`)
- Postal / ZIP: `postal_code`, (legacy: `zip_code`)

The database does not enforce different types (they are all text), so **the meaning is defined by convention** here.

---

## Country Fields

**`country_code`**
- Purpose: canonical, machine-friendly identifier.
- Value: ISO 3166-1 alpha-2 code (e.g. `US`, `CA`, `DE`).
- Usage:
  - Filtering, search, joins, analytics.
  - Logic that depends on country.

**`country`**
- Purpose: human-friendly, display value.
- Value: full country name or label (e.g. `United States`, `Canada`, `Germany`).
- Usage:
  - UI display.
  - Optional: can be derived from `country_code` using a mapping table.

**Important rules**
- Store the **2-letter country code** in `country_code`.
- Store the **human-readable name/label** in `country`.
- Do **not** store the code in `country`.

---

## State / Province Fields

**`state_province`**
- Purpose: human-friendly region name.
- Value: full state/province/region name (e.g. `Texas`, `California`, `British Columbia`).
- Usage:
  - UI display.
  - Searching by human-readable text where exact code is not required.

**`state_code`**
- Purpose: canonical region identifier where applicable.
- Value: short region code (e.g. `TX`, `CA`, `BC`) when a code exists. May be `null` for countries without such codes.
- Usage:
  - Filtering, analytics, normalized lookups.

**`state`** (LEGACY)
- Status: **legacy / deprecated**.
- Historical purpose: older field holding some state/region text.
- Current behavior:
  - May still contain data from older records.
  - New code should **not write** to `state`.
  - It may be used as a temporary **read-only fallback** when populating `state_province` for old data.
- Future plan:
  - Migrate any needed values into `state_province`.
  - Remove `state` from the database once migration is complete.

**Important rules**
- New development should use **`state_province` + `state_code`**.
- `state` is for backwards compatibility only and should be treated as read-only, with the goal of eventual removal.

---

## Postal / ZIP Fields

**`postal_code`**
- Purpose: canonical postal/ZIP code field for all countries.
- Value: postal code string (e.g. `78701`, `SW1A 1AA`, `75001`).
- Usage:
  - All new reads/writes of postal codes should use `postal_code`.

**`zip_code`** (LEGACY)
- Status: **legacy / deprecated**.
- Historical purpose: US-specific postal code field.
- Current behavior:
  - May still contain values for older records.
  - New code should **not write** to `zip_code`.
  - It may be used as a temporary **read-only fallback** when `postal_code` is empty for old data.
- Future plan:
  - Migrate any remaining values into `postal_code`.
  - Remove `zip_code` from the database once migration is complete.

**Important rules**
- `postal_code` is the single source of truth for postal/ZIP codes.
- `zip_code` exists only for backwards compatibility and will be dropped after migration.

---

## General Guidelines

1. **Normalization**
   - Use `*_code` fields (`country_code`, `state_code`) for normalized codes.
   - Use non-code fields (`country`, `state_province`) for human-readable display names.

2. **Legacy fields**
   - `state` and `zip_code` are legacy.
   - Do not write new data into them.
   - Use them only as read-only fallbacks while old data is being migrated.
   - Tag any remaining usages in the code with comments indicating they are temporary.

3. **Future cleanup**
   - After migrating all required data:
     - Remove fallback logic that reads from legacy fields.
     - Drop `state` and `zip_code` columns from the database schema.

---

_Last updated: 2024-04-19_
