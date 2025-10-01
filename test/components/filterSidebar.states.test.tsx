import React, { act } from "react"
import { createRoot, type Root } from "react-dom/client"

import FilterSidebar from "@/components/FilterSidebar"
import type { CompanyFacetCounts } from "@/lib/queries/companySearch"
import type { FilterUrlState } from "@/lib/filters/url"
import type { FilterContextType } from "@/types/company"

const facetCounts: CompanyFacetCounts = {
  states: [
    { code: "CA", count: 12 },
    { code: "TX", count: 8 },
  ],
  capabilities: [
    { slug: "smt", count: 10 },
    { slug: "through_hole", count: 6 },
    { slug: "mixed", count: 4 },
    { slug: "fine_pitch", count: 3 },
    { slug: "cable_harness", count: 2 },
    { slug: "box_build", count: 5 },
  ],
  productionVolume: [
    { level: "low", count: 7 },
    { level: "medium", count: 5 },
    { level: "high", count: 2 },
  ],
}

let currentFilters: FilterUrlState = { states: [], capabilities: [], productionVolume: null }
const updateFilter = jest.fn(<K extends keyof FilterUrlState>(key: K, value: FilterUrlState[K]) => {
  currentFilters = { ...currentFilters, [key]: value }
})

jest.mock("@/contexts/FilterContext", () => ({
  useFilters: (): FilterContextType => ({
    filters: currentFilters,
    updateFilter: updateFilter as FilterContextType["updateFilter"],
    setFilters: jest.fn(),
    clearFilters: jest.fn(),
    filteredCount: 0,
    setFilteredCount: jest.fn(),
    isPending: false,
  }),
}))

describe("FilterSidebar state facet", () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    jest.clearAllMocks()
    currentFilters = { states: [], capabilities: [], productionVolume: null }
    container = document.createElement("div")
    document.body.appendChild(container)
    root = createRoot(container)
  })

  afterEach(() => {
    act(() => {
      root.unmount()
    })
    container.remove()
  })

  it("renders state counts and toggles selections via context", () => {
    const initialFilters: FilterUrlState = { states: [], capabilities: [], productionVolume: null }

    act(() => {
      root.render(
        <FilterSidebar basePath="/" filters={initialFilters} facetCounts={facetCounts} clearHref="/" />,
      )
    })

    const checkbox = container.querySelector<HTMLInputElement>("#state-CA")
    expect(checkbox?.checked).toBe(false)
    expect(container.textContent).toContain("12")

    const label = container.querySelector<HTMLLabelElement>("label[for='state-CA']")
    expect(label).not.toBeNull()
    act(() => {
      label?.dispatchEvent(new MouseEvent("click", { bubbles: true }))
    })

    expect(updateFilter).toHaveBeenCalledWith("states", ["CA"])

    act(() => {
      root.render(
        <FilterSidebar
          basePath="/"
          filters={{ ...initialFilters, states: ["CA"] }}
          facetCounts={facetCounts}
          clearHref="/"
        />,
      )
    })

    const updatedCheckbox = container.querySelector<HTMLInputElement>("#state-CA")
    expect(updatedCheckbox?.checked).toBe(true)
  })

  it("renders capability counts in sorted order", () => {
    const initialFilters: FilterUrlState = { states: ["CA"], capabilities: [], productionVolume: null }

    act(() => {
      root.render(
        <FilterSidebar basePath="/manufacturers" filters={initialFilters} facetCounts={facetCounts} clearHref="/" />,
      )
    })

    const capabilityCountBadges = Array.from(
      container.querySelectorAll<HTMLSpanElement>("section:nth-of-type(2) a span:nth-of-type(2)"),
    )

    expect(capabilityCountBadges).toHaveLength(6)
    expect(capabilityCountBadges[0]?.textContent).toBe("10")
    expect(capabilityCountBadges[capabilityCountBadges.length - 1]?.textContent).toBe("5")
  })

  it("updates displayed counts after filters change", () => {
    const initialFilters: FilterUrlState = { states: [], capabilities: [], productionVolume: null }

    act(() => {
      root.render(
        <FilterSidebar basePath="/" filters={initialFilters} facetCounts={facetCounts} clearHref="/" />,
      )
    })

    const updatedFacetCounts: CompanyFacetCounts = {
      states: [
        { code: "CA", count: 5 },
        { code: "TX", count: 2 },
      ],
      capabilities: facetCounts.capabilities.map((entry) =>
        entry.slug === "smt" ? { ...entry, count: 3 } : entry,
      ),
      productionVolume: facetCounts.productionVolume.map((entry) =>
        entry.level === "medium" ? { ...entry, count: 1 } : entry,
      ),
    }

    act(() => {
      root.render(
        <FilterSidebar
          basePath="/"
          filters={{ states: ["CA"], capabilities: ["smt"], productionVolume: "medium" }}
          facetCounts={updatedFacetCounts}
          clearHref="/"
        />,
      )
    })

    const stateCountText = container.querySelector("label[for='state-CA'] span:nth-of-type(2)")?.textContent
    expect(stateCountText).toBe("5")

    const capabilityCount = container.querySelector<HTMLSpanElement>(
      "section:nth-of-type(2) li:first-child span:nth-of-type(2)",
    )?.textContent
    expect(capabilityCount).toBe("3")

    const volumeCount = container.querySelector<HTMLSpanElement>(
      "section:nth-of-type(3) a:nth-of-type(2) span:nth-of-type(2)",
    )?.textContent
    expect(volumeCount).toBe("1")
  })
})
