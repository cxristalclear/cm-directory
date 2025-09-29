jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((value: unknown, init?: { status?: number }) => ({ value, init })),
  },
}))

import { GET } from "@/app/api/map/route"
import { companyFacilitiesForMap } from "@/lib/queries/mapSearch"
import { createClusters } from "@/lib/map/createClusters"

jest.mock("@/lib/queries/mapSearch", () => ({
  companyFacilitiesForMap: jest.fn(),
}))

jest.mock("@/lib/map/createClusters", () => ({
  createClusters: jest.fn(),
}))

const { NextResponse } = jest.requireMock("next/server") as {
  NextResponse: { json: jest.Mock }
}

describe("GET /api/map", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns 400 when bbox is missing", async () => {
    const request = { url: "https://example.com/api/map?zoom=5" } as Request

    await GET(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "bbox must be [minLng,minLat,maxLng,maxLat]" },
      { status: 400 },
    )
    expect(companyFacilitiesForMap).not.toHaveBeenCalled()
  })

  it("returns 400 when zoom is invalid", async () => {
    const request = { url: "https://example.com/api/map?bbox=-125,25,-66,49&zoom=abc" } as Request

    await GET(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      { error: "zoom must be a number between 0 and 22" },
      { status: 400 },
    )
    expect(companyFacilitiesForMap).not.toHaveBeenCalled()
  })

  it("applies filters, bbox, and returns clustered facilities", async () => {
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
        company_id: "c02",
        company_name: "Beta",
        slug: "beta",
        facility_id: "f2",
        city: "Dallas",
        state: "TX",
        lat: 32.7,
        lng: -96.8,
      },
    ]

    ;(companyFacilitiesForMap as jest.Mock).mockResolvedValue({
      facilities,
      truncated: false,
      totalCount: facilities.length,
    })

    const clusters = {
      clusters: [
        { id: "1", coordinates: [-97.0, 31.0], point_count: 2 },
      ],
      leaves: facilities,
    }

    ;(createClusters as jest.Mock).mockReturnValue(clusters)

    const request = {
      url: "https://example.com/api/map?bbox=-125,25,-66,49&zoom=5&state=TX&capability=smt&cert=iso-13485&defaultState=TX",
    } as Request

    const response = await GET(request)

    expect(companyFacilitiesForMap).toHaveBeenCalledWith({
      filters: { states: ["TX"], capabilities: ["smt"], productionVolume: null },
      bbox: { minLng: -125, minLat: 25, maxLng: -66, maxLat: 49 },
      routeDefaults: { certSlug: "iso-13485", state: "TX" },
    })

    expect(createClusters).toHaveBeenCalledWith({
      facilities,
      zoom: 5,
      bbox: { minLng: -125, minLat: 25, maxLng: -66, maxLat: 49 },
    })

    expect(NextResponse.json).toHaveBeenCalledWith(
      { ...clusters, totalCount: facilities.length },
    )

    expect(response).toEqual({ value: { ...clusters, totalCount: facilities.length }, init: undefined })
  })
})
