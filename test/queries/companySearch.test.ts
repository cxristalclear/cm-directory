import { randomUUID } from "crypto"

import {
  companySearch,
  deserializeCursor,
  parseCursor,
  serializeCursor,
} from "@/lib/queries/companySearch"
import type {
  Capabilities,
  Certification,
  Company,
  Facility,
  Industry,
} from "@/types/company"

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const { supabase } = jest.requireMock("@/lib/supabase") as {
  supabase: { from: jest.Mock }
}

type MockCompany = Company & {
  facilities: Facility[]
  capabilities: Capabilities[]
  industries: Industry[]
  certifications: Certification[]
}

type CapabilityOverrides = Partial<Capabilities>
type FacilityOverrides = Partial<Facility>
type CompanyOverrides = Partial<MockCompany>

type BuilderResult = {
  data?: unknown
  count?: number
  error?: Error | null
}

type MockBuilder = {
  select: jest.Mock
  filter: jest.Mock
  or: jest.Mock
  eq: jest.Mock
  gte: jest.Mock
  lte: jest.Mock
  order: jest.Mock
  limit: jest.Mock
  not: jest.Mock
  then: jest.Mock
}

type BuilderEntry = {
  table: string
  from: { select: jest.Mock }
  builder: MockBuilder
}

function createCapabilities(overrides: CapabilityOverrides = {}): Capabilities {
  return {
    id: randomUUID(),
    company_id: "",
    pcb_assembly_smt: false,
    pcb_assembly_through_hole: false,
    pcb_assembly_mixed: false,
    pcb_assembly_fine_pitch: false,
    cable_harness_assembly: false,
    box_build_assembly: false,
    testing_ict: null,
    testing_functional: null,
    testing_environmental: null,
    testing_rf_wireless: null,
    design_services: null,
    supply_chain_management: null,
    prototyping: false,
    low_volume_production: false,
    medium_volume_production: false,
    high_volume_production: false,
    turnkey_services: null,
    consigned_services: null,
    last_verified_date: null,
    created_at: undefined,
    updated_at: undefined,
    ...overrides,
  }
}

function createFacility(overrides: FacilityOverrides = {}): Facility {
  return {
    id: randomUUID(),
    company_id: "",
    facility_type: "Manufacturing",
    street_address: null,
    city: null,
    state: null,
    zip_code: null,
    country: "US",
    latitude: null,
    longitude: null,
    location: null,
    facility_size_sqft: null,
    employees_at_location: null,
    key_capabilities: null,
    is_primary: true,
    created_at: undefined,
    updated_at: undefined,
    ...overrides,
  }
}

function createCompany(overrides: CompanyOverrides = {}): MockCompany {
  const id = overrides.id ?? randomUUID()
  const capability = overrides.capabilities?.[0] ?? createCapabilities({ company_id: id })
  const facility = overrides.facilities?.[0] ?? createFacility({ company_id: id })

  return {
    id,
    company_name: "Test Company",
    slug: `company-${id}`,
    dba_name: null,
    website_url: null,
    year_founded: null,
    employee_count_range: null,
    annual_revenue_range: null,
    logo_url: null,
    description: null,
    key_differentiators: null,
    is_active: true,
    is_verified: true,
    last_verified_date: null,
    created_at: undefined,
    updated_at: undefined,
    facilities: [facility],
    capabilities: [capability],
    industries: [],
    certifications: [],
    technical_specs: null,
    business_info: null,
    contacts: null,
    verification_data: null,
    ...overrides,
  }
}

const baseCompanies: MockCompany[] = [
  createCompany({
    id: "c01",
    company_name: "Alpha Manufacturing",
    slug: "alpha-manufacturing",
    facilities: [
      createFacility({
        company_id: "c01",
        city: "San Jose",
        state: "CA",
        latitude: 37.33,
        longitude: -121.9,
      }),
    ],
    capabilities: [
      createCapabilities({
        company_id: "c01",
        pcb_assembly_smt: true,
        medium_volume_production: true,
      }),
    ],
  }),
  createCompany({
    id: "c02",
    company_name: "Beta Electronics",
    slug: "beta-electronics",
    facilities: [
      createFacility({
        company_id: "c02",
        city: "Austin",
        state: "TX",
        latitude: 30.27,
        longitude: -97.74,
      }),
    ],
    capabilities: [
      createCapabilities({
        company_id: "c02",
        box_build_assembly: true,
        high_volume_production: true,
      }),
    ],
  }),
]

const builderQueue: BuilderEntry[] = []

