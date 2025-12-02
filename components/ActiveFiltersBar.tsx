'use client'

import { X, Filter, Globe, MapPin, Settings, Layers, Users } from 'lucide-react'
import { useFilters } from '@/contexts/FilterContext'
import type { CapabilitySlug, ProductionVolume } from '@/lib/filters/url'
import type { EmployeeCountRange } from '@/types/company'
import { formatCountryLabel, formatStateLabelFromKey } from '@/utils/locationFilters'

interface ActiveFiltersBarProps {
  variant?: 'page' | 'inline'
}

const CAPABILITY_NAMES: Record<CapabilitySlug, string> = {
  'smt': 'SMT Assembly',
  'through_hole': 'Through-Hole',
  'cable_harness': 'Cable & Harness',
  'box_build': 'Box Build',
  'prototyping': 'Prototyping'
}

const VOLUME_NAMES: Record<ProductionVolume, string> = {
  'low': 'Low Volume',
  'medium': 'Medium Volume',
  'high': 'High Volume'
}

type FilterCategory = 'country' | 'state' | 'capability' | 'volume' | 'employees'

interface FilterChipProps {
  label: string
  category: FilterCategory
  onRemove: () => void
}

const categoryStyles: Record<FilterCategory, { bg: string; icon: React.ElementType }> = {
  country: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100', icon: Globe },
  state: { bg: 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100', icon: MapPin },
  capability: { bg: 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100', icon: Settings },
  volume: { bg: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100', icon: Layers },
  employees: { bg: 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100', icon: Users }
}

function FilterChip({ label, category, onRemove }: FilterChipProps) {
  const { bg, icon: Icon } = categoryStyles[category]
  
  return (
    <button
      onClick={onRemove}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 border rounded-full transition-all group flex-shrink-0 ${bg}`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium whitespace-nowrap">{label}</span>
      <X className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity" />
    </button>
  )
}

export default function ActiveFiltersBar({ variant = 'page' }: ActiveFiltersBarProps) {
  const { filters, updateFilter, clearFilters, filteredCount } = useFilters()
  
  const activeCount = 
    filters.countries.length + 
    filters.states.length + 
    filters.capabilities.length + 
    (filters.productionVolume ? 1 : 0) +
    filters.employeeCountRanges.length
  
  // Don't render if no filters are active
  if (activeCount === 0) return null
  
  const handleRemoveCountry = (code: string) => {
    updateFilter('countries', filters.countries.filter(c => c !== code))
  }
  
  const handleRemoveState = (code: string) => {
    updateFilter('states', filters.states.filter(s => s !== code))
  }
  
  const handleRemoveCapability = (cap: CapabilitySlug) => {
    updateFilter('capabilities', filters.capabilities.filter(c => c !== cap))
  }
  
  const handleRemoveVolume = () => {
    updateFilter('productionVolume', null)
  }

  const handleRemoveEmployeeRange = (range: EmployeeCountRange) => {
    updateFilter('employeeCountRanges', filters.employeeCountRanges.filter(r => r !== range))
  }

  const renderFilterChips = () => (
    <>
      {filters.countries.map(code => (
        <FilterChip 
          key={`country-${code}`}
          label={formatCountryLabel(code)}
          category="country"
          onRemove={() => handleRemoveCountry(code)}
        />
      ))}
      {filters.states.map(code => (
        <FilterChip 
          key={`state-${code}`}
          label={formatStateLabelFromKey(code)}
          category="state"
          onRemove={() => handleRemoveState(code)}
        />
      ))}
      {filters.capabilities.map(cap => (
        <FilterChip 
          key={`cap-${cap}`}
          label={CAPABILITY_NAMES[cap]}
          category="capability"
          onRemove={() => handleRemoveCapability(cap)}
        />
      ))}
      {filters.productionVolume && (
        <FilterChip 
          label={VOLUME_NAMES[filters.productionVolume]}
          category="volume"
          onRemove={handleRemoveVolume}
        />
      )}
      {filters.employeeCountRanges.map(range => (
        <FilterChip
          key={`emp-${range}`}
          label={`${range} employees`}
          category="employees"
          onRemove={() => handleRemoveEmployeeRange(range)}
        />
      ))}
    </>
  )

  if (variant === 'inline') {
    return (
      <div className="flex flex-wrap items-center gap-2 min-w-0">
        <div className="flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
          <Filter className="h-3.5 w-3.5" />
          <span className="tabular-nums leading-none">{activeCount}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 py-1 pr-2">
            {renderFilterChips()}
          </div>
        </div>

        <button 
          onClick={clearFilters}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
        >
          <X className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Clear</span>
        </button>
      </div>
    )
  }

  return (
    <div className="sticky top-16 z-30 bg-white/50 backdrop-blur-md border-b border-gray-200 shadow-sm animate-in slide-in-from-top-2 duration-300">
      <div className="page-container py-2.5">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Filter count + chips */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {/* Filter badge */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="flex items-center gap-1.5 p-1 m-1 bg-blue-50 rounded-sm border border-blue-100">
                <Filter className="w-3 h-3 text-blue-600" />
                <span className="text-sm font-semibold text-blue-700 tabular-nums">{activeCount}</span>
              </div>
              <span className="text-sm text-gray-500 hidden sm:inline">
                <span className="font-medium text-gray-700">{filteredCount}</span> results
              </span>
            </div>
            
            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 hidden md:block" />
            
            {/* Filter chips - scrollable */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide min-w-0 py-1 -my-1 pr-4">
              {renderFilterChips()}
            </div>
          </div>
          
          {/* Right: Clear all */}
          <button 
            onClick={clearFilters}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span className="hidden sm:inline">Clear all</span>
          </button>
        </div>
      </div>
    </div>
  )
}
