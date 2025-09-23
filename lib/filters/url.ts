import type { ReadonlyURLSearchParams } from "next/navigation"

import { STATE_NAMES } from "@/utils/stateMapping"

const US_STATE_CODES = new Set(Object.keys(STATE_NAMES))

const CAPABILITY_SLUGS = [
  "smt",
  "through_hole",
  "cable_harness",
  "box_build",
  "prototyping",
] as const

type CapabilitySlug = (typeof CAPABILITY_SLUGS)[number]
const CAPABILITY_SET = new Set<string>(CAPABILITY_SLUGS)

const PRODUCTION_VOLUMES = ["low", "medium", "high"] as const
export type ProductionVolume = (typeof PRODUCTION_VOLUMES)[number]
const PRODUCTION_VOLUME_SET = new Set<string>(PRODUCTION_VOLUMES)

type SearchParamRecord = Record<string, string | string[] | undefined>
type SearchParamsInit = URLSearchParams | ReadonlyURLSearchParams | SearchParamRecord
type SearchParamsInput = SearchParamsInit | Promise<SearchParamsInit>

type FilterUrlState = {
  states: string[]
  capabilities: CapabilitySlug[]
  productionVolume: ProductionVolume | null
}

function toURLSearchParams(input: SearchParamsInit): URLSearchParams {
  if (typeof (input as URLSearchParams).forEach === "function") {
    const params = new URLSearchParams()
    ;(input as URLSearchParams).forEach((value, key) => {
      params.append(key, value)
    })
    return params
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(input as SearchParamRecord)) {
    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry)
      }
    } else if (typeof value === "string") {
      params.append(key, value)
    }
  }
  return params
}

function uniqueSorted(values: string[]): string[] {
  return Array.from(new Set(values)).sort((a, b) => a.localeCompare(b))
}

function normalizeState(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const upper = trimmed.toUpperCase()
  return US_STATE_CODES.has(upper) ? upper : null
}

function normalizeCapability(value: string | CapabilitySlug | null | undefined): CapabilitySlug | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  return CAPABILITY_SET.has(lower) ? (lower as CapabilitySlug) : null
}

function normalizeVolume(
  value: string | ProductionVolume | null | undefined,
): ProductionVolume | null {
  if (!value) return null
  const trimmed = value.toString().trim()
  if (!trimmed) return null
  const lower = trimmed.toLowerCase()
  return PRODUCTION_VOLUME_SET.has(lower) ? (lower as ProductionVolume) : null
}

function collectMultiValues(params: URLSearchParams, keys: string[]): string[] {
  const values: string[] = []
  for (const key of keys) {
    params.getAll(key).forEach(entry => {
      values.push(...entry.split(","))
    })
  }
  return values
}

function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in (value as Record<string, unknown>) &&
    typeof (value as { then?: unknown }).then === "function"
  )
}

export async function resolveURLSearchParams(
  searchParams?: SearchParamsInput,
): Promise<URLSearchParams> {
  if (!searchParams) {
    return new URLSearchParams()
  }

  const resolved = isPromise<SearchParamsInit>(searchParams)
    ? await searchParams
    : searchParams

  return toURLSearchParams(resolved)
}

export function parseFiltersFromSearchParams(searchParams: SearchParamsInit): FilterUrlState {
  const params = toURLSearchParams(searchParams)

  const stateValues = collectMultiValues(params, ["state", "states"]).map(normalizeState)
  const capabilityValues = collectMultiValues(params, ["capability", "capabilities"]).map(
    normalizeCapability,
  )
  const volumeValues = collectMultiValues(params, ["volume"]).map(normalizeVolume)

  const states = uniqueSorted(stateValues.filter((value): value is string => value !== null))
  const capabilities = uniqueSorted(
    capabilityValues.filter((value): value is CapabilitySlug => value !== null),
  )

  const productionVolume = volumeValues.find((value): value is ProductionVolume => value !== null) ?? null

  return { states, capabilities, productionVolume }
}

export function serializeFiltersToSearchParams(filters: FilterUrlState): URLSearchParams {
  const params = new URLSearchParams()

  const states = uniqueSorted(filters.states.map(normalizeState).filter((value): value is string => value !== null))
  const capabilities = uniqueSorted(
    filters.capabilities
      .map(normalizeCapability)
      .filter((value): value is CapabilitySlug => value !== null),
  )
  const productionVolume = normalizeVolume(filters.productionVolume)

  states.forEach(state => params.append("state", state))
  capabilities.forEach(capability => params.append("capability", capability))
  if (productionVolume) {
    params.append("volume", productionVolume)
  }

  return params
}

export type { FilterUrlState, SearchParamsInit, SearchParamsInput }