function createBuilder(result: BuilderResult, table: string, label: string): BuilderEntry {
  const response = {
    data: result.data ?? null,
    error: result.error ?? null,
    count: result.count,
  }

  const builder: MockBuilder = {
    select: jest.fn(() => builder),
    filter: jest.fn(() => builder),
    or: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    not: jest.fn(() => builder),
    then: jest.fn((resolve, reject) => Promise.resolve(response).then(resolve, reject)),
  }

  const fromObject = {
    select: jest.fn(() => builder),
    label,
  }

  return { table, from: fromObject, builder }
}

beforeEach(() => {
  jest.clearAllMocks()
  builderQueue.length = 0
  supabase.from.mockImplementation((table: string) => {
    const next = builderQueue.shift()
    if (!next) {
      throw new Error("Unexpected supabase.from call")
    }
    expect(next.table).toBe(table)
    return next.from
  })
})

function enqueueBuilder(result: BuilderResult, table: string, label: string): BuilderEntry {
  const entry = createBuilder(result, table, label)
  builderQueue.push(entry)
  return entry
}

describe("companySearch", () => {
  it("normalizes filters and returns formatted results", async () => {
    const mainEntry = enqueueBuilder(
      { data: baseCompanies, count: 42, error: null },
      "companies",
      "main",
    )
    const prevEntry = enqueueBuilder(
      { data: [{ id: "c00", company_name: "Aardvark" }], error: null },
      "companies",
      "prev",
    )
    const facilitiesEntry = enqueueBuilder(
      {
        data: [
          { state: "CA" },
          { state: "TX" },
        ],
      },
      "facilities",
      "state candidates",
    )

    const capabilityCounts: Array<BuilderResult> = [
      { count: 1 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 0 },
      { count: 1 },
    ]
    for (const [index, result] of capabilityCounts.entries()) {
      enqueueBuilder(result, "companies", `capability-${index}`)
    }

    const volumeCounts: Array<BuilderResult> = [{ count: 0 }, { count: 1 }, { count: 1 }]
    for (const [index, result] of volumeCounts.entries()) {
      enqueueBuilder(result, "companies", `volume-${index}`)
    }

    const stateCounts: Array<BuilderResult> = [{ count: 1 }, { count: 1 }]
    const stateCountEntries = stateCounts.map((result, index) =>
      enqueueBuilder(result, "companies", `state-count-${index}`),
    )

    const cursor = serializeCursor({ name: "Alpha Manufacturing", id: "c01" })

    const result = await companySearch({
      filters: { states: ["ca", "TX"], capabilities: ["smt"], productionVolume: "medium" },
      routeDefaults: { certSlug: "iso-13485" },
      cursor: deserializeCursor(cursor),
      includeFacetCounts: true,
    })

    expect(supabase.from).toHaveBeenCalledTimes(14)
    expect(mainEntry.from.select).toHaveBeenCalledWith(expect.stringContaining("capabilities:capabilities"), {
      count: "exact",
    })
    expect(mainEntry.builder.filter).toHaveBeenCalledWith("facilities.state", "in", "(\"CA\",\"TX\")")
    expect(mainEntry.builder.or).toHaveBeenNthCalledWith(1, "capabilities.pcb_assembly_smt.is.true", {
      referencedTable: "capabilities",
    })
    expect(mainEntry.builder.or).toHaveBeenNthCalledWith(2, expect.stringContaining("company_name.gt."))
    expect(mainEntry.builder.eq).toHaveBeenCalledWith(
      "certifications.certification_type",
      "ISO 13485",
    )

    expect(mainEntry.builder.limit).toHaveBeenCalledWith(10)

    expect(result.filteredCount).toBe(42)
    expect(result.companies).toHaveLength(2)
    expect(result.pageInfo.hasNextPage).toBe(false)
    expect(result.pageInfo.hasPreviousPage).toBe(true)
    expect(result.pageInfo.prevCursor).toBeTruthy()
    expect(result.pageInfo.nextCursor).toBeNull()
    expect(result.pageInfo.startCursor).toBeTruthy()
    expect(result.pageInfo.endCursor).toBeTruthy()

    expect(result.facetCounts?.states).toEqual([
      { code: "CA", count: 1 },
      { code: "TX", count: 1 },
    ])
    expect(result.facetCounts?.capabilities.find((entry) => entry.slug === "smt")?.count).toBe(1)
    expect(result.facetCounts?.capabilities.find((entry) => entry.slug === "box_build")?.count).toBe(1)
    expect(result.facetCounts?.productionVolume.find((entry) => entry.level === "medium")?.count).toBe(1)
    expect(result.facetCounts?.productionVolume.find((entry) => entry.level === "high")?.count).toBe(1)

    expect(prevEntry.from.select).toHaveBeenCalledWith("id, company_name")
    expect(facilitiesEntry.from.select).toHaveBeenCalledWith("state")
    expect(facilitiesEntry.builder.not).toHaveBeenCalledWith("state", "is", null)

    const stateFacetEntry = stateCountEntries[0]
    expect(stateFacetEntry?.builder.or).toHaveBeenCalledWith("capabilities.pcb_assembly_smt.is.true", {
      referencedTable: "capabilities",
    })
    expect(stateFacetEntry?.builder.eq).toHaveBeenCalledWith("capabilities.medium_volume_production", true)
    expect(stateFacetEntry?.builder.eq).toHaveBeenCalledWith("facilities.state", "CA")
  })

  it("skips facet queries when includeFacetCounts is false", async () => {
    const mainEntry = enqueueBuilder(
      { data: baseCompanies.slice(0, 1), count: 1, error: null },
      "companies",
      "main",
    )

    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      includeFacetCounts: false,
    })

    expect(supabase.from).toHaveBeenCalledTimes(1)
    expect(mainEntry.builder.limit).toHaveBeenCalledWith(10)
    expect(result.filteredCount).toBe(1)
    expect(result.facetCounts).toBeNull()
    expect(result.pageInfo.hasNextPage).toBe(false)
    expect(result.pageInfo.hasPreviousPage).toBe(false)
  })

  it("returns all companies when no filters or cursor are provided", async () => {
    const mainEntry = enqueueBuilder(
      { data: baseCompanies, count: 2, error: null },
      "companies",
      "main",
    )
    const facilitiesEntry = enqueueBuilder({ data: [], error: null }, "facilities", "state candidates")

    for (let i = 0; i < 6; i += 1) {
      enqueueBuilder({ count: 0 }, "companies", `capability-${i}`)
    }
    for (let i = 0; i < 3; i += 1) {
      enqueueBuilder({ count: 0 }, "companies", `volume-${i}`)
    }

    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    expect(mainEntry.builder.limit).toHaveBeenCalledWith(10)
    expect(result.pageInfo.hasNextPage).toBe(false)
    expect(result.pageInfo.hasPreviousPage).toBe(false)
    expect(result.filteredCount).toBe(2)
    expect(result.companies).toHaveLength(baseCompanies.length)
    expect(facilitiesEntry.from.select).toHaveBeenCalledWith("state")
  })

  it("applies bounding box filters", async () => {
    const entry = enqueueBuilder(
      { data: baseCompanies.slice(0, 1), count: 1, error: null },
      "companies",
      "main",
    )
    enqueueBuilder({ data: [], error: null }, "facilities", "state candidates")
    for (let i = 0; i < 6; i += 1) {
      enqueueBuilder({ count: 0 }, "companies", `capability-${i}`)
    }
    for (let i = 0; i < 3; i += 1) {
      enqueueBuilder({ count: 0 }, "companies", `volume-${i}`)
    }

    await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      bbox: { minLng: -130, minLat: 25, maxLng: -65, maxLat: 50 },
    })

    expect(entry.builder.gte).toHaveBeenCalledWith("facilities.longitude", -130)
    expect(entry.builder.lte).toHaveBeenCalledWith("facilities.latitude", 50)
  })

  it("logs and returns empty results when Supabase returns an error", async () => {
    const error = new Error("Query failed")
    enqueueBuilder({ data: null, error }, "companies", "main")
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    expect(consoleSpy).toHaveBeenCalled()
    expect(result).toEqual({
      companies: [],
      filteredCount: 0,
      facetCounts: {
        states: [],
        capabilities: expect.arrayContaining([
          expect.objectContaining({ slug: "smt", count: 0 }),
          expect.objectContaining({ slug: "box_build", count: 0 }),
        ]),
        productionVolume: [
          { level: "low", count: 0 },
          { level: "medium", count: 0 },
          { level: "high", count: 0 },
        ],
      },
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        prevCursor: null,
        startCursor: null,
        endCursor: null,
        pageSize: 9,
      },
    })

    consoleSpy.mockRestore()
  })
})

describe("cursor helpers", () => {
  it("serializes and deserializes cursors", () => {
    const cursor = serializeCursor({ name: "Test", id: "123" })
    expect(cursor).toBeTruthy()
    expect(deserializeCursor(cursor)).toEqual({ name: "Test", id: "123" })
  })

  it("parses cursors from search params", () => {
    const encoded = serializeCursor({ name: "Company", id: "abc" })
    const parsed = parseCursor({ cursor: encoded ?? undefined })
    expect(parsed).toEqual({ name: "Company", id: "abc" })
  })
})
