'use client'

import { useMemo, useState, type ReactNode } from 'react'
import {
  ChevronDown,
  Filter as FilterIcon,
  MapPin,
  Settings,
  Layers,
  X,
} from 'lucide-react'

import { useFilters } from '@/contexts/FilterContext'
import type { Company } from '@/types/company'
import type { CapabilitySlug, ProductionVolume } from '@/lib/filters/url'
import { getStateName } from '@/utils/stateMapping'
import ActiveFiltersBar from './ActiveFiltersBar'

interface FilterSidebarProps {
  facetCounts?: CompanyFacetCounts | null
}

type FilterSection = 'states' | 'capabilities' | 'volume'

type FilterOption<T extends string> = {
  value: T
  label: string
  count: number
}

const CAPABILITY_LABELS: Record<CapabilitySlug, string> = {
  smt: 'SMT',
  through_hole: 'Through-Hole',
  cable_harness: 'Cable Harness',
  box_build: 'Box Build',
  prototyping: 'Prototyping',
}

const VOLUME_LABELS: Record<ProductionVolume, string> = {
  low: 'Low Volume',
  medium: 'Medium Volume',
  high: 'High Volume',
}

export default function FilterSidebar({ allCompanies }: FilterSidebarProps) {
  // === Keep NEW filter state + API ===
  const { filters, updateFilter, clearFilters } = useFilters()

  // OLD-style: mobile drawer toggle + section expanders
  const [isOpen, setIsOpen] = useState(false)
  const [expanded, setExpanded] = useState<Record<FilterSection, boolean>>({
    states: true,
    capabilities: true,
    volume: true,
  })

  // === Keep NEW counting logic (no cross-filter dependency) ===
  const stateOptions = useMemo((): FilterOption<string>[] => {
    const counts = new Map<string, number>()
    for (const company of allCompanies) {
      for (const facility of company.facilities ?? []) {
        const st = facility?.state?.toUpperCase()
        if (!st) continue
        counts.set(st, (counts.get(st) ?? 0) + 1)
      }
    }
    return Array.from(counts.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([state, count]) => ({
        value: state,
        label: getStateName(state) ?? state,
        count,
      }))
  }, [facetCounts, filters.states])

  const capabilityOptions = useMemo((): FilterOption<CapabilitySlug>[] => {
    const counts = new Map<CapabilitySlug, number>()
    for (const company of allCompanies) {
      const cap = company.capabilities?.[0]
      if (!cap) continue
      if (cap.pcb_assembly_smt)
        counts.set('smt', (counts.get('smt') ?? 0) + 1)
      if (cap.pcb_assembly_through_hole)
        counts.set('through_hole', (counts.get('through_hole') ?? 0) + 1)
      if (cap.cable_harness_assembly)
        counts.set('cable_harness', (counts.get('cable_harness') ?? 0) + 1)
      if (cap.box_build_assembly)
        counts.set('box_build', (counts.get('box_build') ?? 0) + 1)
      if (cap.prototyping)
        counts.set('prototyping', (counts.get('prototyping') ?? 0) + 1)
    }
    return (Object.keys(CAPABILITY_LABELS) as CapabilitySlug[]).map(value => ({
      value,
      label: CAPABILITY_LABELS[value],
      count: counts.get(value) ?? 0,
    }))
  }, [facetCounts, filters.capabilities])

  const volumeOptions = useMemo((): FilterOption<ProductionVolume>[] => {
    const counts = new Map<ProductionVolume, number>()
    for (const company of allCompanies) {
      const cap = company.capabilities?.[0]
      if (!cap) continue
      if (cap.low_volume_production)
        counts.set('low', (counts.get('low') ?? 0) + 1)
      if (cap.medium_volume_production)
        counts.set('medium', (counts.get('medium') ?? 0) + 1)
      if (cap.high_volume_production)
        counts.set('high', (counts.get('high') ?? 0) + 1)
    }
    return (Object.keys(VOLUME_LABELS) as ProductionVolume[]).map(value => ({
      value,
      label: VOLUME_LABELS[value],
      count: counts.get(value) ?? 0,
    }))
  }, [allCompanies])

  // === NEW behavior: updateFilter calls ===
  const toggleState = (value: string) => {
    const next = filters.states.includes(value)
      ? filters.states.filter(v => v !== value)
      : [...filters.states, value]
    updateFilter('states', next)
  }

  const toggleCapability = (value: CapabilitySlug) => {
    const next = filters.capabilities.includes(value)
      ? filters.capabilities.filter(v => v !== value)
      : [...filters.capabilities, value]
    updateFilter('capabilities', next)
  }

  const selectProductionVolume = (value: ProductionVolume) => {
    updateFilter('productionVolume', filters.productionVolume === value ? null : value)
  }

  const activeFilterCount =
    filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)

  const sectionIcon: Record<FilterSection, ReactNode> = {
    states: <MapPin className="h-4 w-4" />,
    capabilities: <Settings className="h-4 w-4" />,
    volume: <Layers className="h-4 w-4" />,
  }

  const Section = ({
    id,
    title,
    subtitleCount,
    children,
  }: {
    id: FilterSection
    title: string
    subtitleCount?: number
    children: React.ReactNode
  }) => (
    <div className="rounded-xl bg-gray-50 p-4 transition-all hover:bg-gray-100">
      <button
        type="button"
        onClick={() => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))}
        className="flex w-full items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-white p-2 shadow-sm">
            {sectionIcon[id]}
          </div>
          <div>
            <span className="font-semibold text-gray-900">{title}</span>
            {subtitleCount ? (
              <p className="text-xs text-blue-600">{subtitleCount} selected</p>
            ) : null}
          </div>
        </div>
        <ChevronDown
          className={`h-5 w-5 text-gray-400 transition-transform ${expanded[id] ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded[id] && <div className="mt-4 space-y-2">{children}</div>}
    </div>
  )

  return (
    <>
      {/* OLD-style: Mobile toggle with badge */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-30 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 p-4 text-white shadow-xl transition-all hover:shadow-2xl lg:hidden"
        aria-label="Open filters"
      >
        <FilterIcon className="h-6 w-6" />
        {activeFilterCount > 0 && (
          <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Drawer/Sidebar container */}
      <aside
        className={`fixed top-0 left-0 z-20 h-auto w-80 -translate-x-full border-r border-gray-100 bg-white shadow-xl transition-transform duration-300 ease-out lg:relative lg:w-full lg:translate-x-0 lg:rounded-xl lg:shadow-lg ${
          isOpen ? 'translate-x-0' : ''
        }`}
      >
        <div className="h-full overflow-y-auto p-6">
          {/* Header with Clear all */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-2 shadow-sm">
                <FilterIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                {activeFilterCount > 0 && (
                  <p className="text-xs text-gray-500">{activeFilterCount} active</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 hover:text-blue-700"
                >
                  Clear all
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 transition-colors hover:bg-gray-100 lg:hidden"
                aria-label="Close filters"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Keep NEW component that shows/removes active filters */}
          <div className="mb-6">
            <ActiveFiltersBar />
          </div>

          {/* Sections with OLD look, NEW data/behavior */}
          <div className="space-y-2">
            <Section id="states" title="States" subtitleCount={filters.states.length || undefined}>
              {stateOptions.map(({ value, label, count }) => {
                const checked = filters.states.includes(value)
                const disabled = count === 0 && !checked
                return (
                  <label
                    key={value}
                    className={`flex items-center justify-between rounded-lg p-2 transition-colors ${
                      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => !disabled && toggleState(value)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                        {label}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs transition-colors ${
                        checked
                          ? 'bg-blue-100 font-semibold text-blue-700'
                          : disabled
                          ? 'bg-gray-50 text-gray-400'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {count}
                    </span>
                  </label>
                )
              })}
            </Section>

            <Section id="capabilities" title="Capabilities" subtitleCount={filters.capabilities.length || undefined}>
              {capabilityOptions.map(({ value, label, count }) => {
                const checked = filters.capabilities.includes(value)
                const disabled = count === 0 && !checked
                return (
                  <label
                    key={value}
                    className={`flex items-center justify-between rounded-lg p-2 transition-colors ${
                      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => !disabled && toggleCapability(value)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                        {label}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs transition-colors ${
                        checked
                          ? 'bg-blue-100 font-semibold text-blue-700'
                          : disabled
                          ? 'bg-gray-50 text-gray-400'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {count}
                    </span>
                  </label>
                )
              })}
            </Section>

            <Section id="volume" title="Production Volume" subtitleCount={filters.productionVolume ? 1 : undefined}>
              {volumeOptions.map(({ value, label, count }) => {
                const checked = filters.productionVolume === value
                const disabled = count === 0 && !checked
                return (
                  <label
                    key={value}
                    className={`flex items-center justify-between rounded-lg p-2 transition-colors ${
                      disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-white'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <input
                        type="radio"
                        checked={checked}
                        disabled={disabled}
                        onChange={() => !disabled && selectProductionVolume(value)}
                        className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className={`text-sm font-medium ${disabled ? 'text-gray-400' : 'text-gray-700'}`}>
                        {label}
                      </span>
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs transition-colors ${
                        checked
                          ? 'bg-blue-100 font-semibold text-blue-700'
                          : disabled
                          ? 'bg-gray-50 text-gray-400'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      {count}
                    </span>
                  </label>
                )
              })}
            </Section>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/50 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
