"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Building2, ChevronRight, MapPin, Users, Grid, List } from "lucide-react"

import { useFilters } from "@/contexts/FilterContext"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import { filterCompanies } from "@/utils/filtering"
import { getFacilityLocationLabel, getFacilityCountryCode, normalizeStateFilterValue } from "@/utils/locationFilters"
import HeroSearchBar from "@/components/HeroSearchBar"

interface CompanyListProps {
  allCompanies: HomepageCompanyWithLocations[]
  limit?: number
}

const DEFAULT_LIMIT = 12 

function createSummary(totalCount: number, visibleCount: number): string {
  if (totalCount === 0) return "No results"
  if (visibleCount >= totalCount) return `${totalCount} companies`
  return `Showing ${visibleCount} of ${totalCount}`
}

export default function CompanyList({ allCompanies, limit = DEFAULT_LIMIT }: CompanyListProps) {
  const { filters, setFilteredCount } = useFilters()
  const [pagesLoaded, setPagesLoaded] = useState(1)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')

  const filteredCompanies = useMemo(() => {
    return filterCompanies(allCompanies, filters)
  }, [allCompanies, filters])

  useEffect(() => setPagesLoaded(1), [filters])
  useEffect(() => setFilteredCount(filteredCompanies.length), [filteredCompanies.length, setFilteredCount])

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / limit))
  const visibleCompanies = useMemo(() => filteredCompanies.slice(0, pagesLoaded * limit), [filteredCompanies, pagesLoaded, limit])
  const summary = createSummary(filteredCompanies.length, visibleCompanies.length)
  const canLoadMore = pagesLoaded < totalPages

  if (filteredCompanies.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
        <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3 shadow-inner">
          <Building2 className="h-6 w-6 text-gray-400" />
        </div>
        <h3 className="mb-1 text-base font-bold text-gray-900">No partners found</h3>
        <p className="text-xs text-gray-500 max-w-xs mx-auto">Try removing some filters to broaden your search.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* List Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Results</h2>
            <p className="text-xs text-gray-500">{summary}</p>
          </div>
          <div className="flex items-center bg-gray-100/80 p-0.5 rounded-md border border-gray-200/50 backdrop-blur-sm">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[4px] transition-all duration-200 ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'}`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[4px] transition-all duration-200 ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-200/50'}`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <div className="w-full md:w-72">
          <HeroSearchBar companies={allCompanies} variant="inline" />
        </div>
      </div>

      {/* List/Grid View */}
      <div className={viewMode === 'list' ? 'flex flex-col gap-3' : 'grid grid-cols-1 sm:grid-cols-2 gap-4'}>
        {visibleCompanies.map(company => {
          const facility = company.facilities?.[0]
          const location = getFacilityLocationLabel(facility)
          const normalizedRegionCode = facility
            ? normalizeStateFilterValue(facility.state_code) ?? normalizeStateFilterValue(facility.state_province) ?? normalizeStateFilterValue(facility.state)
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
              className={`group relative block rounded-xl border border-gray-200 bg-white transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5 ${viewMode === 'list' ? 'p-4' : 'p-4 h-full flex flex-col'}`}
            >
              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

              <div className={`relative z-10 flex ${viewMode === 'list' ? 'flex-col md:flex-row gap-4 items-start' : 'flex-col gap-3 items-start h-full'}`}>
                
                {/* Compact Logo Placeholder */}
                <div className="flex-shrink-0">
                  <div className={`flex items-center justify-center rounded-lg bg-white border border-gray-100 shadow-sm text-gray-300 group-hover:text-blue-600 group-hover:border-blue-100 group-hover:scale-105 transition-all duration-300 ${viewMode === 'list' ? 'h-12 w-12' : 'h-10 w-10'}`}>
                    <Building2 className={`${viewMode === 'list' ? 'h-6 w-6' : 'h-5 w-5'} transition-colors duration-300`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <h3 className={`font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 ${viewMode === 'list' ? 'text-base' : 'text-sm'}`}>
                        {company.company_name}
                      </h3>
                      
                      {/* Compact Active Badge */}
                      <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50/80 border border-emerald-100/50 backdrop-blur-sm">
                        <div className="w-1 h-1 rounded-full bg-emerald-500"></div>
                        <span className="text-[9px] font-bold text-emerald-700 uppercase tracking-wider leading-none">Active</span>
                      </div>
                    </div>
                  </div>
                  
                  {company.dba_name && (
                    <p className="text-[10px] font-medium text-gray-400 mb-1 group-hover:text-gray-500 transition-colors">DBA: {company.dba_name}</p>
                  )}

                  {company.description && (
                    <p className={`mb-3 text-xs text-gray-500 leading-relaxed ${viewMode === 'list' ? 'line-clamp-1 max-w-3xl' : 'line-clamp-2'}`}>
                      {company.description}
                    </p>
                  )}

                  {/* Compact Data Pills */}
                  <div className={`flex flex-wrap items-center gap-2 mb-3 ${viewMode === 'grid' ? 'mt-auto' : ''}`}>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 text-[10px] font-medium text-gray-600 group-hover:bg-white group-hover:shadow-sm group-hover:ring-1 group-hover:ring-gray-200 transition-all duration-300">
                      <MapPin className="h-3 w-3 text-gray-400 group-hover:text-blue-500 transition-colors" />
                      <span className="truncate max-w-[120px]">{location}</span>
                      {locationCodes && <span className="text-gray-400 hidden sm:inline">({locationCodes})</span>}
                    </div>

                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded bg-gray-50 text-[10px] font-medium text-gray-600 group-hover:bg-white group-hover:shadow-sm group-hover:ring-1 group-hover:ring-gray-200 transition-all duration-300">
                      <Users className="h-3 w-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                      <span>{company.employee_count_range ?? "N/A"}</span>
                    </div>
                  </div>

                  {/* Micro Badges */}
                  <div className={`flex flex-wrap gap-1.5 ${viewMode === 'grid' ? 'pt-3 border-t border-gray-100 w-full' : ''}`}>
                    {capabilityRecord?.pcb_assembly_smt && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-blue-50/80 text-[9px] font-bold text-blue-700 border border-blue-100 group-hover:bg-blue-50 transition-colors uppercase tracking-wide">
                        SMT
                      </span>
                    )}
                    {capabilityRecord?.box_build_assembly && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-50/80 text-[9px] font-bold text-slate-600 border border-slate-100 group-hover:bg-slate-50 transition-colors uppercase tracking-wide">
                        Box Build
                      </span>
                    )}
                    {certifications.slice(0, 3).map(cert => (
                       <span key={cert.id} className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-amber-50/80 text-[9px] font-bold text-amber-700 border border-amber-100/50 group-hover:bg-amber-50 transition-colors uppercase tracking-wide">
                         {cert.certification_type}
                       </span>
                    ))}
                    {certifications.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium text-gray-400 bg-gray-50 border border-gray-100">
                            +{certifications.length - 3}
                        </span>
                    )}
                  </div>
                </div>

                {/* Arrow Action */}
                {viewMode === 'list' && (
                  <div className="hidden md:flex h-full items-center pl-2">
                     <div className="p-1.5 rounded-full text-gray-300 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all transform group-hover:translate-x-1">
                        <ChevronRight className="h-5 w-5" />
                     </div>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {canLoadMore && (
        <div className="flex justify-center pt-6 pb-2">
          <button
            type="button"
            onClick={() => setPagesLoaded(prev => Math.min(prev + 1, totalPages))}
            className="group px-6 py-2 bg-white border border-gray-200 rounded-full shadow-sm text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow transition-all flex items-center gap-1.5"
          >
            Show More
            <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </button>
        </div>
      )}
    </div>
  )
}

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m6 9 6 6 6-6"/>
    </svg>
  )
}