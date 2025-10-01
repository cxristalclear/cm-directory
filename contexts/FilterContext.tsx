'use client'

import { createContext, useContext, useState, useEffect, type ReactNode, useTransition, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import type { FilterState, FilterContextType } from "../types/company"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"

const FilterContext = createContext<FilterContextType | undefined>(undefined)

interface FilterProviderProps {
  children: ReactNode
  initialFilters?: {
    states: string[]
    capabilities: CapabilitySlug[]
    productionVolume: ProductionVolume | null
  }
}

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFilters] = useState<FilterState>({
    countries: [],
    states: initialFilters?.states || [],
    capabilities: initialFilters?.capabilities || [],
    productionVolume: initialFilters?.productionVolume || null,
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const debouncedUpdateURL = useDebouncedCallback(updateURLParams, 300)

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters, [key]: value }
        
        // Defer URL update to after render
        setTimeout(() => {
          updateURLParams(newFilters)
        }, 0)
        
        return newFilters
      })
    },
    [updateURLParams]
  )

  const clearFilters = useCallback(() => {
    const defaultFilters: FilterState = {
      countries: [],
      states: [],
      capabilities: [],
      productionVolume: null,
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