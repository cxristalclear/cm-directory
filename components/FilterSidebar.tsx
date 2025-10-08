'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '../contexts/FilterContext'
import { ChevronDown, X, Filter, MapPin, Globe, Settings, Layers } from 'lucide-react'
import type { Company } from '../types/company'
import type { CapabilitySlug, ProductionVolume } from '@/lib/filters/url'
import { getStateName } from '../utils/stateMapping'

type FilterSection = 'countries' | 'states' | 'capabilities' | 'volume'

interface FilterSidebarProps {
  allCompanies: Company[]
}

// Country names mapping
const COUNTRIES: Record<string, string> = {
  'US': 'United States',
  'CA': 'Canada',
  'MX': 'Mexico',
  'CN': 'China',
  'TW': 'Taiwan',
  'VN': 'Vietnam',
  'MY': 'Malaysia',
  'TH': 'Thailand',
  'IN': 'India',
  'DE': 'Germany',
  'PL': 'Poland',
  'HU': 'Hungary',
  'CZ': 'Czech Republic',
}

const getCountryName = (code: string): string => {
  return COUNTRIES[code] || code
}

// Capability display names
const CAPABILITY_NAMES: Record<CapabilitySlug, string> = {
  'smt': 'SMT Assembly',
  'through_hole': 'Through-Hole Assembly',
  'cable_harness': 'Cable & Harness',
  'box_build': 'Box Build',
  'prototyping': 'Prototyping'
}

// Volume display names
const VOLUME_NAMES: Record<ProductionVolume, string> = {
  'low': 'Low Volume',
  'medium': 'Medium Volume',
  'high': 'High Volume'
}

