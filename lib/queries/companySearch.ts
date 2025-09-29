
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

export type NormalizedFilters = {
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

type CompanyFilterBuilder<Row> = PostgrestFilterBuilder<
  Schema,
  CompanyRow,
  Row[] | null,
  "companies"
>

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

export function normalizeFilters(options: CompanySearchOptions): NormalizedFilters {
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

let envSanityPromise: Promise<void> | null = null

function maskSupabaseUrl(value: string | undefined): string | null {
  if (!value) {
    return null
  }

  if (value.length <= 12) {
    return `${value.slice(0, 4)}…`
  }

  return `${value.slice(0, 8)}…${value.slice(-4)}`
}

async function ensureEnvironmentSanity(): Promise<void> {
  if (envSanityPromise) {
    return envSanityPromise
  }

  if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
    envSanityPromise = Promise.resolve()
    return envSanityPromise
  }

  envSanityPromise = (async () => {
    const supabaseUrl = maskSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
    const anonKeyPresent = Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)

    console.info("companySearch environment", {
      supabaseUrl,
      anonKeyPresent,
    })

    try {
      const builder = supabase
        .from("companies")
        .select("id", { count: "exact", head: true }) as PostgrestFilterBuilder<
        Schema,
        CompanyRow,
        { id: string | null }[] | null,
        "companies"
      >

      const query = getBuilderUrl(builder)
      const response = await builder
      if (response.error) {
        console.error("companySearch environment probe error", {
          query: query ?? null,
          error: formatErrorForLog(response.error),
        })
        return
      }

      console.info("companySearch environment probe", {
        query: query ?? null,
        companyCount: typeof response.count === "number" ? response.count : null,
      })
    } catch (error) {
      console.error("companySearch environment probe", {
        error: formatErrorForLog(error),
      })
    }
  })()

  return envSanityPromise
}

type CompanyIdSet = Set<string>

type FilterCompanySets = {
  states: CompanyIdSet | null
  capabilities: CompanyIdSet | null
  volume: CompanyIdSet | null
  certification: CompanyIdSet | null
  bbox: CompanyIdSet | null
}

function intersectSets(base: CompanyIdSet | null, next: CompanyIdSet | null): CompanyIdSet | null {
  if (!next) {
    return base ? new Set(base) : null
  }

  if (!base) {
    return new Set(next)
  }

  const intersection = new Set<string>()
  for (const value of base) {
    if (next.has(value)) {
      intersection.add(value)
    }
  }

  return intersection
}

function normalizeCompanyId(value: string | null | undefined): string | null {
  if (typeof value !== "string") {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

async function fetchCompanyIdsForStates(
  states: string[],
  context: LogContext,
): Promise<CompanyIdSet> {
  const builder = supabase
    .from("facilities")
    .select("company_id, state") as PostgrestFilterBuilder<
    Schema,
    FacilityRow,
    { company_id: string | null; state: string | null }[] | null,
    "facilities"
  >

  builder.in("state", states)
  builder.not("company_id", "is", null)

  const { data } = await executeBuilder<{ company_id: string | null; state: string | null }>(
    "filter:states",
    context,
    builder,
  )

  const result = new Set<string>()
  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    if (companyId) {
      result.add(companyId)
    }
  }

  return result
}

async function fetchCompanyIdsForCapabilities(
  capabilities: CapabilitySlug[],
  context: LogContext,
): Promise<CompanyIdSet> {
  const builder = supabase
    .from("capabilities")
    .select("company_id") as PostgrestFilterBuilder<
    Schema,
    CapabilityRow,
    { company_id: string | null }[] | null,
    "capabilities"
  >

  const orConditions = capabilities
    .map((slug) => `${CAPABILITY_COLUMN_MAP[slug]}.is.true`)
    .join(",")

  if (orConditions) {
    builder.or(orConditions)
  }

  builder.not("company_id", "is", null)

  const { data } = await executeBuilder<{ company_id: string | null }>(
    "filter:capabilities",
    context,
    builder,
  )

  const result = new Set<string>()
  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    if (companyId) {
      result.add(companyId)
    }
  }

  return result
}

