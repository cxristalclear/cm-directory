'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '../contexts/FilterContext'
import { ChevronDown, X, Filter, Search, Check } from 'lucide-react'
import type { HomepageCompanyWithLocations } from '@/types/homepage'
import type { CapabilitySlug, ProductionVolume } from '@/lib/filters/url'
import { EmployeeCountRanges, type EmployeeCountRange } from '@/types/company'
import {
  formatCountryLabel,
  formatStateLabelFromKey,
  getFacilityCountryCode,
  getFacilityStateKey,
  getFacilityStateLabel,
  normalizeCountryCode,
  normalizeStateFilterValue,
} from "@/utils/locationFilters"

type FilterSection = 'countries' | 'states' | 'capabilities' | 'volume' | 'employees'

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
  const [expandedSections, setExpandedSections] = useState<FilterSection[]>(['countries', 'states'])
  const [countrySearch, setCountrySearch] = useState("")
  const [stateSearch, setStateSearch] = useState("")
  const [showAllCountries, setShowAllCountries] = useState(false)
  const [showAllStates, setShowAllStates] = useState(false)
  const [showAllCapabilities, setShowAllCapabilities] = useState(false)
  const [showAllEmployees, setShowAllEmployees] = useState(false)

  // Calculate dynamic filter counts
  const dynamicCounts = useMemo(() => {
    const counts = {
      countries: new Map<string, number>(),
      states: new Map<string, { count: number; label: string }>(),
      capabilities: new Map<CapabilitySlug, number>(),
      productionVolume: new Map<ProductionVolume, number>(),
      employeeCountRanges: new Map<EmployeeCountRange, number>()
    }
    const allCountryCodes = new Set<string>()
    const allStateKeys = new Set<string>()

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
      const matchesEmployees = filters.employeeCountRanges.length === 0 ||
        (company.employee_count_range ? filters.employeeCountRanges.includes(company.employee_count_range as EmployeeCountRange) : false)

      if (!matchesCapabilities || !matchesVolume || !matchesLocation || !matchesEmployees) return

      company.facilities?.forEach(facility => {
        const countryCode = getFacilityCountryCode(facility)
        if (countryCode) {
          allCountryCodes.add(countryCode)
        }
        if (!countryCode) return

        if (filters.states.length > 0) {
          const stateKey = getFacilityStateKey(facility)
          if (!stateKey || !filters.states.includes(stateKey)) return
        }
        counts.countries.set(countryCode, (counts.countries.get(countryCode) || 0) + 1)
      })

      company.facilities?.forEach(facility => {
        const countryCode = getFacilityCountryCode(facility)
        if (countryCode) allCountryCodes.add(countryCode)
        if (filters.countries.length > 0) {
          if (!countryCode || !filters.countries.includes(countryCode)) return
        }
        const key = getFacilityStateKey(facility)
        if (key) allStateKeys.add(key)
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

      if (company.employee_count_range) {
        const range = company.employee_count_range as EmployeeCountRange
        counts.employeeCountRanges.set(range, (counts.employeeCountRanges.get(range) || 0) + 1)
      }
    })

    filters.countries.forEach(code => !counts.countries.has(code) && counts.countries.set(code, 0))
    filters.states.forEach(state => !counts.states.has(state) && counts.states.set(state, { count: 0, label: formatStateLabelFromKey(state) }))
    filters.capabilities.forEach(cap => !counts.capabilities.has(cap) && counts.capabilities.set(cap, 0))
    if (filters.productionVolume && !counts.productionVolume.has(filters.productionVolume)) counts.productionVolume.set(filters.productionVolume, 0)
    filters.employeeCountRanges.forEach(range => !counts.employeeCountRanges.has(range) && counts.employeeCountRanges.set(range, 0))
    allCountryCodes.forEach(code => {
      if (!counts.countries.has(code)) counts.countries.set(code, 0)
    })
    allStateKeys.forEach(state => {
      if (!counts.states.has(state)) counts.states.set(state, { count: 0, label: formatStateLabelFromKey(state) })
    })
    ;(Object.keys(CAPABILITY_NAMES) as CapabilitySlug[]).forEach((cap: CapabilitySlug) => {
      if (!counts.capabilities.has(cap)) counts.capabilities.set(cap, 0)
    })

    return counts
  }, [allCompanies, filters])

  const filteredCountriesList = useMemo(() => {
    return Array.from(dynamicCounts.countries.entries())
      .filter(([code]) => formatCountryLabel(code).toLowerCase().includes(countrySearch.toLowerCase()))
      .sort(([aCode, aCount], [bCode, bCount]) => {
        if (aCode === "US" && bCode !== "US") return -1
        if (bCode === "US" && aCode !== "US") return 1
        const aZero = aCount === 0
        const bZero = bCount === 0
        if (aZero !== bZero) return aZero ? 1 : -1
        return formatCountryLabel(aCode).localeCompare(formatCountryLabel(bCode))
      })
  }, [dynamicCounts.countries, countrySearch])

  const filteredStatesList = useMemo(() => {
    return Array.from(dynamicCounts.states.entries())
      .filter(([, data]) => data.label.toLowerCase().includes(stateSearch.toLowerCase()))
      .sort(([, a], [, b]) => {
        const aZero = a.count === 0
        const bZero = b.count === 0
        if (aZero !== bZero) return aZero ? 1 : -1
        return a.label.localeCompare(b.label)
      })
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

  const handleEmployeeRangeToggle = (range: EmployeeCountRange) => {
    updateFilter('employeeCountRanges', filters.employeeCountRanges.includes(range) ? filters.employeeCountRanges.filter(r => r !== range) : [...filters.employeeCountRanges, range])
  }

  const activeCount = filters.countries.length + filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0) + filters.employeeCountRanges.length

  const employeeCountRangeList = useMemo(() => {
    return EmployeeCountRanges.map((range, index) => ({
      range,
      count: dynamicCounts.employeeCountRanges.get(range) || 0,
      order: index
    }))
      .sort((a, b) => {
        const aZero = a.count === 0
        const bZero = b.count === 0
        if (aZero !== bZero) return aZero ? 1 : -1
        return a.order - b.order
      })
      .map(({ range, count }) => ({ range, count }))
  }, [dynamicCounts.employeeCountRanges])

  const capabilityList = useMemo(() => {
    return Array.from(dynamicCounts.capabilities.entries()).sort(([capA, countA], [capB, countB]) => {
      const aZero = countA === 0
      const bZero = countB === 0
      if (aZero !== bZero) return aZero ? 1 : -1
      return CAPABILITY_NAMES[capA].localeCompare(CAPABILITY_NAMES[capB])
    })
  }, [dynamicCounts.capabilities])

  const visibleCountries = showAllCountries ? filteredCountriesList : filteredCountriesList.slice(0, 3)
  const visibleStates = showAllStates ? filteredStatesList : filteredStatesList.slice(0, 3)
  const visibleCapabilities = showAllCapabilities ? capabilityList : capabilityList.slice(0, 5)
  const visibleEmployees = showAllEmployees ? employeeCountRangeList : employeeCountRangeList.slice(0, 5)

  return (
    <>
      {/* TODO: Mobile Toggle is not deprecated; keep until MobileFilterBar is implemented across mobile filters because that bar is not in use elsewhere — tracking: GH-2345.
          FIXME: Remove after MobileFilterBar rollout covers all mobile entry points and product design signs off (owner: Product design). */}
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
        w-[250px] lg:w-full lg:max-w-[220px]
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

        <div className="px-3 lg:px-0 pb-6 pt-3 lg:pt-0 lg:sticky lg:top-4">
          <div className="rounded-2xl border border-gray-200/80  bg-gradient-to-b from-blue-50/60 via-white to-white shadow-sm ring-1 ring-gray-100/70 backdrop-blur supports-[backdrop-filter]:bg-white/90">
            <div className="px-2.5 py-3 lg:px-3 lg:py-4 space-y-5">
              <FilterGroup 
                title="Country" 
                isOpen={expandedSections.includes('countries')} 
                onToggle={() => toggleSection('countries')}
                count={filters.countries.length}
              >
                <div className="mb-1.5 relative transition-opacity duration-200 opacity-90 group-hover/filter:opacity-100 group-focus-within/filter:opacity-100">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 group-hover/filter:text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search countries..." 
                    value={countrySearch}
                    onChange={(e) => setCountrySearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 rounded-full text-gray-600 focus:ring-0 focus:outline-none placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-1 pr-2">
                  {visibleCountries.map(([code, count]) => (
                    <CheckboxOption 
                      key={code}
                      label={formatCountryLabel(code)}
                      count={count}
                      checked={filters.countries.includes(code)}
                      onChange={() => handleCountryToggle(code)}
                    />
                  ))}
                  {filteredCountriesList.length === 0 && <EmptyState />}
                  {!showAllCountries && filteredCountriesList.length > visibleCountries.length && (
                    <button
                      type="button"
                      onClick={() => setShowAllCountries(true)}
                      className="text-[11px] font-medium text-blue-700/80 hover:text-blue-800 transition-colors"
                    >
                      Show {filteredCountriesList.length - visibleCountries.length} more
                    </button>
                  )}
                  {showAllCountries && filteredCountriesList.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCountries(false)}
                      className="text-[11px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Show fewer
                    </button>
                  )}
                </div>
              </FilterGroup>

              <FilterGroup 
                title="State" 
                isOpen={expandedSections.includes('states')} 
                onToggle={() => toggleSection('states')}
                count={filters.states.length}
              >
                <div className="mb-1.5 relative transition-opacity duration-200 opacity-90 group-hover/filter:opacity-100 group-focus-within/filter:opacity-100">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300 group-hover/filter:text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search states..." 
                    value={stateSearch}
                    onChange={(e) => setStateSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-transparent border-0 rounded-full text-gray-600 focus:ring-0 focus:outline-none placeholder:text-gray-400"
                  />
                </div>
                <div className="space-y-1 pr-2">
                  {visibleStates.map(([code, data]) => (
                    <CheckboxOption 
                      key={code}
                      label={data.label}
                      count={data.count}
                      checked={filters.states.includes(code)}
                      onChange={() => handleStateToggle(code)}
                    />
                  ))}
                  {filteredStatesList.length === 0 && <EmptyState />}
                  {!showAllStates && filteredStatesList.length > visibleStates.length && (
                    <button
                      type="button"
                      onClick={() => setShowAllStates(true)}
                      className="text-[11px] font-medium text-blue-700/80 hover:text-blue-800 transition-colors"
                    >
                      Show {filteredStatesList.length - visibleStates.length} more
                    </button>
                  )}
                  {showAllStates && filteredStatesList.length > 3 && (
                    <button
                      type="button"
                      onClick={() => setShowAllStates(false)}
                      className="text-[11px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Show fewer
                    </button>
                  )}
                </div>
              </FilterGroup>

              <FilterGroup 
                title="Capabilities" 
                isOpen={expandedSections.includes('capabilities')} 
                onToggle={() => toggleSection('capabilities')}
                count={filters.capabilities.length}
              >
                <div className="space-y-1 pr-1">
                  {visibleCapabilities.map(([cap, count]) => (
                    <CheckboxOption 
                      key={cap}
                      label={CAPABILITY_NAMES[cap]}
                      count={count}
                      checked={filters.capabilities.includes(cap)}
                      onChange={() => handleCapabilityToggle(cap)}
                    />
                  ))}
                  {!showAllCapabilities && dynamicCounts.capabilities.size > visibleCapabilities.length && (
                    <button
                      type="button"
                      onClick={() => setShowAllCapabilities(true)}
                      className="text-[11px] font-medium text-blue-700/80 hover:text-blue-800 transition-colors"
                    >
                      Show {dynamicCounts.capabilities.size - visibleCapabilities.length} more
                    </button>
                  )}
                  {showAllCapabilities && dynamicCounts.capabilities.size > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllCapabilities(false)}
                      className="text-[11px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Show fewer
                    </button>
                  )}
                </div>
              </FilterGroup>

              <FilterGroup 
                title="Volume" 
                isOpen={expandedSections.includes('volume')} 
                onToggle={() => toggleSection('volume')}
                count={filters.productionVolume ? 1 : 0}
              >
                <div className="flex gap-1">
                  {(['low', 'medium', 'high'] as ProductionVolume[]).map(vol => {
                    const isActive = filters.productionVolume === vol
                    return (
                      <button
                        key={vol}
                        type="button"
                        onClick={() => updateFilter('productionVolume', isActive ? null : vol)}
                        className={`flex-1 px-2 py-1.5 text-xs font-semibold border rounded-md transition-colors ${
                          isActive
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300 hover:text-blue-700'
                        }`}
                        aria-pressed={isActive}
                      >
                        {VOLUME_NAMES[vol]}
                      </button>
                    )
                  })}
                </div>
              </FilterGroup>

              <FilterGroup 
                title="Employees" 
                isOpen={expandedSections.includes('employees')} 
                onToggle={() => toggleSection('employees')}
                count={filters.employeeCountRanges.length}
              >
                <div className="space-y-1 pr-1">
                  {visibleEmployees.map(({ range, count }) => (
                    <CheckboxOption
                      key={range}
                      label={`${range} employees`}
                      count={count}
                      checked={filters.employeeCountRanges.includes(range)}
                      onChange={() => handleEmployeeRangeToggle(range)}
                    />
                  ))}
                  {!showAllEmployees && employeeCountRangeList.length > visibleEmployees.length && (
                    <button
                      type="button"
                      onClick={() => setShowAllEmployees(true)}
                      className="text-[11px] font-medium text-blue-700/80 hover:text-blue-800 transition-colors"
                    >
                      Show {employeeCountRangeList.length - visibleEmployees.length} more
                    </button>
                  )}
                  {showAllEmployees && employeeCountRangeList.length > 5 && (
                    <button
                      type="button"
                      onClick={() => setShowAllEmployees(false)}
                      className="text-[11px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Show fewer
                    </button>
                  )}
                </div>
              </FilterGroup>
            </div>
          </div>
        </div>
      </div>
      
      {isOpen && <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-20 lg:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}

