import { CANONICAL_CAPABILITIES } from "@/lib/filters/url"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import type { CompanyFacetCounts } from "@/lib/queries/companySearch"
import type {
  Capabilities,
  Certification,
  Company,
  Facility,
  Industry,
  ListingCapability,
  ListingCertification,
  ListingCompany,
  ListingFacility,
  ListingIndustry,
} from "@/types/company"

const CAPABILITY_SLUGS: readonly CapabilitySlug[] = CANONICAL_CAPABILITIES

const PRODUCTION_VOLUMES: ProductionVolume[] = ["low", "medium", "high"]

function sanitizeFacility(facility: Facility | null | undefined): ListingFacility | null {
  if (!facility || !facility.id) {
    return null
  }

  return {
    id: facility.id,
    facility_type: facility.facility_type ?? null,
    street_address: facility.street_address ?? null,
    city: facility.city ?? null,
    state: facility.state ?? null,
    zip_code: facility.zip_code ?? null,
    country: facility.country ?? null,
    latitude: typeof facility.latitude === "number" ? facility.latitude : null,
    longitude: typeof facility.longitude === "number" ? facility.longitude : null,
    is_primary: Boolean(facility.is_primary),
  }
}

function sanitizeCapability(capability: Capabilities | null | undefined): ListingCapability | null {
  if (!capability || !capability.id) {
    return null
  }

  return {
    id: capability.id,
    pcb_assembly_smt: Boolean(capability.pcb_assembly_smt),
    pcb_assembly_through_hole: Boolean(capability.pcb_assembly_through_hole),
    pcb_assembly_mixed: Boolean(capability.pcb_assembly_mixed),
    pcb_assembly_fine_pitch: Boolean(capability.pcb_assembly_fine_pitch),
    cable_harness_assembly: Boolean(capability.cable_harness_assembly),
    box_build_assembly: Boolean(capability.box_build_assembly),
    prototyping: Boolean(capability.prototyping),
    low_volume_production: Boolean(capability.low_volume_production),
    medium_volume_production: Boolean(capability.medium_volume_production),
    high_volume_production: Boolean(capability.high_volume_production),
  }
}

function sanitizeIndustry(industry: Industry | null | undefined): ListingIndustry | null {
  if (!industry || !industry.industry_name) {
    return null
  }

  return {
    id: industry.id,
    industry_name: industry.industry_name,
  }
}

function sanitizeCertification(certification: Certification | null | undefined): ListingCertification | null {
  if (!certification || !certification.certification_type) {
    return null
  }

  return {
    id: certification.id,
    certification_type: certification.certification_type,
  }
}

export function sanitizeCompanyForListing(company: Company): ListingCompany {
  const facilities = (company.facilities ?? [])
    .map((facility) => sanitizeFacility(facility))
    .filter((facility): facility is ListingFacility => facility !== null)

  const primaryCapability = sanitizeCapability(company.capabilities?.[0] ?? null)

  const industries = (company.industries ?? [])
    .map((industry) => sanitizeIndustry(industry))
    .filter((industry): industry is ListingIndustry => industry !== null)

  const certifications = (company.certifications ?? [])
    .map((certification) => sanitizeCertification(certification))
    .filter((certification): certification is ListingCertification => certification !== null)

  return {
    id: company.id,
    company_name: company.company_name,
    slug: company.slug,
    dba_name: company.dba_name ?? null,
    description: company.description ?? null,
    employee_count_range: company.employee_count_range ?? null,
    website_url: company.website_url ?? null,
    annual_revenue_range: company.annual_revenue_range ?? null,
    facilities,
    capabilities: primaryCapability ? [primaryCapability] : [],
    industries,
    certifications,
  }
}

export function sanitizeCompaniesForListing(companies: Company[]): ListingCompany[] {
  return companies.map((company) => sanitizeCompanyForListing(company))
}

export function computeFacetCountsFromCompanies(companies: ListingCompany[]): CompanyFacetCounts {
  const stateCounts = new Map<string, number>()
  const capabilityCounts = new Map<CapabilitySlug, number>()
  const volumeCounts = new Map<ProductionVolume, number>()

  for (const company of companies) {
    for (const facility of company.facilities) {
      const state = facility.state?.trim().toUpperCase()
      if (state) {
        stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1)
      }
    }

    const capability = company.capabilities[0]
    if (capability) {
      if (capability.pcb_assembly_smt) {
        capabilityCounts.set("smt", (capabilityCounts.get("smt") ?? 0) + 1)
      }
      if (capability.pcb_assembly_through_hole) {
        capabilityCounts.set("through_hole", (capabilityCounts.get("through_hole") ?? 0) + 1)
      }
      if (capability.pcb_assembly_mixed) {
        capabilityCounts.set("mixed", (capabilityCounts.get("mixed") ?? 0) + 1)
      }
      if (capability.pcb_assembly_fine_pitch) {
        capabilityCounts.set("fine_pitch", (capabilityCounts.get("fine_pitch") ?? 0) + 1)
      }
      if (capability.cable_harness_assembly) {
        capabilityCounts.set("cable_harness", (capabilityCounts.get("cable_harness") ?? 0) + 1)
      }
      if (capability.box_build_assembly) {
        capabilityCounts.set("box_build", (capabilityCounts.get("box_build") ?? 0) + 1)
      }
      if (capability.low_volume_production) {
        volumeCounts.set("low", (volumeCounts.get("low") ?? 0) + 1)
      }
      if (capability.medium_volume_production) {
        volumeCounts.set("medium", (volumeCounts.get("medium") ?? 0) + 1)
      }
      if (capability.high_volume_production) {
        volumeCounts.set("high", (volumeCounts.get("high") ?? 0) + 1)
      }
    }
  }

  const orderedStates = Array.from(stateCounts.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => a.code.localeCompare(b.code))

  const orderedCapabilities = CAPABILITY_SLUGS.map((slug) => ({
    slug,
    count: capabilityCounts.get(slug) ?? 0,
  }))

  const orderedVolumes = PRODUCTION_VOLUMES.map((level) => ({
    level,
    count: volumeCounts.get(level) ?? 0,
  }))

  return {
    states: orderedStates,
    capabilities: orderedCapabilities,
    productionVolume: orderedVolumes,
  }
}
