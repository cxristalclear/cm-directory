import { compress, decompress } from 'lz-string'
import type { FilterState } from '../types/company'

const DEFAULT_FILTERS: FilterState = {
  countries: [],
  states: [],
  capabilities: [],
  productionVolume: null,
  employeeCountRanges: [],
  searchQuery: "",
}

export const compressFilters = (filters: FilterState) => {
  return compress(JSON.stringify(filters))
}

/**
* Decompresses a compressed filter JSON string into a FilterState object, applying defaults and returning DEFAULT_FILTERS on error.
* @example
* decodeFilterState("eJyrVkrLz1eyUkpKLFKqBQA1BwYJ")
* { countries: [], states: [], capabilities: [], productionVolume: null, employeeCountRanges: [], searchQuery: "" }
* @param {{string}} {{compressed}} - Compressed filter string produced by the corresponding compression utility.
* @returns {{FilterState}} Parsed FilterState with defaults applied; returns DEFAULT_FILTERS if decompression or parsing fails.
**/
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
      employeeCountRanges: Array.isArray(parsed.employeeCountRanges) ? parsed.employeeCountRanges : [],
      searchQuery: typeof parsed.searchQuery === "string" ? parsed.searchQuery : "",
    }
  } catch {
    return DEFAULT_FILTERS
  }
}
