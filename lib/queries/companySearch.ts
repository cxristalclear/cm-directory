
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/supabase"
import { CANONICAL_CAPABILITIES } from "@/lib/filters/url"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import type {
  Capabilities,
  Certification,
  Company,
  Facility,
  Industry,
} from "@/types/company"
import type { PostgrestFilterBuilder } from "@supabase/postgrest-js"

const CAPABILITY_SLUGS: readonly CapabilitySlug[] = CANONICAL_CAPABILITIES

const CAPABILITY_COLUMN_MAP: Record<CapabilitySlug, CapabilityBooleanColumn> = {
  smt: "pcb_assembly_smt",
  through_hole: "pcb_assembly_through_hole",
  mixed: "pcb_assembly_mixed",
  fine_pitch: "pcb_assembly_fine_pitch",
  cable_harness: "cable_harness_assembly",
  box_build: "box_build_assembly",
}

const VOLUME_COLUMN_MAP: Record<ProductionVolume, CapabilityBooleanColumn> = {
  low: "low_volume_production",
  medium: "medium_volume_production",
  high: "high_volume_production",
}

const PRODUCTION_VOLUMES: ProductionVolume[] = ["low", "medium", "high"]

const DEFAULT_PAGE_SIZE = 9

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
  capabilities:capabilities!left(
    ${CAPABILITIES_SELECT_FRAGMENT}
  ),
  facilities:facilities!left(
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
  certifications:certifications!left(
    id,
    certification_type
  ),
  industries:industries!left(
    id,
    industry_name
  )
`

type Schema = Database["public"]
type CompanyRow = Schema["Tables"]["companies"]["Row"]
type FacilityRow = Schema["Tables"]["facilities"]["Row"]
type CapabilityRow = Schema["Tables"]["capabilities"]["Row"]
type CertificationRow = Schema["Tables"]["certifications"]["Row"]
type IndustryRow = Schema["Tables"]["industries"]["Row"]

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

type CompanyRecord = CompanyRow & {
  facilities: FacilityRow[] | null
  capabilities: CapabilityRow[] | null
  certifications: CertificationRow[] | null
  industries: IndustryRow[] | null
}

type PrevRow = Pick<CompanyRow, "id" | "company_name">

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

type CompanyCountBuilder = CompanyFilterBuilder<null>

type FacilityStateRow = {
  state: string | null
}

export type CompanyPageInfo = {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string | null
  endCursor: string | null
  nextCursor: string | null
  prevCursor: string | null
  pageSize: number
}

export type CompanySearchResult = {
  companies: Company[]
  filteredCount: number
  facetCounts: CompanyFacetCounts | null
  pageInfo: CompanyPageInfo
}

const CERTIFICATION_SLUG_MAP: Record<string, string> = {
  "iso-9001": "ISO 9001",
  "iso-13485": "ISO 13485",
  "as9100": "AS9100",
  "iatf-16949": "IATF 16949",
  itar: "ITAR",
}

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
  return deserializeCursor(params.get("cursor"))
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

function resolveCertificationSlug(slug: string | undefined): string | null {
  if (!slug) {
    return null
  }

  const lower = slug.toLowerCase()
  return CERTIFICATION_SLUG_MAP[lower] ?? null
}

function normalizeFilters(options: CompanySearchOptions): NormalizedFilters {
  const routeDefaults = options.routeDefaults ?? {}

  return {
    states: normalizeFilterStates(options.filters.states, routeDefaults.state),
    capabilities: Array.from(
      new Set(
        options.filters.capabilities.filter((slug) => (CAPABILITY_SLUGS as readonly string[]).includes(slug)),
      ),
    ),
    productionVolume: options.filters.productionVolume ?? null,
    certification: resolveCertificationSlug(routeDefaults.certSlug),
    bbox: normalizeBoundingBox(options.bbox),
  }
}

function applyCursor<Result>(
  builder: CompanyFilterBuilder<Result>,
  cursor: CompanySearchCursor | null,
): void {
  if (!cursor) {
    return
  }

  const encodedName = encodeURIComponent(cursor.name)
  const encodedId = encodeURIComponent(cursor.id)
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
    const values = filters.states
      .map((state) => state.replace(/"/g, ""))
      .map((state) => `"${state}"`)
      .join(",")
    builder.filter("facilities.state", "in", `(${values})`)
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
    const { minLng, maxLng, minLat, maxLat } = filters.bbox
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

function createCountBuilder(): CompanyCountBuilder {
  return supabase
    .from("companies")
    .select("id", { head: true, count: "exact" }) as unknown as CompanyCountBuilder
}

async function fetchPreviousRow(
  filters: NormalizedFilters,
  firstCompany: Company,
): Promise<PrevRow | null> {
  const builder = supabase
    .from("companies")
    .select("id, company_name") as CompanyFilterBuilder<PrevRow[]>

  applyFilters(builder, filters)

  const encodedName = encodeURIComponent(firstCompany.company_name)
  const encodedId = encodeURIComponent(firstCompany.id)

  builder.order("company_name", { ascending: false })
  builder.order("id", { ascending: false })
  builder.or(
    `company_name.lt.${encodedName},and(company_name.eq.${encodedName},id.lt.${encodedId})`,
  )
  builder.limit(1)

  const { data, error } = await builder
  if (error) {
    throw error
  }

  const rows = (data ?? []) as PrevRow[]
  return rows[0] ?? null
}

async function fetchStateCandidates(filters: NormalizedFilters): Promise<string[]> {
  const builder = supabase
    .from("facilities")
    .select("state")
    .not("state", "is", null)

  if (filters.bbox) {
    const { minLng, maxLng, minLat, maxLat } = filters.bbox
    builder.gte("longitude", minLng)
    builder.lte("longitude", maxLng)
    builder.gte("latitude", minLat)
    builder.lte("latitude", maxLat)
  }

  const { data, error } = await builder
  if (error) {
    throw error
  }

  const fromFacilities = Array.isArray(data)
    ? (data as FacilityStateRow[])
        .map((row) => normalizeStateCode(row.state))
        .filter((state): state is string => Boolean(state))
    : []

  const combined = new Set<string>([...fromFacilities, ...filters.states])
  return Array.from(combined).sort((a, b) => a.localeCompare(b))
}

async function countCompaniesForState(
  state: string,
  filters: NormalizedFilters,
): Promise<number> {
  const builder = createCountBuilder()
  applyFilters(builder, filters, { skipStates: true })
  builder.eq("facilities.state", state)

  const { count, error } = await builder
  if (error) {
    throw error
  }

  return typeof count === "number" ? count : 0
}

async function fetchStateFacetCounts(filters: NormalizedFilters): Promise<Array<{ code: string; count: number }>> {
  const candidates = await fetchStateCandidates(filters)
  if (candidates.length === 0) {
    return []
  }

  const counts = await Promise.all(
    candidates.map(async (state) => ({ code: state, count: await countCompaniesForState(state, filters) })),
  )

  return counts
    .filter((entry) => entry.count > 0 || filters.states.includes(entry.code))
    .sort((a, b) => a.code.localeCompare(b.code))
}

async function countCompaniesForCapability(
  slug: CapabilitySlug,
  filters: NormalizedFilters,
): Promise<number> {
  const builder = createCountBuilder()
  applyFilters(builder, filters, { skipCapabilities: true })
  builder.eq(`capabilities.${CAPABILITY_COLUMN_MAP[slug]}`, true)

  const { count, error } = await builder
  if (error) {
    throw error
  }

  return typeof count === "number" ? count : 0
}

async function fetchCapabilityFacetCounts(
  filters: NormalizedFilters,
): Promise<Array<{ slug: CapabilitySlug; count: number }>> {
  const counts = await Promise.all(
    CAPABILITY_SLUGS.map(async (slug) => ({ slug, count: await countCompaniesForCapability(slug, filters) })),
  )

  return counts
}

async function countCompaniesForVolume(
  level: ProductionVolume,
  filters: NormalizedFilters,
): Promise<number> {
  const builder = createCountBuilder()
  applyFilters(builder, filters, { skipVolume: true })
  builder.eq(`capabilities.${VOLUME_COLUMN_MAP[level]}`, true)

  const { count, error } = await builder
  if (error) {
    throw error
  }

  return typeof count === "number" ? count : 0
}

async function fetchVolumeFacetCounts(
  filters: NormalizedFilters,
): Promise<Array<{ level: ProductionVolume; count: number }>> {
  const counts = await Promise.all(
    PRODUCTION_VOLUMES.map(async (level) => ({ level, count: await countCompaniesForVolume(level, filters) })),
  )

  return counts
}

async function fetchFacetCounts(filters: NormalizedFilters): Promise<CompanyFacetCounts> {
  const [states, capabilities, productionVolume] = await Promise.all([
    fetchStateFacetCounts(filters),
    fetchCapabilityFacetCounts(filters),
    fetchVolumeFacetCounts(filters),
  ])

  return { states, capabilities, productionVolume }
}

export async function companySearch(options: CompanySearchOptions): Promise<CompanySearchResult> {
  const { cursor = null, includeFacetCounts = true } = options
  const filters = normalizeFilters(options)
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE

  try {
    const builder = supabase
      .from("companies")
      .select(COMPANY_LIST_SELECT, { count: "exact" }) as CompanyFilterBuilder<CompanyRecord[]>

    applyFilters(builder, filters)
    applyCursor(builder, cursor)

    builder.order("company_name", { ascending: true })
    builder.order("id", { ascending: true })
    builder.limit(pageSize + 1)

    const { data, error, count } = await builder
    if (error) {
      throw error
    }

    const rows = (data ?? []) as CompanyRecord[]
    const hasNextPage = rows.length > pageSize
    const trimmedRows = hasNextPage ? rows.slice(0, pageSize) : rows
    const companies = trimmedRows.map((row) => coerceCompany(row))

    const firstCompany = companies[0] ?? null
    const lastCompany = companies.at(-1) ?? null

    let prevCursor: string | null = null
    let hasPreviousPage = false

    if (cursor && firstCompany) {
      try {
        const previousRow = await fetchPreviousRow(filters, firstCompany)
        if (previousRow) {
          prevCursor = serializeCursor({ name: previousRow.company_name, id: previousRow.id })
          hasPreviousPage = Boolean(prevCursor)
        }
      } catch (previousError) {
        logSupabaseError("previous", filters, previousError)
      }
    }

    const nextCursor = hasNextPage && lastCompany
      ? serializeCursor({ name: lastCompany.company_name, id: lastCompany.id })
      : null

    const startCursor = firstCompany
      ? serializeCursor({ name: firstCompany.company_name, id: firstCompany.id })
      : null
    const endCursor = lastCompany
      ? serializeCursor({ name: lastCompany.company_name, id: lastCompany.id })
      : null

    let facetCounts: CompanyFacetCounts | null = null
    if (includeFacetCounts) {
      try {
        facetCounts = await fetchFacetCounts(filters)
      } catch (facetError) {
        logSupabaseError("facets", filters, facetError)
        facetCounts = createEmptyFacetCounts()
      }
    }

    const pageInfo: CompanyPageInfo = {
      hasNextPage,
      hasPreviousPage,
      nextCursor,
      prevCursor,
      startCursor,
      endCursor,
      pageSize,
    }

    return {
      companies,
      filteredCount: typeof count === "number" ? count : companies.length,
      facetCounts,
      pageInfo,
    }
  } catch (error) {
    logSupabaseError("main", filters, error)

    return {
      companies: [],
      filteredCount: 0,
      facetCounts: includeFacetCounts ? createEmptyFacetCounts() : null,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        nextCursor: null,
        prevCursor: null,
        startCursor: null,
        endCursor: null,
        pageSize,
      },
    }
  }
}
