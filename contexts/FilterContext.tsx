'use client'

import { createContext, useContext, useState, useEffect, type ReactNode, useTransition, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { parseFiltersFromSearchParams, serializeFiltersToSearchParams } from "@/lib/filters/url"
import type { FilterState, FilterContextType } from "../types/company"

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    countries: [],
    states: [],
    capabilities: [],
    certifications: [],
    industries: [],
    employeeRange: [],
    volumeCapability: [],
  })

  const [filteredCount, setFilteredCount] = useState(0)

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const parsedUrlFilters = parseFiltersFromSearchParams(searchParams)
    const volumeCapability = parsedUrlFilters.productionVolume ? [parsedUrlFilters.productionVolume] : []

    const newFilters: FilterState = {
      searchTerm: params.get("search") || "",
      countries: params.get("countries")?.split(",").filter(Boolean) || [],
      states: parsedUrlFilters.states,
      capabilities: parsedUrlFilters.capabilities,
      certifications: params.get("certifications")?.split(",").filter(Boolean) || [],
      industries: params.get("industries")?.split(",").filter(Boolean) || [],
      employeeRange: params.get("employees")?.split(",").filter(Boolean) || [],
      volumeCapability,
    }

    setFilters((prevFilters) => {
      const hasChanged = JSON.stringify(prevFilters) !== JSON.stringify(newFilters)
      return hasChanged ? newFilters : prevFilters
    })
  }, [searchParams])

  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      const params = serializeFiltersToSearchParams({
        states: newFilters.states,
        capabilities: newFilters.capabilities,
        productionVolume: newFilters.volumeCapability[0] ?? null,
      })

      if (newFilters.searchTerm) params.set("search", newFilters.searchTerm)
      if (newFilters.countries.length) params.set("countries", newFilters.countries.join(","))
      if (newFilters.certifications.length) params.set("certifications", newFilters.certifications.join(","))
      if (newFilters.industries.length) params.set("industries", newFilters.industries.join(","))
      if (newFilters.employeeRange.length) params.set("employees", newFilters.employeeRange.join(","))

      const newUrl = `${pathname}${params.toString() ? "?" + params.toString() : ""}`
      
      // Defer the router update to avoid updating during render
      setTimeout(() => {
        startTransition(() => {
          router.replace(newUrl, { scroll: false })
        })
      }, 0)
    },
    [router, pathname]
  )

  const debouncedUpdateURL = useDebouncedCallback(updateURLParams, 300)

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters, [key]: value }
        
        // Defer URL update to after render
        setTimeout(() => {
          if (key === "searchTerm") {
            debouncedUpdateURL(newFilters)
          } else {
            updateURLParams(newFilters)
          }
        }, 0)
        
        return newFilters
      })
    },
    [debouncedUpdateURL, updateURLParams]
  )

  const clearFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      searchTerm: "",
      countries: [],
      states: [],
      capabilities: [],
      certifications: [],
      industries: [],
      employeeRange: [],
      volumeCapability: [],
    }
    
    setFilters(defaultFilters)
    
    // Defer the router update to avoid updating during render
    setTimeout(() => {
      startTransition(() => {
        router.replace(pathname, { scroll: false })
      })
    }, 0)
  }, [router, pathname])

  const contextValue: FilterContextType = {
    filters,
    updateFilter,
    clearFilters,
    filteredCount,
    setFilteredCount,
    isPending,
  }

  return <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider")
  }
  return context
}