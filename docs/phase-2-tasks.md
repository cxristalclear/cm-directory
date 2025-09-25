# Phase 2 Follow-up Tasks

## Query Builder & Facet Infrastructure
- [x] Rebuild `lib/queries/companySearch.ts` so filtering, joins, pagination, and facet counts execute in SQL.
  - Cover all specified capability slug-to-column mappings (ignore unknowns gracefully).
  - Apply AND logic across different facets and OR logic within each facet.
  - Return the required top-level pagination fields (`companies`, `totalCount`, `hasNext`, `hasPrev`, `nextCursor?`, `prevCursor?`).
  - Calculate facet counts with `COUNT(DISTINCT companies.id)` while respecting the other active filters.
  - Ensure results are deduplicated via `DISTINCT companies.id` or an equivalent `GROUP BY`.
  - Add the test coverage listed in the Phase 2 checklist and make sure `npx tsc --noEmit` and `npm test -t companySearch` pass.

## SSR Wiring for Listing Pages
- [x] Update `app/page.tsx`, `app/manufacturers/[state]/page.tsx`, and `app/certifications/[certification]/page.tsx` to await `params`/`searchParams`, call `companySearch`, and hand the SSR payload directly to their child components.
  - Remove any client-only filtering state (contexts, `pageInfo`, `filters`, etc.).
  - Ensure URL cursor params are preserved when navigating.
  - Add/repair the specified SSR integration tests and pagination URL tests.

## Payload Tightening & Client Simplification
- [x] Refactor list, sidebar, and related components to rely solely on the SSR data contract.
  - Replace any `select('*')` calls with explicit column lists.
  - Remove `allCompanies`/full dataset props from client components and align prop names/types (`companies`, pagination info, facet counts).
  - Update tests that confirm minimal payloads and the absence of client-side recomputation.

## TypeScript Compile Failures
- [x] Restore a clean `npx tsc --noEmit` run by resolving missing identifiers, imports, and type mismatches introduced by the incomplete Phase 2 work.
  - Verify the compile succeeds as part of CI-ready checks.

## Optional Database Index Documentation
- [x] (Optional) Add `docs/db-indexes.md` describing the recommended indexes (e.g., `companies(company_name,id)`, `facilities(state)`, and hot capability boolean partial indexes) once the query work is complete.
