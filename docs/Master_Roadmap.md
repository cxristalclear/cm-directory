# PCBA Finder — GitHub Issues Import Format

Each section below represents a **single GitHub Issue**.

Issues are ordered by **execution priority** - complete them in this order for best results.

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

## ISSUE: PHASE 1 — Clean Up Unused Files
**Labels:** cleanup, pre-launch

### Description
Remove or archive unused files to keep codebase clean.

### Tasks
- [x] Review `_unused files/` folder contents
- [x] Archive or delete truly unused files
- [x] Move any needed files to proper locations

---

## ISSUE: PHASE 1 — Remove Debug Code
**Labels:** cleanup, pre-launch, blocker

### Description
Remove debug code and console statements from production.

### Tasks
- [x] Verify `FilterDebugger` only shows when `NEXT_PUBLIC_SHOW_DEBUG=true`
- [x] Ensure debug flag is false in production environment
- [x] Remove console.log statements from production code (keep console.error for monitoring)
- [x] Replace console.error with proper error logging service (or keep for now if Sentry not ready)

---

## ISSUE: PHASE 1 — Protect WIP and Styleguide Routes
**Labels:** cleanup, seo, pre-launch, blocker

### Description
Protect unfinished features from being indexed by search engines.

### Tasks
- [x] Add `/wip/` to robots.txt disallow list
- [x] Add `/styleguide/` to robots.txt disallow list
- [x] Remove `/styleguide` page entirely OR add noindex meta tag and password protect
- [x] Verify WIP pages have noindex meta tags (or add them)

---

## ISSUE: PHASE 1 — Verify Database Indexes
**Labels:** performance, database, pre-launch, blocker

### Description
Ensure database indexes exist for optimal query performance with 500+ records.

### Tasks
- [x] Index on `companies.is_active` (for filtering active companies)
- [x] Index on `companies.slug` (for company lookups)
- [x] Index on `companies.updated_at` (for sorting)
- [x] Index on `facilities.company_id` (for joins)
- [x] Index on `facilities.country_code` and `facilities.state_code` (for location filtering)
- [x] Composite index on `(is_active, updated_at)` if needed

---

## ISSUE: PHASE 1 — Optimize FilterSidebar Performance
**Labels:** performance, pre-launch, blocker

### Description
Optimize FilterSidebar to handle 500+ companies efficiently.

### Tasks
- [x] Reduce duplicate iterations (currently iterates through all companies twice) - Combined facility loops into single pass
- [x] Memoize filter count calculations more efficiently - Optimized with Set lookups and pre-computed flags
- [x] Fix map zoom jank - Separated data updates from zoom logic, added filter change detection, prevented overlapping animations

---

## ISSUE: PHASE 1 — Verify Payload Size and Load Time
**Labels:** performance, pre-launch, blocker

### Description
Ensure homepage payload and load time are acceptable with 500 records.

### Tasks
- [x] Test actual payload size with 500 companies (target: < 2MB) - Added performance tracking utilities with benchmarks
- [x] Consider reducing nested data if payload exceeds target - Performance tracking in place to monitor
- [x] Verify page load time with 500 records (< 3 seconds) - Load time tracking implemented
- [x] Test filtering performance with 500 records - FilterSidebar optimized in previous task

---

## ISSUE: PHASE 1 — Add Error Handling for Data Loading
**Labels:** error-handling, ux, pre-launch, blocker

### Description
Replace silent failures with proper error handling and user feedback.

### Tasks
- [x] Replace silent failures (empty array returns) with user-facing error messages - Enhanced getCompanies with proper error handling
- [x] Add error boundaries around data-dependent components - DataErrorBoundary component created
- [x] Add retry logic for transient database errors - Exponential backoff retry implemented
- [x] Show loading states during data fetch - Loading states and performance tracking added

---

## ISSUE: PHASE 1 — Add Error Boundaries
**Labels:** error-handling, ux, pre-launch

