# Google Analytics Event Tracking Documentation

## Overview

This document describes the Google Analytics event tracking implementation for the Contract Manufacturer Directory. All events use the `cm_directory_` prefix and camelCase naming convention.

## Event Naming Convention

- **Prefix**: `cm_directory_`
- **Format**: camelCase
- **Example**: `cm_directory_listCompanyClick`

## Event Categories

### 1. Conversion Events
These are key actions that represent business goals and should be marked as conversions in GA4.

#### `cm_directory_conversion`
Tracks conversion actions (List Company, Contact Sales, Form Submission).

**Parameters:**
- `conversion_type`: `'list_company'` | `'contact_sales'` | `'form_submission'`
- `location`: String indicating where the action occurred (e.g., `'navbar_desktop'`, `'list_page_hero'`)
- `event_category`: `'conversion'`
- `event_label`: Descriptive label (e.g., `'List Company - navbar_desktop'`)

**Helper Functions:**
- `trackListCompanyClick(location: string)` - Tracks "List Your Company" button clicks
- `trackContactSalesClick(location: string)` - Tracks "Contact Sales" button clicks
- `trackFormSubmissionClick(location: string)` - Tracks "Submit Free Listing" button clicks

**Locations Tracked:**
- `navbar_desktop` - Desktop navbar button
- `navbar_mobile` - Mobile menu button
- `callout` - AddCompanyCallout component
- `list_page_hero` - Hero section on list-your-company page
- `list_page_footer` - Footer CTA on list-your-company page
- `about_page_hero` - Hero section on about page
- `about_page_footer` - Footer CTA on about page

### 2. Funnel Events
These track user journey through the site.

#### `cm_directory_search`
Tracks company search events.

**Parameters:**
- `search_query`: The search term entered
- `result_count`: Number of results (optional)
- `event_category`: `'funnel'`
- `event_label`: Descriptive label (e.g., `'Search: pcb assembly'`)

**Triggered When:**
- User submits search form
- User selects a search suggestion

#### `cm_directory_filter`
Tracks filter application events.

**Parameters:**
- `filter_type`: Type of filter (`'capability'` | `'country'` | `'state'` | `'volume'` | `'employees'`)
- `filter_value`: The filter value(s) applied
- `active_filters_count`: Total number of active filters
- `event_category`: `'funnel'`
- `event_label`: Descriptive label (e.g., `'capability: smt,box_build'`)

**Triggered When:**
- User applies any filter (except search query to avoid spam)

#### `cm_directory_companyView`
Tracks company profile page views.

**Parameters:**
- `company_name`: Name of the company
- `company_slug`: URL slug of the company
- `company_id`: Database ID of the company
- `event_category`: `'funnel'`
- `event_label`: Descriptive label (e.g., `'Company View: Acme Manufacturing'`)

**Triggered When:**
- User views a company profile page (`/companies/[slug]`)

#### `cm_directory_mapMarkerClick`
Tracks map marker clicks.

**Parameters:**
- `marker_company_name`: Name of the company whose marker was clicked
- `marker_company_slug`: URL slug of the company
- `marker_company_id`: Database ID of the company (optional)
- `map_zoom_level`: Current zoom level of the map
- `event_category`: `'funnel'`
- `event_label`: Descriptive label (e.g., `'Map Marker: Acme Manufacturing'`)

**Triggered When:**
- User clicks a company marker on the map

## Implementation Details

### Analytics Utility
Located at `lib/utils/analytics.ts`, this module provides:
- Type-safe event tracking functions
- Automatic prefixing with `cm_directory_`
- Console logging in development mode
- Graceful handling when GA is disabled or unavailable

### Usage Example

```typescript
import { trackListCompanyClick, trackSearch, trackFilter } from '@/lib/utils/analytics'

// Track button click
trackListCompanyClick('navbar_desktop')

// Track search
trackSearch({
  search_query: 'pcb assembly',
  event_label: 'Search: pcb assembly',
})

// Track filter
trackFilter({
  filter_type: 'capability',
  filter_value: 'smt,box_build',
  active_filters_count: 2,
  event_label: 'capability: smt,box_build',
})
```

## Debugging

In development mode, all GA events are logged to the console with the prefix `[GA Event]`. This helps verify that events are firing correctly.

Example console output:
```
[GA Event] cm_directory_listCompanyClick { location: 'navbar_desktop', ... }
[GA Event] cm_directory_search { search_query: 'pcb assembly', ... }
```

## Setting Up Conversions in GA4

To mark events as conversions in Google Analytics 4:

1. Go to **Admin** → **Events**
2. Find the event (e.g., `cm_directory_conversion`)
3. Toggle **Mark as conversion**
4. Alternatively, create custom conversion events based on event parameters:
   - `cm_directory_conversion` with `conversion_type = 'list_company'`
   - `cm_directory_conversion` with `conversion_type = 'contact_sales'`
   - `cm_directory_conversion` with `conversion_type = 'form_submission'`

## Testing

1. **Development Testing:**
   - Open browser console
   - Perform tracked actions
   - Verify `[GA Event]` logs appear

2. **Production Testing:**
   - Use GA4 Real-Time reports
   - Navigate to **Reports** → **Realtime**
   - Perform tracked actions
   - Verify events appear in real-time

3. **Event Verification:**
   - Check event names match documentation
   - Verify all expected parameters are included
   - Confirm event_category is set correctly

## Notes

- Search query tracking is debounced to avoid excessive events
- Filter tracking excludes search queries to prevent spam
- All events respect cookie consent (GA only loads after consent)
- Events are automatically prefixed with `cm_directory_`
- Console logging is enabled in development mode only

