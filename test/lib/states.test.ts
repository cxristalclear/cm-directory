import {
  getAllStateMetadata,
  getStateMetadataBySlug,
  stateSlugFromAbbreviation,
} from "@/lib/states"

describe("state helpers", () => {
  it("returns deterministic slugs for known state abbreviations", () => {
    expect(stateSlugFromAbbreviation("CA")).toBe("california")
    expect(stateSlugFromAbbreviation("tx")).toBe("texas")
  })

  it("resolves metadata from slugs", () => {
    const metadata = getStateMetadataBySlug("california")

    expect(metadata).not.toBeNull()
    expect(metadata).toMatchObject({
      abbreviation: "CA",
      name: "California",
      slug: "california",
    })
  })

  it("falls back to abbreviation slugs for unlisted regions", () => {
    expect(stateSlugFromAbbreviation("PR")).toBe("pr")

    const metadata = getStateMetadataBySlug("pr")

    expect(metadata).not.toBeNull()
    expect(metadata).toMatchObject({
      abbreviation: "PR",
      name: "PR",
      slug: "pr",
    })
  })

  it("exposes a sorted list of state metadata", () => {
    const metadata = getAllStateMetadata()

    expect(metadata.length).toBeGreaterThan(0)

    const names = metadata.map((entry) => entry.name)
    const sortedNames = [...names].sort((a, b) => a.localeCompare(b))

    expect(names).toEqual(sortedNames)
  })
})
