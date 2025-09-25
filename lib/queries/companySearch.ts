import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import type {
  Capabilities,
  Certification,
  Company,
  Facility,
  Industry,
} from "@/types/company"
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js"

const CAPABILITY_SLUGS: CapabilitySlug[] = [
  "smt",
  "through_hole",
  "mixed",
  "fine_pitch",
  "cable_harness",
  "box_build",
  "prototyping",
]

const CAPABILITY_COLUMN_MAP: Record<CapabilitySlug, CapabilityBooleanColumn> = {
  smt: "pcb_assembly_smt",
  through_hole: "pcb_assembly_through_hole",
  mixed: "pcb_assembly_mixed",
  fine_pitch: "pcb_assembly_fine_pitch",
  cable_harness: "cable_harness_assembly",
  box_build: "box_build_assembly",
  prototyping: "prototyping",
}

const PRODUCTION_VOLUMES: ProductionVolume[] = ["low", "medium", "high"]

const DEFAULT_PAGE_SIZE = 9

const VOLUME_COLUMN_MAP: Record<ProductionVolume, CapabilityBooleanColumn> = {
  low: "low_volume_production",
  medium: "medium_volume_production",
  high: "high_volume_production",
}

const CAPABILITY_BOOLEAN_COLUMNS = [
  "pcb_assembly_smt",
  "pcb_assembly_through_hole",
  "pcb_assembly_mixed",
  "pcb_assembly_fine_pitch",
  "cable_harness_assembly",
  "box_build_assembly",
  "prototyping",
  "low_volume_production",
  "medium_volume_production",
  "high_volume_production",
] as const satisfies ReadonlyArray<keyof Capabilities>

type CapabilityBooleanColumn = (typeof CAPABILITY_BOOLEAN_COLUMNS)[number]

const CAPABILITIES_SELECT_FRAGMENT = ["id", ...CAPABILITY_BOOLEAN_COLUMNS].join(", ")

const CERTIFICATION_SLUG_MAP: Record<string, string> = {
  "iso-9001": "ISO 9001",
  "iso-13485": "ISO 13485",
  "as9100": "AS9100",
  "iatf-16949": "IATF 16949",
  itar: "ITAR",
}

const COMPANY_LIST_SELECT = `
  id,
  company_name,
  slug,
  dba_name,
  website_url,
  year_founded,
  employee_count_range,
  annual_revenue_range,
  logo_url,
  description,
  key_differentiators,
  is_active,
  is_verified,
  last_verified_date,
  created_at,
  updated_at,
  capabilities:capabilities(
    ${CAPABILITIES_SELECT_FRAGMENT}
  ),
  facilities:facilities(
    id,
    facility_type,
    street_address,
    city,
    state,
    zip_code,
    country,
    latitude,
    longitude,
    is_primary
  ),
  certifications:certifications(
    id,
    certification_type
  ),
  industries:industries(
    id,
    industry_name
  )
`

export type CompanySearchCursor = {
  name: string
  id: string
}

export type CompanyFacetCounts = {
  states: Array<{ code: string; count: number }>
  capabilities: Array<{ slug: CapabilitySlug; count: number }>
  productionVolume: Array<{ level: ProductionVolume; count: number }>
}

export type CompanySearchOptions = {
  filters: {
    states: string[]
    capabilities: CapabilitySlug[]
    productionVolume: ProductionVolume | null
  }
  routeDefaults?: {
    state?: string
    certSlug?: string
  }
  cursor?: CompanySearchCursor | null
  pageSize?: number
  includeFacetCounts?: boolean
  bbox?: {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
  }
}

export type CompanySearchResult = {
  companies: Company[]
  totalCount: number
  hasNext: boolean
  hasPrev: boolean
  nextCursor: string | null
  prevCursor: string | null
  facetCounts: CompanyFacetCounts | null
}

type Schema = Database["public"]
type CompanyRow = Schema["Tables"]["companies"]["Row"]
type FacilityRow = Schema["Tables"]["facilities"]["Row"]
type CapabilityRow = Schema["Tables"]["capabilities"]["Row"]
type CertificationRow = Schema["Tables"]["certifications"]["Row"]
type IndustryRow = Schema["Tables"]["industries"]["Row"]

