/**
 * Address Compatibility Layer
 * Handles both legacy (state, zip_code) and canonical (state_province, postal_code) columns
 */
import { formatStateLabelFromKey, normalizeCountryCode, normalizeStateFilterValue } from "@/utils/locationFilters"
import { getCountryName } from "@/utils/countryMapping"

type FacilityAddress = {
  street_address?: string | null
  city?: string | null
  state?: string | null
  state_province?: string | null
  state_code?: string | null
  zip_code?: string | null
  postal_code?: string | null
  country?: string | null
  country_code?: string | null
  facility_type?: string
  is_primary?: boolean
  latitude?: number | null
  longitude?: number | null
  location?: unknown
  company_id?: string
  id?: string
}

/**
 * Get state/province from either column
 */
export function getStateProvince(facility: FacilityAddress): string | null {
  if (facility.state_province) return facility.state_province
  if (facility.state) return facility.state
  if (facility.state_code) return formatStateLabelFromKey(facility.state_code)
  return null
}

/**
 * Get postal code from either column
 */
export function getPostalCode(facility: FacilityAddress): string | null {
  return facility.postal_code || facility.zip_code || null
}

/**
 * Prepare facility data for database insert/update.
 * Populates canonical columns while leaving legacy columns untouched.
 */
export function prepareFacilityForDB<T extends FacilityAddress>(facility: T): T {
  const rawStateValue = getStateProvince(facility)
  const stateCode = normalizeStateFilterValue(facility.state_code || rawStateValue)
  const stateValue = rawStateValue || (stateCode ? formatStateLabelFromKey(stateCode) : null)
  const postalValue = getPostalCode(facility)
  const normalizedCountry = normalizeCountryCode(facility.country_code || facility.country)
  const countryCode =
    normalizedCountry && /^[A-Z]{2}$/.test(normalizedCountry) ? normalizedCountry : null
  const displayCountry =
    facility.country?.trim() ||
    (countryCode ? getCountryName(countryCode) || countryCode : null)
  
  return {
    ...facility,
    // New columns (preferred)
    state_province: stateValue,
    postal_code: postalValue,
    state_code: stateCode,
    country_code: countryCode,
    country: displayCountry,
  }
}

/**
 * Check if facility has minimum address data for geocoding
 */
export function hasMinimumAddressData(facility: FacilityAddress): boolean {
  return !!(facility.city && getStateProvince(facility))
}

/**
 * Build display address string
 */
export function buildDisplayAddress(
  facility: FacilityAddress,
  options?: { excludeCountries?: string[] }
): string {
  const parts: string[] = []
  const excludeCountries = options?.excludeCountries ?? ['US']
  
  if (facility.street_address) parts.push(facility.street_address)
  if (facility.city) parts.push(facility.city)
  
  const state = getStateProvince(facility)
  if (state) parts.push(state)
  
  const postal = getPostalCode(facility)
  if (postal) parts.push(postal)
  
  if (facility.country && !excludeCountries.includes(facility.country)) {
    parts.push(facility.country)
  }
  
  return parts.join(', ')
}
