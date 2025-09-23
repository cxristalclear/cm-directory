import type {
  CompanyListItem,
  FilterState,
  PageInfo,
  ProductionVolume,
} from "@/types/company"

const PAGE_SIZE = 9

const CAPABILITY_SLUGS = [
  "smt",
  "through_hole",
  "cable_harness",
  "box_build",
  "prototyping",
] as const

const VOLUME_KEYS: ProductionVolume[] = ["low", "medium", "high"]

export type FacetCounts = {
  states: Record<string, number>
  capabilities: Record<(typeof CAPABILITY_SLUGS)[number], number>
  productionVolume: Record<ProductionVolume, number>
}

export type CompanySearchResult = {
  companies: CompanyListItem[]
  totalCount: number
  facetCounts: FacetCounts
  pageInfo: PageInfo
}

const STUB_COMPANIES: CompanyListItem[] = [
  {
    id: "c1",
    slug: "smt-innovations",
    company_name: "SMT Innovations",
    dba_name: "SMTI",
    description: "High-mix SMT assembly specialist serving regulated markets.",
    employee_count_range: "150-500",
    facilities: [
      {
        id: "f1",
        city: "San Jose",
        state: "CA",
        latitude: 37.3382,
        longitude: -121.8863,
        facility_type: "Manufacturing",
      },
      {
        id: "f2",
        city: "Reno",
        state: "NV",
        latitude: 39.5296,
        longitude: -119.8138,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: false,
        box_build_assembly: true,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: true,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i1", company_id: "c1", industry_name: "Medical Devices" },
      { id: "i2", company_id: "c1", industry_name: "Aerospace/Defense" },
    ],
    certifications: [
      { id: "cert1", company_id: "c1", certification_type: "ISO 13485" },
      { id: "cert2", company_id: "c1", certification_type: "AS9100" },
    ],
  },
  {
    id: "c2",
    slug: "lone-star-electronics",
    company_name: "Lone Star Electronics",
    description: "Texas EMS with high-reliability box build capabilities.",
    employee_count_range: "500-1000",
    facilities: [
      {
        id: "f3",
        city: "Austin",
        state: "TX",
        latitude: 30.2672,
        longitude: -97.7431,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: true,
        box_build_assembly: true,
        prototyping: false,
        low_volume_production: false,
        medium_volume_production: true,
        high_volume_production: true,
      },
    ],
    industries: [
      { id: "i3", company_id: "c2", industry_name: "Industrial Controls" },
      { id: "i4", company_id: "c2", industry_name: "Automotive" },
    ],
    certifications: [
      { id: "cert3", company_id: "c2", certification_type: "ISO 9001" },
      { id: "cert4", company_id: "c2", certification_type: "IATF 16949" },
    ],
  },
  {
    id: "c3",
    slug: "pacific-prototypes",
    company_name: "Pacific Prototypes",
    description: "Rapid prototyping and small batch builds for west coast startups.",
    employee_count_range: "50-150",
    facilities: [
      {
        id: "f4",
        city: "Seattle",
        state: "WA",
        latitude: 47.6062,
        longitude: -122.3321,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: false,
        cable_harness_assembly: false,
        box_build_assembly: false,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: false,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i5", company_id: "c3", industry_name: "Consumer Electronics" },
    ],
    certifications: [
      { id: "cert5", company_id: "c3", certification_type: "ISO 9001" },
    ],
  },
  {
    id: "c4",
    slug: "midwest-manufacturing",
    company_name: "Midwest Manufacturing Group",
    description: "Family-owned EMS focused on industrial controls and energy.",
    employee_count_range: "150-500",
    facilities: [
      {
        id: "f5",
        city: "Chicago",
        state: "IL",
        latitude: 41.8781,
        longitude: -87.6298,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: false,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: true,
        box_build_assembly: true,
        prototyping: false,
        low_volume_production: false,
        medium_volume_production: true,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i6", company_id: "c4", industry_name: "Industrial Controls" },
    ],
    certifications: [
      { id: "cert6", company_id: "c4", certification_type: "ISO 9001" },
    ],
  },
  {
    id: "c5",
    slug: "gulf-coast-ems",
    company_name: "Gulf Coast EMS",
    description: "High-reliability defense and aerospace builds near the Gulf Coast.",
    employee_count_range: "150-500",
    facilities: [
      {
        id: "f6",
        city: "Houston",
        state: "TX",
        latitude: 29.7604,
        longitude: -95.3698,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: true,
        box_build_assembly: true,
        prototyping: true,
        low_volume_production: false,
        medium_volume_production: true,
        high_volume_production: true,
      },
    ],
    industries: [
      { id: "i7", company_id: "c5", industry_name: "Aerospace/Defense" },
      { id: "i8", company_id: "c5", industry_name: "Energy" },
    ],
    certifications: [
      { id: "cert7", company_id: "c5", certification_type: "AS9100" },
      { id: "cert8", company_id: "c5", certification_type: "ITAR" },
    ],
  },
  {
    id: "c6",
    slug: "northeast-assembly",
    company_name: "Northeast Assembly",
    description: "Medical device focused EMS with strong prototyping services.",
    employee_count_range: "50-150",
    facilities: [
      {
        id: "f7",
        city: "Boston",
        state: "MA",
        latitude: 42.3601,
        longitude: -71.0589,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: false,
        cable_harness_assembly: false,
        box_build_assembly: false,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: true,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i9", company_id: "c6", industry_name: "Medical Devices" },
    ],
    certifications: [
      { id: "cert9", company_id: "c6", certification_type: "ISO 13485" },
    ],
  },
  {
    id: "c7",
    slug: "desert-electronics",
    company_name: "Desert Electronics",
    description: "High-volume consumer electronics production in Arizona.",
    employee_count_range: "500-1000",
    facilities: [
      {
        id: "f8",
        city: "Phoenix",
        state: "AZ",
        latitude: 33.4484,
        longitude: -112.074,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: false,
        cable_harness_assembly: false,
        box_build_assembly: true,
        prototyping: false,
        low_volume_production: false,
        medium_volume_production: true,
        high_volume_production: true,
      },
    ],
    industries: [
      { id: "i10", company_id: "c7", industry_name: "Consumer Electronics" },
    ],
    certifications: [
      { id: "cert10", company_id: "c7", certification_type: "ISO 9001" },
    ],
  },
  {
    id: "c8",
    slug: "rocky-mountain-manufacturing",
    company_name: "Rocky Mountain Manufacturing",
    description: "Mixed technology builds with ruggedization expertise.",
    employee_count_range: "150-500",
    facilities: [
      {
        id: "f9",
        city: "Denver",
        state: "CO",
        latitude: 39.7392,
        longitude: -104.9903,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: true,
        box_build_assembly: true,
        prototyping: false,
        low_volume_production: false,
        medium_volume_production: true,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i11", company_id: "c8", industry_name: "Industrial Controls" },
      { id: "i12", company_id: "c8", industry_name: "Energy" },
    ],
    certifications: [
      { id: "cert11", company_id: "c8", certification_type: "ISO 9001" },
      { id: "cert12", company_id: "c8", certification_type: "AS9100" },
    ],
  },
  {
    id: "c9",
    slug: "great-lakes-ems",
    company_name: "Great Lakes EMS",
    description: "Full-service EMS supporting automotive and medical OEMs.",
    employee_count_range: "500-1000",
    facilities: [
      {
        id: "f10",
        city: "Detroit",
        state: "MI",
        latitude: 42.3314,
        longitude: -83.0458,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: true,
        box_build_assembly: false,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: true,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i13", company_id: "c9", industry_name: "Automotive" },
      { id: "i14", company_id: "c9", industry_name: "Medical Devices" },
    ],
    certifications: [
      { id: "cert13", company_id: "c9", certification_type: "IATF 16949" },
      { id: "cert14", company_id: "c9", certification_type: "ISO 13485" },
    ],
  },
  {
    id: "c10",
    slug: "southern-circuits",
    company_name: "Southern Circuits",
    description: "Specialty cable harness and mixed technology builds in Georgia.",
    employee_count_range: "150-500",
    facilities: [
      {
        id: "f11",
        city: "Atlanta",
        state: "GA",
        latitude: 33.749,
        longitude: -84.388,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: true,
        box_build_assembly: false,
        prototyping: false,
        low_volume_production: false,
        medium_volume_production: true,
        high_volume_production: true,
      },
    ],
    industries: [
      { id: "i15", company_id: "c10", industry_name: "Industrial Controls" },
    ],
    certifications: [
      { id: "cert15", company_id: "c10", certification_type: "ISO 9001" },
    ],
  },
  {
    id: "c11",
    slug: "northwest-systems",
    company_name: "Northwest Systems",
    description: "Prototype-to-production partner with focus on IoT devices.",
    employee_count_range: "50-150",
    facilities: [
      {
        id: "f12",
        city: "Portland",
        state: "OR",
        latitude: 45.5152,
        longitude: -122.6784,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: false,
        cable_harness_assembly: false,
        box_build_assembly: true,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: false,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i16", company_id: "c11", industry_name: "Consumer Electronics" },
    ],
    certifications: [
      { id: "cert16", company_id: "c11", certification_type: "ISO 9001" },
    ],
  },
  {
    id: "c12",
    slug: "lakeside-electronics",
    company_name: "Lakeside Electronics",
    description: "Low-volume builds for industrial automation OEMs.",
    employee_count_range: "50-150",
    facilities: [
      {
        id: "f13",
        city: "Minneapolis",
        state: "MN",
        latitude: 44.9778,
        longitude: -93.265,
        facility_type: "Manufacturing",
      },
    ],
    capabilities: [
      {
        pcb_assembly_smt: false,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: false,
        box_build_assembly: false,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: false,
        high_volume_production: false,
      },
    ],
    industries: [
      { id: "i17", company_id: "c12", industry_name: "Industrial Controls" },
    ],
    certifications: [
      { id: "cert17", company_id: "c12", certification_type: "ISO 9001" },
    ],
  },
]

function normalizeCursor(cursor?: string | null): number {
  if (!cursor) {
    return 0
  }

  const numeric = Number(String(cursor).split(":").pop())
  if (Number.isFinite(numeric) && numeric >= 0) {
    return Math.floor(numeric)
  }

  return 0
}

function supportsCapability(
  capabilityRecord: CompanyListItem["capabilities"] extends Array<infer C> ? C : never,
  capability: (typeof CAPABILITY_SLUGS)[number],
): boolean {
  if (!capabilityRecord) {
    return false
  }

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
}

function supportsVolume(
  capabilityRecord: CompanyListItem["capabilities"] extends Array<infer C> ? C : never,
  volume: ProductionVolume,
): boolean {
  if (!capabilityRecord) {
    return false
  }

  switch (volume) {
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

function matchesFilters(company: CompanyListItem, filters: FilterState): boolean {
  const { states, capabilities, productionVolume } = filters
  const facilityStates = new Set(
    (company.facilities ?? [])
      .map(facility => facility?.state)
      .filter((state): state is string => typeof state === "string" && state.length > 0),
  )

  if (states.length > 0 && !states.some(state => facilityStates.has(state))) {
    return false
  }

  if (capabilities.length > 0) {
    const capabilityRecord = company.capabilities?.[0]
    if (!capabilityRecord) {
      return false
    }

    const matchesCapability = capabilities.every(capability =>
      supportsCapability(capabilityRecord, capability as (typeof CAPABILITY_SLUGS)[number]),
    )

    if (!matchesCapability) {
      return false
    }
  }

  if (productionVolume) {
    const capabilityRecord = company.capabilities?.[0]
    if (!capabilityRecord || !supportsVolume(capabilityRecord, productionVolume)) {
      return false
    }
  }

  return true
}

function computeFacetCounts(companies: CompanyListItem[]): FacetCounts {
  const stateCounts: Record<string, number> = {}
  const capabilityCounts: Record<(typeof CAPABILITY_SLUGS)[number], number> = {
    smt: 0,
    through_hole: 0,
    cable_harness: 0,
    box_build: 0,
    prototyping: 0,
  }
  const volumeCounts: Record<ProductionVolume, number> = {
    low: 0,
    medium: 0,
    high: 0,
  }

  companies.forEach(company => {
    const facilityStates = new Set(
      (company.facilities ?? [])
        .map(facility => facility?.state)
        .filter((state): state is string => typeof state === "string" && state.length > 0),
    )
    facilityStates.forEach(state => {
      stateCounts[state] = (stateCounts[state] ?? 0) + 1
    })

    const capabilityRecord = company.capabilities?.[0]
    CAPABILITY_SLUGS.forEach(capability => {
      if (supportsCapability(capabilityRecord, capability)) {
        capabilityCounts[capability] = (capabilityCounts[capability] ?? 0) + 1
      }
    })

    VOLUME_KEYS.forEach(volume => {
      if (supportsVolume(capabilityRecord, volume)) {
        volumeCounts[volume] = (volumeCounts[volume] ?? 0) + 1
      }
    })
  })

  return {
    states: stateCounts,
    capabilities: capabilityCounts,
    productionVolume: volumeCounts,
  }
}

export async function fetchCompaniesStub(
  filters: FilterState,
  cursor?: string | null,
  predicate?: (company: CompanyListItem) => boolean,
): Promise<CompanySearchResult> {
  const normalizedCursor = normalizeCursor(cursor)
  const filtered = STUB_COMPANIES.filter(company => matchesFilters(company, filters))
    .filter(company => (predicate ? predicate(company) : true))

  const totalCount = filtered.length
  const facetCounts = computeFacetCounts(filtered)

  const startIndex = Math.min(Math.max(normalizedCursor, 0), Math.max(totalCount - 1, 0))
  const sliceStart = Math.min(startIndex, Math.max(totalCount - 1, 0))
  const sliceEnd = sliceStart + PAGE_SIZE

  const companies = filtered.slice(sliceStart, sliceEnd)

  const hasPrev = sliceStart > 0
  const hasNext = sliceEnd < totalCount

  const pageInfo: PageInfo = {
    hasPrev,
    hasNext,
    prevCursor: hasPrev ? `c:${Math.max(sliceStart - PAGE_SIZE, 0)}` : undefined,
    nextCursor: hasNext ? `c:${sliceEnd}` : undefined,
  }

  return {
    companies,
    totalCount,
    facetCounts,
    pageInfo,
  }
}

export { STUB_COMPANIES }
