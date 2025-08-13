import { compress, decompress } from 'lz-string'
import type { FilterState } from '../types/company' // Add this import

export const compressFilters = (filters: FilterState) => {
  return compress(JSON.stringify(filters))
}

export const decompressFilters = (compressed: string): FilterState => {
  try {
    return JSON.parse(decompress(compressed) || '{}')
  } catch {
    return {
      searchTerm: '',
      states: [],
      capabilities: [],
      certifications: [],
      industries: [],
      employeeRange: [],
      volumeCapability: []
    }
  }
}