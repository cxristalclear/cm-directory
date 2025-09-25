import { supabase } from "@/lib/supabase"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import type {
  Capabilities,
  Certification,
  Company,
  Facility,
  Industry,
} from "@/types/company"

const CAPABILITY_SLUGS: CapabilitySlug[] = [
  "smt",
  "through_hole",
  "mixed",
  "fine_pitch",
  "cable_harness",
  "box_build",
  "prototyping",
]

const PRODUCTION_VOLUMES: ProductionVolume[] = ["low", "medium", "high"]

const CERTIFICATION_SLUG_MAP: Record<string, string> = {
  "iso-9001": "ISO 9001",
  "iso-13485": "ISO 13485",
  "as9100": "AS9100",
  "iatf-16949": "IATF 16949",
  itar: "ITAR",
}

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

type RpcCompany = Company & {
  facilities: Facility[] | null
  capabilities: Capabilities[] | null
  industries: Industry[] | null
  certifications: Certification[] | null
}

type RpcFacetCounts = {
  states: Array<{ code: string | null; count: number | null }>
  capabilities: Array<{ slug: string | null; count: number | null }>
  production_volume: Array<{ level: string | null; count: number | null }>
}

type RpcBoundingBox = {
  min_lng: number
  min_lat: number
  max_lng: number
  max_lat: number
}

type RpcResponse = {
  companies: RpcCompany[]
  total_count: number | null
  has_next: boolean | null
  has_prev: boolean | null
  next_cursor: CompanySearchCursor | string | null
  prev_cursor: CompanySearchCursor | string | null
  facet_counts: RpcFacetCounts | null
}

export const COMPANY_SEARCH_FUNCTION = "company_directory_search"

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

function resolveCertificationSlug(slug: string | undefined): string | null {
  if (!slug) {
    return null
  }
  const lower = slug.toLowerCase()
  return CERTIFICATION_SLUG_MAP[lower] ?? null
}

function normalizeCapabilitySlug(value: string | null | undefined): CapabilitySlug | null {
  if (typeof value !== "string") {
    return null
  }
  const lower = value.trim().toLowerCase()
  return (CAPABILITY_SLUGS as readonly string[]).includes(lower)
    ? (lower as CapabilitySlug)
    : null
}

function normalizeProductionVolume(value: string | null | undefined): ProductionVolume | null {
  if (typeof value !== "string") {
    return null
  }
  const lower = value.trim().toLowerCase()
  return (PRODUCTION_VOLUMES as readonly string[]).includes(lower)
    ? (lower as ProductionVolume)
    : null
}

function dedupeAndSort<T>(values: T[], key: (value: T) => string): T[] {
  const seen = new Set<string>()
  const result: T[] = []
  for (const value of values) {
    const k = key(value)
    if (!seen.has(k)) {
      seen.add(k)
      result.push(value)
    }
  }
  return result.sort((a, b) => key(a).localeCompare(key(b)))
}

function normalizeFacetCounts(raw: RpcFacetCounts | null | undefined): CompanyFacetCounts {
  const stateCounts = new Map<string, number>()
  for (const entry of raw?.states ?? []) {
    const state = normalizeStateCode(entry.code)
    if (state) {
      stateCounts.set(state, Number(entry.count ?? 0))
    }
  }

  const capabilityCounts = new Map<CapabilitySlug, number>()
  for (const entry of raw?.capabilities ?? []) {
    const slug = normalizeCapabilitySlug(entry.slug)
    if (slug) {
      capabilityCounts.set(slug, Number(entry.count ?? 0))
    }
  }

  const volumeCounts = new Map<ProductionVolume, number>()
  for (const entry of raw?.production_volume ?? []) {
    const level = normalizeProductionVolume(entry.level)
    if (level) {
      volumeCounts.set(level, Number(entry.count ?? 0))
    }
  }

  const orderedStates = dedupeAndSort(
    Array.from(stateCounts.entries()).map(([code, count]) => ({ code, count })),
    (entry) => entry.code,
  )

  const orderedCapabilities = CAPABILITY_SLUGS.map((slug) => ({
    slug,
    count: capabilityCounts.get(slug) ?? 0,
  }))

  const orderedVolumes = PRODUCTION_VOLUMES.map((level) => ({
    level,
    count: volumeCounts.get(level) ?? 0,
  }))

  return {
    states: orderedStates,
    capabilities: orderedCapabilities,
    productionVolume: orderedVolumes,
  }
}

