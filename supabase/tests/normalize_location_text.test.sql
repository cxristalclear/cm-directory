-- normalize_location_text behavior checks
BEGIN;

DO $$
DECLARE
  normalized text;
BEGIN
  normalized := public.normalize_location_text('  hSiNcHu  ');
  IF normalized <> 'hsinchu' THEN
    RAISE EXCEPTION 'Expected lowercase output without surrounding whitespace, got %', normalized;
  END IF;
END $$;

DO $$
DECLARE
  normalized text;
BEGIN
  normalized := public.normalize_location_text('Québec-City!!!');
  IF normalized <> 'quebeccity' THEN
    RAISE EXCEPTION 'Expected accent removal and punctuation stripping, got %', normalized;
  END IF;
END $$;

DO $$
DECLARE
  normalized text;
BEGIN
  normalized := public.normalize_location_text('   New    York   ');
  IF normalized <> 'newyork' THEN
    RAISE EXCEPTION 'Expected collapsed internal whitespace before stripping, got %', normalized;
  END IF;
END $$;

ROLLBACK;
