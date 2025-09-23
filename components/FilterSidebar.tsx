'use client'

import { useState } from 'react'
import { ChevronDown, Filter as FilterIcon } from 'lucide-react'

import { useFilters } from '../contexts/FilterContext'
import type { ProductionVolume } from '../types/company'

type FilterOption<T extends string> = {
  value: T
  label: string
  count: number
}

interface FilterSidebarProps {
  stateOptions: FilterOption<string>[]
  capabilityOptions: FilterOption<string>[]
  volumeOptions: FilterOption<ProductionVolume>[]
}

type FilterSection = 'states' | 'capabilities' | 'volume'

export default function FilterSidebar({
  stateOptions,
  capabilityOptions,
  volumeOptions,
}: FilterSidebarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()
  const [expandedSections, setExpandedSections] = useState<Record<FilterSection, boolean>>({
    states: true,
    capabilities: true,
    volume: true,
  })

  const toggleSection = (section: FilterSection) => {
    setExpandedSections(previous => ({
      ...previous,
      [section]: !previous[section],
    }))
  }

  const toggleMultiValue = (section: 'states' | 'capabilities', value: string) => {
    const current = filters[section]
    const nextValues = current.includes(value)
      ? current.filter(entry => entry !== value)
      : [...current, value]
    updateFilter(section, nextValues)
  }

  const selectProductionVolume = (value: ProductionVolume) => {
    updateFilter('productionVolume', filters.productionVolume === value ? null : value)
  }

  const activeFilterCount =
    filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)

  return (
    <aside className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-gray-900">
            <FilterIcon className="h-5 w-5 text-blue-600" />
            <span className="text-lg font-semibold">Filters</span>
          </div>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear all
            </button>
          )}
        </div>

        <section>
          <button
            type="button"
            onClick={() => toggleSection('states')}
            className="flex w-full items-center justify-between py-2 text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900">States</h3>
              {filters.states.length > 0 && (
                <p className="text-xs text-blue-600">{filters.states.length} selected</p>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                expandedSections.states ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.states && (
            <div className="space-y-2">
              {stateOptions.map(option => {
                const checked = filters.states.includes(option.value)
                return (
                  <label key={option.value} className="flex items-center justify-between text-sm text-gray-700">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        value={option.value}
                        onChange={() => toggleMultiValue('states', option.value)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">{option.count}</span>
                  </label>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-4">
          <button
            type="button"
            onClick={() => toggleSection('capabilities')}
            className="flex w-full items-center justify-between py-2 text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Capabilities</h3>
              {filters.capabilities.length > 0 && (
                <p className="text-xs text-blue-600">{filters.capabilities.length} selected</p>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                expandedSections.capabilities ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.capabilities && (
            <div className="space-y-2">
              {capabilityOptions.map(option => {
                const checked = filters.capabilities.includes(option.value)
                return (
                  <label key={option.value} className="flex items-center justify-between text-sm text-gray-700">
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        value={option.value}
                        onChange={() => toggleMultiValue('capabilities', option.value)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">{option.count}</span>
                  </label>
                )
              })}
            </div>
          )}
        </section>

        <section className="mt-4">
          <button
            type="button"
            onClick={() => toggleSection('volume')}
            className="flex w-full items-center justify-between py-2 text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Production Volume</h3>
              {filters.productionVolume && (
                <p className="text-xs text-blue-600">1 selected</p>
              )}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                expandedSections.volume ? 'rotate-180' : ''
              }`}
            />
          </button>
          {expandedSections.volume && (
            <div className="space-y-2">
              {volumeOptions.map(option => {
                const checked = filters.productionVolume === option.value
                return (
                  <label key={option.value} className="flex items-center justify-between text-sm text-gray-700">
                    <span className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={checked}
                        value={option.value}
                        onChange={() => selectProductionVolume(option.value)}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      {option.label}
                    </span>
                    <span className="text-xs text-gray-500">{option.count}</span>
                  </label>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </aside>
  )
}
