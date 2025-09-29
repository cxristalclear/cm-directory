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
  capabilities: [],
  productionVolume: [],
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
})
