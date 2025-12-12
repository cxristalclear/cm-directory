# Deployment Runbook

## Pre-Deployment Verification

Before deploying to production, run the deployment verification script:

```bash
# Test production build locally with production env vars
npm run verify-deployment

# Or verify a remote deployment
npm run verify-deployment -- --url https://www.pcbafinder.com
```

The script verifies:
- ✅ All required environment variables are set
- ✅ Production build completes successfully
- ✅ Sitemap.xml is accessible and valid
- ✅ Feed.xml is accessible and valid
- ✅ Robots.txt is accessible and references sitemap
- ✅ Canonical URLs use HTTPS
- ✅ Homepage is accessible

### Manual Pre-Deployment Checklist

1. **Test Production Build Locally**
   ```bash
   # Set production environment variables in .env.local
   # Then build and test locally
   npm run build
   
   # In a separate terminal, start the production server
   npm run start
   
   # In the first terminal, run verification (server must be running)
   npm run verify-deployment
   
   # Or verify against production URL (no local server needed)
   npm run verify-deployment -- --url https://www.pcbafinder.com
   ```
   
   **Note:** When verifying against `localhost:3000`, the production server must be running. The script will check if the server is running and provide helpful instructions if it's not.

2. **Verify Environment Variables**
   - Ensure `NEXT_PUBLIC_SITE_URL` uses production domain (https://www.pcbafinder.com)
   - Verify all Supabase credentials are production values
   - Check that no placeholder values remain (e.g., "your_", "example.com")

3. **Test Staging/Preview Deployment First**
   - Deploy to preview environment
   - Run verification script against preview URL
   - Test critical user flows

## Post-Deployment Verification

After deploying to production, verify critical files and services:

### 1. Verify Critical Files

```bash
# Run verification script against production URL
npm run verify-deployment -- --url https://www.pcbafinder.com
```

Or manually check:
- ✅ `https://www.pcbafinder.com/sitemap.xml` - Should return valid XML
- ✅ `https://www.pcbafinder.com/feed.xml` - Should return valid RSS XML
- ✅ `https://www.pcbafinder.com/robots.txt` - Should reference sitemap

### 2. Verify Canonical Domain Redirects

Ensure your hosting layer (Vercel, etc.) redirects:
- `http://` → `https://`
- `www.pcbafinder.com` → `www.pcbafinder.com` (or vice versa, depending on preference)
- Non-www → www (or vice versa)

### 3. Submit to Google Search Console

1. **Add Property**
   - Go to [Google Search Console](https://search.google.com/search-console)
   - Add property for production domain (e.g., `https://www.pcbafinder.com`)

2. **Submit Sitemap**
   - Navigate to Sitemaps section
   - Submit: `https://www.pcbafinder.com/sitemap.xml`

3. **Submit RSS Feed** (optional but recommended)
   - Some search engines index RSS feeds
   - Submit: `https://www.pcbafinder.com/feed.xml`

4. **Request Indexing for Key Pages**
   - Homepage: `https://www.pcbafinder.com`
   - Main category pages: `/manufacturers`, `/industries`
   - Sample company pages

## Sitemap refresh

- The sitemap pulls company and facility update timestamps directly from Supabase. No manual action is required for individual company or facility edits.
- Root and evergreen URLs rely on the build timestamp exposed through the `NEXT_PUBLIC_BUILD_TIMESTAMP` (preferred) or `BUILD_TIMESTAMP` environment variable. Ensure your CI pipeline sets one of these values to the deployment time (ISO 8601).
- To force a sitemap refresh for the root pages, trigger a new build/deployment so the build timestamp updates. If your build timestamp is static, bump the value in your deployment configuration before redeploying.

## RSS feed refresh

- The `/feed.xml` endpoint uses the same Supabase data and build timestamp fallback as the sitemap.
- Any time you trigger the existing build hook (or redeploy), both the sitemap and RSS feed will refresh together.
- The feed is also reachable at `/api/feed` for integrations that prefer a JSON-style endpoint path while still receiving RSS XML.

