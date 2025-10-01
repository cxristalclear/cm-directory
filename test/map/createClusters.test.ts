import { createClusters } from "@/lib/map/createClusters"

describe("createClusters", () => {
  it("returns clusters and sorted leaves for facilities in the viewport", () => {
    const facilities = [
      {
        company_id: "c01",
        company_name: "Alpha",
        slug: "alpha",
        facility_id: "f1",
        city: "Austin",
        state: "TX",
        lat: 30.1,
        lng: -97.7,
      },
      {
        company_id: "c01",
        company_name: "Alpha",
        slug: "alpha",
        facility_id: "f2",
        city: "Austin",
        state: "TX",
        lat: 30.11,
        lng: -97.69,
      },
      {
        company_id: "c02",
        company_name: "Beta",
        slug: "beta",
        facility_id: "f3",
        city: "Dallas",
        state: "TX",
        lat: 32.8,
        lng: -96.8,
      },
    ]

    const result = createClusters({
      facilities,
      zoom: 4,
      bbox: { minLng: -130, minLat: 20, maxLng: -60, maxLat: 50 },
    })

    expect(result.leaves).toHaveLength(facilities.length)
    expect(result.leaves[0].facility_id).toBe("f1")
    expect(result.leaves[1].facility_id).toBe("f2")
    expect(result.clusters.length).toBeGreaterThan(0)
    expect(result.clusters[0]).toMatchObject({ point_count: expect.any(Number) })
  })

  it("returns empty arrays when no facilities are provided", () => {
    const result = createClusters({
      facilities: [],
      zoom: 3,
      bbox: { minLng: -130, minLat: 20, maxLng: -60, maxLat: 50 },
    })

    expect(result).toEqual({ clusters: [], leaves: [] })
  })
})
