import { compress, decompress } from "lz-string"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import type { FilterState } from "../types/company"

const DEFAULT_FILTERS: FilterState = {
  states: [],
  capabilities: [],
  productionVolume: null,
}

export const compressFilters = (filters: FilterState) => {
  return compress(JSON.stringify(filters))
}

export const decompressFilters = (compressed: string): FilterState => {
  try {
    const raw = decompress(compressed)
    if (!raw) {
      return DEFAULT_FILTERS
    }

    const parsed = JSON.parse(raw) as Record<string, unknown>
    const record: Record<string, string | string[]> = {}

    if (Array.isArray(parsed.states)) {
      record.state = parsed.states.map((value) => String(value))
    }

    if (Array.isArray(parsed.capabilities)) {
      record.capability = parsed.capabilities.map((value) => String(value))
    }

    if (typeof parsed.productionVolume === "string") {
      record.volume = parsed.productionVolume
    }

    return parseFiltersFromSearchParams(record)
  } catch {
    return DEFAULT_FILTERS
  }
}