/**
 * Google Analytics event tracking utility
 * Provides type-safe event tracking with consistent naming conventions
 * 
 * Event naming: camelCase with cm_directory_ prefix
 * Example: cm_directory_listCompanyClick
 */

import { analyticsConfig } from '@/lib/config'

// Check if GA is available and enabled
const isGAEnabled = (): boolean => {
  if (typeof window === 'undefined') return false
  if (!analyticsConfig.enabled) return false
  return typeof window.gtag !== 'undefined'
}

// Type definitions for GA events
export interface GAEventParams {
  event_category?: string
  event_label?: string
  value?: number
  [key: string]: string | number | boolean | undefined
}

export interface ConversionEventParams extends GAEventParams {
  conversion_type: 'list_company' | 'contact_sales' | 'form_submission'
  location?: string // Where the action occurred (e.g., 'navbar', 'footer', 'hero')
}

export interface SearchEventParams extends GAEventParams {
  search_query?: string
  result_count?: number
}

export interface FilterEventParams extends GAEventParams {
  filter_type?: string // e.g., 'capability', 'location', 'certification'
  filter_value?: string
  active_filters_count?: number
}

export interface CompanyViewEventParams extends GAEventParams {
  company_name?: string
  company_slug?: string
  company_id?: string
}

export interface MapEventParams extends GAEventParams {
  marker_company_name?: string
  marker_company_slug?: string
  marker_company_id?: string
  map_zoom_level?: number
}

/**
 * Track a custom GA event
 */
export const trackEvent = (
  eventName: string,
  params?: GAEventParams
): void => {
  if (!isGAEnabled()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA Debug] Event tracking disabled:', { eventName, params })
    }
    return
  }

  try {
    const fullEventName = `cm_directory_${eventName}`
    if (window.gtag) {
      window.gtag('event', fullEventName, params)
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[GA Event]', fullEventName, params)
    }
  } catch (error) {
    console.error('[GA Error] Failed to track event:', error)
  }
}

/**
 * Track conversion events (List Company, Contact Sales, Form Submission)
 */
export const trackConversion = (
  conversionType: ConversionEventParams['conversion_type'],
  location?: string,
  additionalParams?: Omit<ConversionEventParams, 'conversion_type' | 'location'>
): void => {
  trackEvent('conversion', {
    conversion_type: conversionType,
    location: location || 'unknown',
    ...additionalParams,
  })
}

/**
 * Track "List Your Company" button clicks
 */
export const trackListCompanyClick = (location: string): void => {
  trackConversion('list_company', location, {
    event_category: 'conversion',
    event_label: `List Company - ${location}`,
  })
}

/**
 * Track "Contact Sales" button clicks
 */
export const trackContactSalesClick = (location: string): void => {
  trackConversion('contact_sales', location, {
    event_category: 'conversion',
    event_label: `Contact Sales - ${location}`,
  })
}

/**
 * Track form submission button clicks (Submit Free Listing)
 */
export const trackFormSubmissionClick = (location: string): void => {
  trackConversion('form_submission', location, {
    event_category: 'conversion',
    event_label: `Form Submission - ${location}`,
  })
}

/**
 * Track company search events
 */
export const trackSearch = (params: SearchEventParams): void => {
  trackEvent('search', {
    event_category: 'funnel',
    ...params,
  })
}

/**
 * Track filter application events
 */
export const trackFilter = (params: FilterEventParams): void => {
  trackEvent('filter', {
    event_category: 'funnel',
    ...params,
  })
}

/**
 * Track company profile views
 */
export const trackCompanyView = (params: CompanyViewEventParams): void => {
  trackEvent('companyView', {
    event_category: 'funnel',
    ...params,
  })
}

/**
 * Track map marker clicks
 */
export const trackMapMarkerClick = (params: MapEventParams): void => {
  trackEvent('mapMarkerClick', {
    event_category: 'funnel',
    ...params,
  })
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void
    dataLayer?: unknown[]
  }
}

