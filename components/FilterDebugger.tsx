'use client'

import { useFilters } from '../contexts/FilterContext'
import type { CompanyListItem } from '../types/company'

interface FilterDebuggerProps {
  companies: CompanyListItem[]
  totalCount: number
}

export default function FilterDebugger({ companies, totalCount }: FilterDebuggerProps) {
  const { filters, filteredCount } = useFilters()

  const activeStates = filters.states
  const activeCapabilities = filters.capabilities
  const hasVolume = filters.productionVolume !== null

  return (
    <div className="fixed bottom-20 right-4 z-50 max-w-md rounded-lg border-2 border-blue-500 bg-white p-4 shadow-xl">
      <h3 className="mb-2 text-sm font-bold text-blue-700">Filter Debug Info</h3>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="font-semibold">Companies (filtered):</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">{filteredCount}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Page companies:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">{companies.length}</span>
        </div>

        <div className="flex justify-between">
          <span className="font-semibold">Total available:</span>
          <span className="rounded bg-gray-100 px-2 py-1 font-mono">{totalCount}</span>
        </div>

        <div className="border-t pt-2">
          <div className="mb-1 font-semibold">Active Filters</div>
          {activeStates.length === 0 && activeCapabilities.length === 0 && !hasVolume ? (
            <div className="text-gray-500">None</div>
          ) : (
            <ul className="space-y-1 text-gray-700">
              {activeStates.map(state => (
                <li key={`state-${state}`}>State: {state}</li>
              ))}
              {activeCapabilities.map(capability => (
                <li key={`cap-${capability}`}>Capability: {capability}</li>
              ))}
              {hasVolume && filters.productionVolume && (
                <li>Production Volume: {filters.productionVolume}</li>
              )}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
