import { randomUUID } from "crypto"

import { companySearch } from "@/lib/queries/companySearch"
import type { Capabilities, Company, Facility } from "@/types/company"

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const { supabase } = jest.requireMock("@/lib/supabase") as {
  supabase: { from: jest.Mock }
}

type BuilderResult = {
  data?: unknown
  count?: number | null
  error?: Error | null
}

type MockBuilder = {
  select: jest.Mock
  in: jest.Mock
  eq: jest.Mock
  or: jest.Mock
  gte: jest.Mock
  lte: jest.Mock
  not: jest.Mock
  order: jest.Mock
  limit: jest.Mock
  then: jest.Mock
  url: URL
}

type QueueEntry = {
  table: string
  builder: MockBuilder
  response: BuilderResult
}

const builderQueue: QueueEntry[] = []

function createMockBuilder(table: string, response: BuilderResult): MockBuilder {
  const url = new URL(`https://example.com/${table}`)

  const builder: MockBuilder = {
    select: jest.fn(() => builder),
    in: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    or: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    not: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    then: jest.fn((resolve, reject) => Promise.resolve(response).then(resolve, reject)),
    url,
  }

  return builder
}

function enqueueBuilder(table: string, result: BuilderResult): QueueEntry {
  const response: BuilderResult = {
    data: result.data ?? null,
    count: result.count ?? null,
    error: result.error ?? null,
  }

  const entry: QueueEntry = {
    table,
    builder: createMockBuilder(table, response),
    response,
  }

  builderQueue.push(entry)
  return entry
}

beforeEach(() => {
  jest.clearAllMocks()
  builderQueue.length = 0
  supabase.from.mockImplementation((table: string) => {
    const next = builderQueue.shift()
    if (!next) {
      throw new Error(`Unexpected supabase.from call for ${table}`)
    }
    expect(next.table).toBe(table)
    return next.builder
  })
})

