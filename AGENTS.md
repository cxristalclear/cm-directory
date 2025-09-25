# AGENTS.md

## Purpose
This document tells any contributor or AI **how to work in this repo without breaking things**. It encodes our stack, data contracts, and guardrails. Follow these rules for all changes, regardless of project phase.

---

## Stack & runtime
- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript (strict).
- **Styling:** Tailwind + Next font loader.
- **Data:** Supabase (PostgREST) over **tables** (`companies`, `facilities`, `capabilities`).  
  ➜ Do **not** add RPCs unless you also ship SQL migrations that create them and matching typed client wrappers.
- **Maps:** Mapbox/MapLibre on the client; server bbox endpoint + clustering planned.
- **Node:** v18+.

---

## Golden rules (must follow)

1) ### Filter contract (do not change)
```ts
export type CapabilitySlug =
  | 'smt'
  | 'through_hole'
  | 'mixed'
  | 'fine_pitch'
  | 'cable_harness'
  | 'box_build'          // default UI slugs; others are opt-in later

export type ProductionVolume = 'low' | 'medium' | 'high'

export type FilterState = {
  states: string[]                 // multi; OR within facet
  capabilities: CapabilitySlug[]   // multi; OR within facet
  productionVolume: ProductionVolume | null // single
}
```
- **AND across facets**, **OR within a facet**.
- Filters must be **URL-serializable** with shared helpers.

2) ### URL = source of truth
- Use `lib/filters/url.ts` for **parse/serialize** on both server and client.  
- Server components **must** render from URL filters on first paint.

3) ### Next 15 async dynamic APIs
- In server files, `params` and `searchParams` are **Promises**. Always await once at top:
```ts
export default async function Page({
  params, searchParams
}: {
  params: Promise<Record<string, string | undefined>>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const p = await params
  const sp = await searchParams
  // use p, sp
}
```
- Never read properties (or `Object.entries`) on the Promise before `await`.

4) ### No over-fetching / no client recompute
- **Server-side filtering** only (SSR).  
- Components render server props; do **not** pull entire datasets to the browser.  
- **Explicit column lists only**—no `select('*')`.  
- Filter counts come from the server, not from client loops.

5) ### Pagination
- **Cursor-based**, 9 per page. Sort by `companies.company_name ASC, companies.id ASC`.  
- When updating `cursor` in the URL, **preserve existing filter params**.

6) ### Supabase usage
- Use the **TypeScript query builder** in `lib/queries/companySearch.ts` (joins, filters, cursor, facet counts).  
- **Do not** use `supabase.rpc(...)` unless you also provide a migration that creates the function with the **exact** signature/shape you call and tests to cover it.

7) ### SEO
- Index only: **homepage**, **state landings**, **certification landings**, **company/detail**.  
- Filtered URLs are `noindex` with **canonical** to nearest landing.  
- Use `lib/config/site.ts` (`NEXT_PUBLIC_SITE_URL`) for canonicals/sitemap.

8) ### Security
- Sanitize any HTML injected into map popups with DOMPurify (strict options).  
- Whitelist URL query keys; ignore/strip unknowns. Never trust route params; safe-parse & validate.

---

## Schema mapping (filters → DB)

- **states[]** → OR over `facilities.state`.  
  Join: `companies.id = facilities.company_id` (LEFT).  
- **capabilities[]** → OR over booleans on `capabilities` (LEFT join). Default UI slugs map to columns:
  - `smt` → `pcb_assembly_smt`
  - `through_hole` → `pcb_assembly_through_hole`
  - `mixed` → `pcb_assembly_mixed`
  - `fine_pitch` → `pcb_assembly_fine_pitch`
  - `cable_harness` → `cable_harness_assembly`
  - `box_build` → `box_build_assembly`
  - *(available in schema but not default UI—opt-in later: `testing_ict`, `testing_functional`, `testing_environmental`, `testing_rf_wireless`, `design_services`, `supply_chain_management`, `turnkey_services`, `consigned_services`, `lead_free_soldering`, `prototyping`)*

- **productionVolume (single)** → exactly one boolean on `capabilities`:
  - `low` → `low_volume_production`
  - `medium` → `medium_volume_production`
  - `high` → `high_volume_production`

- **De-duplicate** after joins: `DISTINCT companies.id` (or `GROUP BY companies.id`).

---

## Facet counts (for FilterSidebar)
- Compute counts **with all other facets applied** (minus the one being counted).  
- Use `COUNT(DISTINCT companies.id)`.  
- Provide via SSR props; never iterate huge arrays in the client.

---

## Map (planned server endpoint)
- Endpoint will accept: bbox + filters; apply the **same semantics** as listings.  
- Use `facilities.location` (geography) for bbox (or `latitude/longitude` if preferred).  
  Recommended predicate: `location && ST_MakeEnvelope(minLng, minLat, maxLng, maxLat, 4326)` (cast to geometry if using `&&`).  
- Return one point per facility with `{ company_id, company_name, slug, facility_id, city, state, lat, lng }`.  
- Client renders clusters/leaves; do **not** ship full datasets.

---

## Index recommendations (documented; ops adds when needed)
- `CREATE INDEX ON companies (company_name, id);`  // cursor + sort  
- `CREATE INDEX ON facilities (state);`  
- (If missing) `CREATE INDEX facilities_location_gist ON facilities USING GIST (location);`  
- Partial indexes for hot booleans you expose:
  - e.g., `CREATE INDEX ON capabilities (company_id) WHERE pcb_assembly_smt = true;`

---

## Testing, linting, types
- **TypeScript:** `npx tsc --noEmit` must be **0 errors**.
- **Jest:** add/keep coverage for:
  - URL parse/serialize round-trip, sort/dedup, invalid handling.  
  - Query builder (AND/OR semantics, de-dup, cursor stability, facet counts).  
  - SSR pages (awaited `params/searchParams`, small payloads, URL cursor).  
  - DOMPurify popup sanitization.  
- **ESLint/Prettier/Tailwind:** keep configs enforced; no `as any` band-aids.

---

## PR & branch hygiene
- **One ticket → one branch → one PR** (branch: `codex/<ticket-slug>`; base: `main`).  
- PR must include:
  - Scope & acceptance criteria checklist.  
  - “Testing done” with `tsc` and Jest outputs.  
  - Screens for UI changes (home, state, cert pages).  
- Do **not** target feature branches (e.g., `performance/quick-wins`) unless explicitly requested.

---

## Agent pre-push checklist
- [ ] Used `lib/filters/url.ts` (no custom parsing/serialization).
- [ ] Server pages **await** `params`/`searchParams` once at top.
- [ ] Called **TypeScript builder** (`lib/queries/companySearch.ts`); no stray `supabase.rpc(...)`.
- [ ] **Explicit selects** only; no `select('*')`.
- [ ] List payload ≤ 9 items + minimal metadata; counts from server; no client recompute.
- [ ] Cursor URL updates **preserve** current filters.
- [ ] `npx tsc --noEmit` = 0 errors; `npm test` = green.
- [ ] Did **not** reintroduce client-side “filter everything”.

---

## Useful commands
```bash
# Types, tests, dev/build
npx tsc --noEmit
npm test
npm run dev
npm run build && npm start

# Sanity: find accidental RPCs
git grep -n "supabase\.rpc"
```
