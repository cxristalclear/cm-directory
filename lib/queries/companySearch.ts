import { supabase } from "@/lib/supabase"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import type {
  Capabilities,
  Certification,
  Company,
  Facility,
  Industry,
} from "@/types/company"

const CAPABILITY_SLUGS: CapabilitySlug[] = [
  "smt",
  "through_hole",
  "cable_harness",
  "box_build",
  "prototyping",
]

const PRODUCTION_VOLUMES: ProductionVolume[] = ["low", "medium", "high"]

const CERTIFICATION_SLUG_MAP: Record<string, string> = {
  "iso-9001": "ISO 9001",
  "iso-13485": "ISO 13485",
  "as9100": "AS9100",
  "iatf-16949": "IATF 16949",
  itar: "ITAR",
}

export type CompanySearchCursor = {
  name: string
  id: string
}

export type CompanyFacetCounts = {
  states: Array<{ code: string; count: number }>
  capabilities: Array<{ slug: CapabilitySlug; count: number }>
  productionVolume: Array<{ level: ProductionVolume; count: number }>
}

export type CompanySearchOptions = {
  filters: {
    states: string[]
    capabilities: CapabilitySlug[]
    productionVolume: ProductionVolume | null
  }
  routeDefaults?: {
    state?: string
    certSlug?: string
  }
  cursor?: CompanySearchCursor | null
  pageSize?: number
  includeFacetCounts?: boolean
  bbox?: {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
  }
}

export type CompanySearchResult = {
  companies: Company[]
  totalCount: number
  nextCursor: CompanySearchCursor | null
  prevCursor: CompanySearchCursor | null
  hasNext: boolean
  hasPrev: boolean
  facetCounts: CompanyFacetCounts | null
}

type RawCompany = Company & {
  facilities: Facility[] | null
  capabilities: Capabilities[] | null
  industries: Industry[] | null
  certifications: Certification[] | null
}

type FilterApplication = {
  applyStates: boolean
  applyCapabilities: boolean
  applyVolume: boolean
}

const RECOMMENDED_CAPABILITY_FIELDS: Array<keyof Capabilities> = [
  "pcb_assembly_smt",
  "pcb_assembly_through_hole",
  "pcb_assembly_mixed",
  "pcb_assembly_fine_pitch",
  "cable_harness_assembly",
  "box_build_assembly",
  "low_volume_production",
  "medium_volume_production",
  "high_volume_production",
  "prototyping",
]

function normalizeStateCode(value: string | undefined): string | null {
  if (!value) {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  return trimmed.toUpperCase()
}

function resolveCertificationSlug(slug: string | undefined): string | null {
  if (!slug) {
    return null
  }
  const lower = slug.toLowerCase()
  return CERTIFICATION_SLUG_MAP[lower] ?? null
}

function companyCapabilities(company: RawCompany): Capabilities | null {
  if (Array.isArray(company.capabilities) && company.capabilities.length > 0) {
    return company.capabilities[0]
  }
  return null
}

function facilityStates(company: RawCompany): string[] {
  const states = new Set<string>()
  for (const facility of company.facilities ?? []) {
    const normalized = normalizeStateCode(facility?.state ?? undefined)
    if (normalized) {
      states.add(normalized)
    }
  }
  return [...states]
}

function capabilityMatches(capability: Capabilities | null, slug: CapabilitySlug): boolean {
  if (!capability) {
    return false
  }
  switch (slug) {
    case "smt":
      return Boolean(capability.pcb_assembly_smt)
    case "through_hole":
      return Boolean(capability.pcb_assembly_through_hole)
    case "cable_harness":
      return Boolean(capability.cable_harness_assembly)
    case "box_build":
      return Boolean(capability.box_build_assembly)
    case "prototyping":
      return Boolean(capability.prototyping)
    default:
      return false
  }
}

function volumeMatches(capability: Capabilities | null, volume: ProductionVolume): boolean {
  if (!capability) {
    return false
  }
  switch (volume) {
    case "low":
      return Boolean(capability.low_volume_production)
    case "medium":
      return Boolean(capability.medium_volume_production)
    case "high":
      return Boolean(capability.high_volume_production)
    default:
      return false
  }
}

function facilityWithinBBox(facility: Facility | null | undefined, bbox: NonNullable<CompanySearchOptions["bbox"]>): boolean {
  if (!facility) {
    return false
  }
  const { latitude, longitude } = facility
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    return false
  }
  return (
    longitude >= bbox.minLng &&
    longitude <= bbox.maxLng &&
    latitude >= bbox.minLat &&
    latitude <= bbox.maxLat
  )
}

