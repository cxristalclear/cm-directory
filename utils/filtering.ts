import type { Company, FilterState } from '../types/company'

export function filterCompanies(companies: Company[], filters: FilterState): Company[] {
  let filtered = [...companies]

  // Search term filter
  if (filters.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase()
    filtered = filtered.filter(
      (company) =>
        company.company_name?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower) ||
        company.key_differentiators?.toLowerCase().includes(searchLower),
    )
  }

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
      return filters.capabilities.some((filter) => {
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

  // Volume capability filter
  if (filters.volumeCapability.length > 0) {
    filtered = filtered.filter((company) => {
      if (!company.capabilities?.[0]) return false
      const cap = company.capabilities[0]
      return filters.volumeCapability.some((vol) => {
        switch (vol) {
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
    })
  }

  // Certifications filter
  if (filters.certifications.length > 0) {
    filtered = filtered.filter((company) =>
      company.certifications?.some((cert) =>
        filters.certifications.includes(cert.certification_type.toLowerCase().replace(/\s+/g, "_")),
      ),
    )
  }

  // Industries filter
  if (filters.industries.length > 0) {
    filtered = filtered.filter((company) =>
      company.industries?.some((ind) =>
        filters.industries.includes(ind.industry_name.toLowerCase().replace(/\s+/g, "_")),
      ),
    )
  }

  // Employee range filter
  if (filters.employeeRange.length > 0) {
    filtered = filtered.filter((company) =>
      typeof company.employee_count_range === 'string' &&
      filters.employeeRange.includes(company.employee_count_range)
    )
  }

  return filtered
}