function normalizeCursorValue(value: unknown): CompanySearchCursor | null {
  if (!value) {
    return null
  }
  if (typeof value === "string") {
    return deserializeCursor(value)
  }
  if (typeof value === "object" && value !== null) {
    const name = (value as { name?: unknown }).name
    const id = (value as { id?: unknown }).id
    if (typeof name === "string" && typeof id === "string") {
      return { name, id }
    }
  }
  return null
}

function normalizeBoundingBox(
  bbox: CompanySearchOptions["bbox"] | null,
): RpcBoundingBox | undefined {
  if (!bbox) {
    return undefined
  }
  const { minLng, minLat, maxLng, maxLat } = bbox
  if (
    [minLng, minLat, maxLng, maxLat].some((value) => typeof value !== "number" || Number.isNaN(value))
  ) {
    return undefined
  }
  return {
    min_lng: minLng,
    min_lat: minLat,
    max_lng: maxLng,
    max_lat: maxLat,
  }
}

function coerceCompanies(companies: RpcCompany[] | null | undefined): Company[] {
  if (!Array.isArray(companies)) {
    return []
  }
  return companies.map((company) => ({
    ...company,
    facilities: Array.isArray(company.facilities) ? company.facilities : [],
    capabilities: Array.isArray(company.capabilities) ? company.capabilities : [],
    industries: Array.isArray(company.industries) ? company.industries : [],
    certifications: Array.isArray(company.certifications) ? company.certifications : [],
  }))
}

function serializeCursorValue(value: unknown): string | null {
  return serializeCursor(normalizeCursorValue(value))
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
  const unique = new Set(normalized)
  return Array.from(unique)
}

export async function companySearch(options: CompanySearchOptions): Promise<CompanySearchResult> {
  const {
    filters,
    cursor = null,
    pageSize = 9,
    includeFacetCounts = true,
    bbox = null,
  } = options

  const routeDefaults = options.routeDefaults ?? {}
  const normalizedStates = normalizeFilterStates(filters.states, routeDefaults.state)
  const normalizedCapabilities = Array.from(
    new Set(
      filters.capabilities.filter((slug) =>
        (CAPABILITY_SLUGS as readonly string[]).includes(slug),
      ),
    ),
  )

  const payload = {
    filter_states: normalizedStates,
    filter_capabilities: normalizedCapabilities,
    filter_volume: filters.productionVolume ?? null,
    route_state: normalizeStateCode(routeDefaults.state) ?? null,
    required_certification: resolveCertificationSlug(routeDefaults.certSlug),
    cursor_name: cursor?.name ?? null,
    cursor_id: cursor?.id ?? null,
    page_size: pageSize,
    include_facets: includeFacetCounts,
    bbox: normalizeBoundingBox(bbox),
  }

  const { data, error } = await supabase.rpc(COMPANY_SEARCH_FUNCTION, payload)

  if (error) {
    throw error
  }

  const response = data ?? {
    companies: [],
    total_count: 0,
    has_next: false,
    has_prev: false,
    next_cursor: null,
    prev_cursor: null,
    facet_counts: null,
  }

  const companies = coerceCompanies(response.companies)
  const facetCounts = includeFacetCounts ? normalizeFacetCounts(response.facet_counts) : null

  return {
    companies,
    totalCount: typeof response.total_count === "number" ? response.total_count : companies.length,
    hasNext: Boolean(response.has_next),
    hasPrev: Boolean(response.has_prev),
    nextCursor: serializeCursorValue(response.next_cursor),
    prevCursor: serializeCursorValue(response.prev_cursor),
    facetCounts,
  }
}
