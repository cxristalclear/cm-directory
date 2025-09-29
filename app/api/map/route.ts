import { NextResponse } from "next/server"

import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { companyFacilitiesForMap } from "@/lib/queries/mapSearch"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const filters = parseFiltersFromSearchParams(url.searchParams)

  const certSlug = url.searchParams.get("cert") ?? undefined
  const defaultState = url.searchParams.get("defaultState") ?? undefined

  const result = await companyFacilitiesForMap({
    filters,
    routeDefaults: {
      certSlug,
      state: defaultState,
    },
  })

  return NextResponse.json(result)
}
