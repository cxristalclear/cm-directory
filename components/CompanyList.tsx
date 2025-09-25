"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { Award, Building2, ChevronRight, MapPin, Users } from "lucide-react"

import { useFilters } from "@/contexts/FilterContext"
import type { Company } from "@/types/company"
interface CompanyListProps {
  companies: Company[]
  totalCount: number
  limit?: number
}

const DEFAULT_LIMIT = 9

function createSummary(totalCount: number, visibleCount: number): string {
  if (totalCount === 0) {
    return "No results"
  }

  if (visibleCount === totalCount) {
    return `${totalCount} results`
  }

  return `${visibleCount} of ${totalCount} results`
}

export default function CompanyList({ companies, totalCount, limit = DEFAULT_LIMIT }: CompanyListProps) {
  const { setFilteredCount } = useFilters()

  useEffect(() => {
    setFilteredCount(totalCount)
  }, [setFilteredCount, totalCount])

  const visibleCompanies = useMemo(() => {
    return companies.slice(0, limit)
  }, [companies, limit])

  const summary = createSummary(totalCount, visibleCompanies.length)

  if (visibleCompanies.length === 0) {
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
      <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Companies Directory</h2>
        <span className="text-sm font-medium text-gray-600">{summary}</span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {visibleCompanies.map(company => {
          const facility = company.facilities?.[0]
          const location = facility?.city && facility?.state ? `${facility.city}, ${facility.state}` : "Multiple"
          const capabilityRecord = company.capabilities?.[0]
          const industries = company.industries ?? []
          const certifications = company.certifications ?? []

          return (
            <Link
              key={company.id}
              href={`/companies/${company.slug}`}
              prefetch
              className="group block overflow-hidden rounded-xl border border-gray-200/50 bg-white shadow-sm transition hover:border-blue-200/50 hover:shadow-lg"
            >
              <div className="p-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 transition group-hover:scale-105">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-1 truncate text-lg font-bold text-gray-900 transition-colors group-hover:text-blue-600">
                        {company.company_name}
                      </h3>
                      {company.dba_name && (
                        <p className="truncate text-sm text-gray-500">DBA: {company.dba_name}</p>
                      )}
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>

                {company.description && (
                  <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600">{company.description}</p>
                )}

                <div className="mb-4 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
                      <MapPin className="h-3 w-3 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500">Location</p>
                      <p className="truncate text-sm font-semibold text-gray-900">{location}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-100">
                      <Users className="h-3 w-3 text-purple-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-gray-500">Employees</p>
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {company.employee_count_range ?? "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {capabilityRecord && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Key Capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {capabilityRecord.pcb_assembly_smt && (
                        <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">SMT</span>
                      )}
                      {capabilityRecord.pcb_assembly_through_hole && (
                        <span className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">Through-Hole</span>
                      )}
                      {capabilityRecord.box_build_assembly && (
                        <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">Box Build</span>
                      )}
                      {capabilityRecord.prototyping && (
                        <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Prototyping</span>
                      )}
                      {capabilityRecord.cable_harness_assembly && (
                        <span className="rounded-md bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-800">Cable Harness</span>
                      )}
                    </div>
                  </div>
                )}

                {industries.length > 0 && (
                  <div className="mb-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Industries</p>
                    <div className="flex flex-wrap gap-1">
                      {industries.slice(0, 3).map(industry => (
                        <span
                          key={`${company.id}-industry-${industry.id ?? industry.industry_name}`}
                          className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700"
                        >
                          {industry.industry_name}
                        </span>
                      ))}
                      {industries.length > 3 && (
                        <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">
                          +{industries.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div>
                    <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Award className="h-3 w-3" />
                      Certifications
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {certifications.slice(0, 4).map(certification => (
                        <span
                          key={`${company.id}-cert-${certification.id ?? certification.certification_type}`}
                          className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800"
                        >
                          {certification.certification_type}
                        </span>
                      ))}
                      {certifications.length > 4 && (
                        <span className="rounded-md bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-800">
                          +{certifications.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
