# Deployment Runbook

## Sitemap refresh

- The sitemap pulls company and facility update timestamps directly from Supabase. No manual action is required for individual company or facility edits.
- Root and evergreen URLs rely on the build timestamp exposed through the `NEXT_PUBLIC_BUILD_TIMESTAMP` (preferred) or `BUILD_TIMESTAMP` environment variable. Ensure your CI pipeline sets one of these values to the deployment time (ISO 8601).
- To force a sitemap refresh for the root pages, trigger a new build/deployment so the build timestamp updates. If your build timestamp is static, bump the value in your deployment configuration before redeploying.

## RSS feed refresh

- The `/feed.xml` endpoint uses the same Supabase data and build timestamp fallback as the sitemap.
- Any time you trigger the existing build hook (or redeploy), both the sitemap and RSS feed will refresh together.
- The feed is also reachable at `/api/feed` for integrations that prefer a JSON-style endpoint path while still receiving RSS XML.

## Host redirects

- Canonical www/HTTPS redirects are handled at the hosting/CDN layer (not in app middleware) to keep local/LAN dev and previews unaffected.
- Configure the redirect rules with your host (e.g., Vercel/CloudFront/NGINX) to point all variants to `https://www.pcbafinder.com`.
- Keep `NEXT_PUBLIC_SITE_URL` set to the canonical domain so metadata, sitemaps, and feeds emit the correct URLs even without in-app redirects.

