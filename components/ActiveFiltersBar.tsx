'use client'

import { X } from 'lucide-react'

import { useFilters } from '../contexts/FilterContext'
import type { ProductionVolume } from '../types/company'

type ChipProps = {
  label: string
  onRemove: () => void
}

function Chip({ label, onRemove }: ChipProps) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-sm text-neutral-800">
      {label}
      <button
        aria-label={`Remove ${label}`}
        onClick={event => {
          event.preventDefault()
          event.stopPropagation()
          onRemove()
        }}
        className="rounded-full p-1 text-neutral-500 hover:bg-neutral-200/60 hover:text-neutral-700"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  )
}

function formatCapability(key: string) {
  switch (key) {
    case 'smt':
      return 'SMT'
    case 'through_hole':
      return 'Through Hole'
    case 'cable_harness':
      return 'Cable Harness'
    case 'box_build':
      return 'Box Build'
    case 'prototyping':
      return 'Prototyping'
    default:
      return key
  }
}

function formatVolume(volume: ProductionVolume) {
  switch (volume) {
    case 'low':
      return 'Low Volume'
    case 'medium':
      return 'Medium Volume'
    case 'high':
      return 'High Volume'
    default:
      return volume
  }
}

export default function ActiveFiltersBar() {
  const { filters, updateFilter, clearFilters } = useFilters()
  const { states, capabilities, productionVolume } = filters

  const hasStates = states.length > 0
  const hasCapabilities = capabilities.length > 0
  const hasVolume = productionVolume !== null
  const hasAny = hasStates || hasCapabilities || hasVolume

  const removeState = (state: string) => {
    updateFilter(
      'states',
      states.filter(entry => entry !== state),
    )
  }

  const removeCapability = (capability: string) => {
    updateFilter(
      'capabilities',
      capabilities.filter(entry => entry !== capability),
    )
  }

  const removeVolume = () => {
    updateFilter('productionVolume', null)
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {!hasAny && <span className="text-sm text-neutral-500">No active filters</span>}
        {states.map(state => (
          <Chip key={`state-${state}`} label={state} onRemove={() => removeState(state)} />
        ))}
        {capabilities.map(capability => (
          <Chip
            key={`cap-${capability}`}
            label={formatCapability(capability)}
            onRemove={() => removeCapability(capability)}
          />
        ))}
        {productionVolume && (
          <Chip
            key="volume"
            label={formatVolume(productionVolume)}
            onRemove={removeVolume}
          />
        )}
      </div>
      {hasAny && (
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-blue-700 hover:text-blue-800"
          aria-label="Clear all filters"
        >
          Clear all
        </button>
      )}
    </div>
  )
}
