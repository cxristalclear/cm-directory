import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import type { FilterUrlState } from "@/lib/filters/url"
import {
  applyFilters,
  normalizeFilters,
  type CompanySearchOptions,
  type NormalizedFilters,
} from "@/lib/queries/companySearch"
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js"

const MAX_FACILITY_RESULTS = 5000

const MAP_SELECT_FRAGMENT = `
  id,
  company_name,
  slug,
  facilities:facilities!left (
    id,
    city,
    state,
    latitude,
    longitude
  )
`

type Schema = Database["public"]
type CompanyRow = Schema["Tables"]["companies"]["Row"]
type FacilityRow = Schema["Tables"]["facilities"]["Row"]

type CompanyWithFacilities = Pick<CompanyRow, "id" | "company_name" | "slug"> & {
  facilities: FacilityRow[] | null
}

export type MapFacility = {
  company_id: string
  company_name: string
  slug: string
  facility_id: string
  city: string | null
  state: string | null
  lat: number
  lng: number
}

export type MapSearchResult = {
  facilities: MapFacility[]
  truncated: boolean
  totalCount: number
}

type MapSearchOptions = Pick<CompanySearchOptions, "routeDefaults" | "bbox"> & {
  filters: FilterUrlState
}

function coerceFacilities(companies: CompanyWithFacilities[]): MapFacility[] {
  const facilities: MapFacility[] = []

  for (const company of companies) {
    const { id: companyId, company_name: companyName, slug, facilities: companyFacilities } = company
    if (!companyFacilities) {
      continue
    }

    for (const facility of companyFacilities) {
      const latitude = typeof facility.latitude === "number" ? facility.latitude : null
      const longitude = typeof facility.longitude === "number" ? facility.longitude : null

      if (
        !facility.id ||
        !companyId ||
        !companyName ||
        !slug ||
        latitude === null ||
        longitude === null ||
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        continue
      }

      facilities.push({
        company_id: companyId,
        company_name: companyName,
        slug,
        facility_id: facility.id,
        city: facility.city ?? null,
        state: facility.state ?? null,
        lat: latitude,
        lng: longitude,
      })
    }
  }

  return facilities
}

function logTruncation(filters: NormalizedFilters, total: number) {
  console.warn("companyFacilitiesForMap truncated results", {
    filters,
    total,
    max: MAX_FACILITY_RESULTS,
  })
}

export async function companyFacilitiesForMap(options: MapSearchOptions): Promise<MapSearchResult> {
  const filters = normalizeFilters({
    filters: options.filters,
    routeDefaults: options.routeDefaults,
    bbox: options.bbox,
  })

  const builder = supabase
    .from("companies")
    .select(MAP_SELECT_FRAGMENT) as unknown as PostgrestFilterBuilder<
    Schema,
    CompanyRow,
    CompanyWithFacilities[],
    "companies"
  >

  applyFilters(builder, filters)

  // Fetch a generous number of companies to approximate the facility cap before client truncation
  builder.order("company_name", { ascending: true })
  builder.order("id", { ascending: true })
  builder.limit(MAX_FACILITY_RESULTS + 1)
  builder.limit(MAX_FACILITY_RESULTS + 1, { referencedTable: "facilities" })

  const { data, error } = await builder
  if (error) {
    console.error("companyFacilitiesForMap query failed", { filters }, error)
    return { facilities: [], truncated: false, totalCount: 0 }
  }

  const rows = (Array.isArray(data) ? (data as CompanyWithFacilities[]) : [])
  const flattened = coerceFacilities(rows)
  const totalCount = flattened.length
  const truncated = totalCount > MAX_FACILITY_RESULTS
  const facilities = truncated ? flattened.slice(0, MAX_FACILITY_RESULTS) : flattened

  if (truncated) {
    logTruncation(filters, flattened.length)
  }

  return { facilities, truncated, totalCount }
}
