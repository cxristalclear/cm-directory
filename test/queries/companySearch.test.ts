import { randomUUID } from "crypto"

import {
  COMPANY_SEARCH_FUNCTION,
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
    rpc: jest.fn(),
  },
}))

const { supabase } = jest.requireMock("@/lib/supabase") as {
  supabase: { rpc: jest.Mock }
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
    facilities: [createFacility({ company_id: id })],
    capabilities: [createCapabilities({ company_id: id })],
    industries: [],
    certifications: [],
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

type MockRpcData = {
  companies: MockCompany[]
  total_count: number
  has_next: boolean
  has_prev: boolean
  next_cursor: { name: string; id: string } | null
  prev_cursor: { name: string; id: string } | null
  facet_counts: {
    states: Array<{ code: string; count: number }>
    capabilities: Array<{ slug: string; count: number }>
    production_volume: Array<{ level: string; count: number }>
  } | null
}

function setRpcResponse(data: MockRpcData, error: Error | null = null) {
  supabase.rpc.mockResolvedValue({ data, error })
}

beforeEach(() => {
  jest.clearAllMocks()
  setRpcResponse({
    companies: baseCompanies,
    total_count: 42,
    has_next: true,
    has_prev: false,
    next_cursor: { name: "Gamma Industries", id: "c03" },
    prev_cursor: null,
    facet_counts: {
      states: [
        { code: "CA", count: 21 },
        { code: "TX", count: 21 },
      ],
      capabilities: [
        { slug: "smt", count: 21 },
        { slug: "box_build", count: 10 },
      ],
      production_volume: [
        { level: "low", count: 5 },
        { level: "medium", count: 21 },
      ],
    },
  })
})

describe("companySearch", () => {
  it("calls the Supabase RPC with normalized filters and returns formatted results", async () => {
    const result = await companySearch({
      filters: { states: ["ca", "TX"], capabilities: ["smt"], productionVolume: "medium" },
      cursor: { name: "Alpha Manufacturing", id: "c01" },
      pageSize: 12,
      includeFacetCounts: true,
    })

    expect(supabase.rpc).toHaveBeenCalledWith(
      COMPANY_SEARCH_FUNCTION,
      expect.objectContaining({
        filter_states: expect.arrayContaining(["CA", "TX"]),
        filter_capabilities: ["smt"],
        filter_volume: "medium",
        cursor_name: "Alpha Manufacturing",
        cursor_id: "c01",
        page_size: 12,
        include_facets: true,
      }),
    )

    expect(result.totalCount).toBe(42)
    expect(result.companies).toHaveLength(baseCompanies.length)
    expect(result.hasNext).toBe(true)
    expect(result.hasPrev).toBe(false)
    expect(result.nextCursor).toBe(
      serializeCursor({ name: "Gamma Industries", id: "c03" }),
    )
    expect(result.prevCursor).toBeNull()
    expect(result.facetCounts?.capabilities.find((entry) => entry.slug === "smt")?.count).toBe(21)
  })

  it("omits facet counts when includeFacetCounts is false", async () => {
    await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      includeFacetCounts: false,
    })

    expect(supabase.rpc).toHaveBeenCalledWith(
      COMPANY_SEARCH_FUNCTION,
      expect.objectContaining({ include_facets: false }),
    )

    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      includeFacetCounts: false,
    })

    expect(result.facetCounts).toBeNull()
  })

  it("fills missing capability and volume facet counts with zeros", async () => {
    setRpcResponse({
      companies: baseCompanies,
      total_count: 2,
      has_next: false,
      has_prev: false,
      next_cursor: null,
      prev_cursor: null,
      facet_counts: {
        states: [],
        capabilities: [{ slug: "smt", count: 2 }],
        production_volume: [{ level: "medium", count: 2 }],
      },
    })

    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    const capabilityCounts = result.facetCounts?.capabilities ?? []
    expect(capabilityCounts).toHaveLength(7)
    expect(capabilityCounts.find((entry) => entry.slug === "box_build")?.count).toBe(0)

    const volumeCounts = result.facetCounts?.productionVolume ?? []
    expect(volumeCounts).toHaveLength(3)
    expect(volumeCounts.find((entry) => entry.level === "low")?.count).toBe(0)
  })

  it("passes bounding box filters to the RPC payload", async () => {
    await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      bbox: { minLng: -123.5, minLat: 30.5, maxLng: -97.0, maxLat: 38.0 },
    })

    expect(supabase.rpc).toHaveBeenCalledWith(
      COMPANY_SEARCH_FUNCTION,
      expect.objectContaining({
        bbox: {
          min_lng: -123.5,
          min_lat: 30.5,
          max_lng: -97.0,
          max_lat: 38.0,
        },
      }),
    )
  })

  it("normalizes route defaults and certification slugs", async () => {
    await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      routeDefaults: { state: "ny", certSlug: "iso-13485" },
    })

    expect(supabase.rpc).toHaveBeenCalledWith(
      COMPANY_SEARCH_FUNCTION,
      expect.objectContaining({
        filter_states: ["NY"],
        route_state: "NY",
        required_certification: "ISO 13485",
      }),
    )
  })

  it("throws when Supabase returns an error", async () => {
    const error = new Error("RPC failure")
    supabase.rpc.mockResolvedValue({ data: null, error })

    await expect(
      companySearch({
        filters: { states: [], capabilities: [], productionVolume: null },
      }),
    ).rejects.toThrow("RPC failure")
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
