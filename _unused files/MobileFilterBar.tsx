'use client'

import { useState } from 'react'
import { X, Filter, ChevronUp, Globe, MapPin, Settings, Layers, Users } from 'lucide-react'
import { useFilters } from '@/contexts/FilterContext'
import type { CapabilitySlug, ProductionVolume } from '@/lib/filters/url'
import type { EmployeeCountRange } from '@/types/company'
import { formatCountryLabel, formatStateLabelFromKey } from '@/utils/locationFilters'

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

const categoryStyles: Record<FilterCategory, { bg: string; icon: React.ElementType }> = {
  country: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Globe },
  state: { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: MapPin },
  capability: { bg: 'bg-violet-50 text-violet-700 border-violet-200', icon: Settings },
  volume: { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: Layers },
  employees: { bg: 'bg-teal-50 text-teal-700 border-teal-200', icon: Users }
}

interface MobileFilterChipProps {
  label: string
  category: FilterCategory
  onRemove: () => void
}

function MobileFilterChip({ label, category, onRemove }: MobileFilterChipProps) {
  const { bg, icon: Icon } = categoryStyles[category]
  
  return (
    <button
      onClick={onRemove}
      className={`inline-flex items-center gap-1.5 px-2 py-1 border rounded-full transition-all group ${bg}`}
    >
      <Icon className="w-3 h-3" />
      <span className="text-xs font-medium">{label}</span>
      <X className="w-3 h-3 opacity-60 group-hover:opacity-100" />
    </button>
  )
}

export default function MobileFilterBar() {
  const [isExpanded, setIsExpanded] = useState(false)
  const { filters, updateFilter, clearFilters, filteredCount } = useFilters()
  
  const activeCount = 
    filters.countries.length + 
    filters.states.length + 
    filters.capabilities.length + 
    (filters.productionVolume ? 1 : 0) +
    filters.employeeCountRanges.length
  
  // Don't render on desktop or if no filters
  if (activeCount === 0) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
      {/* Expandable panel */}
      <div 
        className={`bg-white border-t border-gray-200 shadow-2xl transition-all duration-300 ease-out ${
          isExpanded ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">Active Filters</span>
            <button 
              onClick={clearFilters}
              className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              Clear all
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {filters.countries.map(code => (
              <MobileFilterChip 
                key={`mobile-country-${code}`}
                label={formatCountryLabel(code)}
                category="country"
                onRemove={() => updateFilter('countries', filters.countries.filter(c => c !== code))}
              />
            ))}
            {filters.states.map(code => (
              <MobileFilterChip 
                key={`mobile-state-${code}`}
                label={formatStateLabelFromKey(code)}
                category="state"
                onRemove={() => updateFilter('states', filters.states.filter(s => s !== code))}
              />
            ))}
            {filters.capabilities.map(cap => (
              <MobileFilterChip 
                key={`mobile-cap-${cap}`}
                label={CAPABILITY_NAMES[cap]}
                category="capability"
                onRemove={() => updateFilter('capabilities', filters.capabilities.filter(c => c !== cap))}
              />
            ))}
            {filters.productionVolume && (
              <MobileFilterChip 
                label={VOLUME_NAMES[filters.productionVolume]}
                category="volume"
                onRemove={() => updateFilter('productionVolume', null)}
              />
            )}
            {filters.employeeCountRanges.map((range: EmployeeCountRange) => (
              <MobileFilterChip
                key={`mobile-emp-${range}`}
                label={`${range} employees`}
                category="employees"
                onRemove={() => updateFilter('employeeCountRanges', filters.employeeCountRanges.filter(r => r !== range))}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Toggle bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-600 text-white px-4 py-3 flex items-center justify-between safe-area-pb"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5" />
          <span className="font-medium">{activeCount} filter{activeCount !== 1 ? 's' : ''} applied</span>
          <span className="text-blue-200">·</span>
          <span className="text-blue-100">{filteredCount} results</span>
        </div>
        <ChevronUp 
          className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>
    </div>
  )
}