function companyWithinBBox(company: RawCompany, bbox: NonNullable<CompanySearchOptions["bbox"]>): boolean {
  for (const facility of company.facilities ?? []) {
    if (facilityWithinBBox(facility, bbox)) {
      return true
    }
  }
  return false
}

type RouteStateConstraint = { state: string } | Record<string, never>

function applyFilters(
  company: RawCompany,
  filters: CompanySearchOptions["filters"],
  routeDefaults: RouteStateConstraint,
  requiredCertification: string | null,
  bbox: CompanySearchOptions["bbox"],
  application: FilterApplication,
): boolean {
  if (bbox && !companyWithinBBox(company, bbox)) {
    return false
  }

  const capabilityRecord = companyCapabilities(company)

  if (requiredCertification) {
    const hasCert = (company.certifications ?? []).some((cert) => {
      return typeof cert?.certification_type === "string" && cert.certification_type === requiredCertification
    })
    if (!hasCert) {
      return false
    }
  }

  const baseStates = new Set<string>()
  if ("state" in routeDefaults) {
    const normalized = normalizeStateCode(routeDefaults.state)
    if (normalized) {
      baseStates.add(normalized)
    }
  }

  if (application.applyStates) {
    for (const state of filters.states) {
      const normalized = normalizeStateCode(state)
      if (normalized) {
        baseStates.add(normalized)
      }
    }
  }

  if (baseStates.size > 0) {
    const companyStates = facilityStates(company)
    const matchesState = companyStates.some((state) => baseStates.has(state))
    if (!matchesState) {
      return false
    }
  }

  if (application.applyCapabilities && filters.capabilities.length > 0) {
    const matchesAny = filters.capabilities.some((slug) => capabilityMatches(capabilityRecord, slug))
    if (!matchesAny) {
      return false
    }
  }

  if (application.applyVolume && filters.productionVolume) {
    if (!volumeMatches(capabilityRecord, filters.productionVolume)) {
      return false
    }
  }

  return true
}

function compareByNameAndId(a: RawCompany, b: RawCompany): number {
  const nameCompare = (a.company_name ?? "").localeCompare(b.company_name ?? "", undefined, {
    sensitivity: "base",
  })
  if (nameCompare !== 0) {
    return nameCompare
  }
  return (a.id ?? "").localeCompare(b.id ?? "")
}

function compareCompanyToCursor(company: RawCompany, cursor: CompanySearchCursor): number {
  const nameCompare = (company.company_name ?? "").localeCompare(cursor.name ?? "", undefined, {
    sensitivity: "base",
  })
  if (nameCompare !== 0) {
    return nameCompare
  }
  return (company.id ?? "").localeCompare(cursor.id ?? "")
}

function uniqueByCompanyId(companies: RawCompany[]): RawCompany[] {
  const seen = new Set<string>()
  const result: RawCompany[] = []
  for (const company of companies) {
    if (!company?.id) {
      continue
    }
    if (seen.has(company.id)) {
      continue
    }
    seen.add(company.id)
    result.push(company)
  }
  return result
}

