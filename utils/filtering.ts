import type { FilterState } from "../types/company"
import type { HomepageCompany, HomepageFacility } from "@/types/homepage"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"

/**
 * Filter companies based on all filter criteria
 */
export function filterCompanies(
  companies: HomepageCompany[],
  filters: FilterState,
): HomepageCompany[] {
  let filtered = [...companies]

  // Countries filter
  if (filters.countries.length > 0) {
    filtered = filtered.filter((company) => 
      company.facilities?.some((f) => filters.countries.includes(f.country || 'US'))
    )
  }

  // States filter
  if (filters.states.length > 0) {
    filtered = filtered.filter((company) =>
      company.facilities?.some((f) =>
        typeof f.state === 'string' && filters.states.includes(f.state)
      )
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

  return filtered
}

/**
 * Filter facilities based on location filters only
 * This ensures only facilities matching the selected locations are displayed
 */
export function filterFacilitiesByLocation(
  facilities: HomepageFacility[],
  filters: FilterState
): HomepageFacility[] {
  let filtered = [...facilities]

  // Apply country filter to facilities
  if (filters.countries.length > 0) {
    filtered = filtered.filter((facility) =>
      filters.countries.includes(facility.country || 'US')
    )
  }

  // Apply state filter to facilities
  if (filters.states.length > 0) {
    filtered = filtered.filter((facility) =>
      facility.state && filters.states.includes(facility.state)
    )
  }

  return filtered
}

/**
 * Get location-filtered facilities from companies
 * Use this when you need to display only facilities that match location filters
 * This is the KEY function that solves the "showing all locations" problem
 */
export function getLocationFilteredFacilities<T extends HomepageFacility>(
  companies: HomepageCompany[],
  filters: FilterState,
  facilitiesMapper: (company: HomepageCompany, facility: HomepageFacility) => T
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