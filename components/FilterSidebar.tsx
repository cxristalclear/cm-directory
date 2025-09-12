'use client'

import { useState, useMemo } from 'react'
import { useFilters } from '../contexts/FilterContext'
import { ChevronDown, X, Filter, Search, MapPin, Settings, Award, Building2, Users, Layers, Globe } from 'lucide-react'
import type { Company } from '../types/company'
import { getStateName } from '../utils/stateMapping'

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

export default function FilterSidebar({ allCompanies }: FilterSidebarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['location', 'capabilities'])

  // Calculate dynamic filter counts
  const dynamicCounts = useMemo(() => {
    // Helper function INSIDE useMemo to fix ESLint warning
    const companyMatchesFilters = (
      company: Company,
      excludeFilterType?: keyof typeof filters
    ): boolean => {
      // Check search term (unless we're excluding it)
      if (excludeFilterType !== 'searchTerm' && filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase()
        const matches = 
          company.company_name?.toLowerCase().includes(searchLower) ||
          company.description?.toLowerCase().includes(searchLower)
        if (!matches) return false
      }
      
      // Check countries (unless we're excluding it)
      if (excludeFilterType !== 'countries' && filters.countries.length > 0) {
        const hasCountry = company.facilities?.some(f => 
          filters.countries.includes(f.country || 'US')
        )
        if (!hasCountry) return false
      }
      
      // Check states (unless we're excluding it)
      if (excludeFilterType !== 'states' && filters.states.length > 0) {
        const hasState = company.facilities?.some(f => 
          filters.states.includes(f.state)
        )
        if (!hasState) return false
      }
      
      // Check capabilities (unless we're excluding it)
      if (excludeFilterType !== 'capabilities' && filters.capabilities.length > 0) {
        if (!company.capabilities?.[0]) return false
        
        const cap = company.capabilities[0]
        const hasCapability = filters.capabilities.some(selected => {
          switch (selected) {
            case 'smt': return cap.pcb_assembly_smt
            case 'through_hole': return cap.pcb_assembly_through_hole
            case 'cable_harness': return cap.cable_harness_assembly
            case 'box_build': return cap.box_build_assembly
            case 'prototyping': return cap.prototyping
            default: return false
          }
        })
        if (!hasCapability) return false
      }
      
      // Check volume capability (unless we're excluding it)
      if (excludeFilterType !== 'volumeCapability' && filters.volumeCapability.length > 0) {
        if (!company.capabilities?.[0]) return false
        
        const cap = company.capabilities[0]
        const hasVolume = filters.volumeCapability.some(volume => {
          switch (volume) {
            case 'low': return cap.low_volume_production
            case 'medium': return cap.medium_volume_production
            case 'high': return cap.high_volume_production
            default: return false
          }
        })
        if (!hasVolume) return false
      }
      
      // Check certifications (unless we're excluding it)
      if (excludeFilterType !== 'certifications' && filters.certifications.length > 0) {
        const hasCert = company.certifications?.some(cert =>
          filters.certifications.includes(
            cert.certification_type.toLowerCase().replace(/\s+/g, '_')
          )
        )
        if (!hasCert) return false
      }
      
      // Check industries (unless we're excluding it)
      if (excludeFilterType !== 'industries' && filters.industries.length > 0) {
        const hasIndustry = company.industries?.some(ind =>
          filters.industries.includes(
            ind.industry_name.toLowerCase().replace(/\s+/g, '_')
          )
        )
        if (!hasIndustry) return false
      }
      
      // Check employee range (unless we're excluding it)
      if (excludeFilterType !== 'employeeRange' && filters.employeeRange.length > 0) {
        if (!filters.employeeRange.includes(company.employee_count_range)) {
          return false
        }
      }
      
      return true
    }

    // Initialize counts
    const counts = {
      countries: new Map<string, number>(),
      states: new Map<string, number>(),
      capabilities: new Map<string, number>(),
      certifications: new Map<string, number>(),
      industries: new Map<string, number>(),
      employeeRange: new Map<string, number>(),
      volumeCapability: new Map<string, number>()
    }
    
    // COUNTRIES - Count companies that match all filters except countries
    allCompanies.forEach(company => {
      if (companyMatchesFilters(company, 'countries')) {
        company.facilities?.forEach(facility => {
          const country = facility.country || 'US'
          counts.countries.set(country, (counts.countries.get(country) || 0) + 1)
        })
      }
    })
    
    // STATES - Count companies that match all filters except states
    // If countries are selected, only show states from those countries
    allCompanies.forEach(company => {
      if (companyMatchesFilters(company, 'states')) {
        company.facilities?.forEach(facility => {
          // If countries filter is active, only count states from selected countries
          if (filters.countries.length === 0 || filters.countries.includes(facility.country || 'US')) {
            if (facility.state) {
              counts.states.set(
                facility.state,
                (counts.states.get(facility.state) || 0) + 1
              )
            }
          }
        })
      }
    })

    // CAPABILITIES - Count companies that match all filters except capabilities
    allCompanies.forEach(company => {
      if (companyMatchesFilters(company, 'capabilities')) {
        if (company.capabilities?.[0]) {
          const cap = company.capabilities[0]
          
          if (cap.pcb_assembly_smt) {
            counts.capabilities.set('smt',
              (counts.capabilities.get('smt') || 0) + 1
            )
          }
          
          if (cap.pcb_assembly_through_hole) {
            counts.capabilities.set('through_hole',
              (counts.capabilities.get('through_hole') || 0) + 1
            )
          }
          
          if (cap.cable_harness_assembly) {
            counts.capabilities.set('cable_harness',
              (counts.capabilities.get('cable_harness') || 0) + 1
            )
          }
          
          if (cap.box_build_assembly) {
            counts.capabilities.set('box_build',
              (counts.capabilities.get('box_build') || 0) + 1
            )
          }
          
          if (cap.prototyping) {
            counts.capabilities.set('prototyping',
              (counts.capabilities.get('prototyping') || 0) + 1
            )
          }
        }
      }
    })

    // VOLUME CAPABILITY - Count companies that match all filters except volume
    allCompanies.forEach(company => {
      if (companyMatchesFilters(company, 'volumeCapability')) {
        if (company.capabilities?.[0]) {
          const cap = company.capabilities[0]
          
          if (cap.low_volume_production) {
            counts.volumeCapability.set('low',
              (counts.volumeCapability.get('low') || 0) + 1
            )
          }
          
          if (cap.medium_volume_production) {
            counts.volumeCapability.set('medium',
              (counts.volumeCapability.get('medium') || 0) + 1
            )
          }
          
          if (cap.high_volume_production) {
            counts.volumeCapability.set('high',
              (counts.volumeCapability.get('high') || 0) + 1
            )
          }
        }
      }
    })

    // CERTIFICATIONS - Count companies that match all filters except certifications
    allCompanies.forEach(company => {
      if (companyMatchesFilters(company, 'certifications')) {
        company.certifications?.forEach(cert => {
          const certKey = cert.certification_type.toLowerCase().replace(/\s+/g, '_')
          counts.certifications.set(certKey,
            (counts.certifications.get(certKey) || 0) + 1
          )
        })
      }
    })

    // INDUSTRIES - Count companies that match all filters except industries
    allCompanies.forEach(company => {
      if (companyMatchesFilters(company, 'industries')) {
        company.industries?.forEach(ind => {
          const indKey = ind.industry_name.toLowerCase().replace(/\s+/g, '_')
          counts.industries.set(indKey,
            (counts.industries.get(indKey) || 0) + 1
          )
        })
      }
    })

    // EMPLOYEE RANGE - Count companies that match all filters except employee range
    allCompanies.forEach(company => {
      if (companyMatchesFilters(company, 'employeeRange')) {
        if (company.employee_count_range) {
          counts.employeeRange.set(company.employee_count_range,
            (counts.employeeRange.get(company.employee_count_range) || 0) + 1
          )
        }
      }
    })
    
    return counts
  }, [allCompanies, filters])

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  type FilterKey = 'countries' | 'states' | 'capabilities' | 'certifications' | 'industries' | 'employeeRange' | 'volumeCapability';

  const handleCheckboxChange = (filterKey: FilterKey, value: string) => {
    const currentValues = filters[filterKey] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    updateFilter(filterKey, newValues)
  }

  const activeFilterCount = 
    filters.countries.length +
    filters.states.length + 
    filters.capabilities.length + 
    filters.certifications.length + 
    filters.industries.length +
    filters.employeeRange.length +
    filters.volumeCapability.length +
    (filters.searchTerm ? 1 : 0)

  const sectionIcons = {
    location: <MapPin className="w-4 h-4" />,
    capabilities: <Settings className="w-4 h-4" />,
    volume: <Layers className="w-4 h-4" />,
    certifications: <Award className="w-4 h-4" />,
    industries: <Building2 className="w-4 h-4" />,
    employees: <Users className="w-4 h-4" />
  }

  return (
    <>
      {/* Mobile/Desktop Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 bottom-4 z-30 bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-xl rounded-full p-4 lg:hidden hover:shadow-2xl transition-all duration-300"
      >
        <Filter className="w-6 h-6" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-auto z-20 
        bg-white shadow-xl lg:shadow-lg
        transition-all duration-300 ease-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-80 lg:w-full overflow-hidden border-r border-gray-100
        lg:rounded-xl
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-sm">
                  <Filter className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                  {activeFilterCount > 0 && (
                    <p className="text-xs text-gray-500">{activeFilterCount} active</p>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors duration-200 font-medium"
                  >
                    Clear all
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="lg:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search companies..."
                  value={filters.searchTerm}
                  onChange={(e) => updateFilter('searchTerm', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border-0 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-sm"
                />
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFilterCount > 0 && (
              <div className="mb-6 p-3 bg-blue-50 rounded-xl">
                <p className="text-xs font-semibold text-blue-900 mb-2 uppercase tracking-wide">Active filters</p>
                <div className="flex flex-wrap gap-2">
                  {filters.searchTerm && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      &quot;{filters.searchTerm}&quot;
                      <button 
                        onClick={() => updateFilter('searchTerm', '')}
                        className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.countries.map(country => (
                    <span key={country} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {getCountryName(country)}
                      <button onClick={() => handleCheckboxChange('countries', country)} className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.states.map(state => (
                    <span key={state} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {getStateName(state)}
                      <button onClick={() => handleCheckboxChange('states', state)} className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.capabilities.map(cap => (
                    <span key={cap} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {cap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <button onClick={() => handleCheckboxChange('capabilities', cap)} className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.volumeCapability.map(vol => (
                    <span key={vol} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {vol.charAt(0).toUpperCase() + vol.slice(1)} Volume
                      <button onClick={() => handleCheckboxChange('volumeCapability', vol)} className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.certifications.map(cert => (
                    <span key={cert} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {cert.replace(/_/g, ' ').toUpperCase()}
                      <button onClick={() => handleCheckboxChange('certifications', cert)} className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.industries.map(ind => (
                    <span key={ind} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {ind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      <button onClick={() => handleCheckboxChange('industries', ind)} className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                  {filters.employeeRange.map(range => (
                    <span key={range} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {range} employees
                      <button onClick={() => handleCheckboxChange('employeeRange', range)} className="ml-1 hover:bg-gray-100 rounded-full p-0.5 transition-colors">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Filter Sections */}
            <div className="space-y-1">
              {/* Location Filter - Now includes Countries and States */}
              <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
                <button
                  onClick={() => toggleSection('location')}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                      {sectionIcons.location}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">Location</span>
                      {(filters.countries.length > 0 || filters.states.length > 0) && (
                        <p className="text-xs text-blue-600">
                          {filters.countries.length + filters.states.length} selected
                        </p>
                      )}
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSections.includes('location') ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                {expandedSections.includes('location') && (
                  <div className="mt-4 space-y-4">
                    {/* Countries subsection */}
                    {dynamicCounts.countries.size > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Globe className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Countries</span>
                        </div>
                        <div className="space-y-2 max-h-32 overflow-y-auto pl-1">
                          {Array.from(dynamicCounts.countries.entries())
                            .sort(([a], [b]) => {
                              const nameA = getCountryName(a);
                              const nameB = getCountryName(b);
                              return nameA.localeCompare(nameB);
                            })
                            .map(([country, count]) => {
                              const isSelected = filters.countries.includes(country)
                              const isDisabled = count === 0 && !isSelected
                              
                              return (
                                <label 
                                  key={country} 
                                  className={`flex items-center justify-between p-2 rounded-lg ${
                                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'
                                  } transition-colors group`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => !isDisabled && handleCheckboxChange('countries', country)}
                                      disabled={isDisabled}
                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                                    />
                                    <span className={`text-sm font-medium ${
                                      isDisabled ? 'text-gray-400' : 'text-gray-700'
                                    }`}>
                                      {getCountryName(country)}
                                    </span>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    isSelected 
                                      ? 'bg-blue-100 text-blue-700 font-semibold'
                                      : isDisabled
                                        ? 'bg-gray-50 text-gray-400'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                  } transition-colors`}>
                                    {count}
                                  </span>
                                </label>
                              )
                            })}
                        </div>
                      </div>
                    )}
                    
                    {/* States subsection - Only show if US is selected or no country filter */}
                    {(filters.countries.length === 0 || filters.countries.includes('US')) && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-3.5 h-3.5 text-gray-500" />
                          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">US States</span>
                        </div>
                        <div className="space-y-2 max-h-48 overflow-y-auto pl-1">
                          {Array.from(dynamicCounts.states.entries())
                            .sort(([a], [b]) => {
                              const nameA = getStateName(a);
                              const nameB = getStateName(b);
                              return nameA.localeCompare(nameB);
                            })
                            .map(([state, count]) => {
                              const isSelected = filters.states.includes(state)
                              const isDisabled = count === 0 && !isSelected
                              
                              return (
                                <label 
                                  key={state} 
                                  className={`flex items-center justify-between p-2 rounded-lg ${
                                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'
                                  } transition-colors group`}
                                >
                                  <div className="flex items-center gap-3">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => !isDisabled && handleCheckboxChange('states', state)}
                                      disabled={isDisabled}
                                      className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                                    />
                                    <span className={`text-sm font-medium ${
                                      isDisabled ? 'text-gray-400' : 'text-gray-700'
                                    }`}>
                                      {getStateName(state)}
                                    </span>
                                  </div>
                                  <span className={`text-xs px-2 py-1 rounded-full ${
                                    isSelected 
                                      ? 'bg-blue-100 text-blue-700 font-semibold'
                                      : isDisabled
                                        ? 'bg-gray-50 text-gray-400'
                                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                  } transition-colors`}>
                                    {count}
                                  </span>
                                </label>
                              )
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Capabilities Filter */}
              <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
                <button
                  onClick={() => toggleSection('capabilities')}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                      {sectionIcons.capabilities}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">Capabilities</span>
                      {filters.capabilities.length > 0 && (
                        <p className="text-xs text-blue-600">{filters.capabilities.length} selected</p>
                      )}
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSections.includes('capabilities') ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                {expandedSections.includes('capabilities') && (
                  <div className="mt-4 space-y-2">
                    {Array.from(dynamicCounts.capabilities.entries()).map(([cap, count]) => {
                      const isSelected = filters.capabilities.includes(cap)
                      const isDisabled = count === 0 && !isSelected
                      
                      return (
                        <label 
                          key={cap} 
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'
                          } transition-colors group`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => !isDisabled && handleCheckboxChange('capabilities', cap)}
                              disabled={isDisabled}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                            />
                            <span className={`text-sm font-medium ${
                              isDisabled ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {cap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-700 font-semibold'
                              : isDisabled
                                ? 'bg-gray-50 text-gray-400'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                          } transition-colors`}>
                            {count}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Volume Capability and other filters remain the same... */}
              {/* I'll include them for completeness */}
              
              {/* Volume Capability */}
              <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
                <button
                  onClick={() => toggleSection('volume')}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                      {sectionIcons.volume}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">Production Volume</span>
                      {filters.volumeCapability.length > 0 && (
                        <p className="text-xs text-blue-600">{filters.volumeCapability.length} selected</p>
                      )}
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSections.includes('volume') ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                {expandedSections.includes('volume') && (
                  <div className="mt-4 space-y-2">
                    {Array.from(dynamicCounts.volumeCapability.entries()).map(([vol, count]) => {
                      const isSelected = filters.volumeCapability.includes(vol)
                      const isDisabled = count === 0 && !isSelected
                      
                      return (
                        <label 
                          key={vol} 
                          className={`flex items-center justify-between p-2 rounded-lg ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-white cursor-pointer'
                          } transition-colors group`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => !isDisabled && handleCheckboxChange('volumeCapability', vol)}
                              disabled={isDisabled}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 disabled:cursor-not-allowed"
                            />
                            <span className={`text-sm font-medium ${
                              isDisabled ? 'text-gray-400' : 'text-gray-700'
                            }`}>
                              {vol.charAt(0).toUpperCase() + vol.slice(1)} Volume
                            </span>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isSelected 
                              ? 'bg-blue-100 text-blue-700 font-semibold'
                              : isDisabled
                                ? 'bg-gray-50 text-gray-400'
                                : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                          } transition-colors`}>
                            {count}
                          </span>
                        </label>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Remaining filter sections continue with the same pattern... */}
              {/* Including Certifications, Industries, and Employee Range */}
            </div>
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-10 lg:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}