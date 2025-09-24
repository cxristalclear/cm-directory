"use client"

import { useMemo } from "react"
import { useFilters } from "@/contexts/FilterContext"
import type { Company } from "@/types/company"

interface FilterDebuggerProps {
  allCompanies: Company[]
}

export default function FilterDebugger({ allCompanies }: FilterDebuggerProps) {
  const { filters, filteredCount } = useFilters()

  const companiesByState = useMemo(() => {
    const counts = new Map<string, number>()
    for (const company of allCompanies) {
      for (const facility of company.facilities ?? []) {
        if (facility?.state) {
          counts.set(facility.state, (counts.get(facility.state) ?? 0) + 1)
        }
      }
    }
    return counts
  }, [allCompanies])

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md rounded-lg border-2 border-blue-500 bg-white p-4 shadow-xl">
      <h3 className="mb-2 text-sm font-bold text-blue-700">Filter Debug Info</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Filtered companies:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">{filteredCount}</span>
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
          <div className="mb-1 font-semibold text-blue-700">Known companies by state</div>
          <ul className="grid grid-cols-2 gap-1 text-gray-700">
            {Array.from(companiesByState.entries()).map(([state, count]) => (
              <li key={state}>
                {state}: {count}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
