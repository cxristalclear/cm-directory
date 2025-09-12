"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useTransition, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import type { FilterState, FilterContextType } from "../types/company"

const FilterContext = createContext<FilterContextType | undefined>(undefined)

export function FilterProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<FilterState>({
    searchTerm: "",
    countries: [], // Add if you want country filtering
    states: [],
    capabilities: [],
    certifications: [],
    industries: [],
    employeeRange: [],
    volumeCapability: [],
  })

  // Load filters from URL on mount and when URL changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    const newFilters: FilterState = {
      searchTerm: params.get("search") || "",
      countries: params.get("countries")?.split(",").filter(Boolean) || [],
      states: params.get("states")?.split(",").filter(Boolean) || [],
      capabilities: params.get("capabilities")?.split(",").filter(Boolean) || [],
      certifications: params.get("certifications")?.split(",").filter(Boolean) || [],
      industries: params.get("industries")?.split(",").filter(Boolean) || [],
      employeeRange: params.get("employees")?.split(",").filter(Boolean) || [],
      volumeCapability: params.get("volume")?.split(",").filter(Boolean) || [],
    }

    setFilters((prevFilters) => {
      // Only update if actually changed to prevent re-renders
      const hasChanged = JSON.stringify(prevFilters) !== JSON.stringify(newFilters)
      return hasChanged ? newFilters : prevFilters
    })
  }, [searchParams])

  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams()

      // Only add params that have values
      if (newFilters.searchTerm) params.set("search", newFilters.searchTerm)
      if (newFilters.countries?.length) params.set("countries", newFilters.countries.join(","))
      if (newFilters.states.length) params.set("states", newFilters.states.join(","))
      if (newFilters.capabilities.length) params.set("capabilities", newFilters.capabilities.join(","))
      if (newFilters.certifications.length) params.set("certifications", newFilters.certifications.join(","))
      if (newFilters.industries.length) params.set("industries", newFilters.industries.join(","))
      if (newFilters.employeeRange.length) params.set("employees", newFilters.employeeRange.join(","))
      if (newFilters.volumeCapability.length) params.set("volume", newFilters.volumeCapability.join(","))

      const newUrl = `${pathname}${params.toString() ? "?" + params.toString() : ""}`
      
      // Use startTransition directly
      startTransition(() => {
        router.replace(newUrl, { scroll: false })
      })
    },
    [router, pathname]
  )

  const debouncedUpdateURL = useDebouncedCallback(updateURLParams, 300)

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters, [key]: value }
        
        // Debounce search, immediate for others
        if (key === "searchTerm") {
          debouncedUpdateURL(newFilters)
        } else {
          updateURLParams(newFilters)
        }
        
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
    
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [router, pathname])

const contextValue: FilterContextType = {
  filters,
  updateFilter,
  clearFilters,   
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