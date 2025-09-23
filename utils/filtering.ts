import type { Company, FilterState } from '../types/company'

export function filterCompanies(companies: Company[], filters: FilterState): Company[] {
  const { states, capabilities, productionVolume } = filters

  return companies.filter(company => {
    if (states.length > 0) {
      const matchesState = company.facilities?.some(
        facility => typeof facility.state === 'string' && states.includes(facility.state),
      )
      if (!matchesState) {
        return false
      }
    }

    if (capabilities.length > 0) {
      const capabilityRecord = company.capabilities?.[0]
      if (!capabilityRecord) {
        return false
      }

      const matchesCapability = capabilities.some(capability => {
        switch (capability) {
          case 'smt':
            return capabilityRecord.pcb_assembly_smt
          case 'through_hole':
            return capabilityRecord.pcb_assembly_through_hole
          case 'cable_harness':
            return capabilityRecord.cable_harness_assembly
          case 'box_build':
            return capabilityRecord.box_build_assembly
          case 'prototyping':
            return capabilityRecord.prototyping
          default:
            return false
        }
      })

      if (!matchesCapability) {
        return false
      }
    }

    if (productionVolume) {
      const capabilityRecord = company.capabilities?.[0]
      if (!capabilityRecord) {
        return false
      }

      switch (productionVolume) {
        case 'low':
          return Boolean(capabilityRecord.low_volume_production)
        case 'medium':
          return Boolean(capabilityRecord.medium_volume_production)
        case 'high':
          return Boolean(capabilityRecord.high_volume_production)
        default:
          return true
      }
    }

    return true
  })
}
