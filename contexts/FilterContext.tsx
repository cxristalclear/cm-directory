'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useDebouncedCallback } from 'use-debounce'
import type { FilterState, FilterContextType } from '../types/company'

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    states: [],
    capabilities: [],
    certifications: [],
    industries: [],
    employeeRange: [],
    volumeCapability: []
  })

  const [filteredCount, setFilteredCount] = useState(0)

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams)
    
    setFilters({
      searchTerm: params.get('search') || '',
      states: params.get('states')?.split(',').filter(Boolean) || [],
      capabilities: params.get('capabilities')?.split(',').filter(Boolean) || [],
      certifications: params.get('certifications')?.split(',').filter(Boolean) || [],
      industries: params.get('industries')?.split(',').filter(Boolean) || [],
      employeeRange: params.get('employees')?.split(',').filter(Boolean) || [],
      volumeCapability: params.get('volume')?.split(',').filter(Boolean) || []
    })
  }, [searchParams])

  // Update URL when filters change
  const debouncedUpdateFilter = useDebouncedCallback(
    (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)
      
      startTransition(() => {
        const params = new URLSearchParams()
        
        if (newFilters.searchTerm) params.set('search', newFilters.searchTerm)
        if (newFilters.states.length) params.set('states', newFilters.states.join(','))
        if (newFilters.capabilities.length) params.set('capabilities', newFilters.capabilities.join(','))
        if (newFilters.certifications.length) params.set('certifications', newFilters.certifications.join(','))
        if (newFilters.industries.length) params.set('industries', newFilters.industries.join(','))
        if (newFilters.employeeRange.length) params.set('employees', newFilters.employeeRange.join(','))
        if (newFilters.volumeCapability.length) params.set('volume', newFilters.volumeCapability.join(','))

        router.replace(`${pathname}${params.toString() ? '?' + params.toString() : ''}`, {
          scroll: false // Prevent scrolling to top
        })
      })
    },
    300 // 300ms delay
  )

  // Use this for search term updates
  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    if (key === 'searchTerm') {
      debouncedUpdateFilter(key, value)
    } else {
      // Regular update for other filters
      const newFilters = { ...filters, [key]: value }
      setFilters(newFilters)

      // Update URL in a transition
      startTransition(() => {
        const params = new URLSearchParams()
        
        if (newFilters.searchTerm) params.set('search', newFilters.searchTerm)
        if (newFilters.states.length) params.set('states', newFilters.states.join(','))
        if (newFilters.capabilities.length) params.set('capabilities', newFilters.capabilities.join(','))
        if (newFilters.certifications.length) params.set('certifications', newFilters.certifications.join(','))
        if (newFilters.industries.length) params.set('industries', newFilters.industries.join(','))
        if (newFilters.employeeRange.length) params.set('employees', newFilters.employeeRange.join(','))
        if (newFilters.volumeCapability.length) params.set('volume', newFilters.volumeCapability.join(','))

        router.replace(`${pathname}${params.toString() ? '?' + params.toString() : ''}`, {
          scroll: false // Prevent scrolling to top
        })
      })
    }
  }

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      states: [],
      capabilities: [],
      certifications: [],
      industries: [],
      employeeRange: [],
      volumeCapability: []
    })
    router.push(pathname, {
      scroll: false // Also prevent scrolling when clearing filters
    })
  }

  return (
    <FilterContext.Provider value={{ 
      filters, 
      updateFilter, 
      clearFilters, 
      filteredCount, 
      setFilteredCount,
      isPending 
    }}>
      {children}
    </FilterContext.Provider>
  )
}

export const useFilters = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider')
  }
  return context
}