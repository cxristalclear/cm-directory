/**
 * Enhanced data fetching with error handling, retry logic, and performance tracking
 */

import { supabase } from '@/lib/supabase'
import { retryWithBackoff, type RetryResult } from '@/lib/utils/retry'
import { trackPayloadSize, startPerformanceMeasure, endPerformanceMeasure, logPerformanceSummary } from '@/lib/utils/performance'
import type { HomepageCompanyWithLocations } from '@/types/homepage'

export interface DataLoadResult {
  companies: HomepageCompanyWithLocations[]
  error: Error | null
  isEmpty: boolean
  payloadSizeBytes: number
  loadTimeMs: number | null
  attempts: number
}

export interface GetCompaniesOptions {
  maxCompanies?: number
  companyFields?: string
  enableRetry?: boolean
  retryOptions?: {
    maxAttempts?: number
    initialDelayMs?: number
  }
}

const DEFAULT_COMPANY_FIELDS = `
  id,
  slug,
  company_name,
  dba_name,
  description,
  employee_count_range,
  is_active,
  website_url,
  updated_at,
  facilities (
    id,
    company_id,
    city,
    state,
    state_code,
    state_province,
    country,
    country_code,
    latitude,
    longitude,
    facility_type,
    is_primary
  ),
  capabilities (
    pcb_assembly_smt,
    pcb_assembly_through_hole,
    cable_harness_assembly,
    box_build_assembly,
    prototyping,
    low_volume_production,
    medium_volume_production,
    high_volume_production
  ),
  certifications (
    id,
    certification_type
  ),
  industries (
    id,
    industry_name
  )
`

const DEFAULT_MAX_COMPANIES = 500

/**
 * Internal fetch function (used by retry logic)
 */
async function fetchCompaniesInternal(
  companyFields: string,
  maxCompanies: number
): Promise<HomepageCompanyWithLocations[]> {
  const { data, error } = await supabase
    .from('companies')
    .select(companyFields)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(maxCompanies)
    .returns<HomepageCompanyWithLocations[]>()

  if (error) {
    // Throw error to trigger retry logic
    throw new Error(`Database error: ${error.message} (code: ${error.code || 'unknown'})`)
  }

  return data ?? []
}

/**
 * Enhanced data fetching with retry, error handling, and performance tracking
 * 
 * @param options - Configuration options
 * @returns DataLoadResult with companies, error state, and performance metrics
 */
export async function getCompanies(
  options: GetCompaniesOptions = {}
): Promise<DataLoadResult> {
  const {
    maxCompanies = DEFAULT_MAX_COMPANIES,
    companyFields = DEFAULT_COMPANY_FIELDS,
    enableRetry = true,
    retryOptions = {},
  } = options

  // Start performance measurement
  startPerformanceMeasure('companies-fetch')

  // Fetch with retry logic
  let result: RetryResult<HomepageCompanyWithLocations[]>
  
  if (enableRetry) {
    result = await retryWithBackoff(
      () => fetchCompaniesInternal(companyFields, maxCompanies),
      {
        maxAttempts: retryOptions.maxAttempts ?? 3,
        initialDelayMs: retryOptions.initialDelayMs ?? 1000,
        onRetry: (attempt, error) => {
          if (process.env.NODE_ENV === 'development') {
            console.warn(`[Retry] Attempt ${attempt} failed:`, error.message)
          }
        },
      }
    )
  } else {
    // No retry - just try once
    try {
      const data = await fetchCompaniesInternal(companyFields, maxCompanies)
      result = { success: true, data, attempts: 1 }
    } catch (error) {
      result = {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
        attempts: 1,
      }
    }
  }

  // End performance measurement
  const loadTimeMs = endPerformanceMeasure('companies-fetch')

  // Process result
  if (result.success && result.data) {
    const companies = result.data
    const payloadSizeBytes = trackPayloadSize(companies, 'Companies Data')
    const isEmpty = companies.length === 0

    // Log performance summary in development
    if (process.env.NODE_ENV === 'development') {
      logPerformanceSummary('Companies Data Load', payloadSizeBytes, loadTimeMs)
      
      // Warn if payload is large
      const payloadMB = payloadSizeBytes / (1024 * 1024)
      if (payloadMB > 2) {
        console.warn(
          `⚠️ Payload size (${payloadMB.toFixed(2)}MB) exceeds target of 2MB`
        )
      }
      
      // Warn if load time is slow
      if (loadTimeMs && loadTimeMs > 3000) {
        console.warn(
          `⚠️ Load time (${loadTimeMs.toFixed(2)}ms) exceeds target of 3000ms`
        )
      }
    }

    return {
      companies,
      error: null,
      isEmpty,
      payloadSizeBytes,
      loadTimeMs,
      attempts: result.attempts,
    }
  } else {
    // Fetch failed - return error state
    const error = result.error || new Error('Unknown error fetching companies')
    
    // Log error with context
    console.error('[Data Load Error]', {
      message: error.message,
      attempts: result.attempts,
      loadTimeMs,
    })

    // Log to error reporting service (Sentry ready)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     tags: {
    //       dataSource: 'companies',
    //       attempts: result.attempts,
    //     },
    //   })
    // }

    return {
      companies: [],
      error,
      isEmpty: false, // Not empty - it's an error state
      payloadSizeBytes: 0,
      loadTimeMs,
      attempts: result.attempts,
    }
  }
}





