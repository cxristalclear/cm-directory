'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '../contexts/FilterContext'
import { ChevronDown, X, Filter, MapPin, Globe, Settings, Layers, Search, Check } from 'lucide-react'
import type { HomepageCompanyWithLocations } from '@/types/homepage'
import type { CapabilitySlug, ProductionVolume } from '@/lib/filters/url'
import {
  formatCountryLabel,
  formatStateLabelFromKey,
  getFacilityCountryCode,
  getFacilityStateKey,
  getFacilityStateLabel,
  normalizeCountryCode,
  normalizeStateFilterValue,
} from "@/utils/locationFilters"

type FilterSection = 'countries' | 'states' | 'capabilities' | 'volume'

interface FilterSidebarProps {
  allCompanies: HomepageCompanyWithLocations[]
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

export default function FilterSidebar({ allCompanies }: FilterSidebarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<FilterSection[]>(['countries', 'states', 'capabilities'])
  const [countrySearch, setCountrySearch] = useState("")
  const [stateSearch, setStateSearch] = useState("")

  // Calculate dynamic filter counts
  const dynamicCounts = useMemo(() => {
    const counts = {
      countries: new Map<string, number>(),
      states: new Map<string, { count: number; label: string }>(),
      capabilities: new Map<CapabilitySlug, number>(),
      productionVolume: new Map<ProductionVolume, number>()
    }

    type CompanyFacility = NonNullable<HomepageCompanyWithLocations["facilities"]>[number]

    const facilityMatchesLocation = (facility: CompanyFacility) => {
      const countryCode = getFacilityCountryCode(facility)
      const stateKey = getFacilityStateKey(facility)

      if (filters.countries.length > 0) {
        if (!countryCode || !filters.countries.includes(countryCode)) return false
      }
      if (filters.states.length > 0) {
        if (!stateKey || !filters.states.includes(stateKey)) return false
      }
      return true
    }

    allCompanies.forEach(company => {
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

      const matchesLocation = company.facilities?.some(facilityMatchesLocation) ?? false

      if (!matchesCapabilities || !matchesVolume || !matchesLocation) return

      company.facilities?.forEach(facility => {
        const countryCode = getFacilityCountryCode(facility)
        if (!countryCode) return

        if (filters.states.length > 0) {
          const stateKey = getFacilityStateKey(facility)
          if (!stateKey || !filters.states.includes(stateKey)) return
        }
        counts.countries.set(countryCode, (counts.countries.get(countryCode) || 0) + 1)
      })

      company.facilities?.forEach(facility => {
        const countryCode = getFacilityCountryCode(facility)
        if (filters.countries.length > 0) {
          if (!countryCode || !filters.countries.includes(countryCode)) return
        }
        const key = getFacilityStateKey(facility)
        if (!key) return
        const label = getFacilityStateLabel(facility) || formatStateLabelFromKey(key)
        const existing = counts.states.get(key)
        if (existing) existing.count += 1
        else counts.states.set(key, { count: 1, label })
      })

      if (company.capabilities?.[0]) {
        const cap = company.capabilities[0]
        if (matchesVolume) {
          if (cap.pcb_assembly_smt) counts.capabilities.set('smt', (counts.capabilities.get('smt') || 0) + 1)
          if (cap.pcb_assembly_through_hole) counts.capabilities.set('through_hole', (counts.capabilities.get('through_hole') || 0) + 1)
          if (cap.cable_harness_assembly) counts.capabilities.set('cable_harness', (counts.capabilities.get('cable_harness') || 0) + 1)
          if (cap.box_build_assembly) counts.capabilities.set('box_build', (counts.capabilities.get('box_build') || 0) + 1)
          if (cap.prototyping) counts.capabilities.set('prototyping', (counts.capabilities.get('prototyping') || 0) + 1)
        }
        if (matchesCapabilities) {
          if (cap.low_volume_production) counts.productionVolume.set('low', (counts.productionVolume.get('low') || 0) + 1)
          if (cap.medium_volume_production) counts.productionVolume.set('medium', (counts.productionVolume.get('medium') || 0) + 1)
          if (cap.high_volume_production) counts.productionVolume.set('high', (counts.productionVolume.get('high') || 0) + 1)
        }
      }
    })

    filters.countries.forEach(code => !counts.countries.has(code) && counts.countries.set(code, 0))
    filters.states.forEach(state => !counts.states.has(state) && counts.states.set(state, { count: 0, label: formatStateLabelFromKey(state) }))
    filters.capabilities.forEach(cap => !counts.capabilities.has(cap) && counts.capabilities.set(cap, 0))
    if (filters.productionVolume && !counts.productionVolume.has(filters.productionVolume)) counts.productionVolume.set(filters.productionVolume, 0)

    return counts
  }, [allCompanies, filters])

  const filteredCountriesList = useMemo(() => {
    return Array.from(dynamicCounts.countries.entries())
      .filter(([code]) => formatCountryLabel(code).toLowerCase().includes(countrySearch.toLowerCase()))
      .sort(([a], [b]) => formatCountryLabel(a).localeCompare(formatCountryLabel(b)))
  }, [dynamicCounts.countries, countrySearch])

  const filteredStatesList = useMemo(() => {
    return Array.from(dynamicCounts.states.entries())
      .filter(([, data]) => data.label.toLowerCase().includes(stateSearch.toLowerCase()))
      .sort(([, a], [, b]) => a.label.localeCompare(b.label))
  }, [dynamicCounts.states, stateSearch])

  const toggleSection = (section: FilterSection) => {
    setExpandedSections(prev => prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section])
  }

