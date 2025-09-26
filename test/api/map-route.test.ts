jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((value: unknown) => ({
      json: () => Promise.resolve(value),
    })),
  },
}))

import { GET } from "@/app/api/map/route"
import { companyFacilitiesForMap } from "@/lib/queries/mapSearch"

jest.mock("@/lib/queries/mapSearch", () => ({
  companyFacilitiesForMap: jest.fn(),
}))

describe("GET /api/map", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("parses filters and forwards route defaults", async () => {
    const facilities = [
      {
        company_id: "c01",
        company_name: "Alpha",
        slug: "alpha",
        facility_id: "f1",
        city: "Austin",
        state: "TX",
        latitude: 30,
        longitude: -97,
      },
    ]
    ;(companyFacilitiesForMap as jest.Mock).mockResolvedValue({ facilities, truncated: false })

    const request = {
      url: "https://example.com/api/map?state=CA&cert=iso-13485&defaultState=CA",
    } as unknown as Request
    const response = await GET(request)
    const payload = await response.json()

    expect(companyFacilitiesForMap).toHaveBeenCalledWith({
      filters: { states: ["CA"], capabilities: [], productionVolume: null },
      routeDefaults: { certSlug: "iso-13485", state: "CA" },
    })
    expect(payload).toEqual({ facilities, truncated: false })
  })
})