### Description
Ensure all critical sections have error boundaries.

### Tasks
- [x] Verify error boundaries exist for map component
- [x] Verify error boundaries exist for filter components
- [x] Add error boundary for company list if missing

---

## ISSUE: PHASE 1 — Improve Empty States
**Labels:** ux, pre-launch

### Description
Add better empty state UI for various scenarios.

### Tasks
- [ ] Better empty state when no companies match filters
- [ ] Better empty state when database is empty
- [ ] Better empty state for company detail pages (404 handling)

---

## ISSUE: PHASE 1 — Add Input Validation for Search
**Labels:** security, validation, pre-launch, blocker

### Description
Add validation and sanitization for search queries.

### Tasks
- [ ] Validate search query length (min 1, max reasonable limit)
- [ ] Sanitize search queries to prevent XSS
- [ ] Add rate limiting for search API endpoints

---

## ISSUE: PHASE 1 — Add URL Parameter Validation
**Labels:** security, validation, pre-launch, blocker

### Description
Validate and handle invalid URL parameters gracefully.

### Tasks
- [ ] Validate state slugs in URL params
- [ ] Validate company slugs in URL params
- [ ] Return 404 for invalid slugs instead of error pages

---

## ISSUE: PHASE 1 — Add Rate Limiting to API Endpoints
**Labels:** security, pre-launch, blocker

### Description
Add rate limiting to prevent abuse of API endpoints.

### Tasks
- [ ] Rate limit `/api/ai/research` endpoint (already authenticated, but add per-user limits)
- [ ] Rate limit `/api/admin/companies/search` endpoint
- [ ] Consider rate limiting for public endpoints if needed

---

## ISSUE: PHASE 1 — Verify SQL Injection Protection
**Labels:** security, pre-launch, blocker

### Description
Verify all database queries are protected against SQL injection.

### Tasks
- [ ] Confirm all queries use parameterized queries (Supabase handles this, but verify)
- [ ] Never concatenate user input into SQL queries
- [ ] Add request size limits for API endpoints

---

## ISSUE: PHASE 1 — Run Code Quality Checks
**Labels:** build, pre-launch, blocker

### Description
Ensure code passes all quality checks before deployment.

### Tasks
- [ ] Run TypeScript type checking: `npm run typecheck` (must pass with no errors)
- [ ] Run ESLint: `npm run lint` (must pass with no errors)
- [ ] Fix any TypeScript errors
- [ ] Fix any ESLint warnings/errors

---

## ISSUE: PHASE 1 — Verify Production Build
**Labels:** build, pre-launch, blocker

### Description
Ensure production build succeeds and is optimized.

### Tasks
- [ ] Run production build: `npm run build` (must succeed without errors)
- [ ] Verify build output has no warnings
- [ ] Verify build bundle size is reasonable
- [ ] Verify all environment variables are validated at build time
- [ ] Test production build locally: `npm run start` (verify app runs correctly)
- [ ] Verify no console errors in production build

---

## ISSUE: PHASE 1 — Run Automated Tests
**Labels:** testing, pre-launch, blocker

### Description
Ensure all automated tests pass.

### Tasks
- [ ] Run full test suite: `npm test` (all tests must pass)

---

## ISSUE: PHASE 1 — Test Authentication Flows
**Labels:** testing, security, pre-launch, blocker

### Description
Verify authentication and authorization work correctly.

### Tasks
- [ ] Cannot access `/admin` without login
- [ ] Cannot access `/api/ai/research` without auth
- [ ] Admin login works correctly
- [ ] Redirect flow works after login

---

## ISSUE: PHASE 1 — Test Navigation Flows
**Labels:** testing, navigation, pre-launch

### Description
Verify all navigation links and CTAs work correctly.

### Tasks
- [ ] All header links work
- [ ] All footer links work
- [ ] All CTA buttons navigate correctly
- [ ] No 404 errors on expected routes
- [ ] State pages load correctly
- [ ] Company pages load correctly
- [ ] Verify every page uses `<Navbar />`
- [ ] Test mobile navigation

