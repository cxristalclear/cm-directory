import { renderToStaticMarkup } from "react-dom/server"

import { serializeCursor } from "@/lib/queries/companySearch"

const mockCompanyList = jest.fn((props: unknown) => null)
const mockFilterSidebar = jest.fn((props: unknown) => null)
const mockLazyCompanyMap = jest.fn((props: unknown) => null)
const mockHeader = jest.fn((props: unknown) => null)

jest.mock("@/components/CompanyList", () => ({
  __esModule: true,
  default: mockCompanyList,
}))

jest.mock("@/components/FilterSidebar", () => ({
  __esModule: true,
  default: mockFilterSidebar,
}))

jest.mock("@/components/LazyCompanyMap", () => ({
  __esModule: true,
  default: mockLazyCompanyMap,
}))

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: mockHeader,
}))

jest.mock("@/lib/queries/companySearch", () => {
  const actual = jest.requireActual("@/lib/queries/companySearch")
  return {
    ...actual,
    companySearch: jest.fn(),
  }
})

jest.mock("@/lib/queries/mapSearch", () => ({
  companyFacilitiesForMap: jest.fn(),
}))

const { companySearch } = jest.requireMock("@/lib/queries/companySearch") as {
  companySearch: jest.Mock
}
const { companyFacilitiesForMap } = jest.requireMock("@/lib/queries/mapSearch") as {
  companyFacilitiesForMap: jest.Mock
}

const baseCompanies = Array.from({ length: 9 }).map((_, index) => ({
  id: `company-${index}`,
  company_name: `Company ${index}`,
  slug: `company-${index}`,
  facilities: [
    {
      id: `facility-${index}`,
      company_id: `company-${index}`,
      city: "Austin",
      state: "TX",
      latitude: 30.2672,
      longitude: -97.7431,
      is_primary: true,
    },
  ],
  capabilities: [
    {
      id: `cap-${index}`,
      company_id: `company-${index}`,
      pcb_assembly_smt: true,
      box_build_assembly: index % 2 === 0,
      cable_harness_assembly: index % 3 === 0,
      prototyping: index % 4 === 0,
      pcb_assembly_through_hole: false,
      pcb_assembly_mixed: false,
      pcb_assembly_fine_pitch: false,
      low_volume_production: true,
      medium_volume_production: false,
      high_volume_production: false,
    },
  ],
  certifications: [],
}))

const mapFacilities = baseCompanies.flatMap((company) =>
  company.facilities.map((facility) => ({
    company_id: company.id,
    company_name: company.company_name,
    slug: company.slug,
    facility_id: facility.id,
    city: facility.city ?? null,
    state: facility.state ?? null,
    latitude: facility.latitude ?? 0,
    longitude: facility.longitude ?? 0,
  })),
)

const mockResult = {
  companies: baseCompanies,
  filteredCount: 42,
  pageInfo: {
    hasNextPage: true,
    hasPreviousPage: false,
    nextCursor: "next",
    prevCursor: null,
    startCursor: "start",
    endCursor: "end",
    pageSize: 9,
  },
  facetCounts: {
    states: [{ code: "TX", count: 42 }],
    capabilities: [
      { slug: "smt", count: 42 },
      { slug: "box_build", count: 21 },
      { slug: "cable_harness", count: 14 },
      { slug: "through_hole", count: 0 },
    ],
    productionVolume: [
      { level: "low", count: 42 },
      { level: "medium", count: 0 },
      { level: "high", count: 0 },
    ],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  companySearch.mockResolvedValue(mockResult)
  companyFacilitiesForMap.mockResolvedValue({ facilities: mapFacilities, truncated: false })
})

describe("home page SSR", () => {
  it("loads filters from search params and passes server data to UI", async () => {
    const { default: HomePage } = await import("@/app/page")

    const element = await HomePage({
      searchParams: Promise.resolve({ state: "TX", capability: "smt" }),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          states: ["TX"],
          capabilities: ["smt"],
          productionVolume: null,
        },
        cursor: null,
      }),
    )

    const headerProps = mockHeader.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(headerProps).toMatchObject({
      filteredCount: mockResult.filteredCount,
      visibleCount: mockResult.companies.length,
      activeFilterCount: 2,
    })

    const companyListProps = mockCompanyList.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(companyListProps).toMatchObject({
      filteredCount: mockResult.filteredCount,
      pageInfo: expect.objectContaining({
        hasNextPage: true,
        nextCursor: "next",
      }),
    })
    expect(Array.isArray(companyListProps.companies)).toBe(true)
    expect((companyListProps.companies as unknown[]).length).toBe(mockResult.companies.length)

    const filterSidebarProps = mockFilterSidebar.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(filterSidebarProps).toMatchObject({
      basePath: "/",
      filters: { states: ["TX"], capabilities: ["smt"], productionVolume: null },
      facetCounts: mockResult.facetCounts,
    })

    const mapProps = mockLazyCompanyMap.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(Array.isArray(mapProps?.initialFacilities)).toBe(true)
    expect((mapProps?.initialFacilities as unknown[]).length).toBe(mapFacilities.length)
  })

  it("decodes cursor from the URL", async () => {
    const { default: HomePage } = await import("@/app/page")
    const encodedCursor = serializeCursor({ name: "Company 5", id: "company-5" })

    await HomePage({
      searchParams: Promise.resolve({ cursor: encodedCursor ?? undefined }),
    })

    expect(companySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { name: "Company 5", id: "company-5" },
      }),
    )
  })
})
