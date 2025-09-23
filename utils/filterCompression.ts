import { compress, decompress } from 'lz-string'
import { parseFiltersFromSearchParams } from '@/lib/filters/url'
import type { FilterState } from '../types/company'

const EMPTY_FILTERS: FilterState = {
  states: [],
  capabilities: [],
  productionVolume: null,
}

export const compressFilters = (filters: FilterState) => {
  return compress(JSON.stringify(filters))
}

export const decompressFilters = (compressed: string): FilterState => {
  try {
    const parsed = JSON.parse(decompress(compressed) || '{}')
    const normalized = parseFiltersFromSearchParams({
      state: Array.isArray(parsed?.states) ? parsed.states : [],
      capability: Array.isArray(parsed?.capabilities) ? parsed.capabilities : [],
      ...(parsed?.productionVolume ? { volume: parsed.productionVolume } : {}),
    })

    return {
      states: [...normalized.states],
      capabilities: [...normalized.capabilities],
      productionVolume: normalized.productionVolume,
    }
  } catch {
    return EMPTY_FILTERS
  }
}
