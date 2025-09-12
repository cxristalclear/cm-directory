"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Search, Building2, Filter, X, MapPin, Award, Settings } from "lucide-react"
import { useFilters } from "../contexts/FilterContext"
import { useRouter } from "next/navigation"
import type { Company } from "../types/company"
import { type LucideIcon } from "lucide-react"
import { getStateName } from '../utils/stateMapping'



interface HeaderProps {
  onSearchToggle?: () => void
  onFilterToggle?: () => void
  companies?: Company[]
}

export default function Header({ onSearchToggle, onFilterToggle, companies = [] }: HeaderProps) {
  const router = useRouter()
  const { filters, updateFilter } = useFilters()
  const [searchValue, setSearchValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Sync with filters context
  useEffect(() => {
    setSearchValue(filters.searchTerm)
  }, [filters.searchTerm])

  // Generate search suggestions
  const suggestions = useMemo(() => {
    if (!searchValue.trim() || searchValue.length < 2) return []

    const searchLower = searchValue.toLowerCase()
    const results: Array<{
      type: 'company' | 'capability' | 'location' | 'certification'
      value: string
      label: string
      icon: LucideIcon
      count?: number
    }> = []

    // Company name suggestions
    companies.forEach(company => {
      if (company.company_name?.toLowerCase().includes(searchLower)) {
        results.push({
          type: 'company',
          value: company.company_name,
          label: company.company_name,
          icon: Building2
        })
      }
    })

    // Location suggestions (cities and states)
    const locationSet = new Set<string>()
    companies.forEach(company => {
      company.facilities?.forEach(facility => {
        if (facility.city?.toLowerCase().includes(searchLower)) {
          locationSet.add(`${facility.city}, ${facility.state}`)
        }
        if (facility.state?.toLowerCase().includes(searchLower)) {
          locationSet.add(facility.state)
        }
      })
    })
    
    locationSet.forEach(location => {
      // Display full state name in suggestions
      const displayLabel = location.includes(',') 
        ? location.split(', ').map((part, i) => i === 1 ? getStateName(part) : part).join(', ')
        : getStateName(location);
        
      results.push({
        type: 'location',
        value: location, // Keep original for filtering
        label: displayLabel, // Show full name
        icon: MapPin,
        count: companies.filter(c => 
          c.facilities?.some(f => 
            location.includes(',') 
              ? `${f.city}, ${f.state}` === location
              : f.state === location
          )
        ).length
      })
    })

    // Capability suggestions
    const capabilityKeywords = [
      { key: 'smt', label: 'SMT Assembly' },
      { key: 'pcb', label: 'PCB Assembly' },
      { key: 'cable', label: 'Cable & Harness' },
      { key: 'box build', label: 'Box Build' },
      { key: 'prototype', label: 'Prototyping' },
      { key: 'through hole', label: 'Through-Hole' }
    ]

    capabilityKeywords.forEach(cap => {
      if (cap.label.toLowerCase().includes(searchLower) || cap.key.includes(searchLower)) {
        const count = companies.filter(c => {
          const capabilities = c.capabilities?.[0]
          if (!capabilities) return false
          
          switch(cap.key) {
            case 'smt': return capabilities.pcb_assembly_smt
            case 'pcb': return capabilities.pcb_assembly_smt || capabilities.pcb_assembly_through_hole
            case 'cable': return capabilities.cable_harness_assembly
            case 'box build': return capabilities.box_build_assembly
            case 'prototype': return capabilities.prototyping
            case 'through hole': return capabilities.pcb_assembly_through_hole
            default: return false
          }
        }).length

        results.push({
          type: 'capability',
          value: cap.label,
          label: cap.label,
          icon: Settings,
          count
        })
      }
    })

    // Certification suggestions
    const certSet = new Set<string>()
    companies.forEach(company => {
      company.certifications?.forEach(cert => {
        if (cert.certification_type?.toLowerCase().includes(searchLower)) {
          certSet.add(cert.certification_type)
        }
      })
    })

    certSet.forEach(cert => {
      results.push({
        type: 'certification',
        value: cert,
        label: cert,
        icon: Award,
        count: companies.filter(c => 
          c.certifications?.some(ce => ce.certification_type === cert)
        ).length
      })
    })

    // Limit to top 8 suggestions
    return results.slice(0, 8)
  }, [searchValue, companies])

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setShowSuggestions(true)
        setSelectedIndex(0)
        e.preventDefault()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        if (selectedIndex === 0) {
          inputRef.current?.focus()
        }
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex].value)
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
    }
  }

  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    updateFilter('searchTerm', value)
    setShowSuggestions(value.length >= 2)
    setSelectedIndex(-1)
  }

  const handleSuggestionClick = (value: string) => {
    setSearchValue(value)
    updateFilter('searchTerm', value)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    
    // Scroll to results if on homepage
    if (window.location.pathname === '/') {
      const resultsElement = document.querySelector('.companies-directory')
      resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleSearch = () => {
    if (searchValue.trim()) {
      updateFilter('searchTerm', searchValue.trim())
      setShowSuggestions(false)
      
      // Navigate to homepage if not already there
      if (window.location.pathname !== '/') {
        router.push(`/?search=${encodeURIComponent(searchValue.trim())}`)
      } else {
        // Scroll to results
        const resultsElement = document.querySelector('.companies-directory')
        resultsElement?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  const handleClear = () => {
    setSearchValue("")
    updateFilter('searchTerm', "")
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  return (
    <header className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="gradient-bg">
        {/* Navigation Bar */}
        <nav className="relative z-10 border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-sans">CM Directory</h1>
                  <p className="text-xs text-blue-100">Manufacturing Network</p>
                </div>
              </Link>

              <div className="hidden md:flex items-center space-x-6">
                <Link
                  href="/manufacturers"
                  className="text-white/90 hover:text-white transition-colors text-sm font-medium"
                >
                  Browse All
                </Link>
                <Link
                  href="/industries"
                  className="text-white/90 hover:text-white transition-colors text-sm font-medium"
                >
                  Industries
                </Link>
                <Link href="/about" className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  About
                </Link>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all backdrop-blur-sm">
                  Add Your Company
                </button>
              </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={onSearchToggle}
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={onFilterToggle}
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 py-8 md:py-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-sans leading-tight">
                Find Your Next Manufacturing Partner
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-2 leading-relaxed">
                Connect with verified contract manufacturers. Search by name, location, capabilities, and more.
              </p>
              {/* Enhanced Search Bar
              <div className="max-w-2xl mx-auto mb-6" ref={searchRef}>
                <div className="glass-effect rounded-2xl p-1 relative">
                  <div className="flex items-center">
                    <div className="flex-1 flex items-center space-x-3 px-4">
                      <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <input
                        ref={inputRef}
                        type="text"
                        value={searchValue}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => searchValue.length >= 2 && setShowSuggestions(true)}
                        placeholder="Search by company name, capability, or location..."
                        className="flex-1 bg-transparent border-none outline-none text-gray-700 placeholder-gray-400 text-lg"
                      />
                      {searchValue && (
                        <button
                          onClick={handleClear}
                          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                          aria-label="Clear search"
                        >
                          <X className="w-4 h-4 text-gray-500" />
                        </button>
                      )}
                    </div>
                    <button 
                      onClick={handleSearch}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors"
                    >
                      Search
                    </button>
                  </div>

                  {/* Search Suggestions Dropdown
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 right-0 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50">
                      <div className="py-2">
                        {suggestions.map((suggestion, index) => {
                          const Icon = suggestion.icon
                          return (
                            <button
                              key={`${suggestion.type}-${suggestion.value}`}
                              onClick={() => handleSuggestionClick(suggestion.value)}
                              onMouseEnter={() => setSelectedIndex(index)}
                              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors ${
                                selectedIndex === index ? 'bg-gray-50' : ''
                              }`}
                            >
                              <div className="flex items-center space-x-3">
                                <div className={`p-1.5 rounded-lg ${
                                  suggestion.type === 'company' ? 'bg-blue-100 text-blue-600' :
                                  suggestion.type === 'location' ? 'bg-green-100 text-green-600' :
                                  suggestion.type === 'capability' ? 'bg-purple-100 text-purple-600' :
                                  'bg-orange-100 text-orange-600'
                                }`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <div className="text-sm font-medium text-gray-900">
                                    {suggestion.label}
                                  </div>
                                  <div className="text-xs text-gray-500 capitalize">
                                    {suggestion.type}
                                  </div>
                                </div>
                              </div>
                              {suggestion.count !== undefined && (
                                <span className="text-xs text-gray-400">
                                  {suggestion.count} {suggestion.count === 1 ? 'result' : 'results'}
                                </span>
                              )}
                            </button>
                          )
                        })}
                      </div>
                      <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
                        <p className="text-xs text-gray-500">
                          Press <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs">↵</kbd> to search, 
                          <kbd className="px-1.5 py-0.5 bg-white rounded border border-gray-300 text-xs ml-1">↑↓</kbd> to navigate
                        </p>
                      </div>
                    </div>
                  )}
                </div> */}
              </div> 
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </header>
  )
}