# Google Analytics 4 Events Guide - For Beginners

## Understanding Your Events

Your website is tracking the following events (all prefixed with `cm_directory_`):

### Conversion Events
- **`cm_directory_conversion`** - Tracks when users click:
  - "List Your Company" buttons
  - "Contact Sales" buttons  
  - "Submit Free Listing" buttons

### Funnel Events (User Journey)
- **`cm_directory_search`** - When users search for companies
- **`cm_directory_filter`** - When users apply filters
- **`cm_directory_companyView`** - When users view a company profile
- **`cm_directory_mapMarkerClick`** - When users click map markers

---

## Where to Find Events in Google Analytics 4

### Method 1: Real-Time Reports (Best for Testing) ⚡

**This is the fastest way to see if events are working!**

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property (should show `G-6VEF34G0WM`)
3. In the left sidebar, click **Reports** → **Realtime**
4. Scroll down to the **Event count by Event name** section
5. Perform an action on your website (e.g., click "List Your Company")
6. You should see the event appear within **30 seconds** in the real-time report

**Note:** Real-time reports only show activity from the last 30 minutes.

### Method 2: Events Report (Standard Reports)

**Standard reports take 24-48 hours to populate with data.**

1. Go to [Google Analytics](https://analytics.google.com)
2. Select your property
3. In the left sidebar, click **Reports** → **Engagement** → **Events**
4. Look for events starting with `cm_directory_`
5. Click on an event name to see details

**Important:** If you just set up GA, you might not see data here yet. Use Real-Time reports first!

### Method 3: DebugView (Advanced - For Developers)

If you have Google Tag Assistant or GA Debugger extension:
1. Install the [Google Analytics Debugger](https://chrome.google.com/webstore/detail/google-analytics-debugger/jnkmfdileelhofjcijamephohjechhna) Chrome extension
2. Enable it while on your website
3. Open GA4 → **Admin** → **DebugView**
4. You'll see events in real-time with all parameters

---

## Testing if Events Are Working

### Step 1: Check Browser Console (Development Mode)

1. Open your website in a browser
2. Open Developer Tools (F12 or Right-click → Inspect)
3. Go to the **Console** tab
4. Perform an action (e.g., click "List Your Company")
5. Look for messages like: `[GA Event] cm_directory_conversion {...}`

**If you see these messages:** Events are firing! ✅

**If you don't see messages:**
- Make sure you're in development mode (localhost)
- Check that `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set in your `.env.local`
- Verify cookie consent was given (GA only loads after consent)

### Step 2: Check Real-Time Reports

1. Open GA4 Real-Time report (see Method 1 above)
2. Keep it open in one browser tab
3. In another tab, visit your live website
4. Perform actions:
   - Click "List Your Company" button
   - Search for a company
   - View a company profile
   - Apply a filter
5. Watch the Real-Time report - events should appear within 30 seconds

### Step 3: Verify Event Names

In the Real-Time report, you should see:
- `cm_directory_conversion`
- `cm_directory_search`
- `cm_directory_filter`
- `cm_directory_companyView`
- `cm_directory_mapMarkerClick`

---

## Common Issues & Solutions

### Issue 1: "I don't see any events in GA4"

**Possible Causes:**
1. **Cookie consent not given** - GA only loads after users accept cookies
   - **Solution:** Accept cookies on your site, then test again
   
2. **Events haven't fired yet** - You need to actually perform the actions
   - **Solution:** Click buttons, search, view pages, etc. on your live site
   
3. **Looking in wrong place** - Standard reports take 24-48 hours
   - **Solution:** Use Real-Time reports instead (Reports → Realtime)
   
4. **GA not loaded** - Check if GA script is loading
   - **Solution:** Open browser console, type `window.gtag` - should show a function, not `undefined`

### Issue 2: "I see page_view but not my custom events"

**This is normal!** GA4 automatically tracks `page_view`. Your custom events are separate.

**To see custom events:**
1. Go to **Reports** → **Engagement** → **Events**
2. Scroll down past the automatic events (page_view, session_start, etc.)
3. Look for events starting with `cm_directory_`

### Issue 3: "Events show in Real-Time but not in standard reports"

**This is normal!** Standard reports have a 24-48 hour delay. Real-Time reports show data immediately.

**Wait 24-48 hours** and check again in **Reports** → **Engagement** → **Events**

### Issue 4: "I see events but they're not marked as conversions"

**This is expected!** You need to manually mark events as conversions in GA4.

**How to mark conversions:**
1. Go to **Admin** (gear icon in bottom left)
2. Click **Events** (under Data display)
3. Find `cm_directory_conversion`
4. Toggle the switch to **"Mark as conversion"**

---

## Quick Checklist

Use this to verify everything is working:

- [ ] GA Measurement ID is set: `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-6VEF34G0WM`
- [ ] Cookie consent is working (GA script loads after consent)
- [ ] Browser console shows `[GA Event]` messages (in development)
- [ ] Real-Time reports show events when testing (on live site)
- [ ] Events appear with `cm_directory_` prefix
- [ ] Can see event parameters (conversion_type, location, etc.)

---

## Understanding Event Parameters

When you click on an event in GA4, you'll see parameters. Here's what they mean:

### For `cm_directory_conversion`:
- **conversion_type**: `list_company`, `contact_sales`, or `form_submission`
- **location**: Where the click happened (e.g., `navbar_desktop`, `list_page_hero`)
- **event_category**: Always `conversion`
- **event_label**: Descriptive label like `List Company - navbar_desktop`

### For `cm_directory_search`:
- **search_query**: What the user searched for
- **result_count**: How many results were found
- **event_category**: Always `funnel`

### For `cm_directory_filter`:
- **filter_type**: Type of filter (e.g., `capability`, `country`, `state`)
- **filter_value**: What filter was applied
- **active_filters_count**: Total number of active filters

---

## Next Steps

1. **Test events now** using Real-Time reports
2. **Mark conversions** in GA4 Admin → Events
3. **Wait 24-48 hours** for standard reports to populate
4. **Create custom reports** if needed (optional, advanced)

---

## Need Help?

If events still aren't showing:
1. Check browser console for errors
2. Verify `NEXT_PUBLIC_GA_MEASUREMENT_ID` is correct
3. Make sure you're testing on the live site (not just localhost)
4. Ensure cookie consent was given
5. Check Real-Time reports first (not standard reports)

Remember: **Real-Time reports are your friend!** Use them to verify events are working immediately.

