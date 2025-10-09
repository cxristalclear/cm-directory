// components/FilterDebugger.tsx
'use client'

import { useFilters } from '../contexts/FilterContext'
import type { HomepageCompany } from '@/types/homepage'
import { useMemo } from 'react'
import { filterCompanies, getLocationFilteredFacilities } from '../utils/filtering'

interface FilterDebuggerProps {
  allCompanies: HomepageCompany[]
}

export default function FilterDebugger({ allCompanies }: FilterDebuggerProps) {
  const { filters } = useFilters()
  
  // UPDATED: Use the same location-aware filtering as CompanyMap
  const { filteredCompanies, mapMarkers, companiesWithMultipleFacilities, companiesWithoutValidFacilities } = useMemo(() => {
    // Get filtered companies
    const filtered = filterCompanies(allCompanies, filters)
    
    // Get location-filtered facilities for the map
    const locationFilteredFacilities = getLocationFilteredFacilities(
      allCompanies,
      filters,
      (company, facility) => facility
    )
    
    // Transform to marker format
    
    // Check for companies without valid facilities
    const withoutValid = filtered.filter(company => {
      const hasFacility = company.facilities?.some(f => f.latitude && f.longitude)
      return !hasFacility
    })
    
    // Check for companies with multiple facilities (that pass location filter)
    const withMultiple = filtered.filter(company => {
      const validFacilities = getLocationFilteredFacilities(
        [company],
        filters,
        (_, facility) => facility
      ).filter(f => f.latitude && f.longitude)
      return validFacilities.length > 1
    })
    
    return {
      filteredCompanies: filtered,
      mapMarkers: locationFilteredFacilities,
      companiesWithMultipleFacilities: withMultiple,
      companiesWithoutValidFacilities: withoutValid
    }
  }, [allCompanies, filters])
  
  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500 max-w-md">
      <h3 className="font-bold text-sm mb-2 text-blue-700">Filter Debug Info</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Companies (filtered):</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{filteredCompanies.length}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold">Map Markers (facilities):</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{mapMarkers.length}</span>
        </div>
        
        {companiesWithMultipleFacilities.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="text-orange-600 font-semibold">
              Companies with Multiple Locations: {companiesWithMultipleFacilities.length}
            </div>
            <div className="max-h-20 overflow-y-auto text-xs text-gray-600 mt-1">
              {companiesWithMultipleFacilities.slice(0, 5).map(c => {
                const facilityCount = getLocationFilteredFacilities(
                  [c],
                  filters,
                  (_, f) => f
                ).filter(f => f.latitude && f.longitude).length
                return (
                  <div key={c.id}>
                    • {c.company_name} ({facilityCount} locations in selected area)
                  </div>
                )
              })}
            </div>
          </div>
        )}
        
        {companiesWithoutValidFacilities.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="text-red-600 font-semibold">
              Companies Missing Coordinates: {companiesWithoutValidFacilities.length}
            </div>
            <div className="max-h-20 overflow-y-auto text-xs text-gray-600 mt-1">
              {companiesWithoutValidFacilities.slice(0, 5).map(c => (
                <div key={c.id}>• {c.company_name}</div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t pt-2 mt-2 text-xs">
          <div className="font-semibold mb-1">Active Filters:</div>
          {filters.countries.length > 0 && <div>• Countries: {filters.countries.join(', ')}</div>}
          {filters.states.length > 0 && <div>• States: {filters.states.join(', ')}</div>}
          {filters.capabilities.length > 0 && <div>• Capabilities: {filters.capabilities.join(', ')}</div>}
          {filters.productionVolume && <div>• Volume: {filters.productionVolume}</div>}
        </div>
      </div>
    </div>
  )
}