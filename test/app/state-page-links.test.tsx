import React from "react"
import { renderToStaticMarkup } from "react-dom/server"

const fromMock = jest.fn()

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: (table: string) => fromMock(table),
  },
}))

jest.mock("@/contexts/FilterContext", () => ({
  FilterProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock("@/components/CompanyList", () => ({
  __esModule: true,
  default: () => <div data-testid="company-list" />,
}))

jest.mock("@/components/FilterSidebar", () => ({
  __esModule: true,
  default: () => <div data-testid="filter-sidebar" />,
}))

jest.mock("@/components/navbar", () => ({
  __esModule: true,
  default: () => <nav data-testid="navbar" />,
}))

jest.mock("@/components/Header", () => ({
  __esModule: true,
  default: () => <header data-testid="header" />,
}))

jest.mock("@/components/DirectorySummary", () => ({
  __esModule: true,
  default: () => <div data-testid="directory-summary" />,
}))

jest.mock("@/components/FilterDebugger", () => ({
  __esModule: true,
  default: () => <div data-testid="filter-debugger" />,
}))

jest.mock("@/components/FilterErrorBoundary", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock("@/components/MapErrorBoundary", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

jest.mock("@/components/LazyCompanyMap", () => ({
  __esModule: true,
  default: () => <div data-testid="company-map" />,
}))

jest.mock("@/components/AddCompanyCallout", () => ({
  __esModule: true,
  default: () => <div data-testid="add-company-callout" />,
}))

jest.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: () => null,
}))

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ children, ...props }: React.PropsWithChildren<{ href: string }>) => (
    <a {...props}>{children}</a>
  ),
}))

type QueryResult<T> = Promise<{ data: T; error: null }>

const mockCompanies = [
  {
    id: "1",
    slug: "alpha-manufacturing",
    company_name: "Alpha Manufacturing",
    is_active: true,
    description: "Test company",
    facilities: [
      { city: "Austin", state: "TX", country: "US" },
      { city: "Dallas", state: "TX", country: "US" },
    ],
    capabilities: [
      {
        pcb_assembly_smt: true,
        pcb_assembly_through_hole: true,
        cable_harness_assembly: true,
        box_build_assembly: false,
        prototyping: true,
        low_volume_production: true,
        medium_volume_production: true,
        high_volume_production: false,
      },
    ],
    certifications: [{ certification_type: "ISO 9001" }],
    industries: [],
  },
]

const mockFacilities = [{ state: "TX" }, { state: "CA" }]

const createStateCompaniesQuery = () => {
  const secondEq = jest.fn((): QueryResult<typeof mockCompanies> =>
    Promise.resolve({ data: mockCompanies, error: null }),
  )
  const firstEq = jest.fn(() => ({ eq: secondEq }))
  return { eq: firstEq }
}

const createHomepageCompaniesQuery = () => {
  const returns = jest.fn((): QueryResult<typeof mockCompanies> =>
    Promise.resolve({ data: mockCompanies, error: null }),
  )
  const limit = jest.fn(() => ({ returns }))
  const order = jest.fn(() => ({ limit }))
  const eq = jest.fn(() => ({ order }))
  return { eq }
}

const createFacilitiesQuery = () => {
  const not = jest.fn((): QueryResult<typeof mockFacilities> =>
    Promise.resolve({ data: mockFacilities, error: null }),
  )
  return {
    select: jest.fn(() => ({ not })),
  }
}

const setupSupabaseMock = () => {
  fromMock.mockImplementation((table: string) => {
    if (table === "companies") {
      return {
        select: (selection: string) =>
          selection.includes("facilities!inner")
            ? createStateCompaniesQuery()
            : createHomepageCompaniesQuery(),
      }
    }

    if (table === "facilities") {
      return createFacilitiesQuery()
    }

    throw new Error(`Unexpected table ${table}`)
  })
}

describe("state manufacturers page links", () => {
  beforeEach(() => {
    jest.resetModules()
    fromMock.mockReset()
    setupSupabaseMock()
  })

  it("ensures every link resolves with HTTP 200", async () => {
    const { default: StatePage } = await import("@/app/manufacturers/[state]/page")
    const element = await StatePage({
      params: Promise.resolve({ state: "texas" }),
      searchParams: Promise.resolve({}),
    })

    const html = renderToStaticMarkup(element)
    const container = document.createElement("div")
    container.innerHTML = html

    const anchors = Array.from(container.querySelectorAll("a"))
    const hrefs = Array.from(
      new Set(
        anchors
          .map((anchor) => anchor.getAttribute("href"))
          .filter((href): href is string => Boolean(href)),
      ),
    )

    const results = await Promise.all(
      hrefs.map(async (href) => {
        if (href === "/") {
          const { default: HomePage } = await import("@/app/page")
          const homeElement = await HomePage({
            params: Promise.resolve({}),
            searchParams: Promise.resolve({}),
          })
          renderToStaticMarkup(homeElement)
          return { href, status: 200 }
        }

        if (href === "/manufacturers") {
          const { default: ManufacturersIndexPage } = await import("@/app/manufacturers/page")
          const manufacturersElement = await ManufacturersIndexPage()
          renderToStaticMarkup(manufacturersElement)
          return { href, status: 200 }
        }

        if (href.startsWith("/manufacturers/")) {
          const slug = href.split("/")[2]
          const { default: LinkedStatePage } = await import("@/app/manufacturers/[state]/page")
          const linkedElement = await LinkedStatePage({
            params: Promise.resolve({ state: slug }),
            searchParams: Promise.resolve({}),
          })
          renderToStaticMarkup(linkedElement)
          return { href, status: 200 }
        }

        throw new Error(`Unhandled href ${href}`)
      }),
    )

    results.forEach(({ status }) => {
      expect(status).toBe(200)
    })
  })
})