/* --- Subcomponents --- */

interface FilterGroupProps {
  title: string
  isOpen: boolean
  onToggle: () => void
  count: number
  children: React.ReactNode
}

function FilterGroup({ title, isOpen, onToggle, count, children }: FilterGroupProps) {
  const collapsedStyles = isOpen
    ? 'bg-white border border-gray-200/80'
    : 'bg-white border border-transparent'

  return (
    <div className={`group/filter rounded-xl transition-colors duration-200 ${collapsedStyles}`}>
      <button 
        onClick={onToggle} 
        className="relative w-full flex items-center justify-between px-3 py-2.5 select-none group text-[11px] font-semibold uppercase tracking-[0.08em] text-gray-500 hover:text-gray-700"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2 text-left">
          <span className="truncate">{title}</span>
          {count > 0 && (
            <span className="ml-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {count}
            </span>
          )}
        </div>
        <ChevronDown className={`absolute right-2 w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="px-1.5 pb-3 pt-1">
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
      group flex items-center justify-between gap-2 py-1 px-1.5 rounded-md transition-colors
      ${checked ? 'bg-transparent' : 'hover:bg-gray-50'}
      ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
    `}>
      <div className="flex items-center gap-2 min-w-0 overflow-hidden">
        <div className={`
          relative flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-[3px] border transition-colors duration-200
          ${checked ? 'border-blue-600 bg-blue-600 text-white shadow-[0_1px_4px_rgba(37,99,235,0.28)]' : 'border-gray-300 bg-white'}
          ${disabled ? 'opacity-70' : 'group-hover:border-blue-300 group-hover:bg-blue-50/40'}
        `}>
          {checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
        </div>
        <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} disabled={disabled} />
        <span className={`text-sm truncate transition-colors ${checked ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-gray-800'}`}>
          {label}
        </span>
      </div>
      <span className={`text-[10px] tabular-nums transition-colors ${checked ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'}`}>
        {count}
      </span>
    </label>
  )
}



function EmptyState() {
  return <div className="py-6 text-center text-xs text-gray-400 italic bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-2">No matches found</div>
}
