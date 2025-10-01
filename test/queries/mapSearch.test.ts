import { companyFacilitiesForMap } from "@/lib/queries/mapSearch"

jest.mock("@/lib/supabase", () => ({
  supabase: {
    from: jest.fn(),
  },
}))

const { supabase } = jest.requireMock("@/lib/supabase") as {
  supabase: { from: jest.Mock }
}

type BuilderResult = {
  data?: unknown
  error?: Error | null
}

type MockBuilder = {
  select: jest.Mock
  in: jest.Mock
  order: jest.Mock
  limit: jest.Mock
  gte: jest.Mock
  lte: jest.Mock
  then: jest.Mock
}

type QueueEntry = {
  table: string
  builder: MockBuilder
  response: BuilderResult
}

const builderQueue: QueueEntry[] = []

function createMockBuilder(table: string, result: BuilderResult): MockBuilder {
  const response = { data: result.data ?? null, error: result.error ?? null }

  const builder: MockBuilder = {
    select: jest.fn(() => builder),
    in: jest.fn(() => builder),
    order: jest.fn(() => builder),
    limit: jest.fn(() => builder),
    gte: jest.fn(() => builder),
    lte: jest.fn(() => builder),
    then: jest.fn((resolve, reject) => Promise.resolve(response).then(resolve, reject)),
  }

  return builder
}

function enqueueBuilder(table: string, result: BuilderResult): QueueEntry {
  const entry: QueueEntry = { table, builder: createMockBuilder(table, result), response: result }
  builderQueue.push(entry)
  return entry
}

beforeEach(() => {
  jest.clearAllMocks()
  builderQueue.length = 0
  supabase.from.mockImplementation((table: string) => {
    const next = builderQueue.shift()
    if (!next) {
      throw new Error(`Unexpected supabase.from call for ${table}`)
    }
    expect(next.table).toBe(table)
    return next.builder
  })
})

describe("companyFacilitiesForMap", () => {
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

    enqueueBuilder("companies", { data: companies.map((company) => ({ id: company.id })) })
    const mainEntry = enqueueBuilder("companies", { data: companies })

    const result = await companyFacilitiesForMap({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    expect(supabase.from).toHaveBeenCalledWith("companies")
    expect(mainEntry.builder.order).toHaveBeenCalledWith("company_name", { ascending: true })
    expect(mainEntry.builder.limit).toHaveBeenCalledWith(5001)
    expect(mainEntry.builder.limit).toHaveBeenCalledWith(5001, { referencedTable: "facilities" })
    expect(builderQueue).toHaveLength(0)
    expect(result.facilities).toHaveLength(12)
    expect(result.truncated).toBe(false)
    expect(result.totalCount).toBe(12)
    expect(result.facilities[0]).toMatchObject({ lat: expect.any(Number), lng: expect.any(Number) })
  })

  it("truncates facilities above the safety cap", async () => {
    const consoleSpy = jest.spyOn(console, "warn").mockImplementation(() => undefined)
    const facilities = Array.from({ length: 5005 }).map((_, index) => ({
      id: `f-${index}`,
      city: "City",
      state: "CA",
      latitude: 30 + index * 0.001,
      longitude: -97 - index * 0.001,
    }))

    enqueueBuilder("companies", { data: [{ id: "c01" }] })
    enqueueBuilder("companies", {
      data: [
        {
          id: "c01",
          company_name: "Alpha",
          slug: "alpha",
          facilities,
        },
      ],
    })

    const result = await companyFacilitiesForMap({
      filters: { states: [], capabilities: [], productionVolume: null },
    })

    expect(result.facilities).toHaveLength(5000)
    expect(result.truncated).toBe(true)
    expect(result.totalCount).toBe(5005)
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining("companyFacilitiesForMap truncated results"),
      expect.any(Object),
    )

    consoleSpy.mockRestore()
  })
})
