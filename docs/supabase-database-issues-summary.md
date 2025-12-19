# Supabase Database Issues Summary - cm-directory

**Project:** cm-directory  
**Project ID:** qlivculcychjkvkimear  
**Date:** 2025-01-27  
**Total Issues:** ~130

---

## Table of Contents

1. [Security Issues](#security-issues)
   - [Critical (ERROR)](#critical-error)
   - [Warnings (WARN)](#warnings-warn)
2. [Performance Issues](#performance-issues)
   - [Warnings (WARN)](#warnings-warn-1)
   - [Informational (INFO)](#informational-info)

---

## Security Issues

### Critical (ERROR)

#### 1. RLS Disabled in Public Schema (9 issues)

**Severity:** ERROR  
**Category:** SECURITY  
**Description:** Tables in the public schema exposed to PostgREST do not have Row Level Security (RLS) enabled, which is a critical security vulnerability.

**Affected Tables:**
- `public.spatial_ref_sys`
- `public.stg_facilities`
- `public.us_lex`
- `public.country_aliases`
- `public.countries`
- `public.states`
- `public.stg_company_import`
- `public.us_gaz`
- `public.us_rules`
- `public.geocoding_debug_log`

**Remediation:**
1. Enable RLS on each table:
   ```sql
   ALTER TABLE public.<table_name> ENABLE ROW LEVEL SECURITY;
   ```
2. Create appropriate RLS policies based on your access requirements
3. For reference tables (countries, states, etc.), you may want public read access:
   ```sql
   CREATE POLICY "Public read access" ON public.<table_name>
     FOR SELECT
     USING (true);
   ```
4. For staging tables (stg_facilities, stg_company_import), restrict access appropriately

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0013_rls_disabled_in_public

---

### Warnings (WARN)

#### 2. Function Search Path Mutable (16 issues)

**Severity:** WARN  
**Category:** SECURITY  
**Description:** Functions without a fixed `search_path` parameter are vulnerable to search path manipulation attacks.

**Affected Functions:**
1. `public.geocode_facility_address`
2. `public.update_location_from_coords`
3. `public.urlencode`
4. `public.is_venkel_admin`
5. `public.normalize_company_name`
6. `public.generate_slug`
7. `public.normalize_facility_address`
8. `public.get_jwt_email`
9. `public.find_companies_nearby`
10. `public.update_updated_at_column`
11. `public.text_to_bool`
12. `public.normalize_location_text`
13. `public.geocode_address_helper`
14. `public.merge_companies`
15. `public.auto_generate_slug`
16. `public.geocode_with_mapbox`

**Remediation:**
Add `SET search_path = ''` or `SET search_path = 'public'` to each function definition:

```sql
CREATE OR REPLACE FUNCTION public.<function_name>(...)
RETURNS <return_type>
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  -- function body
END;
$$;
```

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

---

#### 3. Extensions in Public Schema (4 issues)

**Severity:** WARN  
**Category:** SECURITY  
**Description:** Extensions installed in the `public` schema should be moved to a dedicated schema for better security isolation.

**Affected Extensions:**
- `public.postgis`
- `public.address_standardizer`
- `public.address_standardizer_data_us`
- `public.pg_trgm`

**Remediation:**
1. Create a dedicated schema for extensions:
   ```sql
   CREATE SCHEMA IF NOT EXISTS extensions;
   ```
2. Move extensions to the new schema (this may require dropping and recreating):
   ```sql
   -- Note: Some extensions may need to be dropped and recreated
   -- Check extension-specific documentation
   ALTER EXTENSION postgis SET SCHEMA extensions;
   ALTER EXTENSION address_standardizer SET SCHEMA extensions;
   ALTER EXTENSION address_standardizer_data_us SET SCHEMA extensions;
   ALTER EXTENSION pg_trgm SET SCHEMA extensions;
   ```
3. Update any code that references these extensions

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

---

#### 4. Auth: Leaked Password Protection Disabled

**Severity:** WARN  
**Category:** SECURITY  
**Description:** Supabase Auth can check passwords against HaveIBeenPwned.org to prevent use of compromised passwords, but this feature is currently disabled.

**Remediation:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable "Leaked Password Protection"
3. This will automatically check passwords against HaveIBeenPwned.org

**Documentation:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

#### 5. Auth: Insufficient MFA Options

**Severity:** WARN  
**Category:** SECURITY  
**Description:** The project has too few multi-factor authentication (MFA) options enabled, which weakens account security.

**Remediation:**
1. Go to Supabase Dashboard → Authentication → Settings
2. Enable additional MFA methods:
   - TOTP (Time-based One-Time Password)
   - SMS (if available)
   - Phone authentication
3. Encourage users to enable MFA on their accounts

**Documentation:** https://supabase.com/docs/guides/auth/auth-mfa

---

#### 6. Vulnerable Postgres Version

**Severity:** WARN  
**Category:** SECURITY  
**Description:** Current Postgres version (supabase-postgres-17.4.1.069) has outstanding security patches available.

**Remediation:**
1. Go to Supabase Dashboard → Project Settings → Infrastructure
2. Check for available database upgrades
3. Schedule a maintenance window for the upgrade
4. Review upgrade notes and breaking changes before upgrading

**Documentation:** https://supabase.com/docs/guides/platform/upgrading

---

## Performance Issues

### Warnings (WARN)

#### 7. Auth RLS Initialization Plan (15 issues)

**Severity:** WARN  
**Category:** PERFORMANCE  
**Description:** RLS policies that call `auth.<function>()` or `current_setting()` are being re-evaluated for each row, causing suboptimal query performance at scale.

**Affected Tables and Policies:**
1. `public.companies` - policy: `companies_venkel_all`
2. `public.facilities` - policy: `facilities_venkel_all`
3. `public.capabilities` - policy: `capabilities_venkel_all`
4. `public.industries` - policy: `industries_venkel_all`
5. `public.certifications` - policy: `certifications_venkel_all`
6. `public.technical_specs` - policy: `technical_specs_venkel_all`
7. `public.business_info` - policy: `business_info_venkel_all`
8. `public.contacts` - policy: `contacts_venkel_all`
9. `public.verification_data` - policy: `verification_data_venkel_all`
10. `public.company_change_log` - policy: `company_change_log_venkel_all`
11. `public.pending_company_updates` - policies: `pending_company_updates_venkel_all`, `pending_company_updates_authenticated_insert`
12. `public.company_research_history` - policies: `Allow authenticated read of research history`, `Allow authenticated insert of research history`, `Allow creator to update research history`

**Remediation:**
Replace `auth.<function>()` with `(select auth.<function>())` in RLS policies:

**Before:**
```sql
CREATE POLICY "example_policy" ON public.companies
  FOR SELECT
  USING (auth.uid() = user_id);
```

**After:**
```sql
CREATE POLICY "example_policy" ON public.companies
  FOR SELECT
  USING ((select auth.uid()) = user_id);
```

This ensures the function is called once per query instead of once per row.

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0003_auth_rls_initplan

---

#### 8. Multiple Permissive Policies (60+ issues)

**Severity:** WARN  
**Category:** PERFORMANCE  
**Description:** Multiple permissive RLS policies for the same role and action on a table cause each policy to be executed for every query, impacting performance.

**Affected Tables (with multiple policies per role/action):**

**business_info:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**capabilities:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**certifications:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**companies:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`
- Multiple DELETE policies for role: `authenticated`
- Multiple INSERT policies for role: `authenticated`
- Multiple UPDATE policies for role: `authenticated`

**company_change_log:**
- Multiple INSERT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`
- Multiple DELETE policies for role: `authenticated`
- Multiple UPDATE policies for role: `authenticated`

**contacts:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**facilities:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**industries:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**pending_company_updates:**
- Multiple INSERT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`
- Multiple UPDATE policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`
- Multiple DELETE policies for role: `authenticated`

**technical_specs:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**verification_data:**
- Multiple SELECT policies for roles: `anon`, `authenticated`, `authenticator`, `cli_login_postgres`, `dashboard_user`

**Remediation:**
1. Review all policies for each table
2. Consolidate multiple permissive policies into a single policy using `OR` conditions
3. Example consolidation:

**Before (multiple policies):**
```sql
CREATE POLICY "policy1" ON public.companies FOR SELECT USING (condition1);
CREATE POLICY "policy2" ON public.companies FOR SELECT USING (condition2);
```

**After (consolidated):**
```sql
CREATE POLICY "consolidated_policy" ON public.companies 
  FOR SELECT 
  USING (condition1 OR condition2);
```

4. Drop the redundant policies after consolidation

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0006_multiple_permissive_policies

---

#### 9. Duplicate Indexes (5 issues)

**Severity:** WARN  
**Category:** PERFORMANCE  
**Description:** Identical indexes exist on the same tables, wasting storage and slowing down writes.

**Affected Tables and Indexes:**
1. `public.capabilities`:
   - `idx_capabilities_company` and `idx_capabilities_company_id` (duplicate)

2. `public.companies`:
   - `idx_companies_active` and `idx_companies_is_active` (duplicate)
   - `idx_companies_is_verified` and `idx_companies_verified` (duplicate)

3. `public.company_change_log`:
   - `idx_change_log_changed_at` and `idx_company_change_log_changed_at` (duplicate)
   - `idx_change_log_company_id` and `idx_company_change_log_company_id` (duplicate)

4. `public.facilities`:
   - `idx_facilities_company` and `idx_facilities_company_id` (duplicate)

**Remediation:**
1. Identify which index to keep (prefer the more descriptive name)
2. Drop the duplicate index:
   ```sql
   DROP INDEX IF EXISTS public.<duplicate_index_name>;
   ```
3. Verify the remaining index is being used in queries

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0009_duplicate_index

---

### Informational (INFO)

#### 10. Unindexed Foreign Keys (1 issue)

**Severity:** INFO  
**Category:** PERFORMANCE  
**Description:** Foreign key constraints without covering indexes can lead to suboptimal query performance.

**Affected Table:**
- `public.country_aliases` - foreign key `country_aliases_iso2_fkey` on column 2

**Remediation:**
Create an index on the foreign key column:
```sql
CREATE INDEX idx_country_aliases_iso2 ON public.country_aliases(iso2);
```

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

---

#### 11. Tables Without Primary Keys (2 issues)

**Severity:** INFO  
**Category:** PERFORMANCE  
**Description:** Tables without primary keys can be inefficient to interact with at scale.

**Affected Tables:**
- `public.stg_facilities`
- `public.stg_company_import`

**Remediation:**
1. Add a primary key to each table:
   ```sql
   ALTER TABLE public.stg_facilities ADD COLUMN id SERIAL PRIMARY KEY;
   ALTER TABLE public.stg_company_import ADD COLUMN id SERIAL PRIMARY KEY;
   ```
2. Or use an existing unique column combination as the primary key if appropriate

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0004_no_primary_key

---

#### 12. Unused Indexes (18 issues)

**Severity:** INFO  
**Category:** PERFORMANCE  
**Description:** Indexes that have never been used may be candidates for removal to improve write performance.

**Affected Indexes:**
1. `public.capabilities`:
   - `idx_capabilities_smt`
   - `idx_capabilities_prototyping`

2. `public.industries`:
   - `idx_industries_specialization`

3. `public.certifications`:
   - `idx_certifications_expiration`

4. `public.technical_specs`:
   - `idx_technical_specs_pcb_layers`

5. `public.contacts`:
   - `idx_contacts_primary`

6. `public.search_analytics`:
   - `idx_search_analytics_timestamp`

7. `public.company_change_log`:
   - `idx_change_log_company_id`
   - `idx_change_log_changed_at`

8. `public.companies`:
   - `idx_companies_is_active`
   - `idx_companies_is_active_updated_at`

9. `public.pending_company_updates`:
   - `idx_pending_updates_company_id`
   - `idx_pending_updates_submitted_at`

10. `public.company_change_log`:
    - `idx_company_change_log_changed_at`

11. `public.company_research_history`:
    - `company_research_history_company_name_trgm_idx`
    - `company_research_history_snapshot_gin_idx`

**Remediation:**
1. Review each index to determine if it's needed for future queries
2. If not needed, drop the index:
   ```sql
   DROP INDEX IF EXISTS public.<index_name>;
   ```
3. Monitor query performance after removal
4. Consider that indexes may be used by future queries even if not currently used

**Documentation:** https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index

---

## Priority Recommendations

### Immediate Action (Critical Security)
1. **Enable RLS on all public tables** (9 ERROR issues)
   - This is the highest priority security issue
   - Start with reference tables (countries, states) and add public read policies
   - Restrict staging tables appropriately

### High Priority (Security & Performance)
2. **Fix RLS policy performance** (15 WARN issues)
   - Replace `auth.<function>()` with `(select auth.<function>())` in all policies
   - This will significantly improve query performance

3. **Consolidate multiple RLS policies** (60+ WARN issues)
   - Review and merge duplicate policies
   - This will improve query performance and simplify policy management

### Medium Priority (Security)
4. **Fix function search_path** (16 WARN issues)
   - Add `SET search_path` to all functions
   - Prevents search path manipulation attacks

5. **Enable Auth security features**
   - Enable leaked password protection
   - Enable additional MFA options

### Lower Priority (Performance & Maintenance)
6. **Remove duplicate indexes** (5 WARN issues)
7. **Add missing indexes** (1 INFO issue)
8. **Add primary keys to staging tables** (2 INFO issues)
9. **Review and remove unused indexes** (18 INFO issues)
10. **Move extensions to dedicated schema** (4 WARN issues)
11. **Upgrade Postgres version** (1 WARN issue)

---

## Implementation Notes

- Always test changes in a development/staging environment first
- Create database migrations for all schema changes
- Review and test RLS policies thoroughly before deploying
- Monitor query performance after making changes
- Consider creating a backup before making bulk changes

---

## Resources

- [Supabase Database Linter Documentation](https://supabase.com/docs/guides/database/database-linter)
- [Row Level Security Guide](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Database Performance Optimization](https://supabase.com/docs/guides/database/postgres/performance)
- [Auth Security Best Practices](https://supabase.com/docs/guides/auth)

