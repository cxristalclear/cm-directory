"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, Users, Award, ChevronRight, Building2, Globe } from "lucide-react"
import type { Company } from "../types/company"
import { getStateName } from '../utils/stateMapping'
import Pagination from "./Pagination"


interface CompanyListProps {
  allCompanies: Company[]
}

export default function CompanyList({ allCompanies }: CompanyListProps) {
  const { filters } = useFilters()
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  const filteredCompanies = useMemo(() => {
    let filtered = [...allCompanies]

    // Apply same filtering logic as map
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (company) =>
          company.company_name?.toLowerCase().includes(searchLower) ||
          company.description?.toLowerCase().includes(searchLower),
      )
    }

    if (filters.countries.length > 0) {
     filtered = filtered.filter((company) => 
       company.facilities?.some((f) => 
         filters.countries.includes(f.country || 'US')
       )
     )
   }

    if (filters.states.length > 0) {
      filtered = filtered.filter((company) => company.facilities?.some((f) => filters.states.includes(f.state)))
    }

    if (filters.capabilities.length > 0) {
      filtered = filtered.filter((company) => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.capabilities.some((filter) => {
          switch (filter) {
            case "smt":
              return cap.pcb_assembly_smt
            case "through_hole":
              return cap.pcb_assembly_through_hole
            case "cable_harness":
              return cap.cable_harness_assembly
            case "box_build":
              return cap.box_build_assembly
            case "prototyping":
              return cap.prototyping
            default:
              return false
          }
        })
      })
    }

    if (filters.volumeCapability.length > 0) {
      filtered = filtered.filter((company) => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.volumeCapability.some((vol) => {
          switch (vol) {
            case "low":
              return cap.low_volume_production
            case "medium":
              return cap.medium_volume_production
            case "high":
              return cap.high_volume_production
            default:
              return false
          }
        })
      })
    }

    // Certifications filter
    if (filters.certifications.length > 0) {
      filtered = filtered.filter((company) =>
        company.certifications?.some((cert) =>
          filters.certifications.includes(cert.certification_type.toLowerCase().replace(/\s+/g, "_")),
        ),
      )
    }

    // Industries filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        company.industries?.some((ind) =>
          filters.industries.includes(ind.industry_name.toLowerCase().replace(/\s+/g, "_")),
        ),
      )
    }

    // Employee range filter
    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter((company) => filters.employeeRange.includes(company.employee_count_range))
    }

    return filtered
  }, [filters, allCompanies])

    const facilityCount = useMemo(() => {
    return filteredCompanies.reduce((acc, company) => 
      acc + (company.facilities?.filter(f => f.latitude && f.longitude).length || 0), 0
    );
  }, [filteredCompanies]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const paginatedCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredCompanies.slice(startIndex, endIndex)
  }, [filteredCompanies, currentPage, itemsPerPage])

  return (
    <div className="space-y-6">
      {/* List Header */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 font-sans">Companies Directory</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{allCompanies.length}</span> companies
            {facilityCount !== filteredCompanies.length && (
              <span className="text-gray-500">
                {' '}({facilityCount} locations)
              </span>
            )}
          </span>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 text-lg font-semibold mb-2">No companies match your criteria</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          paginatedCompanies.map((company) => (
            <Link key={company.id} href={`/companies/${company.slug}`} className="block group">
              <div
                className="
                bg-white 
                border border-gray-200
                rounded-2xl 
                p-6 
                transition-all 
                duration-300 
                hover:border-blue-300
                hover:shadow-xl
                hover:-translate-y-1
                cursor-pointer
                relative
                overflow-hidden
                h-full
                flex
                flex-col
              "
              >
                {/* Gradient accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                {/* Company Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                        {company.company_name?.charAt(0) || "C"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 font-sans break-words">
                          {company.company_name}
                        </h3>
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          {company.facilities?.[0]?.city && company.facilities?.[0]?.state && (
                            <div className="flex items-center space-x-2">
                              <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                              <span className="text-xs text-gray-600 font-medium">{company.facilities?.[0]?.city}, {company.facilities?.[0]?.state}</span>
                            </div>
                          )}
                          {/* Multiple Locations Indicator */}
                          {company.facilities && company.facilities.filter(f => f.latitude && f.longitude).length > 1 && (
                            <div className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 rounded-full px-2 py-1 w-fit">
                              <MapPin className="w-3 h-3" />
                              <span>{company.facilities.filter(f => f.latitude && f.longitude).length} locations</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {company.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">{company.description}</p>
                )}

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {company.employee_count_range && (
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{company.employee_count_range}</span>
                    </div>
                  )}
                  {company.certifications && company.certifications.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Award className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-600">{company.certifications.length} Certs</span>
                    </div>
                  )}
                </div>

                {/* Capabilities Pills */}
                {company.capabilities && company.capabilities[0] && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {company.capabilities[0].pcb_assembly_smt && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg">SMT</span>
                    )}
                    {company.capabilities[0].cable_harness_assembly && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                        Cable
                      </span>
                    )}
                    {company.capabilities[0].box_build_assembly && (
                      <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg">
                        Box Build
                      </span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-1">
                    {company.website_url && (
                      <Globe className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex items-center text-blue-600 group-hover:text-blue-700 transition-colors">
                    <span className="text-sm font-medium">View Details</span>
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredCompanies.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}