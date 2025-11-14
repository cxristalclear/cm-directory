import { compress, decompress } from 'lz-string'
import type { FilterState } from '../types/company'

const DEFAULT_FILTERS: FilterState = {
  countries: [],
  states: [],
  capabilities: [],
  productionVolume: null,
  searchQuery: "",
}

export const compressFilters = (filters: FilterState) => {
  return compress(JSON.stringify(filters))
}

export const decompressFilters = (compressed: string): FilterState => {
  try {
    const decompressed = decompress(compressed)
    if (!decompressed) return DEFAULT_FILTERS
    
    const parsed = JSON.parse(decompressed)
    
    // Ensure all required fields exist with defaults
    return {
      countries: Array.isArray(parsed.countries) ? parsed.countries : [],
      states: Array.isArray(parsed.states) ? parsed.states : [],
      capabilities: Array.isArray(parsed.capabilities) ? parsed.capabilities : [],
      productionVolume: parsed.productionVolume || null,
      searchQuery: typeof parsed.searchQuery === "string" ? parsed.searchQuery : "",
    }
  } catch {
    return DEFAULT_FILTERS
  }
}
