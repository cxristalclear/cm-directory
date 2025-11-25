-- 010_backfill_facility_location_codes.sql
-- Runs the normalization trigger against all existing facility rows

BEGIN;
-- Force trigger execution on all rows by performing a no-op assignment
UPDATE public.facilities
SET country = country;
COMMIT;

-- Optional sanity check: list any rows that still lack canonical codes
SELECT id, country, state, state_province
FROM public.facilities
WHERE country IS NOT NULL AND country_code IS NULL;