---

## ISSUE: PHASE 1 — Test Mobile Responsiveness
**Labels:** testing, responsive, pre-launch

### Description
Verify site works correctly on mobile devices.

### Tasks
- [ ] Header responsive on mobile
- [ ] Footer responsive on mobile
- [ ] Filters work on mobile
- [ ] CTAs work on mobile
- [ ] All pages readable on mobile

---

## ISSUE: PHASE 1 — Test Performance
**Labels:** testing, performance, pre-launch

### Description
Verify performance meets targets.

### Tasks
- [ ] Homepage loads in < 3 seconds
- [ ] Company pages load in < 2 seconds
- [ ] Filters respond quickly
- [ ] No console errors

---

## ISSUE: PHASE 1 — Test Content
**Labels:** testing, content, pre-launch

### Description
Verify all content is complete and correct.

### Tasks
- [ ] Venkel ads display correctly
- [ ] All text readable (no Lorem ipsum)
- [ ] Legal pages complete
- [ ] No placeholder content
- [ ] Test responsive breakpoints for Venkel ads

---

## ISSUE: PHASE 1 — Set Up Google Analytics
**Labels:** analytics, pre-launch, blocker

### Description
Implement Google Analytics tracking.

### Tasks
- [X] Create GA4 property and obtain Measurement ID (G-6VEF34G0WM)
- [X] Add Google Analytics script to `app/layout.tsx` using Next.js Script component
- [X] Verify GA script loads only when `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set
- [ ] Test GA4 pageview tracking in development

---

## ISSUE: PHASE 1 — Add Google Analytics Event Tracking
**Labels:** analytics, pre-launch, blocker

### Description
Add conversion and funnel event tracking to Google Analytics.

### Tasks
- [ ] Add conversion tracking for key actions:
  - [ ] "List Your Company" button clicks
  - [ ] "Contact Sales" button clicks
  - [ ] Form submissions
- [ ] Add funnel event tracking:
  - [ ] Company search events
  - [ ] Filter application events
  - [ ] Company profile views
  - [ ] Map interactions
- [ ] Verify GA events fire correctly in production build
- [ ] Document GA event naming conventions

---

## ISSUE: PHASE 1 — Cookie Consent Banner (If Targeting EU)
**Labels:** legal, analytics, pre-launch

### Description
GDPR/CCPA compliance requires cookie consent for analytics tracking if targeting EU users.

### Tasks
- [ ] Decide if EU targeting is required (if yes, implement consent)
- [ ] If implementing: Choose cookie consent solution (CookieYes, Cookiebot, or custom)
- [ ] If implementing: Add consent banner component
- [ ] If implementing: Block GA script until consent is given
- [ ] If implementing: Store consent preference in localStorage
- [ ] If implementing: Test consent flow in development

---

## ISSUE: PHASE 1 — Configure Robots.txt
**Labels:** seo, pre-launch, blocker

### Description
Configure robots.txt to prevent indexing of admin, WIP, and API routes.

### Tasks
- [ ] Add `/wip/` to disallow list
- [ ] Add `/styleguide/` to disallow list
- [ ] Verify `/admin/` is disallowed (already done)
- [ ] Verify `/api/` is disallowed (already done)
- [ ] Add robots fallback tags for error pages

---

## ISSUE: PHASE 1 — Fix and Verify Sitemap
**Labels:** seo, pre-launch, blocker

### Description
Ensure sitemap only includes valid, production-ready pages.

### Tasks
- [ ] Remove invalid sitemap entries
- [ ] Verify sitemap excludes WIP routes
- [ ] Verify sitemap excludes admin routes
- [ ] Verify sitemap excludes styleguide page
- [ ] Verify all sitemap URLs return 200
- [ ] Rebuild sitemap after corrections
- [ ] Verify only active, production-ready pages are included

---

## ISSUE: PHASE 1 — Enforce Canonical URLs
**Labels:** seo, pre-launch, blocker

### Description
Ensure all pages have correct canonical URLs using www domain.

### Tasks
- [ ] Confirm canonical base in config uses www domain
- [ ] Verify canonical tags on all public pages
- [ ] Add canonical tags to category pages (if missing)
- [ ] Ensure canonical URLs use www domain consistently
- [ ] Check for duplicate content issues

---

## ISSUE: PHASE 1 — Verify Structured Data
**Labels:** seo, pre-launch

### Description
Validate structured data (JSON-LD) is correct and complete.

### Tasks
- [ ] Test JSON-LD on homepage
- [ ] Test CompanySchema on company pages
- [ ] Validate structured data with Google Rich Results Test

---

## ISSUE: PHASE 1 — Verify AI-Generated Content SEO
**Labels:** seo, ai, pre-launch

### Description
Ensure AI-generated company content is SEO-friendly.

### Tasks
- [ ] Review AI research prompts ensure descriptions are SEO-optimized
- [ ] Verify company descriptions are unique (not duplicated)
- [ ] Check that AI-generated slugs are URL-friendly
- [ ] Ensure AI-generated content includes relevant keywords naturally

---

## ISSUE: PHASE 1 — Verify Production Environment Variables
**Labels:** deployment, pre-launch, blocker

### Description
Verify all required environment variables are set correctly in production.

### Tasks
- [ ] Verify all required environment variables are set in production:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL` (production Supabase project)
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` (production anon key)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` (production service role key)
  - [ ] `NEXT_PUBLIC_SITE_URL` (production domain with https://www)
  - [ ] `NEXT_PUBLIC_SITE_NAME` (production site name)
  - [ ] `NEXT_PUBLIC_TWITTER_URL` (production Twitter URL)
  - [ ] `NEXT_PUBLIC_LINKEDIN_URL` (production LinkedIn URL)
  - [ ] `NEXT_PUBLIC_GITHUB_URL` (production GitHub URL)
  - [ ] `NEXT_PUBLIC_GA_MEASUREMENT_ID` (GA4 measurement ID)
- [ ] Verify no placeholder values in production env vars
- [ ] Verify `NEXT_PUBLIC_BUILD_TIMESTAMP` or `BUILD_TIMESTAMP` is set in CI/CD

---

## ISSUE: PHASE 1 — Test Production Build Locally
**Labels:** deployment, pre-launch, blocker

### Description
Test production build with production environment variables before deploying.

### Tasks
- [ ] Test production build locally with production env vars
- [ ] Verify canonical domain redirects (www/https) at hosting layer
- [ ] Test production deployment to staging/preview environment first

---

## ISSUE: PHASE 1 — Post-Deployment Verification
**Labels:** deployment, seo, pre-launch, blocker

### Description
Verify critical files and services are accessible after deployment.

### Tasks
- [ ] Verify sitemap.xml is accessible at production URL
- [ ] Verify feed.xml is accessible at production URL
- [ ] Verify robots.txt is accessible at production URL
- [ ] Submit to Google Search Console:
  - [ ] Add property for production domain
  - [ ] Submit sitemap.xml
  - [ ] Submit feed.xml
  - [ ] Request indexing for key pages

---

## ISSUE: PHASE 1 — Review and Clean Up TODOs
**Labels:** cleanup, pre-launch

### Description
Address or document all TODO comments in codebase.

### Tasks
- [ ] Address critical TODOs or move to backlog
- [ ] Document non-critical TODOs for post-launch

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

## ISSUE: PHASE 1 — Footer Enhancements
**Labels:** ui, footer, pre-launch

### Description
Footer must contain legal links & polished layout.

### Tasks
- [x] Add Privacy and Terms links
- [x] Polish footer layout
- [ ] Add CTA button to "For Contract Manufacturers" on /about

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
- [ ] Add "More in [State]" section
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
