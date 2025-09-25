"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Building2, ChevronRight, MapPin } from "lucide-react"

import { useFilters } from "@/contexts/FilterContext"
import type { ListingCompany } from "@/types/company"

interface CompanyListProps {
  companies: ListingCompany[]
  totalCount: number
  pageInfo?: CompanySearchPageInfo
}

function primaryLocation(company: Company): string {
  const facility = company.facilities?.find((entry) => entry?.is_primary) ?? company.facilities?.[0]
  if (facility?.city && facility?.state) {
    return `${facility.city}, ${facility.state}`
  }
  if (facility?.state) {
    return facility.state
  }
  return "Location not available"
}

function capabilityBadges(company: Company): Array<{ key: string; label: string }> {
  const capabilityRecord = company.capabilities?.[0]
  if (!capabilityRecord) {
    return []
  }

  const badges: Array<{ key: string; label: string }> = []
  if (capabilityRecord.pcb_assembly_smt) {
    badges.push({ key: "smt", label: "SMT" })
  }
  if (capabilityRecord.box_build_assembly) {
    badges.push({ key: "box_build", label: "Box Build" })
  }
  if (capabilityRecord.cable_harness_assembly) {
    badges.push({ key: "cable", label: "Cable Harness" })
  }
  if (capabilityRecord.prototyping) {
    badges.push({ key: "proto", label: "Prototyping" })
  }
  return badges
}

export default function CompanyList({ companies, totalCount, pageInfo }: CompanyListProps) {
  const { setFilteredCount } = useFilters()

  useEffect(() => {
    setFilteredCount(totalCount)
  }, [setFilteredCount, totalCount])

  if (companies.length === 0) {

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
        <span className="text-sm font-medium text-gray-600">
          Showing {companies.length} of {totalCount} results
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">

        {visibleCompanies.map(company => {
          const facility = company.facilities[0]
          const location = facility?.city && facility?.state ? `${facility.city}, ${facility.state}` : "Multiple"
          const capabilityRecord = company.capabilities[0]
          const industries = company.industries
          const certifications = company.certifications

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
                      <p className="text-xs font-medium uppercase tracking-wide text-green-600">Active Vendor</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 flex-shrink-0 text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600" />
                </div>

                <div className="mb-4 flex items-center gap-2 rounded-lg bg-gray-50 p-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-100">
                    <MapPin className="h-3 w-3 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-gray-500">Primary Location</p>
                    <p className="truncate text-sm font-semibold text-gray-900">{location}</p>
                  </div>
                </div>

                {badges.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Highlighted capabilities</p>
                    <div className="flex flex-wrap gap-1">
                      {badges.map((badge) => (
                        <span
                          key={`${company.id}-${badge.key}`}
                          className="rounded-md bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
                        >
                          {badge.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Link>
          )
        })}
      </div>

      {pageInfo && (pageInfo.hasNext || pageInfo.hasPrev) && <Pagination pageInfo={pageInfo} />}
    </div>
  )
}
