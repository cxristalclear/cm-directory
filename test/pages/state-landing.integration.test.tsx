import { renderToStaticMarkup } from "react-dom/server"

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

const { companySearch } = jest.requireMock("@/lib/queries/companySearch") as {
  companySearch: jest.Mock
}

const baseCompanies = Array.from({ length: 3 }).map((_, index) => ({
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
      pcb_assembly_mixed: true,
      low_volume_production: true,
      medium_volume_production: false,
      high_volume_production: false,
      box_build_assembly: false,
      cable_harness_assembly: false,
      pcb_assembly_through_hole: false,
      pcb_assembly_fine_pitch: false,
      prototyping: false,
    },
  ],
  certifications: [],
}))

const mockResult = {
  companies: baseCompanies,
  filteredCount: 18,
  pageInfo: {
    hasNextPage: false,
    hasPreviousPage: false,
    nextCursor: null,
    prevCursor: null,
    startCursor: null,
    endCursor: null,
    pageSize: 9,
  },
  facetCounts: {
    states: [{ code: "TX", count: 18 }],
    capabilities: [
      { slug: "smt", count: 18 },
      { slug: "mixed", count: 18 },
      { slug: "box_build", count: 9 },
    ],
    productionVolume: [
      { level: "low", count: 18 },
      { level: "medium", count: 0 },
      { level: "high", count: 0 },
    ],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  companySearch.mockResolvedValue(mockResult)
})

describe("state landing page SSR", () => {
  it("hydrates filters and forwards data to components", async () => {
    const { default: StatePage } = await import("@/app/manufacturers/[state]/page")

    const element = await StatePage({
      params: Promise.resolve({ state: "texas" }),
      searchParams: Promise.resolve({ capability: "smt" }),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          states: ["TX"],
          capabilities: ["smt"],
          productionVolume: null,
        },
        routeDefaults: { state: "TX" },
      }),
    )

    const headerProps = mockHeader.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(headerProps).toMatchObject({
      filteredCount: mockResult.filteredCount,
      visibleCount: mockResult.companies.length,
      clearHref: "/manufacturers/texas",
    })

    const sidebarProps = mockFilterSidebar.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(sidebarProps).toMatchObject({
      basePath: "/manufacturers/texas",
      filters: { states: ["TX"], capabilities: ["smt"], productionVolume: null },
      facetCounts: mockResult.facetCounts,
    })

    const listProps = mockCompanyList.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(listProps).toMatchObject({
      filteredCount: mockResult.filteredCount,
      pageInfo: expect.objectContaining({ hasNextPage: false }),
    })
    expect(Array.isArray(listProps.companies)).toBe(true)
    expect((listProps.companies as unknown[]).length).toBe(mockResult.companies.length)

    const mapProps = mockLazyCompanyMap.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(Array.isArray(mapProps?.companies)).toBe(true)
    expect((mapProps?.companies as unknown[]).length).toBe(mockResult.companies.length)
  })
})
