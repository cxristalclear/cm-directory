import { createCapabilityOptions, createStateOptions, createVolumeOptions } from "@/components/FilterSidebar"
import type { CompanyFacetCounts } from "@/lib/queries/companySearch"

describe("FilterSidebar option builders", () => {
  const facetCounts: CompanyFacetCounts = {
    states: [
      { code: "CA", count: 3 },
      { code: "TX", count: 2 },
    ],
    capabilities: [
      { slug: "smt", count: 4 },
      { slug: "through_hole", count: 1 },
      { slug: "cable_harness", count: 2 },
      { slug: "box_build", count: 3 },
    ],
    productionVolume: [
      { level: "low", count: 2 },
      { level: "medium", count: 1 },
      { level: "high", count: 1 },
    ],
  }

  it("no-client-recompute state options use facet counts", () => {
    const options = createStateOptions(
      { states: ["WA"], capabilities: [], productionVolume: null },
      facetCounts,
    )
    const codes = options.map(option => option.value)
    expect(codes).toEqual(["CA", "TX", "WA"])
    const waOption = options.find(option => option.value === "WA")
    expect(waOption?.count).toBe(0)
  })

  it("no-client-recompute capability counts", () => {
    const options = createCapabilityOptions(
      { states: [], capabilities: ["smt"], productionVolume: null },
      facetCounts,
    )
    const smt = options.find(option => option.value === "smt")
    const throughHole = options.find(option => option.value === "through_hole")
    expect(smt?.count).toBe(4)
    expect(throughHole?.count).toBe(1)
  })

  it("no-client-recompute volume counts respect selections", () => {
    const options = createVolumeOptions(
      { states: [], capabilities: [], productionVolume: "medium" },
      facetCounts,
    )
    const medium = options.find(option => option.value === "medium")
    const high = options.find(option => option.value === "high")
    expect(medium?.count).toBe(1)
    expect(high?.count).toBe(1)
  })
})
