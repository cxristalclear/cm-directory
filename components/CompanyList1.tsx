"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Award, Building2, ChevronRight, MapPin, Users } from "lucide-react"

import { useFilters } from "@/contexts/FilterContext"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import { filterCompanies } from "@/utils/filtering"
import { getFacilityLocationLabel, getFacilityCountryCode, normalizeStateFilterValue } from "@/utils/locationFilters"
import HeroSearchBar from "@/components/HeroSearchBar"

interface CompanyListProps {
  allCompanies: HomepageCompanyWithLocations[]
  limit?: number
}

const DEFAULT_LIMIT = 12 // Increased from 9 for better pagination

function createSummary(totalCount: number, visibleCount: number): string {
  if (totalCount === 0) {
    return "No results"
  }

  if (visibleCount >= totalCount) {
    return `${totalCount} results`
  }

  return `Showing ${visibleCount} of ${totalCount} results`
}

export default function CompanyList({ allCompanies, limit = DEFAULT_LIMIT }: CompanyListProps) {
  const { filters, setFilteredCount } = useFilters()
  const [pagesLoaded, setPagesLoaded] = useState(1)

  const filteredCompanies = useMemo(() => {
    return filterCompanies(allCompanies, filters)
  }, [allCompanies, filters])

  // Reset to the first set of results when filters change
  useEffect(() => {
    setPagesLoaded(1)
  }, [filters])

  useEffect(() => {
    setFilteredCount(filteredCompanies.length)
  }, [filteredCompanies.length, setFilteredCount])

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / limit))
  useEffect(() => {
    if (pagesLoaded > totalPages) {
      setPagesLoaded(totalPages)
    }
  }, [pagesLoaded, totalPages])

  const visibleCompanies = useMemo(() => {
    return filteredCompanies.slice(0, pagesLoaded * limit)
  }, [filteredCompanies, pagesLoaded, limit])
  const summary = createSummary(filteredCompanies.length, visibleCompanies.length)
  const canLoadMore = pagesLoaded < totalPages

  if (filteredCompanies.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-200 bg-white p-12 text-center">
        <Building2 className="mb-4 inline h-12 w-12 text-gray-400" />
        <h3 className="mb-2 text-lg font-semibold text-gray-600">No companies found</h3>
        <p className="mx-auto max-w-md text-sm text-gray-500">
          Adjust your filters or clear them to explore additional manufacturing partners.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Results Count */}
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Companies Directory</h2>
            <span className="text-sm font-medium text-gray-600">{summary}</span>
          </div>
          <div className="w-full max-w-md">
            <HeroSearchBar companies={allCompanies} variant="inline" />
          </div>
        </div>
      </div>

      {/* Company List Rows */}
      <div className="flex flex-col gap-4">
        {visibleCompanies.map(company => {
          const facility = company.facilities?.[0]
          const location = getFacilityLocationLabel(facility)
          const normalizedRegionCode = facility
            ? normalizeStateFilterValue(facility.state_code) ??
              normalizeStateFilterValue(facility.state_province) ??
              normalizeStateFilterValue(facility.state)
            : null
          const normalizedCountryCode = facility ? getFacilityCountryCode(facility) : null
          const locationCodes = [normalizedRegionCode, normalizedCountryCode].filter(Boolean).join(", ")
          const capabilityRecord = company.capabilities?.[0]
          const certifications = company.certifications ?? []

          return (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              prefetch
              className="group relative block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-start">
                {/* Logo / Icon Column */}
                <div className="flex-shrink-0">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-sm transition-transform group-hover:scale-105">
                    <Building2 className="h-7 w-7" />
                  </div>
                </div>

                {/* Main Content Column */}
                <div className="min-w-0 flex-1">
                  {/* Title Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {company.company_name}
                    </h3>
                    {company.dba_name && (
                      <span className="text-sm text-gray-500 hidden sm:inline">({company.dba_name})</span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                      <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-600"></span>
                      Active
                    </span>
                  </div>

                  {/* Description */}
                  {company.description && (
                    <p className="mb-3 line-clamp-2 max-w-4xl text-sm leading-relaxed text-gray-600">
                      {company.description}
                    </p>
                  )}

                  {/* Meta Data Row (Location | Stats | Tags) */}
                  <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-sm">
                    <div className="flex items-center text-gray-600 min-w-[140px]">
                      <MapPin className="mr-1.5 h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{location}</span>
                      {locationCodes && <span className="ml-1 text-gray-500 text-xs">({locationCodes})</span>}
                    </div>

                    <div className="flex items-center text-gray-600">
                      <Users className="mr-1.5 h-4 w-4 text-gray-400" />
                      <span>{company.employee_count_range ?? "N/A"} employees</span>
                    </div>

                    {/* Quick Capabilities (Inline) */}
                    {capabilityRecord && (
                      <div className="flex flex-wrap gap-1.5">
                        {capabilityRecord.pcb_assembly_smt && (
                          <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">SMT</span>
                        )}
                        {capabilityRecord.box_build_assembly && (
                          <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">Box Build</span>
                        )}
                        {/* Show active certifications as badges */}
                        {certifications.slice(0, 2).map(cert => (
                           <span key={cert.id} className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                             <Award className="mr-1 h-3 w-3 text-gray-400" />
                             {cert.certification_type}
                           </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action / Arrow Column (Desktop) */}
                <div className="hidden md:flex md:flex-col md:items-end md:justify-center md:pl-6 md:border-l md:border-gray-100 self-stretch">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <ChevronRight className="h-5 w-5" />
                   </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {canLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            type="button"
            onClick={() => setPagesLoaded(prev => Math.min(prev + 1, totalPages))}
            className="btn btn--primary btn--lg rounded-full shadow-sm text-sm px-8"
          >
            Load more companies          </button>
        </div>
      )}
    </div>
  )
}