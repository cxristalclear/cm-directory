"use client"

import { useMemo } from "react"
import { useFilters } from "@/contexts/FilterContext"
import type { CompanyFacetCounts } from "@/lib/queries/companySearch"

interface FilterDebuggerProps {
  facetCounts?: CompanyFacetCounts | null
  totalCount: number
}

export default function FilterDebugger({ facetCounts, totalCount }: FilterDebuggerProps) {
  const { filters, filteredCount } = useFilters()

  const stateEntries = useMemo(() => {
    return facetCounts?.states ?? []
  }, [facetCounts])

  const capabilityEntries = useMemo(() => {
    return facetCounts?.capabilities ?? []
  }, [facetCounts])

  const volumeEntries = useMemo(() => {
    return facetCounts?.productionVolume ?? []
  }, [facetCounts])

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md rounded-lg border-2 border-blue-500 bg-white p-4 shadow-xl">
      <h3 className="mb-2 text-sm font-bold text-blue-700">Filter Debug Info</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Filtered companies:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">{filteredCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Total available:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">{totalCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Active states:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">
            {filters.states.length > 0 ? filters.states.join(", ") : "(none)"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Active capabilities:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">
            {filters.capabilities.length > 0 ? filters.capabilities.join(", ") : "(none)"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Production volume:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">{filters.productionVolume ?? "(none)"}</span>
        </div>

        <div className="border-t pt-2">
          <div className="mb-1 font-semibold text-blue-700">Facet counts</div>
          <div className="space-y-2 text-gray-700">
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">States</div>
              <ul className="grid grid-cols-2 gap-1">
                {stateEntries.map(({ code, count }) => (
                  <li key={code}>
                    {code}: {count}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Capabilities</div>
              <ul className="grid grid-cols-2 gap-1">
                {capabilityEntries.map(({ slug, count }) => (
                  <li key={slug}>
                    {slug}: {count}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="text-xs font-semibold uppercase text-gray-500">Production Volume</div>
              <ul className="grid grid-cols-2 gap-1">
                {volumeEntries.map(({ level, count }) => (
                  <li key={level}>
                    {level}: {count}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
