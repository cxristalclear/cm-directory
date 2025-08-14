"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, Users, Award, ChevronRight, Building2, Globe, Phone, Mail } from "lucide-react"
import type { Company } from "../types/company"

interface CompanyListProps {
  allCompanies: Company[]
}

export default function CompanyList({ allCompanies }: CompanyListProps) {
  const { filters } = useFilters()

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

    if (filters.certifications.length > 0) {
      filtered = filtered.filter((company) =>
        company.certifications?.some((cert) =>
          filters.certifications.includes(cert.certification_type.toLowerCase().replace(/\s+/g, "_")),
        ),
      )
    }

    if (filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        company.industries?.some((ind) =>
          filters.industries.includes(ind.industry_name.toLowerCase().replace(/\s+/g, "_")),
        ),
      )
    }

    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter((company) => filters.employeeRange.includes(company.employee_count_range))
    }

    return filtered
  }, [
    allCompanies,
    filters.searchTerm,
    filters.states,
    filters.capabilities,
    filters.volumeCapability,
    filters.certifications,
    filters.industries,
    filters.employeeRange,
  ])

  // Ad Placeholder Component
  const AdPlaceholder = ({
    width,
    height,
    label,
    className = "",
  }: {
    width: string
    height: string
    label: string
    className?: string
  }) => (
    <div
      className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-gray-500">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs mt-1">
          {width} × {height}
        </div>
        <div className="text-xs text-gray-400 mt-1">Advertisement</div>
      </div>
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-serif">Manufacturing Partners</h2>
          <p className="text-sm text-gray-600 mt-1">{filteredCompanies.length} verified companies found</p>
        </div>
        <div className="flex items-center space-x-3">
          <select className="text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Sort by Relevance</option>
            <option>Company Name</option>
            <option>Location</option>
            <option>Employee Count</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCompanies.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building2 className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-900 text-lg font-semibold mb-2">No companies match your criteria</p>
            <p className="text-gray-500 text-sm">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          filteredCompanies.map((company, index) => (
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
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-200 font-serif truncate">
                          {company.company_name}
                        </h3>
                        <div className="flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                          <span className="text-xs text-gray-600 font-medium truncate">
                            {company.facilities?.[0]?.city}, {company.facilities?.[0]?.state}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status indicator and arrow */}
                  <div className="flex flex-col items-end space-y-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-green-600 font-medium">Verified</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </div>

                {/* Company Description */}
                {company.description && (
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3 flex-grow">
                    {company.description}
                  </p>
                )}

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center space-x-2 mb-1">
                      <Users className="w-3 h-3 text-blue-500" />
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Team Size</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900">
                      {company.employee_count_range} employees
                    </span>
                  </div>
                </div>

                {/* Capabilities Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                    Core Capabilities
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {company.capabilities?.[0]?.pcb_assembly_smt && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-200">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        SMT
                      </span>
                    )}
                    {company.capabilities?.[0]?.prototyping && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full border border-green-200">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        Proto
                      </span>
                    )}
                    {company.capabilities?.[0]?.pcb_assembly_through_hole && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full border border-purple-200">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        TH
                      </span>
                    )}
                    {company.capabilities?.[0]?.cable_harness_assembly && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full border border-orange-200">
                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                        Cable
                      </span>
                    )}
                  </div>
                </div>

                {/* Certifications and Contact Info */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
                  <div className="flex items-center space-x-2">
                    {company.certifications && company.certifications.length > 0 && (
                      <div className="flex items-center space-x-1">
                        <Award className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {company.certifications[0].certification_type}
                        </span>
                        {(company.certifications?.length || 0) > 1 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            +{(company.certifications?.length || 0) - 1}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-gray-400">
                    {company.website_url && <Globe className="w-3 h-3" />}
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Bottom of Results Ad */}
      {filteredCompanies.length > 0 && (
        <div className="mt-8">
          <AdPlaceholder width="100%" height="250px" label="Results Footer" />
        </div>
      )}
    </div>
  )
}