export default function FilterSidebar({ allCompanies }: FilterSidebarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<FilterSection[]>(['countries', 'states', 'capabilities'])

  // Calculate dynamic filter counts
  const dynamicCounts = useMemo(() => {
    const counts = {
      countries: new Map<string, number>(),
      states: new Map<string, number>(),
      capabilities: new Map<CapabilitySlug, number>(),
      productionVolume: new Map<ProductionVolume, number>()
    }

    allCompanies.forEach(company => {
      // Pre-calculate matching for each filter type (exclude itself)
      const matchesCountries = filters.countries.length === 0 || 
        company.facilities?.some(f => filters.countries.includes(f.country || 'US'))

      const matchesStates = filters.states.length === 0 ||
        company.facilities?.some(f =>
          typeof f.state === 'string' && filters.states.includes(f.state)
        )

      const matchesCapabilities = filters.capabilities.length === 0 || 
        (company.capabilities?.[0] && filters.capabilities.some(selected => {
          const cap = company.capabilities![0]
          switch (selected) {
            case 'smt': return cap.pcb_assembly_smt
            case 'through_hole': return cap.pcb_assembly_through_hole
            case 'cable_harness': return cap.cable_harness_assembly
            case 'box_build': return cap.box_build_assembly
            case 'prototyping': return cap.prototyping
            default: return false
          }
        }))

      const matchesVolume = !filters.productionVolume ||
        (company.capabilities?.[0] && (() => {
          const cap = company.capabilities![0]
          switch (filters.productionVolume) {
            case 'low': return cap.low_volume_production
            case 'medium': return cap.medium_volume_production
            case 'high': return cap.high_volume_production
            default: return false
          }
        })())

      // Count COUNTRIES (exclude countries filter)
      if (matchesStates && matchesCapabilities && matchesVolume) {
        company.facilities?.forEach(facility => {
          const country = facility.country || 'US'
          counts.countries.set(country, (counts.countries.get(country) || 0) + 1)
        })
      }

      // Count STATES (exclude states filter)
      if (matchesCountries && matchesCapabilities && matchesVolume) {
        company.facilities?.forEach(facility => {
          if (filters.countries.length === 0 || filters.countries.includes(facility.country || 'US')) {
            if (facility.state) {
              counts.states.set(facility.state, (counts.states.get(facility.state) || 0) + 1)
            }
          }
        })
      }

      // Count CAPABILITIES (exclude capabilities filter)
      if (matchesCountries && matchesStates && matchesVolume) {
        if (company.capabilities?.[0]) {
          const cap = company.capabilities[0]
          if (cap.pcb_assembly_smt) {
            counts.capabilities.set('smt', (counts.capabilities.get('smt') || 0) + 1)
          }
          if (cap.pcb_assembly_through_hole) {
            counts.capabilities.set('through_hole', (counts.capabilities.get('through_hole') || 0) + 1)
          }
          if (cap.cable_harness_assembly) {
            counts.capabilities.set('cable_harness', (counts.capabilities.get('cable_harness') || 0) + 1)
          }
          if (cap.box_build_assembly) {
            counts.capabilities.set('box_build', (counts.capabilities.get('box_build') || 0) + 1)
          }
          if (cap.prototyping) {
            counts.capabilities.set('prototyping', (counts.capabilities.get('prototyping') || 0) + 1)
          }
        }
      }

      // Count VOLUME (exclude volume filter)
      if (matchesCountries && matchesStates && matchesCapabilities) {
        if (company.capabilities?.[0]) {
          const cap = company.capabilities[0]
          if (cap.low_volume_production) {
            counts.productionVolume.set('low', (counts.productionVolume.get('low') || 0) + 1)
          }
          if (cap.medium_volume_production) {
            counts.productionVolume.set('medium', (counts.productionVolume.get('medium') || 0) + 1)
          }
          if (cap.high_volume_production) {
            counts.productionVolume.set('high', (counts.productionVolume.get('high') || 0) + 1)
          }
        }
      }
    })

    return counts
  }, [allCompanies, filters.countries, filters.states, filters.capabilities, filters.productionVolume])

  const toggleSection = (section: FilterSection) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const handleCountryToggle = (countryCode: string) => {
    const newCountries = filters.countries.includes(countryCode)
      ? filters.countries.filter(c => c !== countryCode)
      : [...filters.countries, countryCode]
    updateFilter('countries', newCountries)
  }

  const handleStateToggle = (state: string) => {
    const newStates = filters.states.includes(state)
      ? filters.states.filter(s => s !== state)
      : [...filters.states, state]
    updateFilter('states', newStates)
  }

  const handleCapabilityToggle = (capability: CapabilitySlug) => {
    const newCapabilities = filters.capabilities.includes(capability)
      ? filters.capabilities.filter(c => c !== capability)
      : [...filters.capabilities, capability]
    updateFilter('capabilities', newCapabilities)
  }

  const handleVolumeChange = (volume: ProductionVolume | null) => {
    updateFilter('productionVolume', volume)
  }

  const activeFilterCount = 
    filters.countries.length +
    filters.states.length + 
    filters.capabilities.length + 
    (filters.productionVolume ? 1 : 0)

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-4 z-30 bg-blue-600 text-white shadow-xl rounded-full p-4 lg:hidden hover:shadow-2xl transition-shadow"
      >
        <Filter className="w-6 h-6" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full lg:h-auto z-20 
        bg-white shadow-xl lg:shadow-sm lg:rounded-xl lg:border lg:border-gray-200
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-80 lg:w-full
        overflow-y-auto
      `}>
        {/* Header - Compact */}
        <div className="sticky top-0 bg-white z-10 border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Filters</h2>
              {activeFilterCount > 0 && (
                <span className="text-xs text-gray-500">({activeFilterCount})</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Active Filter Pills */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {filters.countries.map(country => (
                <button
                  key={country}
                  onClick={() => handleCountryToggle(country)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  {getCountryName(country)}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {filters.states.map(state => (
                <button
                  key={state}
                  onClick={() => handleStateToggle(state)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  {getStateName(state)}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {filters.capabilities.map(cap => (
                <button
                  key={cap}
                  onClick={() => handleCapabilityToggle(cap)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  {CAPABILITY_NAMES[cap]}
                  <X className="w-3 h-3" />
                </button>
              ))}
              {filters.productionVolume && (
                <button
                  onClick={() => handleVolumeChange(null)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors"
                >
                  {VOLUME_NAMES[filters.productionVolume]}
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          {/* Country Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('countries')}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Country</span>
                {filters.countries.length > 0 && (
                  <span className="text-xs text-blue-600 font-medium">
                    {filters.countries.length}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.includes('countries') ? 'rotate-180' : ''
              }`} />
            </button>

            {expandedSections.includes('countries') && (
              <div className="p-2 space-y-0.5 max-h-48 overflow-y-auto">
                {Array.from(dynamicCounts.countries.entries())
                  .sort(([a], [b]) => getCountryName(a).localeCompare(getCountryName(b)))
                  .map(([country, count]) => {
                    const isSelected = filters.countries.includes(country)
                    const isDisabled = count === 0 && !isSelected
                    
                    return (
                      <label 
                        key={country} 
                        className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && handleCountryToggle(country)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 truncate">
                            {getCountryName(country)}
                          </span>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500'
                        }`}>
                          {count}
                        </span>
                      </label>
                    )
                  })}
              </div>
            )}
          </div>

          {/* State Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('states')}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">State</span>
                {filters.states.length > 0 && (
                  <span className="text-xs text-blue-600 font-medium">
                    {filters.states.length}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.includes('states') ? 'rotate-180' : ''
              }`} />
            </button>

            {expandedSections.includes('states') && (
              <div className="p-2 space-y-0.5 max-h-64 overflow-y-auto">
                {Array.from(dynamicCounts.states.entries())
                  .sort(([a], [b]) => getStateName(a).localeCompare(getStateName(b)))
                  .map(([state, count]) => {
                    const isSelected = filters.states.includes(state)
                    const isDisabled = count === 0 && !isSelected
                    
                    return (
                      <label 
                        key={state} 
                        className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 ${
                          isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && handleStateToggle(state)}
                            disabled={isDisabled}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-1 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700 truncate">
                            {getStateName(state)}
                          </span>
                        </div>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          isSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500'
                        }`}>
                          {count}
                        </span>
                      </label>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Capabilities Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('capabilities')}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Capabilities</span>
                {filters.capabilities.length > 0 && (
                  <span className="text-xs text-blue-600 font-medium">
                    {filters.capabilities.length}
                  </span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.includes('capabilities') ? 'rotate-180' : ''
              }`} />
            </button>

            {expandedSections.includes('capabilities') && (
              <div className="p-2 space-y-0.5">
                {Array.from(dynamicCounts.capabilities.entries()).map(([cap, count]) => {
                  const isSelected = filters.capabilities.includes(cap)
                  const isDisabled = count === 0 && !isSelected
                  
                  return (
                    <label 
                      key={cap} 
                      className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => !isDisabled && handleCapabilityToggle(cap)}
                          disabled={isDisabled}
                          className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {CAPABILITY_NAMES[cap]}
                        </span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>

          {/* Volume Filter */}
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection('volume')}
              className="flex items-center justify-between w-full px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-900">Volume</span>
                {filters.productionVolume && (
                  <span className="text-xs text-blue-600 font-medium">1</span>
                )}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                expandedSections.includes('volume') ? 'rotate-180' : ''
              }`} />
            </button>

            {expandedSections.includes('volume') && (
              <div className="p-2 space-y-0.5">
                {Array.from(dynamicCounts.productionVolume.entries()).map(([vol, count]) => {
                  const isSelected = filters.productionVolume === vol
                  const isDisabled = count === 0 && !isSelected
                  
                  return (
                    <label 
                      key={vol} 
                      className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-gray-50 ${
                        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <input
                          type="radio"
                          name="productionVolume"
                          checked={isSelected}
                          onChange={() => !isDisabled && handleVolumeChange(vol)}
                          disabled={isDisabled}
                          className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-1 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700 truncate">
                          {VOLUME_NAMES[vol]}
                        </span>
                      </div>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${
                        isSelected ? 'bg-blue-100 text-blue-700 font-medium' : 'text-gray-500'
                      }`}>
                        {count}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}