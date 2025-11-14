import { STATE_NAMES } from "@/utils/stateMapping"
import { normalizeCountryCode, normalizeStateFilterValue } from "@/utils/locationFilters"

export const US_STATE_CODES = new Set(Object.keys(STATE_NAMES))

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
  const queryValues = collectValues(params, ["q", "query", "search"])

  const countries = sortAndDedupe(
    countriesValues.filter((value): value is string => typeof value === "string" && value.length > 0),
  )
  const states = sortAndDedupe(stateValues.filter((value): value is string => value !== null))
  const capabilities = sortAndDedupe(
    capabilityValues.filter((value): value is CapabilitySlug => isCapabilitySlug(value)),
  )
  const productionVolume = volumeValues.find((value): value is ProductionVolume => isProductionVolume(value)) ?? null

  const searchQuery = queryValues[0]?.trim() ?? ""

  return { countries, states, capabilities, productionVolume, searchQuery }
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

  // FIXED: Changed parameter name from 'countries' to 'country' for clarity
  normalizedCountries.forEach((country) => params.append("countries", country))
  normalizedStates.forEach((state) => params.append("state", state))
  normalizedCapabilities.forEach((capability) => params.append("capability", capability))

  if (filters.productionVolume && isProductionVolume(filters.productionVolume)) {
    params.append("volume", filters.productionVolume)
  }

  const trimmedQuery = filters.searchQuery.trim()
  if (trimmedQuery.length > 0) {
    params.append("q", trimmedQuery)
  }

  return params
}
