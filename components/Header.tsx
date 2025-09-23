"use client"

import Link from "next/link"
import { useMemo } from "react"
import { Building2 } from "lucide-react"
import { useFilters } from "@/contexts/FilterContext"
import type { Company } from "@/types/company"

interface HeaderProps {
  companies?: Company[]
}

export default function Header({ companies = [] }: HeaderProps) {
  const { filters, filteredCount, clearFilters } = useFilters()

  const activeFilters = useMemo(() => {
    return filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)
  }, [filters.capabilities.length, filters.productionVolume, filters.states.length])

  return (
    <header className="border-b border-gray-100 bg-blue-900 text-white">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
            <Building2 className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-semibold">CM Directory</span>
            <span className="block text-xs text-blue-100">Connecting engineers with verified partners</span>
          </span>
        </Link>
        <div className="text-right text-sm">
          <div className="font-medium">{filteredCount} of {companies.length} companies visible</div>
          {activeFilters > 0 ? (
            <button
              type="button"
              onClick={clearFilters}
              className="mt-1 text-xs font-medium text-white underline"
            >
              Clear {activeFilters} active filter{activeFilters > 1 ? "s" : ""}
            </button>
          ) : (
            <p className="mt-1 text-xs text-blue-100">Add filters to narrow down the results</p>
          )}
        </div>
      </div>
    </header>
  )
}