  const handleCountryToggle = (code: string) => {
    const norm = normalizeCountryCode(code)
    if (!norm) return
    updateFilter('countries', filters.countries.includes(norm) ? filters.countries.filter(c => c !== norm) : [...filters.countries, norm])
  }

  const handleStateToggle = (state: string) => {
    const norm = normalizeStateFilterValue(state)
    if (!norm) return
    updateFilter('states', filters.states.includes(norm) ? filters.states.filter(s => s !== norm) : [...filters.states, norm])
  }

  const handleCapabilityToggle = (cap: CapabilitySlug) => {
    updateFilter('capabilities', filters.capabilities.includes(cap) ? filters.capabilities.filter(c => c !== cap) : [...filters.capabilities, cap])
  }

  const activeCount = filters.countries.length + filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)

  return (
    <>
      {/* Mobile Toggle - Updated to not show when MobileFilterBar is present */}
      {/* This can be removed entirely if using MobileFilterBar instead */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-20 z-40 lg:hidden flex h-12 w-12 items-center justify-center rounded-full bg-white border border-gray-200 text-gray-700 shadow-xl hover:bg-gray-50 transition-all active:scale-95"
        aria-label="Open filters"
      >
        <Filter className="w-5 h-5" />
        {activeCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
            {activeCount}
          </span>
        )}
      </button>

      {/* Sidebar Container */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full lg:h-auto z-30 
        bg-white lg:bg-transparent
        transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-[280px] lg:w-full
        overflow-y-auto lg:overflow-visible
        border-r lg:border-none border-gray-200 shadow-2xl lg:shadow-none
      `}>
        {/* Mobile Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm z-10 lg:hidden px-4 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              Filters
              {activeCount > 0 && (
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeCount}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2">
              {activeCount > 0 && (
                <button 
                  onClick={clearFilters}
                  className="text-xs text-red-600 hover:text-red-700 font-medium"
                >
                  Clear
                </button>
              )}
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* REMOVED: Desktop "Active Filters" section - now shown in ActiveFiltersBar */}

        <div className="px-4 lg:px-0 space-y-3 pb-8 pt-4 lg:pt-0">
          <FilterGroup 
            title="Country" 
            icon={Globe} 
            isOpen={expandedSections.includes('countries')} 
            onToggle={() => toggleSection('countries')}
            count={filters.countries.length}
          >
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search countries..." 
                value={countrySearch}
                onChange={(e) => setCountrySearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin pr-2">
              {filteredCountriesList.map(([code, count]) => (
                <CheckboxOption 
                  key={code}
                  label={formatCountryLabel(code)}
                  count={count}
                  checked={filters.countries.includes(code)}
                  onChange={() => handleCountryToggle(code)}
                />
              ))}
              {filteredCountriesList.length === 0 && <EmptyState />}
            </div>
          </FilterGroup>

          <FilterGroup 
            title="State" 
            icon={MapPin} 
            isOpen={expandedSections.includes('states')} 
            onToggle={() => toggleSection('states')}
            count={filters.states.length}
          >
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search states..." 
                value={stateSearch}
                onChange={(e) => setStateSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none placeholder:text-gray-400"
              />
            </div>
            <div className="space-y-1 max-h-60 overflow-y-auto scrollbar-thin pr-2">
              {filteredStatesList.map(([code, data]) => (
                <CheckboxOption 
                  key={code}
                  label={data.label}
                  count={data.count}
                  checked={filters.states.includes(code)}
                  onChange={() => handleStateToggle(code)}
                />
              ))}
              {filteredStatesList.length === 0 && <EmptyState />}
            </div>
          </FilterGroup>

          <FilterGroup 
            title="Capabilities" 
            icon={Settings} 
            isOpen={expandedSections.includes('capabilities')} 
            onToggle={() => toggleSection('capabilities')}
            count={filters.capabilities.length}
          >
            <div className="space-y-1">
              {Array.from(dynamicCounts.capabilities.entries()).map(([cap, count]) => (
                <CheckboxOption 
                  key={cap}
                  label={CAPABILITY_NAMES[cap]}
                  count={count}
                  checked={filters.capabilities.includes(cap)}
                  onChange={() => handleCapabilityToggle(cap)}
                />
              ))}
            </div>
          </FilterGroup>

          <FilterGroup 
            title="Volume" 
            icon={Layers} 
            isOpen={expandedSections.includes('volume')} 
            onToggle={() => toggleSection('volume')}
            count={filters.productionVolume ? 1 : 0}
          >
            <div className="space-y-1">
              {Array.from(dynamicCounts.productionVolume.entries()).map(([vol, count]) => (
                <RadioOption 
                  key={vol}
                  label={VOLUME_NAMES[vol]}
                  count={count}
                  checked={filters.productionVolume === vol}
                  onChange={() => updateFilter('productionVolume', vol)}
                />
              ))}
            </div>
          </FilterGroup>
        </div>
      </div>
      
      {isOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

/* --- Subcomponents --- */

interface FilterGroupProps {
  title: string
  icon: React.ElementType
  isOpen: boolean
  onToggle: () => void
  count: number
  children: React.ReactNode
}

function FilterGroup({ title, icon: Icon, isOpen, onToggle, count, children }: FilterGroupProps) {
  return (
    <div className={`bg-white rounded-xl border transition-colors duration-200 ${isOpen ? 'border-gray-300 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}>
      <button 
        onClick={onToggle} 
        className="w-full flex items-center justify-between p-3.5 select-none group"
      >
        <div className="flex items-center gap-3 text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
          <div className={`p-1.5 rounded-md transition-colors ${isOpen ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
            <Icon className="w-4 h-4" />
          </div>
          {title}
          {count > 0 && (
            <span className="ml-1 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {count}
            </span>
          )}
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-3.5 pb-3.5 pt-1">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

interface CheckboxOptionProps {
  label: string
  count: number
  checked: boolean
  onChange: () => void
}

function CheckboxOption({ label, count, checked, onChange }: CheckboxOptionProps) {
  const disabled = !checked && count === 0
  
  return (
    <label className={`
      group flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-all
      ${checked ? 'bg-blue-50/80 hover:bg-blue-50' : 'hover:bg-gray-50'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
    `}>
      <div className="flex items-center gap-3 min-w-0 overflow-hidden">
        <div className={`
          w-4 h-4 rounded flex-shrink-0 border flex items-center justify-center transition-all duration-200
          ${checked ? 'bg-blue-600 border-blue-600 shadow-sm' : 'bg-white border-gray-300 group-hover:border-blue-400'}
        `}>
          <Check className={`w-3 h-3 text-white transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} />
        </div>
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
        <span className={`text-sm truncate transition-colors ${checked ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
          {label}
        </span>
      </div>
      <span className={`text-xs transition-colors ${checked ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
        {count}
      </span>
    </label>
  )
}

interface RadioOptionProps {
  label: string
  count: number
  checked: boolean
  onChange: () => void
}

function RadioOption({ label, count, checked, onChange }: RadioOptionProps) {
  const disabled = !checked && count === 0
  return (
    <label className={`
      group flex items-center justify-between py-2 px-2.5 rounded-lg cursor-pointer transition-all
      ${checked ? 'bg-blue-50/80 hover:bg-blue-50' : 'hover:bg-gray-50'}
      ${disabled ? 'opacity-40 cursor-not-allowed' : ''}
    `}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`
          w-4 h-4 rounded-full flex-shrink-0 border flex items-center justify-center transition-all duration-200
          ${checked ? 'border-blue-600 bg-white' : 'border-gray-300 bg-white group-hover:border-blue-400'}
        `}>
          <div className={`w-2 h-2 rounded-full bg-blue-600 transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} />
        </div>
        <input type="radio" className="hidden" checked={checked} onChange={onChange} disabled={disabled} />
        <span className={`text-sm truncate transition-colors ${checked ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
          {label}
        </span>
      </div>
      <span className={`text-xs transition-colors ${checked ? 'text-blue-600 font-medium' : 'text-gray-400'}`}>
        {count}
      </span>
    </label>
  )
}

function EmptyState() {
  return <div className="py-6 text-center text-xs text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-2">No matches found</div>
}