async function fetchCompanyIdsForVolume(
  level: ProductionVolume,
  context: LogContext,
): Promise<CompanyIdSet> {
  const builder = supabase
    .from("capabilities")
    .select("company_id") as PostgrestFilterBuilder<
    Schema,
    CapabilityRow,
    { company_id: string | null }[] | null,
    "capabilities"
  >

  builder.eq(VOLUME_COLUMN_MAP[level], true)
  builder.not("company_id", "is", null)

  const { data } = await executeBuilder<{ company_id: string | null }>(
    "filter:volume",
    context,
    builder,
  )

  const result = new Set<string>()
  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    if (companyId) {
      result.add(companyId)
    }
  }

  return result
}

async function fetchCompanyIdsForCertification(
  certification: string,
  context: LogContext,
): Promise<CompanyIdSet> {
  const builder = supabase
    .from("certifications")
    .select("company_id") as PostgrestFilterBuilder<
    Schema,
    CertificationRow,
    { company_id: string | null }[] | null,
    "certifications"
  >

  builder.eq("certification_type", certification)
  builder.not("company_id", "is", null)

  const { data } = await executeBuilder<{ company_id: string | null }>(
    "filter:certification",
    context,
    builder,
  )

  const result = new Set<string>()
  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    if (companyId) {
      result.add(companyId)
    }
  }

  return result
}

async function fetchCompanyIdsForBoundingBox(
  bbox: BoundingBox,
  context: LogContext,
): Promise<CompanyIdSet> {
  if (!bbox) {
    return new Set()
  }

  const builder = supabase
    .from("facilities")
    .select("company_id, longitude, latitude") as PostgrestFilterBuilder<
    Schema,
    FacilityRow,
    { company_id: string | null; longitude: number | null; latitude: number | null }[] | null,
    "facilities"
  >

  builder.gte("longitude", bbox.minLng)
  builder.lte("longitude", bbox.maxLng)
  builder.gte("latitude", bbox.minLat)
  builder.lte("latitude", bbox.maxLat)
  builder.not("company_id", "is", null)

  const { data } = await executeBuilder<{
    company_id: string | null
    longitude: number | null
    latitude: number | null
  }>("filter:bbox", context, builder)

  const result = new Set<string>()
  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    if (companyId) {
      result.add(companyId)
    }
  }

  return result
}

async function fetchAllCompanyIds(context: LogContext): Promise<CompanyIdSet> {
  const builder = supabase
    .from("companies")
    .select("id") as CompanyFilterBuilder<{ id: string | null }>

  const { data } = await executeBuilder<{ id: string | null }>("filter:all", context, builder)
  const result = new Set<string>()
  for (const row of data) {
    const id = normalizeCompanyId(row.id)
    if (id) {
      result.add(id)
    }
  }

  return result
}

async function gatherFilterCompanySets(
  filters: NormalizedFilters,
  context: LogContext,
): Promise<FilterCompanySets> {
  const statesPromise = filters.states.length > 0 ? fetchCompanyIdsForStates(filters.states, context) : Promise.resolve(null)
  const capabilitiesPromise =
    filters.capabilities.length > 0
      ? fetchCompanyIdsForCapabilities(filters.capabilities, context)
      : Promise.resolve(null)
  const volumePromise = filters.productionVolume
    ? fetchCompanyIdsForVolume(filters.productionVolume, context)
    : Promise.resolve(null)
  const certificationPromise = filters.certification
    ? fetchCompanyIdsForCertification(filters.certification, context)
    : Promise.resolve(null)
  const bboxPromise = filters.bbox ? fetchCompanyIdsForBoundingBox(filters.bbox, context) : Promise.resolve(null)

  const [states, capabilities, volume, certification, bbox] = await Promise.all([
    statesPromise,
    capabilitiesPromise,
    volumePromise,
    certificationPromise,
    bboxPromise,
  ])

  return {
    states,
    capabilities,
    volume,
    certification,
    bbox,
  }
}

