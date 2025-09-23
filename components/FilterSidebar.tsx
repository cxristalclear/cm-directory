"use client"

import { useMemo } from "react"
import { useFilters } from "@/contexts/FilterContext"
import type { Company } from "@/types/company"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import { getStateName } from "@/utils/stateMapping"

interface FilterSidebarProps {
  allCompanies: Company[]
}

const CAPABILITY_OPTIONS: { value: CapabilitySlug; label: string; description: string }[] = [
  { value: "smt", label: "SMT Assembly", description: "Surface-mount technology" },
  { value: "through_hole", label: "Through-Hole", description: "Wave and selective soldering" },
  { value: "cable_harness", label: "Cable Harness", description: "Wire harness fabrication" },
  { value: "box_build", label: "Box Build", description: "Final system integration" },
  { value: "prototyping", label: "Prototyping", description: "Engineering samples and quick-turn" },
]

const PRODUCTION_VOLUMES: { value: ProductionVolume; label: string; helper: string }[] = [
  { value: "low", label: "Low volume", helper: "Pilot runs and NPI" },
  { value: "medium", label: "Medium volume", helper: "1k–100k units" },
  { value: "high", label: "High volume", helper: "Automated, >100k units" },
]

export default function FilterSidebar({ allCompanies }: FilterSidebarProps) {
  const { filters, updateFilter, clearFilters, filteredCount } = useFilters()

  const stateOptions = useMemo(() => {
    const counts = new Map<string, number>()

    for (const company of allCompanies) {
      for (const facility of company.facilities ?? []) {
        if (facility?.state) {
          const state = facility.state.toUpperCase()
          counts.set(state, (counts.get(state) ?? 0) + 1)
        }
      }
    }

    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([state, count]) => ({
        state,
        count,
        label: getStateName(state) ?? state,
      }))
  }, [allCompanies])

  const toggleState = (state: string) => {
    updateFilter(
      "states",
      filters.states.includes(state)
        ? filters.states.filter((value) => value !== state)
        : [...filters.states, state],
    )
  }

  const toggleCapability = (capability: CapabilitySlug) => {
    updateFilter(
      "capabilities",
      filters.capabilities.includes(capability)
        ? filters.capabilities.filter((value) => value !== capability)
        : [...filters.capabilities, capability],
    )
  }

  const selectProductionVolume = (value: ProductionVolume) => {
    updateFilter("productionVolume", filters.productionVolume === value ? null : value)
  }

  const selectedCount = filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)

  return (
    <aside className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <p className="text-sm text-gray-500">{filteredCount} companies match your criteria</p>
        </div>
        {selectedCount > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-sm font-medium text-blue-700 hover:text-blue-800"
          >
            Clear
          </button>
        )}
      </div>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">States</h3>
          <p className="text-xs text-gray-500">Choose the states where you need coverage</p>
        </header>
        <ul className="space-y-2">
          {stateOptions.map(({ state, label, count }) => {
            const checked = filters.states.includes(state)
            return (
              <li key={state}>
                <label className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleState(state)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </span>
                  <span className="text-xs text-gray-500">{count}</span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Capabilities</h3>
          <p className="text-xs text-gray-500">Select the services you require</p>
        </header>
        <ul className="space-y-2">
          {CAPABILITY_OPTIONS.map(({ value, label, description }) => {
            const checked = filters.capabilities.includes(value)
            return (
              <li key={value}>
                <label className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleCapability(value)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span>
                    <span className="block text-sm font-medium text-gray-800">{label}</span>
                    <span className="block text-xs text-gray-500">{description}</span>
                  </span>
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <header className="mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Production volume</h3>
          <p className="text-xs text-gray-500">Match manufacturing scale to demand</p>
        </header>
        <div className="space-y-2">
          {PRODUCTION_VOLUMES.map(({ value, label, helper }) => {
            const checked = filters.productionVolume === value
            return (
              <label key={value} className="flex items-start gap-2">
                <input
                  type="radio"
                  name="production-volume"
                  checked={checked}
                  onChange={() => selectProductionVolume(value)}
                  className="mt-1 h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>
                  <span className="block text-sm font-medium text-gray-800">{label}</span>
                  <span className="block text-xs text-gray-500">{helper}</span>
                </span>
              </label>
            )
          })}
        </div>
      </section>
    </aside>
  )
}
