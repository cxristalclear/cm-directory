"use client"

import { Fragment, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Building2, ChevronRight, MapPin, Users, Grid, List } from "lucide-react"

import { useFilters } from "@/contexts/FilterContext"
import ActiveFiltersBar from "@/components/ActiveFiltersBar"
import VenkelAd from "@/components/VenkelAd"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import { EmployeeCountRanges } from "@/types/company"
import { filterCompanies } from "@/utils/filtering"
import { getFacilityLocationLabel, getFacilityCountryCode, normalizeStateFilterValue } from "@/utils/locationFilters"

interface CompanyListProps {
  allCompanies: HomepageCompanyWithLocations[]
  limit?: number
  showInlineSearch?: boolean
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [sortBy, setSortBy] = useState<"relevance" | "employees" | "name">("relevance")

  const filteredCompanies = useMemo(() => {
    return filterCompanies(allCompanies, filters)
  }, [allCompanies, filters])

  useEffect(() => setPagesLoaded(1), [filters])
  useEffect(() => setFilteredCount(filteredCompanies.length), [filteredCompanies.length, setFilteredCount])

  const totalPages = Math.max(1, Math.ceil(filteredCompanies.length / limit))
  const visibleCompanies = useMemo(() => filteredCompanies.slice(0, pagesLoaded * limit), [filteredCompanies, pagesLoaded, limit])
  const sortedCompanies = useMemo(() => {
    if (sortBy === "relevance") return visibleCompanies

    const employeeRangeOrder = EmployeeCountRanges
    const getEmployeeRangeWeight = (range?: string | null) => {
      if (!range) return Number.POSITIVE_INFINITY
      const index = employeeRangeOrder.indexOf(range as typeof EmployeeCountRanges[number])
      return index === -1 ? Number.POSITIVE_INFINITY : index
    }

    return [...visibleCompanies].sort((companyA, companyB) => {
      if (sortBy === "employees") {
        const weightA = getEmployeeRangeWeight(companyA.employee_count_range)
        const weightB = getEmployeeRangeWeight(companyB.employee_count_range)
        if (weightA === weightB) return companyA.company_name.localeCompare(companyB.company_name)
        return weightA - weightB
      }

      return companyA.company_name.localeCompare(companyB.company_name)
    })
  }, [sortBy, visibleCompanies])
  const summary = createSummary(filteredCompanies.length, visibleCompanies.length)
  const canLoadMore = pagesLoaded < totalPages
  const shouldShowInlineAd = sortedCompanies.length >= 3
  const inlineAd = (
    <div
      key="venkel-inline-banner"
      className={`w-full${viewMode === "grid" ? " sm:col-span-2" : ""}`}
    >
      <VenkelAd size="banner" className="card-compact shadow-sm border border-gray-100" />
    </div>
  )

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
      <div className="flex flex-col gap-2 pb-2 border-b border-gray-200">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Results</h2>
            <span className="text-sm font-semibold text-gray-600">{summary}</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 justify-start sm:justify-end">
            <div className="flex items-center bg-gray-100/80 p-0.5 rounded-md border border-gray-200/50 backdrop-blur-sm">
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-[4px] transition-all duration-200 ${viewMode === "list" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"}`}
                title="List View"
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-[4px] transition-all duration-200 ${viewMode === "grid" ? "bg-white text-blue-600 shadow-sm ring-1 ring-black/5" : "text-gray-400 hover:text-gray-600 hover:bg-gray-200/50"}`}
                title="Grid View"
              >
                <Grid className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <label htmlFor="sort-by" className="text-xs font-semibold text-gray-600">Sort by:</label>
              <div className="relative">
                <select
                  id="sort-by"
                  value={sortBy}
                  onChange={event => setSortBy(event.target.value as "relevance" | "employees" | "name")}
                  className="appearance-none rounded-md border border-gray-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-gray-700 shadow-sm transition-colors focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  <option value="relevance">Relevance</option>
                  <option value="employees">Employees</option>
                  <option value="name">Name</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-gray-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <ActiveFiltersBar variant="inline" />
      </div>

      {/* List/Grid View */}
      <div className={viewMode === "list" ? "flex flex-col gap-3" : "grid grid-cols-1 sm:grid-cols-2 gap-4"}>
        {sortedCompanies.map((company, index) => {
          const facility = company.facilities?.[0]
          const location = getFacilityLocationLabel(facility)
          const normalizedRegionCode = facility
            ? normalizeStateFilterValue(facility.state_code) ?? normalizeStateFilterValue(facility.state_province) ?? normalizeStateFilterValue(facility.state)
            : null
          const normalizedCountryCode = facility ? getFacilityCountryCode(facility) : null
          const locationCodes = [normalizedRegionCode, normalizedCountryCode].filter(Boolean).join(", ")
          const locationLabel = location || "Location unavailable"
          const capabilityRecord = company.capabilities?.[0]
          const certifications = company.certifications ?? []
          const employeeCountLabel = company.employee_count_range ?? "Employees N/A"

          const capabilityHighlights = []
          if (capabilityRecord?.pcb_assembly_smt) capabilityHighlights.push({ label: "SMT Assembly", type: "capability" as const })
          if (capabilityRecord?.box_build_assembly) capabilityHighlights.push({ label: "Box Build", type: "capability" as const })
          if (capabilityRecord?.cable_harness_assembly) capabilityHighlights.push({ label: "Cable & Harness", type: "capability" as const })
          if (capabilityRecord?.prototyping) capabilityHighlights.push({ label: "Prototyping", type: "capability" as const })
          if (capabilityRecord?.turnkey_services) capabilityHighlights.push({ label: "Turnkey Services", type: "capability" as const })
          if (capabilityRecord?.supply_chain_management) capabilityHighlights.push({ label: "Supply Chain", type: "capability" as const })
          if (capabilityRecord?.pcb_assembly_through_hole) capabilityHighlights.push({ label: "Through-Hole", type: "capability" as const })
          if (capabilityRecord?.pcb_assembly_fine_pitch) capabilityHighlights.push({ label: "Fine Pitch", type: "capability" as const })
          if (capabilityRecord?.pcb_assembly_mixed) capabilityHighlights.push({ label: "Mixed Tech", type: "capability" as const })
          if (capabilityRecord?.testing_functional) capabilityHighlights.push({ label: "Functional Test", type: "capability" as const })
          if (capabilityRecord?.testing_ict) capabilityHighlights.push({ label: "ICT Testing", type: "capability" as const })
          if (capabilityRecord?.testing_rf_wireless) capabilityHighlights.push({ label: "RF/Wireless Test", type: "capability" as const })
          if (capabilityRecord?.testing_environmental) capabilityHighlights.push({ label: "Environmental Test", type: "capability" as const })
          if (capabilityRecord?.lead_free_soldering) capabilityHighlights.push({ label: "Lead-Free Solder", type: "capability" as const })
          if (capabilityRecord?.design_services) capabilityHighlights.push({ label: "Design Support", type: "capability" as const })
          if (capabilityRecord?.low_volume_production) capabilityHighlights.push({ label: "Low Volume", type: "capability" as const })
          if (capabilityRecord?.medium_volume_production) capabilityHighlights.push({ label: "Mid Volume", type: "capability" as const })
          if (capabilityRecord?.high_volume_production) capabilityHighlights.push({ label: "High Volume", type: "capability" as const })
          if (capabilityRecord?.consigned_services) capabilityHighlights.push({ label: "Consigned Build", type: "capability" as const })

          const certificationHighlights = certifications
            .map(cert => cert?.certification_type?.trim())
            .filter((cert): cert is string => Boolean(cert))
            .map(cert => ({ label: cert, type: "certification" as const }))

          const combinedHighlights = Array.from(
            new Map(
              [...capabilityHighlights, ...certificationHighlights].map(item => [`${item.type}:${item.label}`, item])
            ).values()
          )
          const visibleHighlights = combinedHighlights.slice(0, 3)
          const hiddenHighlightCount = Math.max(combinedHighlights.length - visibleHighlights.length, 0)

          return (
            <Fragment key={company.id}>
              <Link
                href={`/companies/${company.slug}`}
                prefetch
                className={`group relative block cursor-pointer rounded-xl border border-l-[3px] border-l-transparent border-gray-200 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-blue-300 hover:border-l-blue-500 hover:bg-blue-50/60 hover:shadow-lg ${
                  viewMode === "list" ? "p-2" : "p-4 h-full flex flex-col"
                }`}
              >
                {/* Hover Gradient Overlay */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-50/30 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

                <div className={`relative z-10 flex ${viewMode === "list" ? "flex-col md:flex-row gap-5 items-start" : "flex-col gap-4 items-start h-full"}`}>
                  {/* Compact Logo Placeholder */}
                  

                  {/* Content */}
                  <div className="flex-1 min-w-0 w-full flex flex-col gap-3 pl-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 space-y-2">
                        <h3
                          className={`font-semibold text-gray-900 group-hover:text-blue-600 transition-colors duration-300 ${viewMode === "list" ? "text-lg" : "text-base"}`}
                        >
                          {company.company_name}
                        </h3>

                        {company.dba_name && (
                          <p className="text-[11px] font-medium text-gray-400 group-hover:text-gray-500 transition-colors">
                            DBA: {company.dba_name}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2">
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200 group-hover:bg-white group-hover:ring-gray-300 transition-colors">
                            <MapPin className="h-3.5 w-3.5 text-gray-400 group-hover:text-blue-500 transition-colors" />
                            <span className="truncate max-w-[160px] sm:max-w-[220px]">{locationLabel}</span>
                            {locationCodes && <span className="text-gray-400 hidden sm:inline">({locationCodes})</span>}
                          </div>

                          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 px-2.5 py-1 text-[11px] font-medium text-gray-700 ring-1 ring-gray-200 group-hover:bg-white group-hover:ring-gray-300 transition-colors">
                            <Users className="h-3.5 w-3.5 text-gray-400 group-hover:text-purple-500 transition-colors" />
                            <span>{employeeCountLabel}</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {company.description && (
                      <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
                        {company.description}
                      </p>
                    )}

                    {combinedHighlights.length > 0 && (
                      <div className={`flex flex-wrap items-center gap-2.5 ${viewMode === "grid" ? "mt-auto" : ""}`}>
                        {visibleHighlights.map(highlight => {
                          const isCapability = highlight.type === "capability"
                          const badgeStyles = isCapability
                            ? "border-violet-200 bg-violet-50 text-violet-700"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                          return (
                            <span
                              key={`${highlight.type}-${highlight.label}`}
                              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${badgeStyles}`}
                            >
                              {highlight.label}
                            </span>
                          )
                        })}
                        {hiddenHighlightCount > 0 && (
                          <span className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 hover:underline decoration-dashed underline-offset-2">
                            +{hiddenHighlightCount} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Arrow Action */}
                  {viewMode === "list" && (
                    <div className="hidden md:flex h-full items-center pl-2">
                      <div className="p-1.5 rounded-full text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all group-hover:translate-x-1">
                        <ChevronRight className="h-5 w-5" />
                      </div>
                    </div>
                  )}
                </div>
              </Link>

              {shouldShowInlineAd && index === 2 && inlineAd}
            </Fragment>
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
