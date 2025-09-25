import type { FilterState, ListingCompany } from "../types/company"

export function filterCompanies(companies: ListingCompany[], filters: FilterState): ListingCompany[] {
  return companies.filter((company) => {
    if (filters.states.length > 0) {
      const hasState = company.facilities.some((facility) => {
        return typeof facility.state === "string" && filters.states.includes(facility.state)
      })
      if (!hasState) {
        return false
      }
    }

    if (filters.capabilities.length > 0) {
      const capabilityRecord = company.capabilities[0]
      if (!capabilityRecord) {
        return false
      }

      const matchesCapability = filters.capabilities.some((capability) => {
        switch (capability) {
          case "smt":
            return Boolean(capabilityRecord.pcb_assembly_smt)
          case "through_hole":
            return Boolean(capabilityRecord.pcb_assembly_through_hole)
          case "cable_harness":
            return Boolean(capabilityRecord.cable_harness_assembly)
          case "box_build":
            return Boolean(capabilityRecord.box_build_assembly)
          case "prototyping":
            return Boolean(capabilityRecord.prototyping)
          default:
            return false
        }
      })

      if (!matchesCapability) {
        return false
      }
    }

    if (filters.productionVolume) {
      const capabilityRecord = company.capabilities[0]
      if (!capabilityRecord) {
        return false
      }

      switch (filters.productionVolume) {
        case "low":
          return Boolean(capabilityRecord.low_volume_production)
        case "medium":
          return Boolean(capabilityRecord.medium_volume_production)
        case "high":
          return Boolean(capabilityRecord.high_volume_production)
        default:
          return false
      }
    }

    return true
  })
}