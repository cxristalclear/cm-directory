import { STATE_NAMES } from "@/utils/stateMapping"

const US_STATE_CODES = new Set(Object.keys(STATE_NAMES))

export const CANONICAL_CAPABILITIES = [
  "smt",
  "through_hole",
  "mixed",
  "fine_pitch",
  "cable_harness",
  "box_build",
] as const

export type CanonicalCapability = (typeof CANONICAL_CAPABILITIES)[number]
export type CapabilitySlug = CanonicalCapability

const CANONICAL_CAPABILITY_SET = new Set<string>(CANONICAL_CAPABILITIES)

export function isCanonicalCapability(value: unknown): value is CanonicalCapability {
  return typeof value === "string" && CANONICAL_CAPABILITY_SET.has(value)
}

export const CANONICAL_PRODUCTION_VOLUMES = ["low", "medium", "high"] as const

export type ProductionVolume = (typeof CANONICAL_PRODUCTION_VOLUMES)[number]

const CANONICAL_PRODUCTION_VOLUME_SET = new Set<string>(CANONICAL_PRODUCTION_VOLUMES)

function isProductionVolume(value: unknown): value is ProductionVolume {
  return typeof value === "string" && CANONICAL_PRODUCTION_VOLUME_SET.has(value)
}

type SearchParamValue = string | string[] | undefined
type SearchParamInput = URLSearchParams | Record<string, SearchParamValue>

export type FilterUrlState = {
  states: string[]
  capabilities: CanonicalCapability[]
  productionVolume: ProductionVolume | null
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

function normalizeState(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return null
  }
  const upper = trimmed.toUpperCase()
  return US_STATE_CODES.has(upper) ? upper : null
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

  const stateValues = collectValues(params, ["state", "states"]).map((value) => normalizeState(value))
  const capabilityValues = collectValues(params, ["capability", "capabilities"]).map((value) =>
    value.toLowerCase(),
  )
  const volumeValues = collectValues(params, ["volume"]).map((value) => value.toLowerCase())

  const states = sortAndDedupe(stateValues.filter((value): value is string => value !== null))
  const capabilities = sortAndDedupe(
    capabilityValues.filter((value): value is CanonicalCapability => isCanonicalCapability(value)),
  )
  const productionVolume = volumeValues.find((value): value is ProductionVolume => isProductionVolume(value)) ?? null

  return { states, capabilities, productionVolume }
}

export function serializeFiltersToSearchParams(filters: FilterUrlState): URLSearchParams {
  const params = new URLSearchParams()

  const normalizedStates = sortAndDedupe(
    filters.states
      .map((state) => normalizeState(state))
      .filter((value): value is string => value !== null),
  )
  const normalizedCapabilities = sortAndDedupe(
    filters.capabilities.filter((value): value is CanonicalCapability => isCanonicalCapability(value)),
  )

  normalizedStates.forEach((state) => params.append("state", state))
  normalizedCapabilities.forEach((capability) => params.append("capability", capability))

  if (filters.productionVolume && isProductionVolume(filters.productionVolume)) {
    params.append("volume", filters.productionVolume)
  }

  return params
}

export function buildFilterUrl(basePath: string, filters: FilterUrlState): string {
  const params = serializeFiltersToSearchParams(filters)
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