type CompanyRecord = CompanyRow & {
  facilities: FacilityRow[] | null
  capabilities: CapabilityRow[] | null
  certifications: CertificationRow[] | null
  industries: IndustryRow[] | null
}

type PrevRow = Pick<CompanyRow, "id" | "company_name">

type StateFacetRow = {
  id: string
  facilities: Array<{ state: string | null }> | null
}

type CapabilityFacetRow = {
  id: string
  capabilities: CapabilityRow[] | null
}

type BoundingBox = {
  minLng: number
  minLat: number
  maxLng: number
  maxLat: number
} | null

type NormalizedFilters = {
  states: string[]
  capabilities: CapabilitySlug[]
  productionVolume: ProductionVolume | null
  certification: string | null
  bbox: BoundingBox
}

type FilterSkipOptions = {
  skipStates?: boolean
  skipCapabilities?: boolean
  skipVolume?: boolean
}

type CompanyFilterBuilder<Result> = PostgrestFilterBuilder<
  Schema,
  CompanyRow,
  Result,
  "companies"
>

function base64UrlEncode(value: string): string {
  const encoded = Buffer.from(value, "utf8").toString("base64")
  return encoded.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "")
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/")
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4))
  return Buffer.from(normalized + padding, "base64").toString("utf8")
}

export function serializeCursor(cursor: CompanySearchCursor | null): string | null {
  if (!cursor) {
    return null
  }
  return base64UrlEncode(JSON.stringify(cursor))
}

export function deserializeCursor(value: string | null | undefined): CompanySearchCursor | null {
  if (!value) {
    return null
  }
  try {
    const decoded = base64UrlDecode(value)
    const parsed = JSON.parse(decoded)
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.name === "string" &&
      typeof parsed.id === "string"
    ) {
      return { name: parsed.name, id: parsed.id }
    }
  } catch (error) {
    console.warn("Failed to parse cursor", error)
  }
  return null
}

type SearchParamsInput = URLSearchParams | Record<string, string | string[] | undefined>

function toURLSearchParams(input: SearchParamsInput): URLSearchParams {
  if (input instanceof URLSearchParams) {
    return input
  }
  const params = new URLSearchParams()
  for (const [key, raw] of Object.entries(input)) {
    if (Array.isArray(raw)) {
      for (const value of raw) {
        params.append(key, value)
      }
    } else if (typeof raw === "string") {
      params.append(key, raw)
    }
  }
  return params
}

export function parseCursor(searchParams: SearchParamsInput): CompanySearchCursor | null {
  const params = toURLSearchParams(searchParams)
  const raw = params.get("cursor")
  return deserializeCursor(raw)
}

function normalizeStateCode(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null
  }
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  return trimmed.toUpperCase()
}

function normalizeFilterStates(states: string[], routeDefault?: string): string[] {
  const normalized = states
    .map((state) => normalizeStateCode(state))
    .filter((state): state is string => typeof state === "string")
  if (routeDefault) {
    const normalizedRoute = normalizeStateCode(routeDefault)
    if (normalizedRoute) {
      normalized.push(normalizedRoute)
    }
  }
  return Array.from(new Set(normalized))
}

function formatInFilter(values: string[]): string {
  const sanitized = values.map((value) => `"${value.replace(/"/g, "")}"`)
  return `(${sanitized.join(",")})`
}

function escapeFilterValue(value: string): string {
  return encodeURIComponent(value)
}

function applyCursor<Result>(
  builder: CompanyFilterBuilder<Result>,
  cursor: CompanySearchCursor | null,
): void {
  if (!cursor) {
    return
  }
  const encodedName = escapeFilterValue(cursor.name)
  const encodedId = escapeFilterValue(cursor.id)
  builder.or(
    `company_name.gt.${encodedName},and(company_name.eq.${encodedName},id.gt.${encodedId})`,
  )
}

