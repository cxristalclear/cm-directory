'use client'

import { createContext, useContext, useState, useEffect, type ReactNode, useTransition, useCallback } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { EmployeeCountRanges, type FilterState, type FilterContextType } from "../types/company"
import { useDebounce } from "../hooks/useDebounce"
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

  // Debounce URL writes only (filters are used live elsewhere)
  const debouncedFilters = useDebounce(filters, 200)
  const debouncedSearchQuery = useDebounce(filters.searchQuery, 500)

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

  useEffect(() => {
    const params = new URLSearchParams()

    if (debouncedFilters.countries.length) params.set("countries", debouncedFilters.countries.join(","))
    if (debouncedFilters.states.length) params.set("states", debouncedFilters.states.join(","))
    if (debouncedFilters.capabilities.length) params.set("capabilities", debouncedFilters.capabilities.join(","))
    if (debouncedFilters.productionVolume) params.set("volume", debouncedFilters.productionVolume)
    if (debouncedFilters.employeeCountRanges.length) params.set("employees", debouncedFilters.employeeCountRanges.join(","))
    if (debouncedSearchQuery.trim()) params.set("q", debouncedSearchQuery.trim())

    const newQuery = params.toString()
    const currentQuery = searchParams.toString()

    if (newQuery === currentQuery) return

    const newUrl = `${pathname}${newQuery ? `?${newQuery}` : ""}`

    startTransition(() => {
      router.replace(newUrl, { scroll: false })
    })
  }, [debouncedFilters, debouncedSearchQuery, pathname, router, searchParams, startTransition])

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((prevFilters) => ({ ...prevFilters, [key]: value }))
    },
    []
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
  }, [])

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
