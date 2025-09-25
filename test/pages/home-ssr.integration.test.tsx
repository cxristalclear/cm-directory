import type { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, beforeEach } from "@jest/globals"
import { serializeCursor } from "@/lib/queries/companySearch"

const mockCompanyList = jest.fn((props: unknown) => null)
const mockFilterSidebar = jest.fn((props: unknown) => null)
const mockLazyCompanyMap = jest.fn((props: unknown) => null)
const mockHeader = jest.fn((props: unknown) => null)
const mockActiveFiltersBar = jest.fn(() => null)
const mockFilterProvider = jest.fn(({ children }: { children: ReactNode }) => children)

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

jest.mock("@/components/ActiveFiltersBar", () => ({
  __esModule: true,
  default: () => mockActiveFiltersBar(),
}))

jest.mock("@/contexts/FilterContext", () => ({
  FilterProvider: (props: { children: ReactNode }) => mockFilterProvider(props),
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

const mockResult = {
  companies: baseCompanies,
  totalCount: 42,
  pageInfo: {
    hasNext: true,
    hasPrev: false,
    nextCursor: serializeCursor({ name: "Company 8", id: "company-8" }),
    prevCursor: null,
  },
  facetCounts: {
    states: [{ code: "TX", count: 42 }],
    capabilities: [
      { slug: "smt", count: 42 },
      { slug: "box_build", count: 21 },
      { slug: "cable_harness", count: 14 },
      { slug: "through_hole", count: 0 },
      { slug: "prototyping", count: 11 },
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
})

describe("home page SSR", () => {
  it("[home-ssr] loads filters from search params and passes server data to UI", async () => {
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

    const companyListProps = mockCompanyList.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(companyListProps).toMatchObject({
      companies: mockResult.companies,
      totalCount: mockResult.totalCount,
      pageInfo: mockResult.pageInfo,
    })

    const filterSidebarProps = mockFilterSidebar.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(filterSidebarProps).toMatchObject({ facetCounts: mockResult.facetCounts })

    const mapProps = mockLazyCompanyMap.mock.calls.at(-1)?.[0] as Record<string, unknown>
    expect(mapProps).toMatchObject({ companies: mockResult.companies })
  })

  it("[home-ssr] decodes cursor from the URL", async () => {
    const { default: HomePage } = await import("@/app/page")
    const cursorParam = serializeCursor({ name: "Cursor Company", id: "cursor-1" })

    const element = await HomePage({
      searchParams: Promise.resolve({ cursor: cursorParam ?? undefined }),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        cursor: { name: "Cursor Company", id: "cursor-1" },
      }),
    )
  })
})