function applyFilters<Result>(
  builder: CompanyFilterBuilder<Result>,
  filters: NormalizedFilters,
  skip: FilterSkipOptions = {},
): CompanyFilterBuilder<Result> {
  const { skipStates = false, skipCapabilities = false, skipVolume = false } = skip

  if (!skipStates && filters.states.length > 0) {
    builder.filter("facilities.state", "in", formatInFilter(filters.states))
  }

  if (!skipCapabilities && filters.capabilities.length > 0) {
    const orConditions = filters.capabilities
      .map((slug) => `capabilities.${CAPABILITY_COLUMN_MAP[slug]}.is.true`)
      .join(",")
    if (orConditions) {
      builder.or(orConditions, { referencedTable: "capabilities" })
    }
  }

  if (!skipVolume && filters.productionVolume) {
    const column = VOLUME_COLUMN_MAP[filters.productionVolume]
    builder.eq(`capabilities.${column}`, true)
  }

  if (filters.certification) {
    builder.eq("certifications.certification_type", filters.certification)
  }

  if (filters.bbox) {
    const { minLng, minLat, maxLng, maxLat } = filters.bbox
    builder.gte("facilities.longitude", minLng)
    builder.lte("facilities.longitude", maxLng)
    builder.gte("facilities.latitude", minLat)
    builder.lte("facilities.latitude", maxLat)
  }

  return builder
}

function coerceCompany(company: CompanyRecord): Company {
  const facilities: Facility[] = Array.isArray(company.facilities)
    ? company.facilities.map((facility) => ({
        ...facility,
        facility_type: facility.facility_type ?? "",
        is_primary: facility.is_primary ?? undefined,
      }))
    : []

  const industries: Industry[] = Array.isArray(company.industries)
    ? company.industries.map((industry) => ({
        ...industry,
        industry_name: industry.industry_name ?? "",
      }))
    : []

  const certifications: Certification[] = Array.isArray(company.certifications)
    ? company.certifications.map((certification) => ({
        ...certification,
        certification_type: certification.certification_type ?? "",
      }))
    : []

  return {
    id: company.id,
    company_name: company.company_name,
    slug: company.slug,
    dba_name: company.dba_name ?? null,
    website_url: company.website_url ?? null,
    year_founded: company.year_founded ?? null,
    employee_count_range: company.employee_count_range ?? null,
    annual_revenue_range: company.annual_revenue_range ?? null,
    logo_url: company.logo_url ?? null,
    description: company.description ?? null,
    key_differentiators: company.key_differentiators ?? null,
    is_active: company.is_active ?? undefined,
    is_verified: company.is_verified ?? undefined,
    last_verified_date: company.last_verified_date ?? null,
    created_at: company.created_at ?? undefined,
    updated_at: company.updated_at ?? undefined,
    facilities,
    capabilities: Array.isArray(company.capabilities) ? company.capabilities : [],
    industries,
    certifications,
    technical_specs: null,
    business_info: null,
    contacts: null,
    verification_data: null,
  }
}

function resolveCertificationSlug(slug: string | undefined): string | null {
  if (!slug) {
    return null
  }
  const lower = slug.toLowerCase()
  return CERTIFICATION_SLUG_MAP[lower] ?? null
}

function normalizeBoundingBox(
  bbox: CompanySearchOptions["bbox"] | null | undefined,
): BoundingBox {
  if (!bbox) {
    return null
  }
  const { minLng, minLat, maxLng, maxLat } = bbox
  if (
    [minLng, minLat, maxLng, maxLat].some((value) => typeof value !== "number" || Number.isNaN(value))
  ) {
    return null
  }
  return { minLng, minLat, maxLng, maxLat }
}

function createEmptyFacetCounts(): CompanyFacetCounts {
  return {
    states: [],
    capabilities: CAPABILITY_SLUGS.map((slug) => ({ slug, count: 0 })),
    productionVolume: PRODUCTION_VOLUMES.map((level) => ({ level, count: 0 })),
  }
}

function logSupabaseError(stage: string, filters: NormalizedFilters, error: unknown) {
  console.error(`companySearch ${stage} error`, { filters }, error)
}

async function fetchPreviousRow(
  filters: NormalizedFilters,
  firstCompany: Company,
): Promise<PrevRow | null> {
  const builder = supabase
    .from("companies")
    .select("id, company_name") as CompanyFilterBuilder<PrevRow[]>

  applyFilters(builder, filters)

  const encodedName = escapeFilterValue(firstCompany.company_name)
  const encodedId = escapeFilterValue(firstCompany.id)

  builder.or(
    `company_name.lt.${encodedName},and(company_name.eq.${encodedName},id.lt.${encodedId})`,
  )

  builder.order("company_name", { ascending: false })
  builder.order("id", { ascending: false })
  builder.limit(1)

  const { data, error } = await builder
  if (error) {
    throw error
  }
  return data?.[0] ?? null
}

