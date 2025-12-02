'use client'

import { createContext, useContext, useState, useEffect, type ReactNode, useTransition, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { EmployeeCountRanges, type FilterState, type FilterContextType } from "../types/company"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"

const FilterContext = createContext<FilterContextType | undefined>(undefined)

interface FilterProviderProps {
  children: ReactNode
  initialFilters?: {
    countries: string[]
    states: string[]
    capabilities: CapabilitySlug[]
    productionVolume: ProductionVolume | null
    employeeCountRanges: FilterState["employeeCountRanges"]
    searchQuery: string
  }
}

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<FilterState>({
    countries: initialFilters?.countries || [],
    states: initialFilters?.states || [],
    capabilities: initialFilters?.capabilities || [],
    productionVolume: initialFilters?.productionVolume || null,
    employeeCountRanges: initialFilters?.employeeCountRanges || [],
    searchQuery: initialFilters?.searchQuery || "",
  })

  const [filteredCount, setFilteredCount] = useState(0)

  // Load filters from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())

    const newFilters: FilterState = {
      countries: params.get("countries")?.split(",").filter(Boolean) || [],
      states: params.get("states")?.split(",").filter(Boolean) || [],
      capabilities: (params.get("capabilities")?.split(",").filter(Boolean) || []) as CapabilitySlug[],
      productionVolume: (params.get("volume") || null) as ProductionVolume | null,
      employeeCountRanges:
        (params.get("employees")?.split(",").filter(Boolean) || []).filter(
          (range): range is FilterState["employeeCountRanges"][number] =>
            (EmployeeCountRanges as readonly string[]).includes(range),
        ),
      searchQuery: params.get("q")?.trim() || "",
    }

    setFilters((prevFilters) => {
      const hasChanged = JSON.stringify(prevFilters) !== JSON.stringify(newFilters)
      return hasChanged ? newFilters : prevFilters
    })
  }, [searchParams])

  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams()

      if (newFilters.countries.length) params.set("countries", newFilters.countries.join(","))
      if (newFilters.states.length) params.set("states", newFilters.states.join(","))
      if (newFilters.capabilities.length) params.set("capabilities", newFilters.capabilities.join(","))
      if (newFilters.productionVolume) params.set("volume", newFilters.productionVolume)
      if (newFilters.employeeCountRanges.length) params.set("employees", newFilters.employeeCountRanges.join(","))
      if (newFilters.searchQuery.trim()) params.set("q", newFilters.searchQuery.trim())

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
          if (key === 'searchQuery') {
            debouncedUpdateURL(newFilters)
          } else {
            updateURLParams(newFilters)
          }
        }, 0)
        
        return newFilters
      })
    },
    [updateURLParams, debouncedUpdateURL]
  )

  const clearFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      countries: [],
      states: [],
      capabilities: [],
      productionVolume: null,
      employeeCountRanges: [],
      searchQuery: "",
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
    setFilters,
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
