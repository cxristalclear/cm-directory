import { randomUUID } from "crypto"
import { companySearch, deserializeCursor } from "@/lib/queries/companySearch"
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
  supabase: {
    from: jest.Mock
  }
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

let mockData: MockCompany[] = []

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
    is_primary: undefined,
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

function setSupabaseData(data: MockCompany[]) {
  mockData = data
  const builder = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockImplementation(async () => ({ data: mockData, error: null })),
  }
  supabase.from.mockReturnValue(builder)
}

beforeEach(() => {
  jest.clearAllMocks()
  setSupabaseData([])
})

const BASE_COMPANIES: MockCompany[] = (() => {
  const companies: MockCompany[] = []

  companies.push(
    createCompany({
      id: "c01",
      company_name: "Alpha Manufacturing",
      slug: "alpha-manufacturing",
      facilities: [
        createFacility({ company_id: "c01", city: "San Jose", state: "CA" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c01",
          pcb_assembly_smt: true,
          medium_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c02",
      company_name: "Beta Electronics",
      slug: "beta-electronics",
      facilities: [
        createFacility({ company_id: "c02", city: "Austin", state: "TX" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c02",
          box_build_assembly: true,
          high_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c03",
      company_name: "Gamma Industries",
      slug: "gamma-industries",
      facilities: [
        createFacility({ company_id: "c03", city: "Buffalo", state: "NY" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c03",
          pcb_assembly_smt: true,
          low_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c04",
      company_name: "Delta Systems",
      slug: "delta-systems",
      facilities: [
        createFacility({ company_id: "c04", city: "Los Angeles", state: "CA" }),
        createFacility({ company_id: "c04", city: "Dallas", state: "TX" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c04",
          pcb_assembly_smt: true,
          box_build_assembly: true,
          medium_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c05",
      company_name: "Echo Labs",
      slug: "echo-labs",
      facilities: [
        createFacility({ company_id: "c05", city: "Houston", state: "TX" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c05",
          cable_harness_assembly: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c06",
      company_name: "Foxtrot Manufacturing",
      slug: "foxtrot-manufacturing",
      facilities: [
        createFacility({ company_id: "c06", city: "San Diego", state: "CA" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c06",
          pcb_assembly_smt: true,
          medium_volume_production: true,
          high_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c07",
      company_name: "Golf Tech",
      slug: "golf-tech",
      facilities: [
        createFacility({ company_id: "c07", city: "Miami", state: "FL" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c07",
          box_build_assembly: true,
          low_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c08",
      company_name: "Hotel Works",
      slug: "hotel-works",
      facilities: [
        createFacility({ company_id: "c08", city: "Sacramento", state: "CA" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c08",
          pcb_assembly_smt: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c09",
      company_name: "India Solutions",
      slug: "india-solutions",
      facilities: [
        createFacility({ company_id: "c09", city: "Plano", state: "TX" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c09",
          box_build_assembly: true,
          medium_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c10",
      company_name: "Juliet Fabrication",
      slug: "juliet-fabrication",
      facilities: [
        createFacility({ company_id: "c10", city: "Fresno", state: "CA" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c10",
          pcb_assembly_smt: true,
          medium_volume_production: true,
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c11",
      company_name: "Kilo Assembly",
      slug: "kilo-assembly",
      facilities: [
        createFacility({ company_id: "c11", city: "Seattle", state: "WA" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c11",
        }),
      ],
    }),
  )

  companies.push(
    createCompany({
      id: "c12",
      company_name: "Lima Manufacturing",
      slug: "lima-manufacturing",
      facilities: [
        createFacility({ company_id: "c12", city: "Portland", state: "OR" }),
      ],
      capabilities: [
        createCapabilities({
          company_id: "c12",
          pcb_assembly_smt: true,
          high_volume_production: true,
        }),
      ],
    }),
  )

  return companies
})()

describe("companySearch", () => {
  beforeEach(() => {
    setSupabaseData(BASE_COMPANIES)
  })

  it("filters companies by state OR logic", async () => {
    const result = await companySearch({
      filters: { states: ["CA", "TX"], capabilities: [], productionVolume: null },
    })

    expect(result.totalCount).toBe(8)
    expect(result.companies).toHaveLength(8)
    const names = result.companies.map((company) => company.company_name)
    expect(names).toEqual([
      "Alpha Manufacturing",
      "Beta Electronics",
      "Delta Systems",
      "Echo Labs",
      "Foxtrot Manufacturing",
      "Hotel Works",
      "India Solutions",
      "Juliet Fabrication",
    ])
  })

  it("filters companies by capability OR logic", async () => {
    const result = await companySearch({
      filters: { states: [], capabilities: ["smt", "box_build"], productionVolume: null },
      pageSize: 9,
    })

    expect(result.totalCount).toBe(10)
    expect(result.companies).toHaveLength(9)
    expect(result.pageInfo.hasNext).toBe(true)
    expect(result.pageInfo.nextCursor).not.toBeNull()
    expect(result.companies[0]?.company_name).toBe("Alpha Manufacturing")
    expect(result.companies[8]?.company_name).toBe("Juliet Fabrication")
  })

  it("filters by production volume", async () => {
    const result = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: "medium" },
    })

    expect(result.totalCount).toBe(5)
    const names = result.companies.map((company) => company.company_name)
    expect(names.sort()).toEqual([
      "Alpha Manufacturing",
      "Delta Systems",
      "Foxtrot Manufacturing",
      "India Solutions",
      "Juliet Fabrication",
    ])
  })

  it("applies AND logic across facets", async () => {
    const result = await companySearch({
      filters: {
        states: ["CA"],
        capabilities: ["smt"],
        productionVolume: "medium",
      },
    })

    expect(result.totalCount).toBe(4)
    const names = result.companies.map((company) => company.company_name)
    expect(new Set(names)).toEqual(
      new Set([
        "Alpha Manufacturing",
        "Delta Systems",
        "Foxtrot Manufacturing",
        "Juliet Fabrication",
      ]),
    )
  })

  it("deduplicates companies with multiple facilities", async () => {
    const result = await companySearch({
      filters: { states: ["TX"], capabilities: [], productionVolume: null },
    })

    expect(result.totalCount).toBe(4)
    const ids = result.companies.map((company) => company.id)
    expect(ids).toEqual(["c02", "c04", "c05", "c09"])
  })

  it("paginates using the provided cursor", async () => {
    const firstPage = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      pageSize: 9,
    })

    expect(firstPage.companies).toHaveLength(9)
    expect(firstPage.pageInfo.hasNext).toBe(true)
    expect(firstPage.pageInfo.nextCursor).not.toBeNull()

    const secondPage = await companySearch({
      filters: { states: [], capabilities: [], productionVolume: null },
      cursor: deserializeCursor(firstPage.pageInfo.nextCursor),
      pageSize: 9,
    })

    expect(secondPage.companies.map((company) => company.company_name)).toEqual([
      "Juliet Fabrication",
      "Kilo Assembly",
      "Lima Manufacturing",
    ])
    expect(secondPage.pageInfo.hasNext).toBe(false)
    expect(secondPage.pageInfo.hasPrev).toBe(true)
  })

  it("computes facet counts with capability and volume filters", async () => {
    const result = await companySearch({
      filters: { states: [], capabilities: ["smt"], productionVolume: "medium" },
    })

    expect(result.facetCounts).not.toBeNull()
    const counts = result.facetCounts!
    expect(counts.states).toEqual([
      { code: "CA", count: 4 },
      { code: "TX", count: 1 },
    ])
    const boxBuild = counts.capabilities.find((entry) => entry.slug === "box_build")
    expect(boxBuild?.count).toBe(2)
    const mediumVolume = counts.productionVolume.find((entry) => entry.level === "medium")
    expect(mediumVolume?.count).toBe(4)
  })
})
