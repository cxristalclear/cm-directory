import { companyFacilitiesForMap } from "@/lib/queries/mapSearch"
import { supabase } from "@/lib/supabase"

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

type BuilderResult = {
  data?: unknown
  error?: Error | null
}

type MockBuilder = {
  select: jest.Mock
  order: jest.Mock
  limit: jest.Mock
  filter: jest.Mock
  or: jest.Mock
  eq: jest.Mock
  gte: jest.Mock
  lte: jest.Mock
  then: jest.Mock
}

function createBuilder(result: BuilderResult): { from: { select: jest.Mock }; builder: MockBuilder } {
  const response = { data: result.data ?? null, error: result.error ?? null }

  const builder: MockBuilder = {
    select: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    filter: jest.fn(() => builder),
    or: jest.fn(() => builder),
    eq: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    then: jest.fn((resolve, reject) => Promise.resolve(response).then(resolve, reject)),
  }

  return {
    from: {
      select: jest.fn(() => builder),
    },
    builder,
  }
}

describe("companyFacilitiesForMap", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("returns all facilities without pagination cap", async () => {
    const companies = [
      {
        id: "c01",
        company_name: "Alpha",
        slug: "alpha",
        facilities: Array.from({ length: 6 }).map((_, index) => ({
          id: `f-1-${index}`,
          city: "City",
          state: "CA",
          latitude: 30 + index,
          longitude: -97 - index,
        })),
      },
      {
        id: "c02",
        company_name: "Beta",
        slug: "beta",
        facilities: Array.from({ length: 6 }).map((_, index) => ({
          id: `f-2-${index}`,
          city: "Town",
          state: "TX",
          latitude: 32 + index,
          longitude: -95 - index,
        })),
      },
    ]

    const { builder, from } = createBuilder({ data: companies })
    ;(supabase.from as jest.Mock).mockReturnValue(from)

    const result = await companyFacilitiesForMap({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    expect(supabase.from).toHaveBeenCalledWith("companies")
    expect(from.select).toHaveBeenCalled()
    expect(builder.order).toHaveBeenCalledWith("company_name", { ascending: true })
    expect(builder.limit).toHaveBeenCalledWith(5001)
    expect(builder.limit).toHaveBeenCalledWith(5001, { referencedTable: "facilities" })
    expect(result.facilities).toHaveLength(12)
    expect(result.truncated).toBe(false)
  })

  it("truncates facilities above the safety cap", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    const largeFacilities = Array.from({ length: 5005 }).map((_, index) => ({
      id: `f-${index}`,
      city: "City",
      state: "CA",
      latitude: 30 + index * 0.001,
      longitude: -97 - index * 0.001,
    }))

    const { builder, from } = createBuilder({
      data: [
        {
          id: "c01",
          company_name: "Alpha",
          slug: "alpha",
          facilities: largeFacilities,
        },
      ],
    })

    ;(supabase.from as jest.Mock).mockReturnValue(from)

    const result = await companyFacilitiesForMap({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    expect(builder.limit).toHaveBeenCalledWith(5001)
    expect(result.facilities).toHaveLength(5000)
    expect(result.truncated).toBe(true)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("companyFacilitiesForMap truncated results"),
      expect.any(Object),
    )

    consoleSpy.mockRestore()
  })
})
