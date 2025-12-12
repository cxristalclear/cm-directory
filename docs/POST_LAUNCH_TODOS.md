# Post-Launch TODOs

This document tracks all TODO comments and technical debt items that are safe to defer until after launch.

**Last Updated:** 2024-01-XX  
**Status:** Active tracking document

---

## 📋 TODO Items by Priority

### 🔴 Critical (Address Soon After Launch)

*None currently - all critical items have been addressed pre-launch.*

---

### 🟡 Medium Priority (Address in First Month)

#### 1. Error Monitoring with Sentry
**Files:** `app/error.tsx`, `app/global-error.tsx`  
**Status:** Commented code ready for implementation  
**Description:** Error boundaries currently only log to console. Need to integrate Sentry for production error tracking.

**Current Code:**
```typescript
// You can add error tracking here (e.g., Sentry)
// if (typeof window !== 'undefined') {
//   Sentry.captureException(error)
// }
```

**Action Items:**
- [ ] Set up Sentry account and project
- [ ] Install `@sentry/nextjs` package
- [ ] Configure Sentry in `next.config.ts`
- [ ] Uncomment and implement error tracking in error boundaries
- [ ] Test error reporting in staging environment

**Reference:** Documented in `docs/PRODUCTION_READINESS_ANALYSIS.md` (Item #12)

---

### 🟢 Low Priority (Address When Needed)

#### 2. Facility Data Consistency
**File:** `app/companies/[slug]/page.tsx` (line 98)  
**Status:** Working around data inconsistency  
**Description:** Upstream facility data should include full state/country names consistently to avoid empty segments in location strings.

**Current Workaround:**
- Code filters out empty/null values when building location strings
- Works correctly but could be cleaner with better data

**Action Items:**
- [ ] Review facility data import process
- [ ] Update data model to require full state/country names
- [ ] Migrate existing data to include full names
- [ ] Remove workaround code after data is consistent

**Impact:** Low - current implementation works correctly

---

#### 3. Mobile Filter Toggle Deprecation
**File:** `components/FilterSidebar.tsx` (lines 304-305)  
**Status:** Tracked in GitHub issue GH-2345  
**Owner:** Product design team  
**Description:** Mobile Toggle button should be removed after MobileFilterBar is implemented across all mobile entry points.

**Current Status:**
- Mobile Toggle is still needed until MobileFilterBar rollout is complete
- Tracking issue: GH-2345
- Requires product design sign-off before removal

**Action Items:**
- [ ] Complete MobileFilterBar implementation across all mobile entry points
- [ ] Get product design sign-off
- [ ] Remove Mobile Toggle button and related TODO comment
- [ ] Close tracking issue GH-2345

**Impact:** Low - feature works correctly, just needs cleanup after migration

---

## 📝 Notes

- All TODOs have been reviewed and categorized
- Critical items have been addressed pre-launch
- Medium priority items should be addressed in the first month post-launch
- Low priority items can be addressed as needed or when related work is being done

---

## 🔄 Maintenance

This document should be updated when:
- New TODOs are added to the codebase
- TODOs are completed
- Priority changes for any TODO item

**Review Frequency:** Monthly during first 3 months post-launch, then quarterly