function computeCompanyIdSet(
  filters: NormalizedFilters,
  skip: FilterSkipOptions,
  sets: FilterCompanySets,
): CompanyIdSet | null {
  const { skipStates = false, skipCapabilities = false, skipVolume = false } = skip

  let result: CompanyIdSet | null = null

  if (!skipStates && sets.states) {
    result = intersectSets(result, sets.states)
  }

  if (!skipCapabilities && sets.capabilities) {
    result = intersectSets(result, sets.capabilities)
  }

  if (!skipVolume && sets.volume) {
    result = intersectSets(result, sets.volume)
  }

  if (sets.certification) {
    result = intersectSets(result, sets.certification)
  }

  if (sets.bbox) {
    result = intersectSets(result, sets.bbox)
  }

  return result
}

export type CompanyFilterPreparation = {
  context: LogContext
  filterSets: FilterCompanySets
  resolveCompanyIds: (set: CompanyIdSet | null) => Promise<string[]>
  allCompanyIds: string[]
}

export async function prepareCompanyFilterContext(
  filters: NormalizedFilters,
  routeDefaults: CompanySearchOptions["routeDefaults"] | null,
): Promise<CompanyFilterPreparation> {
  const context: LogContext = { filters, routeDefaults }
  const filterSets = await gatherFilterCompanySets(filters, context)
  let allCompanyIdsPromise: Promise<CompanyIdSet> | null = null

  const resolveCompanyIds = async (set: CompanyIdSet | null): Promise<string[]> => {
    if (set) {
      return Array.from(set)
    }

    if (!allCompanyIdsPromise) {
      allCompanyIdsPromise = fetchAllCompanyIds(context)
    }

    const allIds = await allCompanyIdsPromise
    return Array.from(allIds)
  }

  const allCompanyIds = await resolveCompanyIds(computeCompanyIdSet(filters, {}, filterSets))

  return { context, filterSets, resolveCompanyIds, allCompanyIds }
}

async function fetchStateFacetCountsForCompanies(
  companyIds: string[],
  filters: NormalizedFilters,
  context: LogContext,
): Promise<Array<{ code: string; count: number }>> {
  if (companyIds.length === 0) {
    return filters.states
      .map((state) => normalizeStateCode(state))
      .filter((state): state is string => Boolean(state))
      .map((state) => ({ code: state, count: 0 }))
  }

  const builder = supabase
    .from("facilities")
    .select("company_id, state") as PostgrestFilterBuilder<
    Schema,
    FacilityRow,
    { company_id: string | null; state: string | null }[] | null,
    "facilities"
  >

  builder.in("company_id", companyIds)
  builder.not("company_id", "is", null)
  builder.not("state", "is", null)

  const { data } = await executeBuilder<{ company_id: string | null; state: string | null }>(
    "facet:states",
    { ...context, facet: "states" },
    builder,
  )

  const counts = new Map<string, Set<string>>()

  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    const state = normalizeStateCode(row.state)
    if (!companyId || !state) {
      continue
    }

    const bucket = counts.get(state) ?? new Set<string>()
    bucket.add(companyId)
    counts.set(state, bucket)
  }

  for (const state of filters.states) {
    const normalized = normalizeStateCode(state)
    if (normalized && !counts.has(normalized)) {
      counts.set(normalized, new Set())
    }
  }

  return Array.from(counts.entries())
    .map(([code, bucket]) => ({ code, count: bucket.size }))
    .filter((entry) => entry.count > 0 || filters.states.includes(entry.code))
    .sort((a, b) => a.code.localeCompare(b.code))
}

