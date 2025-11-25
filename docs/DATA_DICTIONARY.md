# Data Dictionary

## Location Normalization Fields

| Field | Table | Source | Description |
| --- | --- | --- | --- |
| `name_normalized` | `public.countries`, `public.states` | Generated column: `normalize_location_text(name)` | Lowercase, ASCII-only version of the display name with punctuation removed for consistent lookups. |
| `alias_normalized` | `public.country_aliases` | Generated column: `normalize_location_text(alias)` | Canonicalized alias token kept in sync with the normalization helper for fuzzy country matching. |

### Normalization Rules

- Trim leading/trailing whitespace and collapse interior whitespace to a single space before processing.
- Remove diacritics using PostgreSQL's `unaccent` extension so `"Québec"` becomes `"Quebec"`.
- Convert to lowercase and strip any character that is not `a-z` or `0-9`, removing punctuation and symbols.
- Return `NULL` when the resulting token is empty so generated columns never store meaningless artifacts.

These normalized fields back the matching logic in `normalize_facility_address`, ensuring that facility inputs, canonical names, and country aliases compare against the same predictable token format.
