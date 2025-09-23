"use client"

import { useEffect, useMemo } from "react"
import Link from "next/link"
import { Building2, MapPin } from "lucide-react"
import { useFilters } from "@/contexts/FilterContext"
import type { Company } from "@/types/company"
import { filterCompanies } from "@/utils/filtering"

interface CompanyListProps {
  allCompanies: Company[]
  limit?: number
}

const DEFAULT_LIMIT = 9

export default function CompanyList({ allCompanies, limit = DEFAULT_LIMIT }: CompanyListProps) {
  const { filters, setFilteredCount } = useFilters()

  const filteredCompanies = useMemo(() => {
    return filterCompanies(allCompanies, filters)
  }, [allCompanies, filters])

  useEffect(() => {
    setFilteredCount(filteredCompanies.length)
  }, [filteredCompanies.length, setFilteredCount])

  const visibleCompanies = filteredCompanies.slice(0, limit)

  if (visibleCompanies.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-600">
        No companies match the selected filters. Adjust the filters to discover more partners.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {visibleCompanies.map((company) => {
        const location = company.facilities?.[0]
        return (
          <article
            key={company.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    <Link href={`/companies/${company.slug}`}>{company.company_name}</Link>
                  </h3>
                  {location && (
                    <p className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      {location.city}, {location.state}
                    </p>
                  )}
                </div>
              </div>
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">Verified</span>
            </div>
            {company.description && (
              <p className="mt-3 text-sm text-gray-600 line-clamp-3">{company.description}</p>
            )}
            {company.capabilities?.[0] && (
              <ul className="mt-4 flex flex-wrap gap-2 text-xs text-gray-700">
                {company.capabilities[0].pcb_assembly_smt && <li className="rounded-full bg-blue-100 px-2 py-1">SMT</li>}
                {company.capabilities[0].pcb_assembly_through_hole && (
                  <li className="rounded-full bg-blue-100 px-2 py-1">Through-Hole</li>
                )}
                {company.capabilities[0].cable_harness_assembly && (
                  <li className="rounded-full bg-blue-100 px-2 py-1">Cable Harness</li>
                )}
                {company.capabilities[0].box_build_assembly && (
                  <li className="rounded-full bg-blue-100 px-2 py-1">Box Build</li>
                )}
                {company.capabilities[0].prototyping && (
                  <li className="rounded-full bg-blue-100 px-2 py-1">Prototyping</li>
                )}
              </ul>
            )}
          </article>
        )
      })}
    </div>
  )
}