function createCapabilities(overrides: Partial<Capabilities> = {}): Capabilities {
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

function createFacility(overrides: Partial<Facility> = {}): Facility {
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

function createCompany(
  overrides: Partial<Company> & { facilities?: Facility[]; capabilities?: Capabilities[] } = {},
): Company {
  const id = overrides.id ?? randomUUID()
  const facilities = overrides.facilities ?? [createFacility({ company_id: id })]
  const capabilities = overrides.capabilities ?? [createCapabilities({ company_id: id })]

  return {
    id,
    company_name: overrides.company_name ?? `Company-${id}`,
    slug: overrides.slug ?? `company-${id}`,
    dba_name: overrides.dba_name ?? null,
    website_url: overrides.website_url ?? null,
    year_founded: overrides.year_founded ?? null,
    employee_count_range: overrides.employee_count_range ?? null,
    annual_revenue_range: overrides.annual_revenue_range ?? null,
    logo_url: overrides.logo_url ?? null,
    description: overrides.description ?? null,
    key_differentiators: overrides.key_differentiators ?? null,
    is_active: overrides.is_active ?? true,
    is_verified: overrides.is_verified ?? true,
    last_verified_date: overrides.last_verified_date ?? null,
    created_at: overrides.created_at ?? undefined,
    updated_at: overrides.updated_at ?? undefined,
    facilities,
    capabilities,
    industries: [],
    certifications: overrides.certifications ?? [],
    technical_specs: null,
    business_info: null,
    contacts: null,
    verification_data: null,
  }
}

describe("companySearch facet counts", () => {
  const baseCompanies = [
    createCompany({
      id: "c01",
      company_name: "Alpha Manufacturing",
      slug: "alpha-manufacturing",
      facilities: [
        createFacility({ company_id: "c01", state: "CA" }),
        createFacility({ company_id: "c01", state: "CA" }),
      ],
      capabilities: [
        createCapabilities({ company_id: "c01", pcb_assembly_smt: true, medium_volume_production: true }),
      ],
    }),
    createCompany({
      id: "c02",
      company_name: "Beta Electronics",
      slug: "beta-electronics",
      facilities: [createFacility({ company_id: "c02", state: "TX" })],
      capabilities: [
        createCapabilities({ company_id: "c02", box_build_assembly: true, high_volume_production: true }),
      ],
    }),
  ]

  it("counts all facets without active filters", async () => {
    enqueueBuilder("companies", { data: baseCompanies.map((company) => ({ id: company.id })) })
    enqueueBuilder("companies", { data: baseCompanies, count: 2 })
    enqueueBuilder("facilities", {
      data: [
        { company_id: "c01", state: "CA" },
        { company_id: "c01", state: "CA" },
        { company_id: "c02", state: "TX" },
      ],
    })
    enqueueBuilder("capabilities", {
      data: [
        createCapabilities({ company_id: "c01", pcb_assembly_smt: true, medium_volume_production: true }),
        createCapabilities({ company_id: "c02", box_build_assembly: true, high_volume_production: true }),
      ],
    })
    enqueueBuilder("capabilities", {
      data: [
        createCapabilities({ company_id: "c01", medium_volume_production: true }),
        createCapabilities({ company_id: "c02", high_volume_production: true }),
      ],
    })

    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    expect(result.facetCounts?.states).toEqual([
      { code: "CA", count: 1 },
      { code: "TX", count: 1 },
    ])
    expect(result.facetCounts?.capabilities.find((entry) => entry.slug === "smt")?.count).toBe(1)
    expect(result.facetCounts?.capabilities.find((entry) => entry.slug === "box_build")?.count).toBe(1)
    expect(result.facetCounts?.productionVolume.find((entry) => entry.level === "medium")?.count).toBe(1)
    expect(result.facetCounts?.productionVolume.find((entry) => entry.level === "high")?.count).toBe(1)
  })

  it("applies capability filters when computing state counts", async () => {
    enqueueBuilder("capabilities", { data: [{ company_id: "c01" }] })
    enqueueBuilder("companies", { data: [baseCompanies[0]], count: 1 })
    enqueueBuilder("companies", { data: baseCompanies.map((company) => ({ id: company.id })) })
    enqueueBuilder("facilities", {
      data: [
        { company_id: "c01", state: "CA" },
        { company_id: "c01", state: "CA" },
      ],
    })
    enqueueBuilder("capabilities", {
      data: [
        createCapabilities({ company_id: "c01", pcb_assembly_smt: true, medium_volume_production: true }),
        createCapabilities({ company_id: "c02", box_build_assembly: true, high_volume_production: true }),
      ],
    })
    enqueueBuilder("capabilities", {
      data: [createCapabilities({ company_id: "c01", medium_volume_production: true })],
    })

    const result = await companySearch({
      filters: { states: [], capabilities: ["smt"], productionVolume: null },
    })

    expect(result.facetCounts?.states).toEqual([{ code: "CA", count: 1 }])
    expect(result.facetCounts?.capabilities.find((entry) => entry.slug === "box_build")?.count).toBe(1)
  })

  it("applies production volume filters when computing capability counts", async () => {
    enqueueBuilder("capabilities", { data: [{ company_id: "c02" }] })
    enqueueBuilder("companies", { data: [baseCompanies[1]], count: 1 })
    enqueueBuilder("companies", { data: baseCompanies.map((company) => ({ id: company.id })) })
    enqueueBuilder("facilities", {
      data: [
        { company_id: "c02", state: "TX" },
      ],
    })
    enqueueBuilder("capabilities", {
      data: [createCapabilities({ company_id: "c02", box_build_assembly: true, high_volume_production: true })],
    })
    enqueueBuilder("capabilities", {
      data: [
        createCapabilities({ company_id: "c01", medium_volume_production: true }),
        createCapabilities({ company_id: "c02", high_volume_production: true }),
      ],
    })

    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: "high" },
    })

    expect(result.facetCounts?.states).toEqual([{ code: "TX", count: 1 }])
    expect(result.facetCounts?.capabilities.find((entry) => entry.slug === "smt")?.count).toBe(0)
    expect(result.facetCounts?.productionVolume.find((entry) => entry.level === "high")?.count).toBe(1)
  })
})
