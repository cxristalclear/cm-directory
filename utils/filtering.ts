import type { FilterState } from "../types/company"
import type {
  HomepageCompanyWithLocations,
  HomepageFacility,
  HomepageFacilityLocation,
} from "@/types/homepage"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import { getFacilityCountryCode, getFacilityStateKey } from "./locationFilters"

/**
 * Filter companies based on all filter criteria
 */
export function filterCompanies(
  companies: HomepageCompanyWithLocations[],
  filters: FilterState,
): HomepageCompanyWithLocations[] {
  let filtered = [...companies]
  const searchTerm = filters.searchQuery.trim().toLowerCase()

  if (searchTerm) {
    filtered = filtered.filter((company) => {
      const candidates = [company.company_name, company.dba_name].filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      )
      return candidates.some((value) => value.toLowerCase().includes(searchTerm))
    })
  }

  // Countries filter
  if (filters.countries.length > 0) {
    filtered = filtered.filter((company) =>
      company.facilities?.some((f) => {
        const countryCode = getFacilityCountryCode(f, { allowStateInference: false })
        if (!countryCode) return false
        return filters.countries.includes(countryCode)
      })
    )
  }

  // States filter
  if (filters.states.length > 0) {
    filtered = filtered.filter((company) =>
      company.facilities?.some((f) => {
        const stateKey = getFacilityStateKey(f)
        if (!stateKey) return false
        return filters.states.includes(stateKey)
      })
    )
  }

  // Capabilities filter
  if (filters.capabilities.length > 0) {
    filtered = filtered.filter((company) => {
      if (!company.capabilities?.[0]) return false
      const cap = company.capabilities[0]
      return filters.capabilities.some((filter: CapabilitySlug) => {
        switch (filter) {
          case "smt":
            return cap.pcb_assembly_smt
          case "through_hole":
            return cap.pcb_assembly_through_hole
          case "cable_harness":
            return cap.cable_harness_assembly
          case "box_build":
            return cap.box_build_assembly
          case "prototyping":
            return cap.prototyping
          default:
            return false
        }
      })
    })
  }

  // Production volume filter (single value, nullable)
  if (filters.productionVolume) {
    filtered = filtered.filter((company) => {
      if (!company.capabilities?.[0]) return false
      const cap = company.capabilities[0]
      const volume: ProductionVolume = filters.productionVolume as ProductionVolume
      
      switch (volume) {
        case "low":
          return cap.low_volume_production
        case "medium":
          return cap.medium_volume_production
        case "high":
          return cap.high_volume_production
        default:
          return false
      }
    })
  }

  if (filters.employeeCountRanges.length > 0) {
    filtered = filtered.filter((company) => {
      if (!company.employee_count_range) return false
      return filters.employeeCountRanges.includes(company.employee_count_range as FilterState["employeeCountRanges"][number])
    })
  }

  return filtered
}

/**
 * Filter facilities based on location filters only
 * This ensures only facilities matching the selected locations are displayed
 */
type FacilityForFiltering = HomepageFacility | HomepageFacilityLocation

export function filterFacilitiesByLocation(
  facilities: FacilityForFiltering[],
  filters: FilterState
): FacilityForFiltering[] {
  let filtered = [...facilities]

  // Apply country filter to facilities
  if (filters.countries.length > 0) {
    filtered = filtered.filter((facility) => {
      const countryCode = getFacilityCountryCode(facility, { allowStateInference: false })
      if (!countryCode) return false
      return filters.countries.includes(countryCode)
    })
  }

  // Apply state filter to facilities
  if (filters.states.length > 0) {
    filtered = filtered.filter((facility) => {
      const stateKey = getFacilityStateKey(facility)
      if (!stateKey) return false
      return filters.states.includes(stateKey)
    })
  }

  return filtered
}

/**
 * Get location-filtered facilities from companies
 * Use this when you need to display only facilities that match location filters
 * This is the KEY function that solves the "showing all locations" problem
 */
export function getLocationFilteredFacilities<T extends FacilityForFiltering>(
  companies: HomepageCompanyWithLocations[],
  filters: FilterState,
  facilitiesMapper: (
    company: HomepageCompanyWithLocations,
    facility: FacilityForFiltering
  ) => T
): T[] {
  // First filter companies by all criteria (countries, states, capabilities, volume)
  const filteredCompanies = filterCompanies(companies, filters)
  
  // Extract all facilities from filtered companies
  const allFacilities = filteredCompanies.flatMap((company) =>
    (company.facilities ?? []).map((facility) => facilitiesMapper(company, facility))
  )
  
  // Then apply location-specific filtering to facilities
  // This ensures we only show facilities in the selected countries/states
  return filterFacilitiesByLocation(allFacilities, filters) as T[]
}
