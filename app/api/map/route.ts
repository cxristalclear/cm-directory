import { NextResponse } from "next/server"

import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { createClusters } from "@/lib/map/createClusters"
import { companyFacilitiesForMap } from "@/lib/queries/mapSearch"

type BoundingBox = {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
}

function parseBoundingBox(raw: string | null): BoundingBox | null {
  if (!raw) {
    return null
  }

  const values = raw.split(",").map((value) => Number.parseFloat(value))
  if (values.length !== 4 || values.some((value) => Number.isNaN(value))) {
    return null
  }

  const [minLng, minLat, maxLng, maxLat] = values

  if (minLng >= maxLng || minLat >= maxLat) {
    return null
  }

  return { minLng, minLat, maxLng, maxLat }
}

function parseZoom(raw: string | null): number | null {
  if (!raw) {
    return null
  }

  const value = Number.parseFloat(raw)
  if (!Number.isFinite(value) || value < 0 || value > 22) {
    return null
  }

  return value
}

export async function GET(request: Request) {
  const url = new URL(request.url)

  const bbox = parseBoundingBox(url.searchParams.get("bbox"))
  if (!bbox) {
    return NextResponse.json({ error: "bbox must be [minLng,minLat,maxLng,maxLat]" }, { status: 400 })
  }

  const zoom = parseZoom(url.searchParams.get("zoom"))
  if (zoom === null) {
    return NextResponse.json({ error: "zoom must be a number between 0 and 22" }, { status: 400 })
  }

  const filters = parseFiltersFromSearchParams(url.searchParams)

  const certSlug = url.searchParams.get("cert") ?? undefined
  const defaultState = url.searchParams.get("defaultState") ?? undefined

  const result = await companyFacilitiesForMap({
    filters,
    bbox,
    routeDefaults: {
      certSlug,
      state: defaultState,
    },
  })

  const { clusters, leaves } = createClusters({ facilities: result.facilities, zoom, bbox })

  return NextResponse.json({
    clusters,
    leaves,
    totalCount: result.totalCount,
  })
}
