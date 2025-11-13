-- 001_location_schema.sql
-- Sets up canonical country/state reference tables and normalization trigger logic

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE OR REPLACE FUNCTION public.normalize_location_text(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
RETURNS NULL ON NULL INPUT
AS $$
  -- Normalize by trimming/collapsing whitespace, removing diacritics, lowercasing,
  -- and stripping punctuation so names/aliases share a consistent ASCII match key.
  SELECT NULLIF(
    regexp_replace(
      lower(
        unaccent(
          regexp_replace(trim(input), '\s+', ' ', 'g')
        )
      ),
      '[^a-z0-9]',
      '',
      'g'
    ),
    ''
  )
$$;

CREATE TABLE IF NOT EXISTS public.countries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  iso2 char(2) NOT NULL UNIQUE,
  iso3 char(3),
  name text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (
    COALESCE(public.normalize_location_text(name), '')
  ) STORED
);

CREATE TABLE IF NOT EXISTS public.country_aliases (
  alias text PRIMARY KEY,
  iso2 char(2) NOT NULL REFERENCES public.countries (iso2) ON DELETE CASCADE,
  alias_normalized text GENERATED ALWAYS AS (
    COALESCE(public.normalize_location_text(alias), '')
  ) STORED
);

CREATE TABLE IF NOT EXISTS public.states (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  country_iso2 char(2) NOT NULL,
  name text NOT NULL,
  code text NOT NULL,
  name_normalized text GENERATED ALWAYS AS (
    COALESCE(public.normalize_location_text(name), '')
  ) STORED,
  CONSTRAINT states_country_fk
    FOREIGN KEY (country_iso2)
    REFERENCES public.countries (iso2)
    ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_states_country_code
  ON public.states (country_iso2, upper(code));

ALTER TABLE public.facilities
  ADD COLUMN IF NOT EXISTS country_code char(2),
  ADD COLUMN IF NOT EXISTS state_code text;

CREATE INDEX IF NOT EXISTS idx_facilities_country_code
  ON public.facilities (country_code);

CREATE INDEX IF NOT EXISTS idx_facilities_state_code
  ON public.facilities (state_code);

CREATE OR REPLACE FUNCTION public.normalize_facility_address()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  trimmed_country text;
  detected_country_code char(2);
  normalized_country text;
  state_input text;
  normalized_state text;
  fallback_country char(2);
BEGIN
  trimmed_country := NULLIF(trim(NEW.country), '');

  IF NEW.country_code IS NOT NULL THEN
    detected_country_code := upper(NEW.country_code);
  END IF;

  IF trimmed_country IS NOT NULL THEN
    normalized_country := public.normalize_location_text(trimmed_country);

    SELECT iso2
      INTO detected_country_code
    FROM public.country_aliases
    WHERE alias_normalized = normalized_country
    LIMIT 1;

    IF detected_country_code IS NULL THEN
      SELECT iso2
        INTO detected_country_code
      FROM public.countries
      WHERE
        name_normalized = normalized_country
        OR upper(iso2) = upper(trimmed_country)
        OR upper(iso3) = upper(trimmed_country)
      ORDER BY
        CASE
          WHEN upper(iso2) = upper(trimmed_country) THEN 1
          WHEN upper(iso3) = upper(trimmed_country) THEN 2
          ELSE 3
        END
      LIMIT 1;
    END IF;
  END IF;

  NEW.country_code := detected_country_code;

  state_input := COALESCE(
    NULLIF(trim(NEW.state), ''),
    NULLIF(trim(NEW.state_province), '')
  );

  normalized_state := public.normalize_location_text(state_input);
  fallback_country := COALESCE(NEW.country_code, 'US');

  NEW.state_code := NULL;
  IF normalized_state IS NOT NULL THEN
    SELECT code
      INTO NEW.state_code
    FROM public.states
    WHERE country_iso2 = fallback_country
      AND (
        upper(code) = upper(state_input)
        OR name_normalized = normalized_state
      )
    LIMIT 1;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_facilities_normalize_location ON public.facilities;

CREATE TRIGGER trg_facilities_normalize_location
BEFORE INSERT OR UPDATE ON public.facilities
FOR EACH ROW
EXECUTE FUNCTION public.normalize_facility_address();

COMMIT;
