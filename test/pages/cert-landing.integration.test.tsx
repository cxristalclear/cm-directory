import type { ReactNode } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { beforeEach, describe, expect, it } from "@jest/globals"
import { serializeCursor } from "@/lib/queries/companySearch"

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
      id: "company-iso",
      company_name: "ISO Experts",
      slug: "iso-experts",
      facilities: [
        {
          id: "facility-iso",
          company_id: "company-iso",
          city: "Austin",
          state: "TX",
          latitude: 30.2672,
          longitude: -97.7431,
          is_primary: true,
        },
      ],
      capabilities: [
        {
          id: "cap-iso",
          company_id: "company-iso",
          pcb_assembly_smt: true,
          box_build_assembly: true,
          cable_harness_assembly: false,
          prototyping: false,
          pcb_assembly_through_hole: false,
          pcb_assembly_mixed: false,
          pcb_assembly_fine_pitch: false,
          low_volume_production: true,
          medium_volume_production: true,
          high_volume_production: false,
        },
      ],
      certifications: [
        {
          id: "cert-1",
          company_id: "company-iso",
          certification_type: "ISO 13485",
          status: "Active",
        },
      ],
    },
  ],
  totalCount: 5,
  pageInfo: {
    hasNext: true,
    hasPrev: false,
    nextCursor: serializeCursor({ name: "ISO Experts", id: "company-iso" }),
    prevCursor: null,
  },
  facetCounts: {
    states: [{ code: "TX", count: 5 }],
    capabilities: [
      { slug: "smt", count: 5 },
      { slug: "box_build", count: 5 },
      { slug: "cable_harness", count: 0 },
      { slug: "through_hole", count: 0 },
      { slug: "prototyping", count: 0 },
    ],
    productionVolume: [
      { level: "low", count: 5 },
      { level: "medium", count: 5 },
      { level: "high", count: 0 },
    ],
  },
}

beforeEach(() => {
  jest.clearAllMocks()
  companySearch.mockResolvedValue(mockResult)
})

describe("certification landing page SSR", () => {
  it("[cert-landing] calls the builder with route defaults and passes props to UI", async () => {
    const { default: CertPage } = await import("@/app/contract-manufacturers/[cert]/page")

    const element = await CertPage({
      params: Promise.resolve({ cert: "iso-13485" }),
      searchParams: Promise.resolve({}),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ capabilities: [], states: [] }),
        routeDefaults: expect.objectContaining({ certSlug: "iso-13485" }),
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
  })

  it("[cert-landing] preserves capability overrides from the URL", async () => {
    const { default: CertPage } = await import("@/app/contract-manufacturers/[cert]/page")

    const element = await CertPage({
      params: Promise.resolve({ cert: "iso-13485" }),
      searchParams: Promise.resolve({ capability: "box_build" }),
    })

    renderToStaticMarkup(element)

    expect(companySearch).toHaveBeenLastCalledWith(
      expect.objectContaining({
        filters: expect.objectContaining({ capabilities: ["box_build"] }),
        routeDefaults: expect.objectContaining({ certSlug: "iso-13485" }),
      }),
    )
  })
})
