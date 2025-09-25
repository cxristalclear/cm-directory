import type { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "@jest/globals"

const mockCompanyList = jest.fn((props: unknown) => null)
const mockFilterSidebar = jest.fn((props: unknown) => null)
const mockFilterProvider = jest.fn(({ children }: { children: ReactNode }) => children)

jest.mock("@/components/CompanyList", () => ({
  __esModule: true,
  default: mockCompanyList,
}))

jest.mock("@/components/FilterSidebar", () => ({
  __esModule: true,
  default: mockFilterSidebar,
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

const mockResult = {
  companies: [
    {
      id: "company-1",
      company_name: "Golden State Manufacturing",
      slug: "golden-state",
      facilities: [
        {
          id: "facility-1",
          company_id: "company-1",
          city: "San Jose",
          state: "CA",
          latitude: 37.3382,
          longitude: -121.8863,
          is_primary: true,
        },
      ],
      capabilities: [
        {
          id: "cap-1",
          company_id: "company-1",
          pcb_assembly_smt: true,
          box_build_assembly: true,
          cable_harness_assembly: false,
          prototyping: true,
          pcb_assembly_through_hole: false,
          pcb_assembly_mixed: false,
          pcb_assembly_fine_pitch: false,
          low_volume_production: true,
          medium_volume_production: false,
          high_volume_production: false,
        },
      ],
      certifications: [],
    },
  ],
  totalCount: 12,
  pageInfo: {
    hasNext: false,
    hasPrev: false,
    nextCursor: null,
    prevCursor: null,
  },
  facetCounts: {
    states: [{ code: "CA", count: 12 }],
    capabilities: [
      { slug: "smt", count: 12 },
      { slug: "box_build", count: 6 },
      { slug: "cable_harness", count: 0 },
      { slug: "through_hole", count: 0 },
      { slug: "prototyping", count: 12 },
    ],
    productionVolume: [
      { level: "low", count: 12 },
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
  it("[state-landing] seeds the default state filter from the route", async () => {
    const { default: StatePage } = await import("@/app/manufacturers/[state]/page")

    const element = await StatePage({
      params: Promise.resolve({ state: "california" }),
      searchParams: Promise.resolve({}),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ states: ["CA"] }),
        routeDefaults: expect.objectContaining({ state: "CA" }),
      }),
    )

    expect(mockFilterProvider).toHaveBeenCalledWith(
      expect.objectContaining({
        initialFilters: expect.objectContaining({ states: ["CA"] }),
      }),
    )
  })

  it("[state-landing] allows URL state filter overrides", async () => {
    const { default: StatePage } = await import("@/app/manufacturers/[state]/page")

    const element = await StatePage({
      params: Promise.resolve({ state: "california" }),
      searchParams: Promise.resolve({ state: "TX" }),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ states: ["TX"] }),
        routeDefaults: expect.objectContaining({ state: "CA" }),
      }),
    )
  })
})
