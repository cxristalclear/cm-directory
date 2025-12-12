# PCBA Finder — GitHub Issues Import Format

Each section below represents a **single GitHub Issue**.

---

## ISSUE: PHASE 0 — Secure AI Endpoints
**Labels:** security, backend, blocker

### Description
AI endpoints must be fully secured before launch.

### Tasks
- [x] Secure `/api/ai/research` with Supabase auth
- [x] Reject unauthenticated users
- [x] Ensure no API keys leak to client

---

## ISSUE: PHASE 0 — Protect Admin Routes
**Labels:** security, admin, blocker

### Description
Admin routes must be gated behind Supabase authentication.

### Tasks
- [x] Add authentication middleware for `/admin/*`
- [x] Allow `/admin/login` without auth
- [x] Test redirect flow

---

## ISSUE: PHASE 0 — API Key Verification
**Labels:** security, backend, blocker

### Description
Ensure no API keys are exposed or committed.

### Tasks
- [x] Confirm all keys stored in env vars only
- [x] Confirm `.env.local` ignored in git
- [x] Remove hardcoded keys in test files

---

## ISSUE: PHASE 1 — Navigation Consistency
**Labels:** ui, navigation, pre-launch

### Description
Ensure navigation is consistent across all pages.

### Tasks
- [x] Adopt Global Navbar pattern
- [x] Fix CompanyHeader CTA path
- [x] Fix all homepage CTA paths
- [x] Fix broken footer links
- [ ] Verify every page uses `<Navbar />`
- [ ] Ensure mobile nav works everywhere

---

## ISSUE: PHASE 1 — Fix Company Listing Flows
**Labels:** conversion, pre-launch, ui

### Description
Ensure company listing funnel routes are correct.

### Tasks
- [x] Convert `/add-your-company` into educational page
- [x] Fix CTAs to route to `/list-your-company`
- [x] Remove inactive buttons on list-your-company
- [x] Wire "Contact Sales" → `/contact`

---

## ISSUE: PHASE 1 — FilterSidebar Fix
**Labels:** ui, bug, pre-launch

### Description
Align FilterSidebar with shared country mapping.

### Tasks
- [x] Replace hardcoded mapping with util

---

## ISSUE: PHASE 1 — Navigation QA
**Labels:** navigation, testing

### Description
Verify navigation flows across all pages.

### Tasks
- [x] Test header links
- [x] Test footer links
- [x] Test state → company → state flow
- [ ] Test mobile navigation

---

## ISSUE: PHASE 1 — Venkel Ads Replacement
**Labels:** ui, marketing

### Description
Replace placeholder ad boxes with real components.

### Tasks
- [x] Replace placeholders with VenkelAd component
- [ ] Test responsive breakpoints

---

## ISSUE: PHASE 1 — Footer Enhancements
**Labels:** ui, footer

### Description
Footer must contain legal links & polished layout.

### Tasks
- [x] Add Privacy and Terms links
- [x] Polish footer layout
- [ ] Add CTA button to “For Contract Manufacturers” on /about

---

## ISSUE: PHASE 2 — Metadata Consolidation
**Labels:** seo, metadata

### Description
Metadata must be centralized and consistent.

### Tasks
- [x] Choose strategy: per-page metadata
- [ ] Remove `app/companies/[slug]/metadata.ts`
- [ ] Consolidate metadata in `page.tsx`
- [ ] Standardize title & description patterns

---

## ISSUE: PHASE 2 — Sitemap Corrections
**Labels:** seo, backend

### Description
Sitemap includes nonexistent routes.

### Tasks
- [ ] Remove invalid sitemap entries
- [ ] Rebuild sitemap after corrections
- [ ] Verify sitemap URLs return 200

---

## ISSUE: PHASE 2 — Canonical URL Enforcement
**Labels:** seo, technical-seo

### Tasks
- [x] Decision: Use **www** host
- [ ] Confirm canonical base in config
- [ ] Add canonical tags to category pages

---

## ISSUE: PHASE 2 — WIP/Admin Deindexing
**Labels:** seo, security

### Tasks
- [ ] Add robots fallback tags

---

## ISSUE: PHASE 2 — Structured Data Upgrades
**Labels:** seo, schema

### Tasks
- [ ] Update CompanySchema to emit `LocalBusiness`
- [ ] Add address, geo, phone, sameAs fields
- [ ] Add SearchAction to `webSiteJsonLd`
- [ ] Add ItemList to homepage, state, industry pages