function countStates(rows: StateFacetRow[]): Array<{ code: string; count: number }> {
  const stateMap = new Map<string, Set<string>>()

  for (const row of rows) {
    const facilities = Array.isArray(row.facilities) ? row.facilities : []
    const statesForCompany = new Set<string>()
    for (const facility of facilities) {
      const state = normalizeStateCode(facility.state ?? null)
      if (state) {
        statesForCompany.add(state)
      }
    }
    for (const state of statesForCompany) {
      if (!stateMap.has(state)) {
        stateMap.set(state, new Set())
      }
      stateMap.get(state)?.add(row.id)
    }
  }

  return Array.from(stateMap.entries())
    .map(([code, ids]) => ({ code, count: ids.size }))
    .sort((a, b) => a.code.localeCompare(b.code))
}

function countCapabilities(rows: CapabilityFacetRow[]): Array<{ slug: CapabilitySlug; count: number }> {
  const counts = new Map<CapabilitySlug, Set<string>>()

  for (const row of rows) {
    const capabilityRecords = Array.isArray(row.capabilities) ? row.capabilities : []
    const slugsForCompany = new Set<CapabilitySlug>()
    for (const capability of capabilityRecords) {
      for (const slug of CAPABILITY_SLUGS) {
        const column = CAPABILITY_COLUMN_MAP[slug]
        if (capability[column]) {
          slugsForCompany.add(slug)
        }
      }
    }
    for (const slug of slugsForCompany) {
      if (!counts.has(slug)) {
        counts.set(slug, new Set())
      }
      counts.get(slug)?.add(row.id)
    }
  }

  return CAPABILITY_SLUGS.map((slug) => ({ slug, count: counts.get(slug)?.size ?? 0 }))
}

function countVolumes(rows: CapabilityFacetRow[]): Array<{ level: ProductionVolume; count: number }> {
  const counts = new Map<ProductionVolume, Set<string>>()

  for (const row of rows) {
    const capabilityRecords = Array.isArray(row.capabilities) ? row.capabilities : []
    const volumesForCompany = new Set<ProductionVolume>()
    for (const capability of capabilityRecords) {
      for (const level of PRODUCTION_VOLUMES) {
        const column = VOLUME_COLUMN_MAP[level]
        if (capability[column]) {
          volumesForCompany.add(level)
        }
      }
    }
    for (const level of volumesForCompany) {
      if (!counts.has(level)) {
        counts.set(level, new Set())
      }
      counts.get(level)?.add(row.id)
    }
  }

  return PRODUCTION_VOLUMES.map((level) => ({ level, count: counts.get(level)?.size ?? 0 }))
}

async function fetchStateFacetCounts(filters: NormalizedFilters): Promise<Array<{ code: string; count: number }>> {
  const builder = supabase
    .from("companies")
    .select("id, facilities:facilities(state)") as CompanyFilterBuilder<StateFacetRow[]>

  applyFilters(builder, filters, { skipStates: true })

  const { data, error } = await builder
  if (error) {
    throw error
  }

  const rows = (data ?? []) as StateFacetRow[]
  return countStates(rows)
}

async function fetchCapabilityRows(
  filters: NormalizedFilters,
  skip: FilterSkipOptions,
): Promise<CapabilityFacetRow[]> {
  const builder = supabase
    .from("companies")
    .select(
      `
        id,
        capabilities:capabilities(${CAPABILITIES_SELECT_FRAGMENT}),
        facilities:facilities(id)
      `,
    ) as CompanyFilterBuilder<CapabilityFacetRow[]>

  applyFilters(builder, filters, skip)

  const { data, error } = await builder
  if (error) {
    throw error
  }

  return (data ?? []) as CapabilityFacetRow[]
}

