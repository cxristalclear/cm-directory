
# AGENTS.md

**Owner:** christal (@cxristalclear)  
**Default base branch:** `main`  
**Repo purpose:** Next.js 15 + React 19 + Tailwind + Supabase directory for companies & facilities, with server-side filtering and a map.

This document defines **how human maintainers and automation agents (e.g., “Codex”) work together** in this repository. It covers branch policy, PR hygiene, task specs, testing, TypeScript standards, and guardrails so agent contributions remain small, reviewable, and safe.

---

## 1) Roles & responsibilities

### Human maintainer (you)
- Writes tickets/specs, reviews PRs, approves merges, owns product decisions.
- Confirms environment variables and deployment configuration.
- Runs manual smoke tests before merging major changes.

### Automation agent (“Codex”)
- Implements tickets exactly as written, one branch/PR per ticket.
- Adds/updates **tests** that prove the ticket’s acceptance criteria.
- Never merges its own PRs; requests review when checks are green.
- Posts **before/after** outputs for `npx tsc --noEmit` and `npm test` in the PR.

---

## 2) Branching & naming

- **One branch per ticket.** Reuse the same branch for follow‑ups on that ticket.
- Name format: `codex/<ticket-slug>` e.g. `codex/build-url-filters-utility-with-tests`.
- **Base branch:** always `main`. Do **not** open PRs against `performance/quick-wins` or other feature branches unless explicitly asked.
- If a temporary/suffixed branch is created (`-8qq3wd`, `-zf7a4f`), consolidate into the canonical branch and **delete** the temp branches.

### Allowed commands (maintainer may use in PR comments)
- _Consolidate branches:_ “Cherry-pick commits X and Y onto `codex/<ticket>` and force-push.”
- _Revert accidental merge:_ Use GitHub’s **Revert** button on the wrong-base PR.

---

## 3) Pull request workflow

1. Open PR from `codex/<ticket>` → **`main`**. Title: `P# — <ticket title>`.
2. PR description must include:
   - Ticket goals and **acceptance criteria** (copy from spec).
   - **File list** of expected changes.
   - `npx tsc --noEmit` (before/after) and `npm test` results (after changes).
3. Keep commits small and meaningful. No unrelated refactors.
4. If TypeScript or lints fail: fix on the **same branch/PR**; do not create a new PR.
5. After approval & merge: delete the `codex/<ticket>` branch.

**Never** merge into branches other than `main` unless explicitly requested.

---

## 4) Task lifecycle (definition of done)

Each ticket must include:
- **Scope**: what to change and what is out-of-scope.
- **Files**: expected files to add/modify/remove.
- **Dependencies**: tickets or env prerequisites.
- **Acceptance criteria**: observable checks (including SSR behavior).
- **Tests**: specific test files & cases to add/update.

**Definition of done (per ticket):**
- `npx tsc --noEmit` → 0 errors.  
- `npm test` → green.  
- New tests cover the acceptance criteria.  
- No dead code or unused exports introduced.

---

## 5) TypeScript & Next.js standards

- **Strict TS**: no `as any` to silence errors. Prefer unions, type guards, and generics.
- **Next 15 async dynamic APIs:** In server files, `params` and `searchParams` are **Promises**.
  - Signature example:
    ```ts
    export default async function Page({
      params, searchParams,
    }: {
      params: Promise<{ cert?: string; state?: string }>,
      searchParams: Promise<Record<string, string | string[] | undefined>>,
    }) {
      const p = await params;
      const sp = await searchParams;
      // pass p/sp to helpers
    }
    ```
  - Do not use `Object.keys/entries` on the promise; `await` first.
- Router updates: build URLs as strings (`/path?${qs}`) before `router.replace(...)`.

---

## 6) Phase 1 filter contract (must remain consistent)