---

## ISSUE: PHASE 2 — Internal Linking Improvements
**Labels:** seo, navigation

### Tasks
- [ ] Add “More in [State]” section
- [ ] Add industry links in company profiles
- [ ] Ensure breadcrumbs emit schema

---

## ISSUE: PHASE 2 — Pagination
**Labels:** seo, backend, ux

### Tasks
- [x] Decision: Add pagination URLs
- [ ] Design URL structure
- [ ] Implement pagination on manufacturers index
- [ ] Add canonical + prev/next metadata

---

## ISSUE: PHASE 2 — Image Optimization
**Labels:** performance, seo, ui

### Tasks
- [x] Decision: Migrate to `next/image`
- [ ] Replace all `<img>` with `<Image>`
- [ ] Add responsive sizes
- [ ] Add blur placeholder

---

## ISSUE: PHASE 2 — Dynamic OG Images (Backlog)
**Labels:** seo, enhancement

### Tasks
- [x] Decision: No for now; add TODO
- [ ] Create backlog item for dynamic OG images

---

## ISSUE: PHASE 3 — Button System
**Labels:** design-system, ui

### Tasks
- [x] Decision: Tailwind shared classes
- [ ] Create `.btn-primary`, `.btn-secondary`, `.btn-ghost`
- [ ] Replace all buttons across project
- [ ] Document button usage

---

## ISSUE: PHASE 3 — Card System
**Labels:** design-system, ui

### Tasks
- [x] Decision: Standard classes
- [ ] Add `.card`, `.card-elevated`, `.card-subtle`
- [ ] Replace inconsistent card styling

---

## ISSUE: PHASE 3 — GradientHero Component
**Labels:** design-system, ui

### Tasks
- [x] Decision: Build `<GradientHero />`
- [ ] Create component
- [ ] Replace gradient sections on pages


---

## ISSUE: PHASE 3 — Typography Unification
**Labels:** design-system

### Tasks
- [x] Adopt scale
- [ ] Update headings across site
- [ ] Ensure consistent weights
- [ ] Document typography

---

## ISSUE: PHASE 3 — Spacing System
**Labels:** design-system

### Tasks
- [x] Adopt spacing rules
- [ ] Audit all sections
- [ ] Apply consistnent spacing and padding across pages

---

## ISSUE: PHASE 3 — Responsive Design Audit
**Labels:** ux, responsive

### Tasks
- [ ] Review breakpoints
- [ ] Standardize grid patterns

---

## ISSUE: PHASE 3 — Icon Audit
**Labels:** design-system, ui

### Tasks
- [ ] Audit icon sizes
- [ ] Apply icon standards

---

## ISSUE: PHASE 3 — Footer Final Polish
**Labels:** ui, design-system

### Tasks
- [x] Structure improved
- [ ] FFinal spacing + alignment pass
- [ ] Add dynamic copyright

---

## ISSUE: PHASE 4 — Analytics Setup
**Labels:** analytics, post-launch

### Tasks
- [ ] Add GA4 script
- [ ] Add conversion tracking
- [ ] Add funnel events tracking

---

## ISSUE: PHASE 4 — Monitoring
**Labels:** monitoring, post-launch

### Tasks
- [ ] Add Sentry
- [ ] Add uptime monitoring
- [ ] Add geocoding failure alerts

---

## ISSUE: PHASE 4 — Documentation
**Labels:** documentation, post-launch

### Tasks
- [ ] DESIGN_SYSTEM.md
- [ ] DATA_IMPORT_RUNBOOK.md
- [ ] SEO_CHECKLIST.md

---

## ISSUE: PHASE 4 — Performance Improvements
**Labels:** performance

### Tasks
- [ ] Lazy-load heavy components
- [ ] Remove unused client JS
- [ ] Add caching for directory queries

---

## ISSUE: PHASE 5 — Future SEO Enhancements
**Labels:** seo, backlog

### Tasks
### [SEO-Future]
- [ ] Add company reviews/ratings schema fields
- [ ] Implement dynamic OG images
- [ ] Add FAQ schema per company

### [UX Extended]
- [ ] Redesign map dialog box
- [ ] Add breadcrumbs to every page

### [Design System Extended]
- [ ] Optional move to shadcn/ui
- [ ] Build Storybook

