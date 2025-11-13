-- 004_seed_country_aliases.sql
-- Adds common free-text aliases that map back to ISO countries

INSERT INTO public.country_aliases (alias, iso2)
VALUES
  ('USA', 'US'),
  ('U.S.', 'US'),
  ('United States', 'US'),
  ('United States of America', 'US'),
  ('United States America', 'US'),
  ('US', 'US'),
  ('U.S.A.', 'US'),
  ('UK', 'GB'),
  ('Great Britain', 'GB'),
  ('Britain', 'GB'),
  ('England', 'GB'),
  ('Scotland', 'GB'),
  ('Wales', 'GB'),
  ('Northern Ireland', 'GB'),
  ('Taiwan', 'TW'),
  ('TAIWAN', 'TW'),
  ('Republic of China', 'TW'),
  ('Hong Kong', 'HK'),
  ('HONG KONG', 'HK'),
  ('Macau', 'MO'),
  ('MACAU', 'MO')
ON CONFLICT (alias)
DO UPDATE SET iso2 = EXCLUDED.iso2;
