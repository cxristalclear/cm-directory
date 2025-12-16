# Google Search Console Setup Guide

This guide walks you through submitting your sitemap, RSS feed, and requesting indexing for key pages in Google Search Console.

## Prerequisites

- ✅ Your site is deployed to production (https://www.pcbafinder.com)
- ✅ Verification file is accessible at `https://www.pcbafinder.com/googled17cadb5cf939200.html`
- ✅ You have verified your property in Google Search Console

## Step 1: Submit Sitemap.xml

1. **Go to Google Search Console**
   - Visit [https://search.google.com/search-console](https://search.google.com/search-console)
   - Select your property (https://www.pcbafinder.com)

2. **Navigate to Sitemaps**
   - In the left sidebar, click **"Sitemaps"** (under "Indexing" section)
   - Or go directly to: `https://search.google.com/search-console/sitemaps`

3. **Add New Sitemap**
   - In the "Add a new sitemap" field, enter:
     ```
     sitemap.xml
     ```
   - **Note:** You only need to enter `sitemap.xml` (not the full URL)
   - Click **"Submit"**

4. **Verify Submission**
   - Google will process the sitemap (usually takes a few minutes)
   - Status will show:
     - ✅ **"Success"** - Sitemap was read successfully
     - ⚠️ **"Couldn't fetch"** - Check that the URL is accessible
     - ⚠️ **"Has errors"** - Review the errors shown

5. **Check Sitemap Details**
   - Click on the sitemap to see:
     - Number of URLs discovered
     - Number of URLs indexed
     - Any errors or warnings

## Step 2: Submit Feed.xml (Optional but Recommended)

**Note:** RSS feeds are not directly submitted to Google Search Console, but they can help with discovery. However, you can still verify the feed is accessible.

1. **Verify Feed is Accessible**
   - Visit: `https://www.pcbafinder.com/feed.xml`
   - You should see valid RSS XML content
   - If you see an error, check your deployment

2. **Alternative: Use Feed in Sitemap**
   - Some sites include their RSS feed URL in the sitemap
   - Google may discover it automatically
   - This is optional - the sitemap is the primary submission method

## Step 3: Request Indexing for Key Pages

Requesting indexing helps Google discover and index your most important pages faster.

### Method 1: URL Inspection Tool (Recommended)

1. **Open URL Inspection Tool**
   - In Google Search Console, click **"URL Inspection"** in the top search bar
   - Or go to: `https://search.google.com/search-console/inspect`

2. **Enter URL and Request Indexing**
   - Paste the full URL (e.g., `https://www.pcbafinder.com`)
   - Click **"Enter"** or press Enter
   - Wait for Google to analyze the URL
   - Click **"Request Indexing"** button
   - Google will confirm: "Indexing requested"

3. **Repeat for Key Pages**
   Request indexing for these important pages:
   - ✅ Homepage: `https://www.pcbafinder.com`
   - ✅ Manufacturers index: `https://www.pcbafinder.com/manufacturers`
   - ✅ Industries index: `https://www.pcbafinder.com/industries`
   - ✅ About page: `https://www.pcbafinder.com/about`
   - ✅ List Your Company: `https://www.pcbafinder.com/list-your-company`
   - ✅ Contact page: `https://www.pcbafinder.com/contact`
   - ✅ Sample company page: `https://www.pcbafinder.com/companies/[example-slug]`

### Method 2: Sitemap Submission (Automatic)

- Once you submit your sitemap, Google will automatically discover all URLs in it
- You don't need to manually request each URL
- However, requesting key pages manually can speed up initial indexing

## Step 4: Monitor Indexing Status

1. **Check Coverage Report**
   - Go to **"Coverage"** in the left sidebar
   - This shows:
     - How many pages are indexed
     - Any indexing errors
     - Pages excluded from indexing

2. **Check Performance Report**
   - Go to **"Performance"** in the left sidebar
   - After a few days, you'll see:
     - Which pages appear in search results
     - Click-through rates
     - Average position in search results

## Troubleshooting

### Sitemap Shows Errors

**Error: "Couldn't fetch"**
- Verify the sitemap is accessible: `https://www.pcbafinder.com/sitemap.xml`
- Check that your site is deployed and accessible
- Ensure robots.txt doesn't block the sitemap

**Error: "Invalid XML"**
- Run the verification script: `npm run verify-deployment -- --url https://www.pcbafinder.com`
- Check the sitemap XML structure manually
- Ensure all URLs in the sitemap are valid

**Error: "URLs not accessible"**
- Some URLs in the sitemap may return 404
- Check the Coverage report for specific errors
- Update the sitemap to exclude invalid URLs

### Indexing Requests Not Working

**"URL is not on Google"**
- This is normal for new sites
- Continue requesting indexing
- It can take days or weeks for new sites to be indexed

**"URL is not available to Google"**
- Check robots.txt doesn't block the page
- Verify the page has proper meta tags (not noindex)
- Ensure the page is accessible without authentication

## Best Practices

1. **Submit Sitemap After Major Updates**
   - After adding many new companies
   - After restructuring pages
   - Google will automatically re-crawl periodically

2. **Monitor Coverage Report Weekly**
   - Check for new errors
   - Review excluded pages
   - Fix any critical issues

3. **Request Indexing for Important New Pages**
   - When you add new high-value pages
   - When you update key content
   - Don't overdo it - Google has rate limits

4. **Keep Sitemap Updated**
   - Your sitemap updates automatically with new companies
   - Evergreen pages update on each deployment
   - No manual maintenance needed

## Expected Timeline

- **Sitemap Processing**: Usually within a few hours
- **Initial Indexing**: 1-7 days for new sites
- **Full Indexing**: 2-4 weeks for all pages
- **Search Results**: May appear within days, but full indexing takes longer

## Next Steps

After submitting to Google Search Console:

1. ✅ Monitor the Coverage report for errors
2. ✅ Check Performance report after a week
3. ✅ Review Search Analytics to see which pages are performing
4. ✅ Set up email alerts for critical issues (in Search Console settings)

## Additional Resources

- [Google Search Console Help](https://support.google.com/webmasters)
- [Sitemap Guidelines](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [URL Inspection Tool Guide](https://support.google.com/webmasters/answer/9012289)