async function fetchFacetCounts(filters: NormalizedFilters): Promise<CompanyFacetCounts> {
  const [stateCounts, capabilityRows, volumeRows] = await Promise.all([
    fetchStateFacetCounts(filters),
    fetchCapabilityRows(filters, { skipCapabilities: true }),
    fetchCapabilityRows(filters, { skipVolume: true }),
  ])

  return {
    states: stateCounts,
    capabilities: countCapabilities(capabilityRows),
    productionVolume: countVolumes(volumeRows),
  }
}

function normalizeFilters(options: CompanySearchOptions): NormalizedFilters {
  const routeDefaults = options.routeDefaults ?? {}
  const normalizedStates = normalizeFilterStates(options.filters.states, routeDefaults.state)
  const normalizedCapabilities = Array.from(
    new Set(
      options.filters.capabilities.filter((slug) => (CAPABILITY_SLUGS as readonly string[]).includes(slug)),
    ),
  )

  return {
    states: normalizedStates,
    capabilities: normalizedCapabilities,
    productionVolume: options.filters.productionVolume ?? null,
    certification: resolveCertificationSlug(routeDefaults.certSlug),
    bbox: normalizeBoundingBox(options.bbox),
  }
}

function hasActiveFilters(filters: NormalizedFilters): boolean {
  return (
    filters.states.length > 0 ||
    filters.capabilities.length > 0 ||
    filters.productionVolume !== null ||
    filters.certification !== null ||
    filters.bbox !== null
  )
}

function resolvePageSize(
  requested: CompanySearchOptions["pageSize"],
  filters: NormalizedFilters,
  cursor: CompanySearchCursor | null,
): number | null {
  if (typeof requested === "number") {
    return requested
  }

  if (hasActiveFilters(filters) || cursor) {
    return DEFAULT_PAGE_SIZE
  }

  return null
}

export async function companySearch(options: CompanySearchOptions): Promise<CompanySearchResult> {
  const { cursor = null, includeFacetCounts = true } = options
  const filters = normalizeFilters(options)
  const resolvedPageSize = resolvePageSize(options.pageSize, filters, cursor)

  try {
    const builder = supabase
      .from("companies")
      .select(COMPANY_LIST_SELECT, { count: "exact" }) as CompanyFilterBuilder<CompanyRecord[]>

    applyFilters(builder, filters)
    applyCursor(builder, cursor)

    builder.order("company_name", { ascending: true })
    builder.order("id", { ascending: true })

    if (resolvedPageSize !== null) {
      builder.limit(resolvedPageSize + 1)
    }

    const { data, count, error } = await builder

    if (error) {
      throw error
    }

    const rows = (data ?? []) as CompanyRecord[]
    const hasNext = resolvedPageSize !== null ? rows.length > resolvedPageSize : false
    const trimmedRows = hasNext && resolvedPageSize !== null ? rows.slice(0, resolvedPageSize) : rows
    const companies = trimmedRows.map((row) => coerceCompany(row))

    const lastCompany = companies.at(-1) ?? null
    let prevCursor: string | null = null
    let hasPrev = false

    if (cursor && companies.length > 0) {
      try {
        const previousRow = await fetchPreviousRow(filters, companies[0]!)
        if (previousRow) {
          prevCursor = serializeCursor({ name: previousRow.company_name, id: previousRow.id })
          hasPrev = Boolean(prevCursor)
        }
      } catch (previousError) {
        logSupabaseError("previous", filters, previousError)
      }
    }

    let facetCounts: CompanyFacetCounts | null = null
    if (includeFacetCounts) {
      try {
        facetCounts = await fetchFacetCounts(filters)
      } catch (facetError) {
        logSupabaseError("facets", filters, facetError)
        facetCounts = createEmptyFacetCounts()
      }
    }

    return {
      companies,
      totalCount: typeof count === "number" ? count : companies.length,
      hasNext,
      hasPrev,
      nextCursor: hasNext && lastCompany
        ? serializeCursor({ name: lastCompany.company_name, id: lastCompany.id })
        : null,
      prevCursor,
      facetCounts,
    }
  } catch (error) {
    logSupabaseError("main", filters, error)
    return {
      companies: [],
      totalCount: 0,
      hasNext: false,
      hasPrev: false,
      nextCursor: null,
      prevCursor: null,
      facetCounts: includeFacetCounts ? createEmptyFacetCounts() : null,
    }
  }
}
