// components/FilterDebugger.tsx
'use client'

import { useFilters } from '../contexts/FilterContext'
import type { Company } from '../types/company'
import { useMemo } from 'react'

interface FilterDebuggerProps {
  allCompanies: Company[]
}

export default function FilterDebugger({ allCompanies }: FilterDebuggerProps) {
  const { filters } = useFilters()
  
  // Calculate filtered companies (same logic as CompanyMap)
  const filteredCompanies = useMemo(() => {
    let filtered = [...allCompanies]
    
    // Apply search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply country filter
    if (filters.countries && filters.countries.length > 0) {
      filtered = filtered.filter(company =>
        company.facilities?.some(f => 
          filters.countries.includes(f.country || 'US')
        )
      )
    }
    
    // Apply state filter
    if (filters.states.length > 0) {
      filtered = filtered.filter(company =>
        company.facilities?.some(f => 
          filters.states.includes(f.state)
        )
      )
    }
    
    // Apply capabilities filter
    if (filters.capabilities.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.capabilities.some(filter => {
          switch (filter) {
            case 'smt': return cap.pcb_assembly_smt
            case 'through_hole': return cap.pcb_assembly_through_hole
            case 'cable_harness': return cap.cable_harness_assembly
            case 'box_build': return cap.box_build_assembly
            case 'prototyping': return cap.prototyping
            default: return false
          }
        })
      })
    }
    
    // Apply volume capability filter
    if (filters.volumeCapability.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.volumeCapability.some(vol => {
          switch (vol) {
            case 'low': return cap.low_volume_production
            case 'medium': return cap.medium_volume_production
            case 'high': return cap.high_volume_production
            default: return false
          }
        })
      })
    }
    
    // Apply certifications filter
    if (filters.certifications.length > 0) {
      filtered = filtered.filter(company =>
        company.certifications?.some(cert =>
          filters.certifications.includes(
            cert.certification_type.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }
    
    // Apply industries filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter(company =>
        company.industries?.some(ind =>
          filters.industries.includes(
            ind.industry_name.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }
    
    // Apply employee range filter
    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter(company =>
        filters.employeeRange.includes(company.employee_count_range)
      )
    }
    
    return filtered
  }, [allCompanies, filters])
  
  // Calculate map markers (locations)
  type MapMarker = {
    company: string;
    facility: string;
    lat: number;
    lng: number;
  }

  const mapMarkers = useMemo(() => {
    const markers: MapMarker[] = []
    
    filteredCompanies.forEach(company => {
      company.facilities?.forEach(facility => {
        if (facility.latitude && facility.longitude) {
          markers.push({
            company: company.company_name,
            facility: `${facility.city}, ${facility.state}`,
            lat: facility.latitude,
            lng: facility.longitude
          })
        }
      })
    })
    
    return markers
  }, [filteredCompanies])
  
  // Count unique locations vs companies
  const uniqueCompanies = filteredCompanies.length
  const totalFacilities = mapMarkers.length
  
  // Debug: Check for companies without valid facilities
  const companiesWithoutValidFacilities = filteredCompanies.filter(company => {
    const hasFacility = company.facilities?.some(f => f.latitude && f.longitude)
    return !hasFacility
  })
  
  // Debug: Check for companies with multiple facilities
  const companiesWithMultipleFacilities = filteredCompanies.filter(company => {
    const validFacilities = company.facilities?.filter(f => f.latitude && f.longitude) || []
    return validFacilities.length > 1
  })
  
  return (
    <div className="fixed bottom-20 right-4 z-50 bg-white p-4 rounded-lg shadow-xl border-2 border-blue-500 max-w-md">
      <h3 className="font-bold text-sm mb-2 text-blue-700">Filter Debug Info</h3>
      
      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Companies (filtered):</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{uniqueCompanies}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="font-semibold">Map Markers (facilities):</span>
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{totalFacilities}</span>
        </div>
        
        {companiesWithMultipleFacilities.length > 0 && (
          <div className="border-t pt-2 mt-2">
            <div className="text-orange-600 font-semibold">
              Companies with Multiple Locations: {companiesWithMultipleFacilities.length}
            </div>
            <div className="max-h-20 overflow-y-auto text-xs text-gray-600 mt-1">
              {companiesWithMultipleFacilities.slice(0, 5).map(c => (
                <div key={c.id}>
                  • {c.company_name} ({c.facilities?.filter(f => f.latitude && f.longitude).length} locations)
                </div>
              ))}
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
          {filters.searchTerm && <div>• Search: &quot;{filters.searchTerm}&quot;</div>}
          {filters.countries?.length > 0 && <div>• Countries: {filters.countries.join(', ')}</div>}
          {filters.states.length > 0 && <div>• States: {filters.states.join(', ')}</div>}
          {filters.capabilities.length > 0 && <div>• Capabilities: {filters.capabilities.join(', ')}</div>}
          {filters.certifications.length > 0 && <div>• Certs: {filters.certifications.length}</div>}
          {filters.industries.length > 0 && <div>• Industries: {filters.industries.length}</div>}
          {filters.employeeRange.length > 0 && <div>• Size: {filters.employeeRange.join(', ')}</div>}
          {filters.volumeCapability.length > 0 && <div>• Volume: {filters.volumeCapability.join(', ')}</div>}
        </div>
      </div>
    </div>
  )
}