'use client'

import { useState } from 'react'
import { useFilters } from '../contexts/FilterContext'
import { ChevronDown, ChevronRight, X, Filter } from 'lucide-react'
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
  const [isOpen, setIsOpen] = useState(true)
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

  return (
    <>
      {/* Mobile/Desktop Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-24 z-30 bg-white shadow-lg rounded-lg p-2 lg:hidden"
      >
        <Filter className="w-5 h-5" />
        {activeFilterCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:relative top-0 left-0 h-full z-20 bg-white shadow-lg transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        w-80 lg:w-full overflow-y-auto
      `}>
        <div className="p-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Filters</h2>
            <div className="flex gap-2">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Clear all
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search companies..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Active Filters Pills */}
          {activeFilterCount > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {filters.searchTerm && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  &quot;{filters.searchTerm}&quot;
                  <button onClick={() => updateFilter('searchTerm', '')}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {filters.states.map(state => (
                <span key={state} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {state}
                  <button onClick={() => handleCheckboxChange('states', state)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {filters.capabilities.map(cap => (
                <span key={cap} className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {cap.replace('_', ' ')}
                  <button onClick={() => handleCheckboxChange('capabilities', cap)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {/* Location Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('location')}
              className="flex items-center justify-between w-full font-semibold mb-2"
            >
              <span>Location</span>
              {expandedSections.includes('location') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('location') && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(filterCounts.states)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([state, count]) => (
                    <label key={state} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.states.includes(state)}
                        onChange={() => handleCheckboxChange('states', state)}
                        className="rounded"
                      />
                      <span className="text-sm">{state}</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </label>
                  ))}
              </div>
            )}
          </div>

          {/* Capabilities Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('capabilities')}
              className="flex items-center justify-between w-full font-semibold mb-2"
            >
              <span>Capabilities</span>
              {expandedSections.includes('capabilities') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('capabilities') && (
              <div className="space-y-2">
                {Object.entries(filterCounts.capabilities).map(([cap, count]) => (
                  <label key={cap} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.capabilities.includes(cap)}
                      onChange={() => handleCheckboxChange('capabilities', cap)}
                      className="rounded"
                    />
                    <span className="text-sm">{cap.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Volume Capability */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('volume')}
              className="flex items-center justify-between w-full font-semibold mb-2"
            >
              <span>Production Volume</span>
              {expandedSections.includes('volume') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('volume') && (
              <div className="space-y-2">
                {Object.entries(filterCounts.volumeCapability).map(([vol, count]) => (
                  <label key={vol} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.volumeCapability.includes(vol)}
                      onChange={() => handleCheckboxChange('volumeCapability', vol)}
                      className="rounded"
                    />
                    <span className="text-sm">{vol.charAt(0).toUpperCase() + vol.slice(1)} Volume</span>
                    <span className="text-xs text-gray-500">({count})</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Certifications Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('certifications')}
              className="flex items-center justify-between w-full font-semibold mb-2"
            >
              <span>Certifications</span>
              {expandedSections.includes('certifications') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('certifications') && (
              <div className="space-y-2">
                {Object.entries(filterCounts.certifications)
                  .slice(0, 10) // Limit to top 10
                  .map(([cert, count]) => (
                    <label key={cert} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.certifications.includes(cert)}
                        onChange={() => handleCheckboxChange('certifications', cert)}
                        className="rounded"
                      />
                      <span className="text-sm">{cert.replace(/_/g, ' ').toUpperCase()}</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </label>
                  ))}
              </div>
            )}
          </div>

          {/* Industries Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('industries')}
              className="flex items-center justify-between w-full font-semibold mb-2"
            >
              <span>Industries</span>
              {expandedSections.includes('industries') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('industries') && (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {Object.entries(filterCounts.industries)
                  .slice(0, 15) // Limit display
                  .map(([ind, count]) => (
                    <label key={ind} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.industries.includes(ind)}
                        onChange={() => handleCheckboxChange('industries', ind)}
                        className="rounded"
                      />
                      <span className="text-sm">{ind.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </label>
                  ))}
              </div>
            )}
          </div>

          {/* Employee Range Filter */}
          <div className="mb-4">
            <button
              onClick={() => toggleSection('employees')}
              className="flex items-center justify-between w-full font-semibold mb-2"
            >
              <span>Company Size</span>
              {expandedSections.includes('employees') ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.includes('employees') && (
              <div className="space-y-2">
                {Object.entries(filterCounts.employeeRange)
                  .sort(([a], [b]) => {
                    const order = ['<50', '50-150', '150-500', '500-1000', '1000+']
                    return order.indexOf(a) - order.indexOf(b)
                  })
                  .map(([range, count]) => (
                    <label key={range} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.employeeRange.includes(range)}
                        onChange={() => handleCheckboxChange('employeeRange', range)}
                        className="rounded"
                      />
                      <span className="text-sm">{range} employees</span>
                      <span className="text-xs text-gray-500">({count})</span>
                    </label>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}