async function fetchCapabilityFacetCountsForCompanies(
  companyIds: string[],
  context: LogContext,
): Promise<Array<{ slug: CapabilitySlug; count: number }>> {
  if (companyIds.length === 0) {
    return CAPABILITY_SLUGS.map((slug) => ({ slug, count: 0 }))
  }

  const builder = supabase
    .from("capabilities")
    .select(`company_id, ${CAPABILITIES_SELECT_FRAGMENT}`) as PostgrestFilterBuilder<
    Schema,
    CapabilityRow,
    CapabilityRow[] | null,
    "capabilities"
  >

  builder.in("company_id", companyIds)
  builder.not("company_id", "is", null)

  const { data } = await executeBuilder<CapabilityRow>(
    "facet:capabilities",
    { ...context, facet: "capabilities" },
    builder,
  )

  const sets = new Map<CapabilitySlug, Set<string>>()
  for (const slug of CAPABILITY_SLUGS) {
    sets.set(slug, new Set())
  }

  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    if (!companyId) {
      continue
    }

    for (const slug of CAPABILITY_SLUGS) {
      const column = CAPABILITY_COLUMN_MAP[slug]
      if (row[column]) {
        sets.get(slug)?.add(companyId)
      }
    }
  }

  return CAPABILITY_SLUGS.map((slug) => ({ slug, count: sets.get(slug)?.size ?? 0 }))
}

async function fetchProductionVolumeFacetCountsForCompanies(
  companyIds: string[],
  context: LogContext,
): Promise<Array<{ level: ProductionVolume; count: number }>> {
  if (companyIds.length === 0) {
    return PRODUCTION_VOLUMES.map((level) => ({ level, count: 0 }))
  }

  const builder = supabase
    .from("capabilities")
    .select(`company_id, ${CAPABILITIES_SELECT_FRAGMENT}`) as PostgrestFilterBuilder<
    Schema,
    CapabilityRow,
    CapabilityRow[] | null,
    "capabilities"
  >

  builder.in("company_id", companyIds)
  builder.not("company_id", "is", null)

  const { data } = await executeBuilder<CapabilityRow>(
    "facet:productionVolume",
    { ...context, facet: "productionVolume" },
    builder,
  )

  const sets = new Map<ProductionVolume, Set<string>>()
  for (const level of PRODUCTION_VOLUMES) {
    sets.set(level, new Set())
  }

  for (const row of data) {
    const companyId = normalizeCompanyId(row.company_id)
    if (!companyId) {
      continue
    }

    for (const level of PRODUCTION_VOLUMES) {
      const column = VOLUME_COLUMN_MAP[level]
      if (row[column]) {
        sets.get(level)?.add(companyId)
      }
    }
  }

  return PRODUCTION_VOLUMES.map((level) => ({ level, count: sets.get(level)?.size ?? 0 }))
}

async function buildFacetCounts(
  filters: NormalizedFilters,
  sets: FilterCompanySets,
  resolveCompanyIds: (set: CompanyIdSet | null) => Promise<string[]>,
  context: LogContext,
): Promise<CompanyFacetCounts> {
  try {
    const baseForStates = await resolveCompanyIds(
      computeCompanyIdSet(filters, { skipStates: true }, sets),
    )
    const baseForCapabilities = await resolveCompanyIds(
      computeCompanyIdSet(filters, { skipCapabilities: true }, sets),
    )
    const baseForVolume = await resolveCompanyIds(
      computeCompanyIdSet(filters, { skipVolume: true }, sets),
    )

    const states = await fetchStateFacetCountsForCompanies(baseForStates, filters, context)
    const capabilities = await fetchCapabilityFacetCountsForCompanies(
      baseForCapabilities,
      context,
    )
    const productionVolume = await fetchProductionVolumeFacetCountsForCompanies(
      baseForVolume,
      context,
    )

    return { states, capabilities, productionVolume }
  } catch (error) {
    logSupabaseError("facet", context, error)
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`companySearch facet computation failed: ${message}`)
  }
}

async function fetchCompaniesPage(
  companyIds: string[],
  cursor: CompanySearchCursor | null,
  pageSize: number,
  context: LogContext,
): Promise<{ rows: CompanyRecord[]; count: number | null }> {
  if (companyIds.length === 0) {
    return { rows: [], count: 0 }
  }

  const builder = supabase
    .from("companies")
    .select(COMPANY_LIST_SELECT, { count: "exact" }) as CompanyFilterBuilder<CompanyRecord>

  builder.in("id", companyIds)
  applyCursor(builder, cursor)
  builder.order("company_name", { ascending: true })
  builder.order("id", { ascending: true })
  builder.limit(pageSize + 1)

  const { data, count } = await executeBuilder<CompanyRecord>("main", context, builder)
  return { rows: data, count }
}