function buildFacetCounts(
  companies: RawCompany[],
  filters: CompanySearchOptions["filters"],
  routeDefaults: RouteStateConstraint,
  requiredCertification: string | null,
  bbox: CompanySearchOptions["bbox"],
): CompanyFacetCounts {
  const stateCounts = new Map<string, number>()
  const capabilityCounts = new Map<CapabilitySlug, number>()
  const volumeCounts = new Map<ProductionVolume, number>()

  for (const company of companies) {
    const passesCapabilityAndVolume = applyFilters(
      company,
      filters,
      routeDefaults,
      requiredCertification,
      bbox,
      { applyStates: false, applyCapabilities: true, applyVolume: true },
    )

    if (passesCapabilityAndVolume) {
      const states = facilityStates(company)
      const countedStates = new Set<string>()
      for (const state of states) {
        if (countedStates.has(state)) {
          continue
        }
        countedStates.add(state)
        stateCounts.set(state, (stateCounts.get(state) ?? 0) + 1)
      }
    }

    const passesStatesAndVolume = applyFilters(
      company,
      filters,
      routeDefaults,
      requiredCertification,
      bbox,
      { applyStates: true, applyCapabilities: false, applyVolume: true },
    )

    if (passesStatesAndVolume) {
      const capabilityRecord = companyCapabilities(company)
      for (const slug of CAPABILITY_SLUGS) {
        if (capabilityMatches(capabilityRecord, slug)) {
          capabilityCounts.set(slug, (capabilityCounts.get(slug) ?? 0) + 1)
        }
      }
    }

    const passesStatesAndCapabilities = applyFilters(
      company,
      filters,
      routeDefaults,
      requiredCertification,
      bbox,
      { applyStates: true, applyCapabilities: true, applyVolume: false },
    )

    if (passesStatesAndCapabilities) {
      const capabilityRecord = companyCapabilities(company)
      for (const level of PRODUCTION_VOLUMES) {
        if (volumeMatches(capabilityRecord, level)) {
          volumeCounts.set(level, (volumeCounts.get(level) ?? 0) + 1)
        }
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

export async function companySearch(options: CompanySearchOptions): Promise<CompanySearchResult> {
  const {
    filters,
    cursor,
    pageSize = 9,
    includeFacetCounts = true,
    bbox = null,
  } = options
  const routeDefaults = options.routeDefaults ?? {}
  const requiredCertification = resolveCertificationSlug(routeDefaults.certSlug)
  const routeStateConstraint: RouteStateConstraint = routeDefaults.state
    ? { state: routeDefaults.state }
    : {}

  const { data, error } = await supabase
    .from("companies")
    .select(
      `
      id,
      slug,
      company_name,
      dba_name,
      description,
      employee_count_range,
      capabilities:capabilities (
        id,
        ${RECOMMENDED_CAPABILITY_FIELDS.join(",\n        ")}
      ),
      facilities:facilities (
        id,
        facility_type,
        city,
        state,
        latitude,
        longitude
      ),
      industries:industries (
        id,
        industry_name
      ),
      certifications:certifications (
        id,
        certification_type
      )
    `
    )
    .eq("is_active", true)

  if (error) {
    throw error
  }

  const rawCompanies = uniqueByCompanyId((data ?? []) as unknown as RawCompany[])

  const filteredCompanies = rawCompanies.filter((company) =>
    applyFilters(company, filters, routeStateConstraint, requiredCertification, bbox ?? undefined, {
      applyStates: true,
      applyCapabilities: true,
      applyVolume: true,
    }),
  )

  const sortedCompanies = filteredCompanies.sort(compareByNameAndId)

  let startIndex = 0
  if (cursor) {
    startIndex = sortedCompanies.findIndex((company) => compareCompanyToCursor(company, cursor) > 0)
    if (startIndex === -1) {
      startIndex = sortedCompanies.length
    }
  }

  const paginatedCompanies = sortedCompanies.slice(startIndex, startIndex + pageSize)

  const hasPrev = startIndex > 0
  const hasNext = startIndex + pageSize < sortedCompanies.length

  const nextCursor = hasNext
    ? {
        name: paginatedCompanies[paginatedCompanies.length - 1]?.company_name ?? "",
        id: paginatedCompanies[paginatedCompanies.length - 1]?.id ?? "",
      }
    : null

  const prevCursor = hasPrev
    ? {
        name: sortedCompanies[startIndex - 1]?.company_name ?? "",
        id: sortedCompanies[startIndex - 1]?.id ?? "",
      }
    : null

  const facetCounts = includeFacetCounts
    ? buildFacetCounts(rawCompanies, filters, routeStateConstraint, requiredCertification, bbox ?? undefined)
    : null

  return {
    companies: paginatedCompanies,
    totalCount: sortedCompanies.length,
    nextCursor,
    prevCursor,
    hasNext,
    hasPrev,
    facetCounts,
  }
}

export const COMPANY_SEARCH_RECOMMENDED_INDEXES = [
  "CREATE INDEX ON companies (company_name, id);",
  "CREATE INDEX ON facilities (state);",
  "CREATE INDEX ON capabilities (company_id) WHERE pcb_assembly_smt = true;",
  "CREATE INDEX ON capabilities (company_id) WHERE pcb_assembly_through_hole = true;",
  "CREATE INDEX ON capabilities (company_id) WHERE cable_harness_assembly = true;",
  "CREATE INDEX ON capabilities (company_id) WHERE box_build_assembly = true;",
]
