"use client"

import Link from "next/link"
import { useMemo } from "react"

import type { CompanyFacetCounts } from "@/lib/queries/companySearch"
import {
  CANONICAL_CAPABILITIES,
  buildFilterUrl,
  isCanonicalCapability,
  type CanonicalCapability,
  type FilterUrlState,
  type ProductionVolume,
} from "@/lib/filters/url"
import { useFilters } from "@/contexts/FilterContext"
import { STATE_NAMES, getStateName } from "@/utils/stateMapping"

type FilterSidebarProps = {
  basePath: string
  filters: FilterUrlState
  facetCounts?: CompanyFacetCounts | null
  clearHref?: string
}

type FilterOption<T extends string> = {
  value: T
  label: string
  count: number
  selected: boolean
}

const CAPABILITY_LABELS: Record<CanonicalCapability, string> = {
  smt: "SMT",
  through_hole: "Through-Hole",
  mixed: "Mixed Tech",
  fine_pitch: "Fine Pitch",
  cable_harness: "Cable Harness",
  box_build: "Box Build",
}

const VOLUME_LABELS: Record<ProductionVolume, string> = {
  low: "Low Volume",
  medium: "Medium Volume",
  high: "High Volume",
}

function buildStateOptions(filters: FilterUrlState, facetCounts?: CompanyFacetCounts | null): FilterOption<string>[] {
  const counts = new Map<string, number>()
  if (facetCounts) {
    for (const { code, count } of facetCounts.states) {
      counts.set(code.toUpperCase(), count)
    }
  }

  for (const state of filters.states) {
    const normalized = state.toUpperCase()
    if (!counts.has(normalized)) {
      counts.set(normalized, 0)
    }
  }

  if (!facetCounts) {
    for (const code of Object.keys(STATE_NAMES)) {
      if (!counts.has(code)) {
        counts.set(code, 0)
      }
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([code, count]) => ({
      value: code,
      label: getStateName(code) ?? code,
      count,
      selected: filters.states.includes(code),
    }))
}

function buildCapabilityOptions(
  filters: FilterUrlState,
  facetCounts?: CompanyFacetCounts | null,
): FilterOption<CanonicalCapability>[] {
  const counts = new Map<CanonicalCapability, number>()
  if (facetCounts) {
    for (const { slug, count } of facetCounts.capabilities) {
      if (isCanonicalCapability(slug)) {
        counts.set(slug, count)
      }
    }
  }

  for (const capability of filters.capabilities) {
    if (!counts.has(capability)) {
      counts.set(capability, 0)
    }
  }

  return CANONICAL_CAPABILITIES.map((slug) => ({
    value: slug,
    label: CAPABILITY_LABELS[slug],
    count: counts.get(slug) ?? 0,
    selected: filters.capabilities.includes(slug),
  }))
}

function buildVolumeOptions(
  filters: FilterUrlState,
  facetCounts?: CompanyFacetCounts | null,
): FilterOption<ProductionVolume>[] {
  const counts = new Map<ProductionVolume, number>()
  if (facetCounts) {
    for (const { level, count } of facetCounts.productionVolume) {
      counts.set(level, count)
    }
  }

  if (filters.productionVolume && !counts.has(filters.productionVolume)) {
    counts.set(filters.productionVolume, 0)
  }

  return (Object.keys(VOLUME_LABELS) as ProductionVolume[]).map((level) => ({
    value: level,
    label: VOLUME_LABELS[level],
    count: counts.get(level) ?? 0,
    selected: filters.productionVolume === level,
  }))
}

export default function FilterSidebar({ basePath, filters, facetCounts, clearHref }: FilterSidebarProps) {
  const { filters: liveFilters, updateFilter } = useFilters()
  const currentFilters = liveFilters ?? filters

  const stateOptions = useMemo(
    () => buildStateOptions(currentFilters, facetCounts),
    [currentFilters, facetCounts],
  )
  const capabilityOptions = useMemo(
    () => buildCapabilityOptions(currentFilters, facetCounts),
    [currentFilters, facetCounts],
  )
  const volumeOptions = useMemo(
    () => buildVolumeOptions(currentFilters, facetCounts),
    [currentFilters, facetCounts],
  )

  const hasActiveFilters =
    currentFilters.states.length > 0 ||
    currentFilters.capabilities.length > 0 ||
    currentFilters.productionVolume !== null

  const clearUrl = clearHref ?? basePath

  const handleStateToggle = (state: string) => {
    const normalized = state.toUpperCase()
    const selected = currentFilters.states.includes(normalized)
    const nextStates = selected
      ? currentFilters.states.filter((value) => value !== normalized)
      : [...currentFilters.states, normalized]
    updateFilter("states", nextStates)
  }

  const toggleCapability = (slug: CanonicalCapability) => {
    const selected = currentFilters.capabilities.includes(slug)
    const nextCapabilities = selected
      ? currentFilters.capabilities.filter((value) => value !== slug)
      : [...currentFilters.capabilities, slug]
    return buildFilterUrl(basePath, { ...currentFilters, capabilities: nextCapabilities })
  }

  const selectVolume = (level: ProductionVolume) => {
    const nextVolume = currentFilters.productionVolume === level ? null : level
    return buildFilterUrl(basePath, { ...currentFilters, productionVolume: nextVolume })
  }

  return (
    <aside className="space-y-6">
      <div className="rounded-xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          {hasActiveFilters && (
            <Link
              href={clearUrl}
              scroll={false}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Clear all
            </Link>
          )}
        </div>
      </div>

      <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
        <header>
          <h3 className="text-sm font-semibold text-gray-900">States</h3>
          <p className="text-xs text-gray-500">Select one or more locations</p>
        </header>
        <ul className="flex flex-col gap-2">
          {stateOptions.map((option) => {
            const checkboxId = `state-${option.value}`
            return (
              <li key={option.value}>
                <label
                  htmlFor={checkboxId}
                  className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                    option.selected
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50"
                  }`}
                >
                  <span>{option.label}</span>
                  <span className="text-xs font-semibold text-gray-500">{option.count}</span>
                  <input
                    id={checkboxId}
                    type="checkbox"
                    className="sr-only"
                    role="checkbox"
                    aria-checked={option.selected}
                    checked={option.selected}
                    onChange={() => handleStateToggle(option.value)}
                  />
                </label>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
        <header>
          <h3 className="text-sm font-semibold text-gray-900">Capabilities</h3>
          <p className="text-xs text-gray-500">Stack filters to refine results</p>
        </header>
        <ul className="flex flex-col gap-2">
          {capabilityOptions.map((option) => (
            <li key={option.value}>
              <Link
                href={toggleCapability(option.value)}
                scroll={false}
                className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                  option.selected
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50"
                }`}
              >
                <span>{option.label}</span>
                <span className="text-xs font-semibold text-gray-500">{option.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
        <header>
          <h3 className="text-sm font-semibold text-gray-900">Production volume</h3>
          <p className="text-xs text-gray-500">Pick one</p>
        </header>
        <div className="grid grid-cols-1 gap-2">
          {volumeOptions.map((option) => (
            <Link
              key={option.value}
              href={selectVolume(option.value)}
              scroll={false}
              className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                option.selected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 bg-white text-gray-700 hover:border-blue-200 hover:bg-blue-50"
              }`}
            >
              <span>{option.label}</span>
              <span className="text-xs font-semibold text-gray-500">{option.count}</span>
            </Link>
          ))}
        </div>
      </section>
    </aside>
  )
}

export {
  buildStateOptions as createStateOptions,
  buildCapabilityOptions as createCapabilityOptions,
  buildVolumeOptions as createVolumeOptions,
}
