# Deployment Runbook

## Sitemap refresh

- The sitemap pulls company and facility update timestamps directly from Supabase. No manual action is required for individual company or facility edits.
- Root and evergreen URLs rely on the build timestamp exposed through the `NEXT_PUBLIC_BUILD_TIMESTAMP` (preferred) or `BUILD_TIMESTAMP` environment variable. Ensure your CI pipeline sets one of these values to the deployment time (ISO 8601).
- To force a sitemap refresh for the root pages, trigger a new build/deployment so the build timestamp updates. If your build timestamp is static, bump the value in your deployment configuration before redeploying.

