-- Migration: Add performance indexes for companies and facilities tables
-- Created: 2025-01-01
-- Purpose: Optimize query performance with 500+ records

-- Index on companies.is_active (for filtering active companies)
-- This is used in queries like: SELECT * FROM companies WHERE is_active = true
CREATE INDEX IF NOT EXISTS idx_companies_is_active ON companies(is_active);

-- Index on companies.slug (for company lookups)
-- This is used for company detail page lookups: SELECT * FROM companies WHERE slug = ?
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);

-- Index on companies.updated_at (for sorting)
-- This is used for sorting companies by most recently updated
CREATE INDEX IF NOT EXISTS idx_companies_updated_at ON companies(updated_at DESC);

-- Index on facilities.company_id (for joins)
-- This is used when joining facilities with companies
CREATE INDEX IF NOT EXISTS idx_facilities_company_id ON facilities(company_id);

-- Index on facilities.country_code (for location filtering)
-- This is used for filtering facilities by country
CREATE INDEX IF NOT EXISTS idx_facilities_country_code ON facilities(country_code);

-- Index on facilities.state_code (for location filtering)
-- This is used for filtering facilities by state/province
CREATE INDEX IF NOT EXISTS idx_facilities_state_code ON facilities(state_code);

-- Composite index on (is_active, updated_at) for common query pattern
-- This optimizes queries that filter by is_active and sort by updated_at
-- Used in: SELECT * FROM companies WHERE is_active = true ORDER BY updated_at DESC
CREATE INDEX IF NOT EXISTS idx_companies_is_active_updated_at ON companies(is_active, updated_at DESC);

