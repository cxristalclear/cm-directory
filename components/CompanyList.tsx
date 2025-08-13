'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFilters } from '../contexts/FilterContext'
import { MapPin, Users, Award, Settings, ChevronRight } from 'lucide-react'
import type { Company } from '../types/company'

interface CompanyListProps {
  allCompanies: Company[]
}

export default function CompanyList({ allCompanies }: CompanyListProps) {
  const { filters } = useFilters()
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>(allCompanies)

  useEffect(() => {
    let filtered = [...allCompanies]

    // Apply same filtering logic as map
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.states.length > 0) {
      filtered = filtered.filter(company =>
        company.facilities?.some((f) => filters.states.includes(f.state))
      )
    }

    if (filters.capabilities.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.capabilities.some(filter => {
          switch(filter) {
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

    if (filters.volumeCapability.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.volumeCapability.some(vol => {
          switch(vol) {
            case 'low': return cap.low_volume_production
            case 'medium': return cap.medium_volume_production
            case 'high': return cap.high_volume_production
            default: return false
          }
        })
      })
    }

    if (filters.certifications.length > 0) {
      filtered = filtered.filter(company =>
        company.certifications?.some((cert) =>
          filters.certifications.includes(
            cert.certification_type.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }

    if (filters.industries.length > 0) {
      filtered = filtered.filter(company =>
        company.industries?.some((ind) =>
          filters.industries.includes(
            ind.industry_name.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }

    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter(company =>
        filters.employeeRange.includes(company.employee_count_range)
      )
    }

    setFilteredCompanies(filtered)
  }, [filters, allCompanies])

  // Ad Placeholder Component
  const AdPlaceholder = ({ 
    width, 
    height, 
    label, 
    className = "" 
  }: { 
    width: string
    height: string
    label: string
    className?: string
  }) => (
    <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`} 
         style={{ width, height }}>
      <div className="text-center text-gray-500">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs mt-1">{width} × {height}</div>
        <div className="text-xs text-gray-400 mt-1">Advertisement</div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          Companies ({filteredCompanies.length})
        </h2>
        <span className="text-sm text-gray-500">
          {filteredCompanies.length} results
        </span>
      </div>
      
      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
        {filteredCompanies.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No companies match your filters</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          filteredCompanies.map((company, index) => (
            <Link 
              key={company.id} 
              href={`/companies/${company.slug}`}
              className="block group"
            >
              <div className="
                bg-white 
                border border-gray-200
                rounded-xl 
                p-6 
                transition-all 
                duration-200 
                hover:border-gray-300
                hover:shadow-lg
                hover:shadow-gray-200/50
                hover:-translate-y-0.5
                cursor-pointer
                relative
                overflow-hidden
              ">
                {/* Optional: Add a subtle gradient or accent line */}
                <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Company Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-200">
                      {company.company_name}
                    </h3>
                    
                    {/* Location */}
                    <div className="flex items-center gap-1.5 mt-2 text-gray-600">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">
                        {company.facilities?.[0]?.city}, {company.facilities?.[0]?.state}
                      </span>
                    </div>
                  </div>
                  
                  {/* Arrow indicator on hover */}
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-200" />
                </div>

                {/* Company Details */}
                <div className="space-y-3">
                  {/* Employee Count */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {company.employee_count_range} employees
                      </span>
                    </div>
                  </div>

                  {/* Capabilities Tags */}
                  <div className="flex flex-wrap gap-2">
                    {company.capabilities?.[0]?.pcb_assembly_smt && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-md border border-blue-200">
                        <Settings className="w-3 h-3" />
                        SMT
                      </span>
                    )}
                    {company.capabilities?.[0]?.prototyping && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200">
                        <Settings className="w-3 h-3" />
                        Prototyping
                      </span>
                    )}
                    {company.capabilities?.[0]?.through_hole && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-md border border-purple-200">
                        <Settings className="w-3 h-3" />
                        Through Hole
                      </span>
                    )}
                  </div>

                  {/* Certifications if available */}
                  {company.certifications && company.certifications.length > 0 && (
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                      <Award className="w-4 h-4 text-gray-400" />
                      <div className="flex flex-wrap gap-1">
                        {company.certifications?.slice(0, 3).map((cert, idx) => (
                          <span key={idx} className="text-xs text-gray-500">
                            {cert.certification_type}{idx < Math.min(2, (company.certifications?.length || 0) - 1) ? ',' : ''}
                          </span>
                        ))}
                        {(company.certifications?.length || 0) > 3 && (
                          <span className="text-xs text-gray-400">
                            +{(company.certifications?.length || 0) - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Optional: Add a subtle description if available */}
                {company.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {company.description}
                  </p>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Bottom of Results Ad */}
      {filteredCompanies.length > 0 && (
        <div className="mt-6">
          <AdPlaceholder 
            width="100%" 
            height="250px" 
            label="Results Footer"
          />
        </div>
      )}
    </div>
  )
}