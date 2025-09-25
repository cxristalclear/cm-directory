import Link from "next/link"

import type { CompanyFacetCounts } from "@/lib/queries/companySearch"
import { serializeFiltersToSearchParams, type FilterUrlState, type CapabilitySlug, type ProductionVolume } from "@/lib/filters/url"
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

const CAPABILITY_LABELS: Record<CapabilitySlug, string> = {
  smt: "SMT",
  through_hole: "Through-Hole",
  mixed: "Mixed Tech",
  fine_pitch: "Fine Pitch",
  cable_harness: "Cable Harness",
  box_build: "Box Build",
  prototyping: "Prototyping",
}

const VOLUME_LABELS: Record<ProductionVolume, string> = {
  low: "Low Volume",
  medium: "Medium Volume",
  high: "High Volume",
}

function buildUrl(basePath: string, filters: FilterUrlState): string {
  const params = serializeFiltersToSearchParams(filters)
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
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
): FilterOption<CapabilitySlug>[] {
  const counts = new Map<CapabilitySlug, number>()
  if (facetCounts) {
    for (const { slug, count } of facetCounts.capabilities) {
      counts.set(slug, count)
    }
  }

  for (const capability of filters.capabilities) {
    if (!counts.has(capability)) {
      counts.set(capability, 0)
    }
  }

  return (Object.keys(CAPABILITY_LABELS) as CapabilitySlug[]).map((slug) => ({
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
  const stateOptions = buildStateOptions(filters, facetCounts)
  const capabilityOptions = buildCapabilityOptions(filters, facetCounts)
  const volumeOptions = buildVolumeOptions(filters, facetCounts)

  const hasActiveFilters =
    filters.states.length > 0 || filters.capabilities.length > 0 || filters.productionVolume !== null

  const clearUrl = clearHref ?? basePath

  const toggleState = (state: string) => {
    const normalized = state.toUpperCase()
    const selected = filters.states.includes(normalized)
    const nextStates = selected
      ? filters.states.filter((value) => value !== normalized)
      : [...filters.states, normalized]
    return buildUrl(basePath, { ...filters, states: nextStates })
  }

  const toggleCapability = (slug: CapabilitySlug) => {
    const selected = filters.capabilities.includes(slug)
    const nextCapabilities = selected
      ? filters.capabilities.filter((value) => value !== slug)
      : [...filters.capabilities, slug]
    return buildUrl(basePath, { ...filters, capabilities: nextCapabilities })
  }

  const selectVolume = (level: ProductionVolume) => {
    const nextVolume = filters.productionVolume === level ? null : level
    return buildUrl(basePath, { ...filters, productionVolume: nextVolume })
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
          {stateOptions.map((option) => (
            <li key={option.value}>
              <Link
                href={toggleState(option.value)}
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
