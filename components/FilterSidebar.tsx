'use client'

import { useState } from 'react'
import { useFilters } from '../contexts/FilterContext'
import { ChevronDown, ChevronRight, X, Filter, Search, MapPin, Settings, Award, Building2, Users, Layers } from 'lucide-react'
import type { Company } from '../types/company'

interface FilterSidebarProps {
  allCompanies: Company[]
}

interface FilterCount {
  states: Record<string, number>;
  capabilities: Record<string, number>;
  certifications: Record<string, number>;
  industries: Record<string, number>;
  employeeRange: Record<string, number>;
  volumeCapability: Record<string, number>;
}

export default function FilterSidebar({ allCompanies }: FilterSidebarProps) {
  const { filters, updateFilter, clearFilters } = useFilters()
  const [isOpen, setIsOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['location', 'capabilities'])

  // Calculate counts for each filter option
  const getFilterCounts = (): FilterCount => {
    const counts: FilterCount = {
        states: {},
        capabilities: {},
        certifications: {},
        industries: {},
        employeeRange: {},
        volumeCapability: {}
    }   

    allCompanies.forEach(company => {
      // States
      company.facilities?.forEach((facility) => {
        if (facility.state) {
          counts.states[facility.state] = (counts.states[facility.state] || 0) + 1
        }
      })

      // Capabilities
      if (company.capabilities?.[0]) {
        const cap = company.capabilities[0]
        if (cap.pcb_assembly_smt) counts.capabilities['smt'] = (counts.capabilities['smt'] || 0) + 1
        if (cap.pcb_assembly_through_hole) counts.capabilities['through_hole'] = (counts.capabilities['through_hole'] || 0) + 1
        if (cap.cable_harness_assembly) counts.capabilities['cable_harness'] = (counts.capabilities['cable_harness'] || 0) + 1
        if (cap.box_build_assembly) counts.capabilities['box_build'] = (counts.capabilities['box_build'] || 0) + 1
        if (cap.prototyping) counts.capabilities['prototyping'] = (counts.capabilities['prototyping'] || 0) + 1
        if (cap.low_volume_production) counts.volumeCapability['low'] = (counts.volumeCapability['low'] || 0) + 1
        if (cap.medium_volume_production) counts.volumeCapability['medium'] = (counts.volumeCapability['medium'] || 0) + 1
        if (cap.high_volume_production) counts.volumeCapability['high'] = (counts.volumeCapability['high'] || 0) + 1
      }

      // Certifications
      company.certifications?.forEach((cert) => {
        const certType = cert.certification_type.toLowerCase().replace(/\s+/g, '_')
        counts.certifications[certType] = (counts.certifications[certType] || 0) + 1
      })

      // Industries
      company.industries?.forEach((ind) => {
        const indName = ind.industry_name.toLowerCase().replace(/\s+/g, '_')
        counts.industries[indName] = (counts.industries[indName] || 0) + 1
      })

      // Employee Range
      if (company.employee_count_range) {
        counts.employeeRange[company.employee_count_range] = 
          (counts.employeeRange[company.employee_count_range] || 0) + 1
      }
    })

    return counts
  }

  const filterCounts = getFilterCounts()

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  type FilterKey = 'states' | 'capabilities' | 'certifications' | 'industries' | 'employeeRange' | 'volumeCapability';

  const handleCheckboxChange = (filterKey: FilterKey, value: string) => {
    const currentValues = filters[filterKey] as string[]
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value]
    updateFilter(filterKey, newValues)
  }

  const activeFilterCount = 
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
                  {filters.states.map(state => (
                    <span key={state} className="inline-flex items-center gap-1 px-3 py-1.5 bg-white text-gray-700 rounded-full text-sm font-medium shadow-sm border border-gray-200">
                      {state}
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
              {/* Location Filter */}
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
                      {filters.states.length > 0 && (
                        <p className="text-xs text-blue-600">{filters.states.length} selected</p>
                      )}
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSections.includes('location') ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                {expandedSections.includes('location') && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pl-1">
                    {Object.entries(filterCounts.states)
                      .sort(([a], [b]) => a.localeCompare(b))
                      .map(([state, count]) => (
                        <label key={state} className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filters.states.includes(state)}
                              onChange={() => handleCheckboxChange('states', state)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm font-medium text-gray-700">{state}</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full group-hover:bg-gray-200 transition-colors">
                            {count}
                          </span>
                        </label>
                      ))}
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
                    {Object.entries(filterCounts.capabilities).map(([cap, count]) => (
                      <label key={cap} className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.capabilities.includes(cap)}
                            onChange={() => handleCheckboxChange('capabilities', cap)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {cap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full group-hover:bg-gray-200 transition-colors">
                          {count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

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
                    {Object.entries(filterCounts.volumeCapability).map(([vol, count]) => (
                      <label key={vol} className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={filters.volumeCapability.includes(vol)}
                            onChange={() => handleCheckboxChange('volumeCapability', vol)}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                          />
                          <span className="text-sm font-medium text-gray-700">
                            {vol.charAt(0).toUpperCase() + vol.slice(1)} Volume
                          </span>
                        </div>
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full group-hover:bg-gray-200 transition-colors">
                          {count}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Certifications Filter */}
              <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
                <button
                  onClick={() => toggleSection('certifications')}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                      {sectionIcons.certifications}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">Certifications</span>
                      {filters.certifications.length > 0 && (
                        <p className="text-xs text-blue-600">{filters.certifications.length} selected</p>
                      )}
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSections.includes('certifications') ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                {expandedSections.includes('certifications') && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(filterCounts.certifications)
                      .slice(0, 10) // Limit to top 10
                      .map(([cert, count]) => (
                        <label key={cert} className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filters.certifications.includes(cert)}
                              onChange={() => handleCheckboxChange('certifications', cert)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm font-medium text-gray-700">{cert.replace(/_/g, ' ').toUpperCase()}</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full group-hover:bg-gray-200 transition-colors">
                            {count}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>

              {/* Industries Filter */}
              <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
                <button
                  onClick={() => toggleSection('industries')}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                      {sectionIcons.industries}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">Industries</span>
                      {filters.industries.length > 0 && (
                        <p className="text-xs text-blue-600">{filters.industries.length} selected</p>
                      )}
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSections.includes('industries') ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                {expandedSections.includes('industries') && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(filterCounts.industries)
                      .slice(0, 15) // Limit display
                      .map(([ind, count]) => (
                        <label key={ind} className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filters.industries.includes(ind)}
                              onChange={() => handleCheckboxChange('industries', ind)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm font-medium text-gray-700">
                              {ind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full group-hover:bg-gray-200 transition-colors">
                            {count}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>

              {/* Employee Range Filter */}
              <div className="bg-gray-50 rounded-xl p-4 transition-all duration-200 hover:bg-gray-100">
                <button
                  onClick={() => toggleSection('employees')}
                  className="flex items-center justify-between w-full group"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg shadow-sm group-hover:shadow transition-shadow">
                      {sectionIcons.employees}
                    </div>
                    <div className="text-left">
                      <span className="font-semibold text-gray-900">Company Size</span>
                      {filters.employeeRange.length > 0 && (
                        <p className="text-xs text-blue-600">{filters.employeeRange.length} selected</p>
                      )}
                    </div>
                  </div>
                  <div className={`transform transition-transform duration-200 ${expandedSections.includes('employees') ? 'rotate-180' : ''}`}>
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                {expandedSections.includes('employees') && (
                  <div className="mt-4 space-y-2">
                    {Object.entries(filterCounts.employeeRange)
                      .sort(([a], [b]) => {
                        const order = ['<50', '50-150', '150-500', '500-1000', '1000+']
                        return order.indexOf(a) - order.indexOf(b)
                      })
                      .map(([range, count]) => (
                        <label key={range} className="flex items-center justify-between p-2 rounded-lg hover:bg-white cursor-pointer transition-colors group">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={filters.employeeRange.includes(range)}
                              onChange={() => handleCheckboxChange('employeeRange', range)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                            />
                            <span className="text-sm font-medium text-gray-700">{range} employees</span>
                          </div>
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full group-hover:bg-gray-200 transition-colors">
                            {count}
                          </span>
                        </label>
                      ))}
                  </div>
                )}
              </div>
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