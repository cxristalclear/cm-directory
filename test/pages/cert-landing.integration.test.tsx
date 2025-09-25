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

const baseCompanies = Array.from({ length: 2 }).map((_, index) => ({
  id: `company-${index}`,
  company_name: `Company ${index}`,
  slug: `company-${index}`,
  facilities: [
    {
      id: `facility-${index}`,
      company_id: `company-${index}`,
      city: "Boston",
      state: "MA",
      latitude: 42.36,
      longitude: -71.05,
      is_primary: true,
    },
  ],
  capabilities: [
    {
      id: `cap-${index}`,
      company_id: `company-${index}`,
      pcb_assembly_smt: true,
      box_build_assembly: true,
      low_volume_production: true,
      medium_volume_production: true,
      high_volume_production: false,
      pcb_assembly_mixed: false,
      pcb_assembly_fine_pitch: false,
      pcb_assembly_through_hole: false,
      cable_harness_assembly: false,
      prototyping: false,
    },
  ],
  certifications: [
    {
      id: `cert-${index}`,
      company_id: `company-${index}`,
      certification_type: "ISO 13485",
    },
  ],
}))

const mockResult = {
  companies: baseCompanies,
  totalCount: 7,
  hasNext: false,
  hasPrev: false,
  nextCursor: null,
  prevCursor: null,
  facetCounts: {
    states: [{ code: "MA", count: 7 }],
    capabilities: [
      { slug: "smt", count: 7 },
      { slug: "box_build", count: 7 },
    ],
    productionVolume: [
      { level: "low", count: 7 },
      { level: "medium", count: 3 },
      { level: "high", count: 0 },
    ],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  companySearch.mockResolvedValue(mockResult)
})

describe("certification landing page SSR", () => {
  it("uses certification slug defaults and forwards SSR data", async () => {
    const { default: CertPage } = await import("@/app/contract-manufacturers/[cert]/page")

    const element = await CertPage({
      params: Promise.resolve({ cert: "iso-13485" }),
      searchParams: Promise.resolve({ volume: "low" }),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: {
          states: [],
          capabilities: [],
          productionVolume: "low",
        },
        routeDefaults: { certSlug: "iso-13485" },
      }),
    )

    const headerProps = mockHeader.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(headerProps).toMatchObject({
      totalCount: mockResult.totalCount,
      clearHref: "/contract-manufacturers/iso-13485",
    })

    const sidebarProps = mockFilterSidebar.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(sidebarProps).toMatchObject({
      basePath: "/contract-manufacturers/iso-13485",
      filters: { states: [], capabilities: [], productionVolume: "low" },
      facetCounts: mockResult.facetCounts,
    })

    const listProps = mockCompanyList.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(listProps).toMatchObject({
      totalCount: mockResult.totalCount,
      hasNext: false,
    })
    expect(Array.isArray(listProps.companies)).toBe(true)
    expect((listProps.companies as unknown[]).length).toBe(mockResult.companies.length)

    const mapProps = mockLazyCompanyMap.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(Array.isArray(mapProps?.companies)).toBe(true)
    expect((mapProps?.companies as unknown[]).length).toBe(mockResult.companies.length)
  })
})