- **Filters:** `states: string[]`, `capabilities: CapabilitySlug[]`, `productionVolume: 'low' | 'medium' | 'high' | null`.
- **Across facets:** AND. **Within a facet:** OR.
- **URL is source of truth**; Context mirrors it.
- **Canonical capability slugs (UI → DB):**
  - `smt` → `pcb_assembly_smt`
  - `through_hole` → `pcb_assembly_through_hole`
  - `cable_harness` → `cable_harness_assembly`
  - `box_build` → `box_build_assembly`
  - `prototyping` → `prototyping` (if exposed as capability)
- `lib/filters/url.ts` must **filter invalid values**, **sort & dedupe arrays**, and round‑trip via tests.

---

## 7) Testing policy

- Use **Jest** + `ts-jest`. No pytest/flake8 in this JS/TS repo.
- **Required test areas for Phase 1:**
  - `test/filters/url-format.test.ts` — URL parse/serialize round-trip; sort/dedup; invalid handling.
  - `test/filters/context-contract.test.tsx` — Context init from `initialFilters`; update/clear semantics.
  - `test/components/filters-ui.test.tsx` — Sidebar toggles; chips; counts from props/context.
  - `test/pages/home-ssr.test.tsx` — SSR uses awaited `searchParams`; ≤ 9 items; no flicker.
  - `test/pages/provider-coverage.smoke.test.tsx` — FilterProvider present on listing routes; Pagination shell works.
  - `test/components/company-list.test.tsx` — Pure render; cursor URL updates preserve filters.

---

## 8) Security & secrets

- Do **not** log secrets or include Supabase keys in client bundles.
- Keep Mapbox tokens server-safe where possible; sanitize popup HTML (DOMPurify tests in Phase 3).
- Avoid `select('*')`—only fetch fields needed by the view.

---

## 9) Performance & payloads

- No “fetch everything then filter on the client.”
- List pages: **server-side filtering** and **cursor pagination** (9 items, A–Z by `company_name`, tiebreaker `id`).
- Map: will use a **bbox endpoint** in Phase 3 (no huge marker dumps).

---

## 10) SEO rules (Phase 1)

- Indexable: homepage, state landings, certification landings, company/facility detail pages.
- Filtered URLs: **renderable but `noindex`**; canonical to nearest landing.
- Use `NEXT_PUBLIC_SITE_URL` via `lib/config/site.ts` for all canonicals/sitemap roots.

---

## 11) Communication templates

### PR summary template
```
**Ticket:** P# — <title>

**Changes**
- <bullet list of changes>

**Acceptance criteria**
- <copy from ticket>

**Results**
- tsc: before X errors → after 0 errors
- tests: <count> passed

**Notes**
- Out of scope: <…>
```

### “Fix types” request
```
Please fix TypeScript errors on this PR branch (do not open a new PR):
- Await `params` and `searchParams` in server files before property access.
- Align FilterContext to {states[], capabilities[], productionVolume|null}.
- Capability slugs must use the canonical union; parser filters invalid values.
- After changes, post `npx tsc --noEmit` output and test results.
```

---

## 12) Phase 1 final checklist (agent view)

- [ ] URL helpers implemented; arrays sorted/deduped; invalids dropped.
- [ ] Context narrowed to 3 keys; `initialFilters` supported; typed API exposed.
- [ ] Sidebar/Header/ActiveFiltersBar refactored to 3 facets; counts from props/context.
- [ ] Home and listing pages await `searchParams`/`params`; Provider present.
- [ ] Pagination shell uses cursors; CompanyList is a pure renderer and updates URL cursor.
- [ ] No client-side “filter everything” paths remain on list pages.
- [ ] `npx tsc --noEmit` → **0 errors**; `npm test` → **green**.
- [ ] PR base is `main`; no temp branches left.

---

## 13) Emergency rollback

If an agent PR broke a page after merge:
1. Click **Revert** on the PR in GitHub to create & merge a revert PR.
2. Open a follow-up ticket describing the reproduction and expected behavior.
3. Agent re-implements on a new `codex/<ticket>` branch with tests reproducing the issue first.
