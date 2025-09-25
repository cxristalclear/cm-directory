import { describe, expect, it } from "@jest/globals"
import { buildCursorUrl } from "../../components/paginationUtils"

describe("Pagination URL integration", () => {
  it("[pagination-url] adds the cursor param while preserving existing filters", () => {
    const params = new URLSearchParams("state=CA&capability=smt")
    const nextUrl = buildCursorUrl("/", params, "NEXT-CURSOR")
    const parsed = new URL(nextUrl, "https://example.com").searchParams
    expect(parsed.get("state")).toBe("CA")
    expect(parsed.get("capability")).toBe("smt")
    expect(parsed.get("cursor")).toBe("NEXT-CURSOR")
  })

  it("[pagination-url] removes the cursor when navigating to the first page", () => {
    const params = new URLSearchParams("state=CA&capability=smt&cursor=OLD")
    const prevUrl = buildCursorUrl("/", params, null)
    const parsed = new URL(prevUrl, "https://example.com").searchParams
    expect(parsed.get("state")).toBe("CA")
    expect(parsed.get("capability")).toBe("smt")
    expect(parsed.has("cursor")).toBe(false)
  })
})
