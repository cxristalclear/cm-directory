"use client"

import type { ReactNode } from "react"
import { X } from "lucide-react"
import { useFilters } from "@/contexts/FilterContext"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"

type ChipProps = {
  label: string
  onRemove?: () => void
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
      {label}
      {onRemove && (
        <button
          aria-label={`Remove ${label}`}
          onClick={(event) => {
            event.preventDefault()
            event.stopPropagation()
            onRemove()
          }}
          className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </span>
  )
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
  low: "Low volume",
  medium: "Medium volume",
  high: "High volume",
}

export default function ActiveFiltersBar() {
  const { filters, updateFilter, clearFilters } = useFilters()

  const removeState = (state: string) => {
    updateFilter("states", filters.states.filter((value) => value !== state))
  }

  const removeCapability = (capability: CapabilitySlug) => {
    updateFilter(
      "capabilities",
      filters.capabilities.filter((value) => value !== capability),
    )
  }

  const clearVolume = () => {
    updateFilter("productionVolume", null)
  }

  const chips: ReactNode[] = []

  for (const state of filters.states) {
    chips.push(<Chip key={`state:${state}`} label={state} onRemove={() => removeState(state)} />)
  }

  for (const capability of filters.capabilities) {
    chips.push(
      <Chip
        key={`capability:${capability}`}
        label={CAPABILITY_LABELS[capability]}
        onRemove={() => removeCapability(capability)}
      />,
    )
  }

  if (filters.productionVolume) {
    chips.push(
      <Chip
        key="volume"
        label={VOLUME_LABELS[filters.productionVolume]}
        onRemove={clearVolume}
      />,
    )
  }

  const hasActiveFilters = chips.length > 0

  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
      <div className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700">
        {hasActiveFilters ? chips : <span className="text-sm text-neutral-500">No active filters</span>}
      </div>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="text-sm font-medium text-blue-700 hover:text-blue-800"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
