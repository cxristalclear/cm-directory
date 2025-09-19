"use client"

import { useMemo, useState, useEffect } from "react"
import Link from "next/link"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, Users, Award, ChevronRight, Building2, Globe } from "lucide-react"
import type { Company } from "../types/company"
import { filterCompanies } from "../utils/filtering"
import Pagination from "./Pagination"

interface CompanyListProps {
  allCompanies: Company[]
  itemsPerPage?: number
}

export default function CompanyList({ allCompanies, itemsPerPage = 12 }: CompanyListProps) {
  const { filters } = useFilters()
  const [currentPage, setCurrentPage] = useState(1)

  const filteredCompanies = useMemo(() => {
    return filterCompanies(allCompanies, filters)
  }, [filters, allCompanies])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Calculate pagination
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCompanies = filteredCompanies.slice(startIndex, endIndex)

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top of list when page changes
    const listElement = document.querySelector('.companies-directory')
    if (listElement) {
      listElement.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="space-y-6">
      {/* List Header */}
      <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900 font-sans">Companies Directory</h2>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {startIndex + 1}-{Math.min(endIndex, filteredCompanies.length)}
            </span>{" "}
            of <span className="font-semibold text-gray-900">{filteredCompanies.length}</span> companies
          </span>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {currentCompanies.length === 0 ? (
          <div className="col-span-full">
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No companies found</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                Try adjusting your filters to see more results. We have {allCompanies.length} companies in our
                directory.
              </p>
            </div>
          </div>
        ) : (
          currentCompanies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              prefetch={true}
              className="group block bg-white rounded-xl shadow-sm border border-gray-200/50 hover:shadow-lg hover:border-blue-200/50 transition-all duration-200 overflow-hidden"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-200">
                      <Building2 className="w-6 h-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1 group-hover:text-blue-600 transition-colors duration-200 truncate">
                        {company.company_name}
                      </h3>
                      {company.dba_name && (
                        <p className="text-sm text-gray-500 mb-1 truncate">DBA: {company.dba_name}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200 flex-shrink-0" />
                </div>

                {/* Description */}
                {company.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {company.description.length > 120
                      ? `${company.description.substring(0, 120)}...`
                      : company.description}
                  </p>
                )}

                {/* Key Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 rounded-md flex items-center justify-center">
                      <MapPin className="w-3 h-3 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium">Location</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {company.facilities?.[0]
                          ? `${company.facilities[0].city}, ${company.facilities[0].state}`
                          : "Multiple"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <div className="w-6 h-6 bg-purple-100 rounded-md flex items-center justify-center">
                      <Users className="w-3 h-3 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-gray-500 font-medium">Employees</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {company.employee_count_range || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Capabilities */}
                {company.capabilities && company.capabilities.length > 0 && company.capabilities[0] && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                      Key Capabilities
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {company.capabilities[0].pcb_assembly_smt && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                          SMT
                        </span>
                      )}
                      {company.capabilities[0].pcb_assembly_through_hole && (
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 rounded-md text-xs font-medium">
                          Through-Hole
                        </span>
                      )}
                      {company.capabilities[0].box_build_assembly && (
                        <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs font-medium">
                          Box Build
                        </span>
                      )}
                      {company.capabilities[0].prototyping && (
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 rounded-md text-xs font-medium">
                          Prototyping
                        </span>
                      )}
                      {company.capabilities[0].cable_harness_assembly && (
                        <span className="inline-flex items-center px-2 py-1 bg-indigo-100 text-indigo-800 rounded-md text-xs font-medium">
                          Cable Harness
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Industries */}
                {company.industries && company.industries.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Industries</p>
                    <div className="flex flex-wrap gap-1">
                      {company.industries.slice(0, 3).map((industry, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                        >
                          {industry.industry_name}
                        </span>
                      ))}
                      {company.industries.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium">
                          +{company.industries.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {company.certifications && company.certifications.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {company.certifications.slice(0, 4).map((cert, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium"
                        >
                          {cert.certification_type}
                        </span>
                      ))}
                      {company.certifications.length > 4 && (
                        <span className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md text-xs font-medium">
                          +{company.certifications.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Pagination */}
      {filteredCompanies.length > itemsPerPage && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
      )}

      {/* Bottom spacing for mobile filter button */}
      <div className="h-20 lg:h-0" />
    </div>
  )
}