# Design Decisions - Quick Reference
**Use this for quick decision-making during implementation**

---

## ✅ DECISION TRACKER

Mark your decisions here, then reference the full audit for implementation details.

### 🔴 CRITICAL DECISIONS (Decide Now)

#### Decision 1: Navigation Pattern
- [x] **Option A: Global Navbar Everywhere** ⭐ RECOMMENDED
- [ ] Option B: Contextual Navigation Per Page
- [ ] Option C: Hybrid (Public nav, Minimal on conversion pages)

**Your Choice:** Global Navbar Everywhere

---

#### Decision 2: Gradient Standardization  
- [x] **Option A: Create Shared `<GradientHero>` Component** ⭐ RECOMMENDED
- [ ] Option B: CSS Classes Only
- [ ] Option C: Keep Page-Specific

**Your Choice:** Create Shared `<GradientHero>` Component

---

#### Decision 3: Button System
- [x] **Option A: Tailwind + Shared CSS Classes** ⭐ RECOMMENDED (Fastest)
- [ ] Option B: shadcn/ui Button Component
- [ ] Option C: Custom React Button Component

**Your Choice:** Tailwind + Shared CSS Classes THEN refactor to use shadcn

---

### 🟡 IMPORTANT DECISIONS (Decide This Week)

#### Decision 4: Card Styling
- [x] **Use Standard Classes** ⭐ RECOMMENDED
  - `.card` (default)
  - `.card-elevated` (emphasized)
  - `.card-subtle` (nested)

**Your Choice:** 

---

#### Decision 5: Typography Scale
- [x] **Use Recommended Scale** ⭐ (See full audit)
- [ ] Customize Scale
- [ ] Keep Current Varied Approach

**Your Choice:** 

---

#### Decision 6: Form Components
- [ ] shadcn/ui Form Components
- [ ] **Custom Form Classes** ⭐ RECOMMENDED (You already have custom)
- [x] Third-party Library

**Your Choice:** 

---

### 🟢 POLISH DECISIONS (Can Decide Later)

#### Decision 7: Spacing Documentation
- [x] **Yes, create standards** ⭐
- [ ] No, keep flexible

---

#### Decision 8: Icon Size Standards
- [x] **Yes, standardize** ⭐
- [ ] No, case-by-case

---

#### Decision 9: Design System Documentation
- [ ] Storybook
- [x] **Simple MD File** ⭐ RECOMMENDED
- [ ] No formal documentation

---

## 📋 IMPLEMENTATION CHECKLIST

Once decisions are made, follow this order:

### Week 1: Foundation
- [ ] Create button classes in `globals.css`
- [ ] Create card classes in `globals.css`
- [ ] Audit all pages for navigation
- [ ] Replace custom navs with `<Navbar />`

### Week 2: Components
- [ ] Create `<GradientHero>` component (if chosen)
- [ ] Replace all buttons with standard classes
- [ ] Standardize all card styling

### Week 3: Documentation & Polish
- [ ] Create `DESIGN_SYSTEM.md`
- [ ] Document color palette
- [ ] Final consistency pass
- [ ] Mobile testing

---

## 🎨 QUICK COPY-PASTE STANDARDS

Use these while you're deciding on the full system:

### Colors
```css
Primary Blue: #2563eb (blue-600)
Gradient: from-blue-600 to-indigo-700
Accent Orange: #ea580c (orange-600)
```

### Button Classes (Recommended)
```css
/* Add to globals.css */
.btn-primary {
  @apply px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors;
}

.btn-secondary {
  @apply px-6 py-3 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors;
}
```

### Card Classes (Recommended)
```css
/* Add to globals.css */
.card {
  @apply bg-white rounded-xl border border-gray-200 shadow-sm;
}

.card-elevated {
  @apply bg-white rounded-xl border border-gray-200 shadow-lg;
}
```

---

## 🚦 TRAFFIC LIGHT STATUS

**Current State:**

🔴 **Critical Issues:**
- Navigation inconsistent across pages
- Button styles vary wildly
- No button/card style system

🟡 **Important Issues:**
- Multiple gradient implementations
- Card styling not standardized
- Forms need consistency

🟢 **Polish Issues:**
- Typography scale informal
- Spacing could be more consistent
- Icon sizes vary

---

## ⚡ QUICK WINS (Do These First)

These take <30 min each and provide immediate value:

1. **Add button classes to globals.css** (20 min)
2. **Add card classes to globals.css** (15 min)
3. **Replace obvious button inconsistencies** (30 min)
4. **Use `<Navbar />` on add-your-company page** (10 min)

---

## 🎯 SUCCESS METRICS

You'll know you're done when:

✅ All pages have consistent navigation
✅ All buttons use same classes
✅ All cards have consistent borders/shadows
✅ No obvious visual inconsistencies
✅ Mobile looks good on all pages

---

## 📞 QUESTIONS?

If unsure about any decision:
1. Check the full audit document
2. Look at existing pages for patterns
3. When in doubt, choose the ⭐ RECOMMENDED option
4. Can always refine later

---

**Last Updated:** November 6, 2025  
**Status:** Ready for Decision-Making  
**Full Audit:** See DESIGN_COHESIVENESS_AUDIT.md
