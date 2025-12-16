# Google Analytics & Search Console Setup Checklist

## ✅ COMPLETED

### Google Analytics Setup
- ✅ **GA4 Property Created** - Measurement ID: `G-6VEF34G0WM`
- ✅ **GA Script Integrated** - Added to `app/layout.tsx` with Next.js Script component
- ✅ **Cookie Consent Integration** - GA only loads after user consent
- ✅ **Environment Variable** - `NEXT_PUBLIC_GA_MEASUREMENT_ID` configured
- ✅ **Pageview Tracking** - Automatic pageview tracking enabled
- ✅ **Console Logging** - Debug logging added for development

### Google Analytics Event Tracking
- ✅ **Conversion Events** - All conversion actions tracked:
  - List Your Company button clicks
  - Contact Sales button clicks
  - Form submission clicks
- ✅ **Funnel Events** - All user journey events tracked:
  - Company search events
  - Filter application events
  - Company profile views
  - Map marker clicks
- ✅ **Event Naming** - Consistent `cm_directory_` prefix with camelCase
- ✅ **Documentation** - Complete guide at `docs/GA_EVENT_TRACKING.md`

### Google Search Console Setup
- ✅ **Verification File** - Placed at `public/googled17cadb5cf939200.html`
- ✅ **Property Added** - Domain verified in Google Search Console
- ✅ **Sitemap Created** - Accessible at `/sitemap.xml`
- ✅ **RSS Feed Created** - Accessible at `/feed.xml` (fixed server-side client issue)
- ✅ **Robots.txt** - Configured and accessible
- ✅ **Documentation** - Complete guide at `docs/GOOGLE_SEARCH_CONSOLE_SETUP.md`

### Technical Fixes
- ✅ **Feed Route Fixed** - Updated to use server-side Supabase client
- ✅ **Company Pages Fixed** - Updated to use server-side Supabase client
- ✅ **TypeScript Errors Fixed** - GA analytics utility type safety improved

---

## ⚠️ PENDING (Manual Steps Required)

### Google Analytics - Post-Deployment Setup

1. **Mark Conversion Events in GA4**
   - Go to [Google Analytics Admin](https://analytics.google.com)
   - Navigate to: **Admin** → **Events**
   - Find `cm_directory_conversion` event
   - Toggle **"Mark as conversion"**
   - Optionally create custom conversions:
     - `cm_directory_conversion` with `conversion_type = 'list_company'`
     - `cm_directory_conversion` with `conversion_type = 'contact_sales'`
     - `cm_directory_conversion` with `conversion_type = 'form_submission'`

2. **Verify Events in Production**
   - After deployment, test actions on live site
   - Check GA4 Real-Time reports to see events firing
   - Verify console logs show `[GA Event]` messages (in development)

3. **Set Up Conversion Goals** (Optional)
   - Create custom conversion goals in GA4
   - Set up conversion funnels for user journeys
   - Configure attribution models if needed

### Google Search Console - Submission Steps

1. **Submit Sitemap** ⚠️ **NOT DONE YET**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Navigate to **Sitemaps** section
   - Submit: `sitemap.xml`
   - Wait for processing (usually a few hours)

2. **Request Indexing for Key Pages** ⚠️ **NOT DONE YET**
   - Use **URL Inspection** tool
   - Request indexing for:
     - `https://www.pcbafinder.com`
     - `https://www.pcbafinder.com/manufacturers`
     - `https://www.pcbafinder.com/industries`
     - `https://www.pcbafinder.com/about`
     - `https://www.pcbafinder.com/list-your-company`
     - `https://www.pcbafinder.com/contact`
     - Sample company page (real slug, not placeholder)

3. **Feed.xml** (Optional)
   - RSS feeds aren't directly submitted to Search Console
   - Google may discover it automatically from sitemap
   - No action needed (feed is accessible and valid)

ALL OF THESE ARE DONE! ^

---

## 📋 Quick Action Items

### Immediate (Before/After Deployment)

1. **Deploy Recent Fixes**
   - Feed route fix (server-side Supabase client)
   - Company page fix (server-side Supabase client)
   - Analytics TypeScript fix

2. **Test in Production**
   - Verify feed.xml loads: `https://www.pcbafinder.com/feed.xml`
   - Test GA events in browser console (check for `[GA Event]` logs)
   - Verify company pages load correctly

3. **Submit to Search Console** (5 minutes)
   - Submit sitemap.xml
   - Request indexing for homepage

### Within First Week

1. **GA4 Setup** (10 minutes)
   - Mark conversion events
   - Verify events in Real-Time reports
   - Set up email alerts for critical issues

2. **Search Console Monitoring** (5 minutes)
   - Request indexing for remaining key pages
   - Check Coverage report for errors
   - Set up email alerts

### Ongoing

1. **Monitor GA4 Reports**
   - Check conversion rates weekly
   - Review funnel drop-off points
   - Analyze search and filter usage

2. **Monitor Search Console**
   - Check Coverage report weekly
   - Review Performance report monthly
   - Fix any indexing errors promptly

---

## 📚 Documentation References

- **GA Event Tracking**: `docs/GA_EVENT_TRACKING.md`
- **Search Console Setup**: `docs/GOOGLE_SEARCH_CONSOLE_SETUP.md`
- **Deployment Guide**: `docs/DEPLOYMENT_RUNBOOK.md`

---

## ✅ Summary

**Code Implementation**: 100% Complete ✅
- All GA tracking code implemented
- All Search Console files in place
- All technical issues fixed

**Manual Configuration**: ~70% Complete ⚠️
- ✅ Property verified in Search Console
- ⚠️ Sitemap not yet submitted
- ⚠️ Indexing not yet requested
- ⚠️ GA conversions not yet marked

**Next Steps**: 
1. Deploy recent fixes
2. Submit sitemap (5 min)
3. Request indexing for key pages (5 min)
4. Mark GA conversions (10 min)

**Total Time Remaining**: ~20 minutes of manual work

