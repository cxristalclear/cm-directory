/**
 * Address Compatibility Layer
 * Handles both old (state, zip_code) and new (state_province, postal_code) columns
 */

type FacilityAddress = {
  street_address?: string | null
  city?: string | null
  state?: string | null
  state_province?: string | null
  zip_code?: string | null
  postal_code?: string | null
  country?: string | null
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
  return facility.state_province || facility.state || null
}

/**
 * Get postal code from either column
 */
export function getPostalCode(facility: FacilityAddress): string | null {
  return facility.postal_code || facility.zip_code || null
}

/**
 * Prepare facility data for database insert/update
 * Writes to BOTH old and new columns for compatibility
 */
export function prepareFacilityForDB<T extends FacilityAddress>(facility: T): T {
  const stateValue = getStateProvince(facility)
  const postalValue = getPostalCode(facility)
  
  return {
    ...facility,
    // New columns (preferred)
    state_province: stateValue,
    postal_code: postalValue,
    // Old columns (backwards compatibility)
    state: stateValue,
    zip_code: postalValue,
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