async function fetchPreviousRowFromIds(
  companyIds: string[],
  firstCompany: Company,
  context: LogContext,
): Promise<PrevRow | null> {
  if (companyIds.length === 0) {
    return null
  }

  const builder = supabase
    .from("companies")
    .select("id, company_name") as CompanyFilterBuilder<PrevRow>

  builder.in("id", companyIds)

  const encodedName = encodeURIComponent(firstCompany.company_name)
  const encodedId = encodeURIComponent(firstCompany.id)

  builder.order("company_name", { ascending: false })
  builder.order("id", { ascending: false })
  builder.or(
    `company_name.lt.${encodedName},and(company_name.eq.${encodedName},id.lt.${encodedId})`,
  )
  builder.limit(1)

  const { data } = await executeBuilder<PrevRow>("previous", context, builder)
  return data[0] ?? null
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

type LogContext = {
  filters: NormalizedFilters
  routeDefaults: CompanySearchOptions["routeDefaults"] | null
  facet?: "states" | "capabilities" | "productionVolume"
}

function cloneFiltersForLog(filters: NormalizedFilters) {
  return {
    ...filters,
    states: [...filters.states],
    capabilities: [...filters.capabilities],
    bbox: filters.bbox ? { ...filters.bbox } : null,
  }
}

function formatErrorForLog(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack }
  }

  return error
}

function logSupabaseError(stage: string, context: LogContext, error: unknown, query?: string | null) {
  console.error("companySearch error", {
    stage,
    facet: context.facet ?? null,
    filters: cloneFiltersForLog(context.filters),
    routeDefaults: context.routeDefaults ?? null,
    query: query ?? null,
    error: formatErrorForLog(error),
  })
}

function getBuilderUrl(builder: unknown): string | null {
  if (builder && typeof builder === "object" && "url" in builder) {
    const value = builder as { url?: URL | null }
    if (value.url instanceof URL) {
      return value.url.toString()
    }
  }

  return null
}

async function executeBuilder<Result>(
  stage: string,
  context: LogContext,
  builder: PostgrestFilterBuilder<Schema, any, Result[] | null, any>,
): Promise<{ data: Result[]; count: number | null }> {
  const query = getBuilderUrl(builder)

  try {
    const response = await builder
    if (response.error) {
      logSupabaseError(stage, context, response.error, query)
      throw response.error
    }

    const rows = Array.isArray(response.data) ? (response.data as Result[]) : []
    return { data: rows, count: typeof response.count === "number" ? response.count : null }
  } catch (error) {
    logSupabaseError(stage, context, error, query)
    throw error
  }
}

export async function companySearch(options: CompanySearchOptions): Promise<CompanySearchResult> {
  const { cursor = null, includeFacetCounts = true } = options
  const filters = normalizeFilters(options)
  const pageSize = options.pageSize ?? DEFAULT_PAGE_SIZE
  const routeDefaults = options.routeDefaults ?? null

  await ensureEnvironmentSanity()

  const { context, filterSets, resolveCompanyIds, allCompanyIds } = await prepareCompanyFilterContext(
    filters,
    routeDefaults,
  )

  const { rows, count } = await fetchCompaniesPage(allCompanyIds, cursor, pageSize, context)
  const hasNextPage = rows.length > pageSize
  const trimmedRows = hasNextPage ? rows.slice(0, pageSize) : rows
  const companies = trimmedRows.map((row) => coerceCompany(row))

  const firstCompany = companies[0] ?? null
  const lastCompany = companies.at(-1) ?? null

  let prevCursor: string | null = null
  let hasPreviousPage = false

  if (cursor && firstCompany) {
    try {
      const previousRow = await fetchPreviousRowFromIds(allCompanyIds, firstCompany, context)
      if (previousRow) {
        prevCursor = serializeCursor({ name: previousRow.company_name, id: previousRow.id })
        hasPreviousPage = Boolean(prevCursor)
      }
    } catch (previousError) {
      logSupabaseError("previous", context, previousError)
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
    facetCounts = await buildFacetCounts(filters, filterSets, resolveCompanyIds, context)
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
}
