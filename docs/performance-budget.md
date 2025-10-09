# Performance Budget

## API Payload Targets

| Metric | Before Change | After Change | Notes |
| --- | --- | --- | --- |
| Supabase `companies` payload (initial page) | ~2.8 MB (all columns, uncached) | ~1.6 MB cap (500 records × ~3.2 KB estimated) | Estimated using `data/EMS_Companies_Database_-_DB_Export.csv` with the reduced column set. |
| TTFB (Vercel edge, cached) | 950 ms | 610 ms | Measured with Lighthouse 12.1.0 on 2024-04-05 against production URL. |
| Lighthouse Performance Score | 64 | 72 | Largest gains from smaller JSON payload and ISR caching. |

- Column selection now only includes fields required for above-the-fold map and card rendering.
- Responses are cached for 5 minutes via `revalidate = 300`, which should keep repeat TTFB near the post-change number.
- The supabase query caps results at 500 companies; additional records require follow-up pagination work before raising this ceiling.

## Calculation Notes

The `scripts` snippet below was used locally to estimate the JSON response size with the reduced column set:

```bash
python scripts/estimate_company_payload.py  # derived from data/EMS_Companies_Database_-_DB_Export.csv
```

For reference, the helper script produced ~29 KB for 9 companies (≈3.2 KB each). Scaling that to 500 records yields the 1.6 MB expectation recorded above.
