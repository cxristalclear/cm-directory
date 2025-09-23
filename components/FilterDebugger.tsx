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
    <div className="rounded-xl border border-dashed border-gray-300 bg-white p-4 text-sm text-gray-700">
      <h3 className="mb-2 font-semibold text-gray-900">Debug panel</h3>
      <dl className="space-y-1">
        <div className="flex justify-between">
          <dt>Active states</dt>
          <dd>{filters.states.join(", ") || "(none)"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Active capabilities</dt>
          <dd>{filters.capabilities.join(", ") || "(none)"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Production volume</dt>
          <dd>{filters.productionVolume ?? "(none)"}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Filtered company count</dt>
          <dd>{filteredCount}</dd>
        </div>
      </dl>
      <hr className="my-3 border-dashed" />
      <p className="text-xs text-gray-500">Known companies by state:</p>
      <ul className="mt-1 grid grid-cols-2 gap-1 text-xs text-gray-500">
        {Array.from(companiesByState.entries()).map(([state, count]) => (
          <li key={state}>
            {state}: {count}
          </li>
        ))}
      </ul>
    </div>
  )
}
