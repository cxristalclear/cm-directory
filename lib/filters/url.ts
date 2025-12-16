import { STATE_NAMES } from "@/utils/stateMapping"
import { normalizeCountryCode, normalizeStateFilterValue } from "@/utils/locationFilters"
import { EmployeeCountRanges, type EmployeeCountRange } from "@/types/company"
import { validateSearchQuery } from "@/lib/utils/validation"

export const US_STATE_CODES = new Set(Object.keys(STATE_NAMES))
/** List of supported capability slugs */
const CAPABILITIES = [
  "smt",
  "through_hole",
  "cable_harness",
  "box_build",
  "prototyping",
] as const

export type CapabilitySlug = (typeof CAPABILITIES)[number]

function isCapabilitySlug(value: unknown): value is CapabilitySlug {
  return typeof value === "string" && (CAPABILITIES as readonly string[]).includes(value)
}

const PRODUCTION_VOLUMES = ["low", "medium", "high"] as const

export type ProductionVolume = (typeof PRODUCTION_VOLUMES)[number]

function isProductionVolume(value: unknown): value is ProductionVolume {
  return typeof value === "string" && (PRODUCTION_VOLUMES as readonly string[]).includes(value)
}

type SearchParamValue = string | string[] | undefined
type SearchParamInput = URLSearchParams | Record<string, SearchParamValue>

export type FilterUrlState = {
  countries: string[] // ISO country codes
  states: string[]
  capabilities: CapabilitySlug[]
  productionVolume: ProductionVolume | null
  employeeCountRanges: EmployeeCountRange[]
  searchQuery: string
}

function toURLSearchParams(input: SearchParamInput): URLSearchParams {
  if (typeof (input as URLSearchParams).forEach === "function") {
    const params = new URLSearchParams()
    ;(input as URLSearchParams).forEach((value, key) => {
      params.append(key, value)
    })
    return params
  }

  const params = new URLSearchParams()
  for (const [key, rawValue] of Object.entries(input)) {
    if (Array.isArray(rawValue)) {
      for (const value of rawValue) {
        params.append(key, String(value))
      }
    } else if (typeof rawValue !== "undefined") {
      params.append(key, String(rawValue))
    }
  }
  return params
}

function sortAndDedupe<T extends string>(values: Iterable<T>): T[] {
  const seen = new Set<T>()
  const result: T[] = []
  for (const value of values) {
    if (!seen.has(value)) {
      seen.add(value)
      result.push(value)
    }
  }
  return result.sort((a, b) => a.localeCompare(b))
}

function collectValues(params: URLSearchParams, keys: readonly string[]): string[] {
  const collected: string[] = []
  for (const key of keys) {
    const entries = params.getAll(key)
    for (const entry of entries) {
      for (const part of entry.split(",")) {
        const trimmed = part.trim()
        if (trimmed) {
          collected.push(trimmed)
        }
      }
    }
  }
  return collected
}

function normalizeEmployeeRanges(values: string[]): EmployeeCountRange[] {
  const seen = new Set<string>()
  const normalized: EmployeeCountRange[] = []
  values.forEach((value) => {
    if (!value) return
    const trimmed = value.trim()
    if (!trimmed || seen.has(trimmed)) return
    if ((EmployeeCountRanges as readonly string[]).includes(trimmed)) {
      seen.add(trimmed)
      normalized.push(trimmed as EmployeeCountRange)
    }
  })
  return normalized
}

export function parseFiltersFromSearchParams(searchParams: SearchParamInput): FilterUrlState {
  const params = toURLSearchParams(searchParams)

  const countriesValues = collectValues(params, ["country", "countries"]).map((value) =>
    normalizeCountryCode(value) || null,
  )
  const stateValues = collectValues(params, ["state", "states"]).map((value) =>
    normalizeStateFilterValue(value),
  )
  const capabilityValues = collectValues(params, ["capability", "capabilities"]).map((value) =>
    value.toLowerCase(),
  )
  const volumeValues = collectValues(params, ["volume"]).map((value) => value.toLowerCase())
  const employeeValues = collectValues(params, ["employees", "employee_range", "employee_ranges"])
  const queryValues = collectValues(params, ["q", "query", "search"])

  const countries = sortAndDedupe(
    countriesValues.filter((value): value is string => typeof value === "string" && value.length > 0),
  )
  const states = sortAndDedupe(
    stateValues
      .map((value) => (typeof value === "string" ? value.toUpperCase() : null))
      .filter((value): value is string => typeof value === "string" && US_STATE_CODES.has(value)),
  )
  const capabilities = sortAndDedupe(
    capabilityValues.filter((value): value is CapabilitySlug => isCapabilitySlug(value)),
  )
  const productionVolume = volumeValues.find((value): value is ProductionVolume => isProductionVolume(value)) ?? null
  const employeeCountRanges = normalizeEmployeeRanges(employeeValues)

  // Validate and sanitize search query
  const rawQuery = queryValues[0]?.trim() ?? ""
  const queryValidation = validateSearchQuery(rawQuery, 0, 200) // Allow empty queries for filter-only searches
  const searchQuery = queryValidation.valid ? queryValidation.sanitized : ""

  return { countries, states, capabilities, productionVolume, employeeCountRanges, searchQuery }
}

export function serializeFiltersToSearchParams(filters: FilterUrlState): URLSearchParams {
  const params = new URLSearchParams()

  const normalizedCountries = sortAndDedupe(
    filters.countries
      .map((country) => normalizeCountryCode(country))
      .filter((value): value is string => typeof value === "string" && value.length > 0),
  )
  const normalizedStates = sortAndDedupe(
    filters.states
      .map((state) => normalizeStateFilterValue(state))
      .filter((value): value is string => value !== null),
  )
  const normalizedCapabilities = sortAndDedupe(
    filters.capabilities.filter((value): value is CapabilitySlug => isCapabilitySlug(value)),
  )
  const normalizedEmployeeRanges = normalizeEmployeeRanges(filters.employeeCountRanges)

  normalizedCountries.forEach((country) => params.append("countries", country))
  normalizedStates.forEach((state) => params.append("state", state))
  normalizedCapabilities.forEach((capability) => params.append("capability", capability))
  normalizedEmployeeRanges.forEach((range) => params.append("employees", range))

  if (filters.productionVolume && isProductionVolume(filters.productionVolume)) {
    params.append("volume", filters.productionVolume)
  }

  // Validate and sanitize before serializing
  const rawQuery = (typeof filters.searchQuery === "string" ? filters.searchQuery : "").trim()
  const queryValidation = validateSearchQuery(rawQuery, 0, 200) // Allow empty queries
  const trimmedQuery = queryValidation.valid ? queryValidation.sanitized : ""
  
  if (trimmedQuery.length > 0) {
    params.append("q", trimmedQuery)
  }

  return params
}
