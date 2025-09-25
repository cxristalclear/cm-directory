"use client"

import { useMemo, useState } from "react"
import { ChevronDown, Filter as FilterIcon } from "lucide-react"

import { useFilters } from "@/contexts/FilterContext"
import type { Company } from "@/types/company"
import type { CompanyFacetCounts } from "@/lib/queries/companySearch"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import { getStateName } from "@/utils/stateMapping"

interface FilterSidebarProps {
  allCompanies?: Company[]
  facetCounts?: CompanyFacetCounts | null
}

type FilterSection = "states" | "capabilities" | "volume"

type FilterOption<T extends string> = {
  value: T
  label: string
  count: number
}

const CAPABILITY_LABELS: Record<CapabilitySlug, string> = {
  smt: "SMT",
  through_hole: "Through-Hole",
  cable_harness: "Cable Harness",
  box_build: "Box Build",
  prototyping: "Prototyping",
}

const VOLUME_LABELS: Record<ProductionVolume, string> = {
  low: "Low Volume",
  medium: "Medium Volume",
  high: "High Volume",
}

export default function FilterSidebar({ allCompanies = [], facetCounts }: FilterSidebarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()
  const [expandedSections, setExpandedSections] = useState<Record<FilterSection, boolean>>({
    states: true,
    capabilities: true,
    volume: true,
  })

  const stateOptions = useMemo((): FilterOption<string>[] => {
    if (facetCounts) {
      const counts = new Map<string, number>()
      for (const { code, count } of facetCounts.states) {
        counts.set(code, count)
      }
      for (const state of filters.states) {
        const normalized = state.toUpperCase()
        if (!counts.has(normalized)) {
          counts.set(normalized, 0)
        }
      }

      return Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([state, count]) => ({
          value: state,
          label: getStateName(state) ?? state,
          count,
        }))
    }

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
        value: state,
        label: getStateName(state) ?? state,
        count,
      }))
  }, [allCompanies, facetCounts, filters.states])

  const capabilityOptions = useMemo((): FilterOption<CapabilitySlug>[] => {
    if (facetCounts) {
      const counts = new Map<CapabilitySlug, number>()
      for (const { slug, count } of facetCounts.capabilities) {
        counts.set(slug, count)
      }
      for (const capability of filters.capabilities) {
        if (!counts.has(capability)) {
          counts.set(capability, 0)
        }
      }
      return (Object.keys(CAPABILITY_LABELS) as CapabilitySlug[]).map(value => ({
        value,
        label: CAPABILITY_LABELS[value],
        count: counts.get(value) ?? 0,
      }))
    }

    const counts = new Map<CapabilitySlug, number>()
    for (const company of allCompanies) {
      const capabilityRecord = company.capabilities?.[0]
      if (!capabilityRecord) {
        continue
      }

      if (capabilityRecord.pcb_assembly_smt) {
        counts.set("smt", (counts.get("smt") ?? 0) + 1)
      }
      if (capabilityRecord.pcb_assembly_through_hole) {
        counts.set("through_hole", (counts.get("through_hole") ?? 0) + 1)
      }
      if (capabilityRecord.cable_harness_assembly) {
        counts.set("cable_harness", (counts.get("cable_harness") ?? 0) + 1)
      }
      if (capabilityRecord.box_build_assembly) {
        counts.set("box_build", (counts.get("box_build") ?? 0) + 1)
      }
      if (capabilityRecord.prototyping) {
        counts.set("prototyping", (counts.get("prototyping") ?? 0) + 1)
      }
    }

    return (Object.keys(CAPABILITY_LABELS) as CapabilitySlug[]).map(value => ({
      value,
      label: CAPABILITY_LABELS[value],
      count: counts.get(value) ?? 0,
    }))
  }, [allCompanies, facetCounts, filters.capabilities])

  const volumeOptions = useMemo((): FilterOption<ProductionVolume>[] => {
    if (facetCounts) {
      const counts = new Map<ProductionVolume, number>()
      for (const { level, count } of facetCounts.productionVolume) {
        counts.set(level, count)
      }
      if (filters.productionVolume && !counts.has(filters.productionVolume)) {
        counts.set(filters.productionVolume, 0)
      }
      return (Object.keys(VOLUME_LABELS) as ProductionVolume[]).map(value => ({
        value,
        label: VOLUME_LABELS[value],
        count: counts.get(value) ?? 0,
      }))
    }

    const counts = new Map<ProductionVolume, number>()
    for (const company of allCompanies) {
      const capabilityRecord = company.capabilities?.[0]
      if (!capabilityRecord) {
        continue
      }

      if (capabilityRecord.low_volume_production) {
        counts.set("low", (counts.get("low") ?? 0) + 1)
      }
      if (capabilityRecord.medium_volume_production) {
        counts.set("medium", (counts.get("medium") ?? 0) + 1)
      }
      if (capabilityRecord.high_volume_production) {
        counts.set("high", (counts.get("high") ?? 0) + 1)
      }
    }

    return (Object.keys(VOLUME_LABELS) as ProductionVolume[]).map(value => ({
      value,
      label: VOLUME_LABELS[value],
      count: counts.get(value) ?? 0,
    }))
  }, [allCompanies, facetCounts, filters.productionVolume])

  const toggleSection = (section: FilterSection) => {
    setExpandedSections(previous => ({
      ...previous,
      [section]: !previous[section],
    }))
  }

  const toggleState = (value: string) => {
    const nextStates = filters.states.includes(value)
      ? filters.states.filter(entry => entry !== value)
      : [...filters.states, value]
    updateFilter("states", nextStates)
  }

  const toggleCapability = (value: CapabilitySlug) => {
    const nextCapabilities = filters.capabilities.includes(value)
      ? filters.capabilities.filter(entry => entry !== value)
      : [...filters.capabilities, value]
    updateFilter("capabilities", nextCapabilities)
  }

  const selectProductionVolume = (value: ProductionVolume) => {
    updateFilter("productionVolume", filters.productionVolume === value ? null : value)
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
              type="button"
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
            onClick={() => toggleSection("states")}
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
                expandedSections.states ? "rotate-180" : ""
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
                        onChange={() => toggleState(option.value)}
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
            onClick={() => toggleSection("capabilities")}
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
                expandedSections.capabilities ? "rotate-180" : ""
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
                        onChange={() => toggleCapability(option.value)}
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
            onClick={() => toggleSection("volume")}
            className="flex w-full items-center justify-between py-2 text-left"
          >
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Production Volume</h3>
              {filters.productionVolume && <p className="text-xs text-blue-600">1 selected</p>}
            </div>
            <ChevronDown
              className={`h-4 w-4 text-gray-500 transition-transform ${
                expandedSections.volume ? "rotate-180" : ""
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
