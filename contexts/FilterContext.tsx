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
    const params = new URLSearchParams(searchParams)

    const newFilters = {
      searchTerm: params.get("search") || "",
      states: params.get("states")?.split(",").filter(Boolean) || [],
      capabilities: params.get("capabilities")?.split(",").filter(Boolean) || [],
      certifications: params.get("certifications")?.split(",").filter(Boolean) || [],
      industries: params.get("industries")?.split(",").filter(Boolean) || [],
      employeeRange: params.get("employees")?.split(",").filter(Boolean) || [],
      volumeCapability: params.get("volume")?.split(",").filter(Boolean) || [],
    }

    setFilters((prevFilters) => {
      const hasChanged = JSON.stringify(prevFilters) !== JSON.stringify(newFilters)
      return hasChanged ? newFilters : prevFilters
    })
  }, [searchParams])

  const updateURLParams = useCallback(
    (newFilters: FilterState) => {
      const params = new URLSearchParams()

      if (newFilters.searchTerm) params.set("search", newFilters.searchTerm)
      if (newFilters.states.length) params.set("states", newFilters.states.join(","))
      if (newFilters.capabilities.length) params.set("capabilities", newFilters.capabilities.join(","))
      if (newFilters.certifications.length) params.set("certifications", newFilters.certifications.join(","))
      if (newFilters.industries.length) params.set("industries", newFilters.industries.join(","))
      if (newFilters.employeeRange.length) params.set("employees", newFilters.employeeRange.join(","))
      if (newFilters.volumeCapability.length) params.set("volume", newFilters.volumeCapability.join(","))

      router.replace(`${pathname}${params.toString() ? "?" + params.toString() : ""}`, {
        scroll: false,
      })
    },
    [router, pathname],
  )

  const debouncedUpdateFilter = useDebouncedCallback(
    (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
      setFilters((prevFilters) => {
        const newFilters = { ...prevFilters, [key]: value }
        startTransition(() => {
          updateURLParams(newFilters)
        })
        return newFilters
      })
    },
    300,
  )

  const updateFilter = useCallback(
    (key: keyof FilterState, value: FilterState[keyof FilterState]) => {
      if (key === "searchTerm") {
        debouncedUpdateFilter(key, value)
      } else {
        setFilters((prevFilters) => {
          const newFilters = { ...prevFilters, [key]: value }
          startTransition(() => {
            updateURLParams(newFilters)
          })
          return newFilters
        })
      }
    },
    [debouncedUpdateFilter, updateURLParams],
  )

  const clearFilters = useCallback(() => {
    const defaultFilters = {
      searchTerm: "",
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

  const contextValue = useCallback(
    () => ({
      filters,
      updateFilter,
      clearFilters,
      filteredCount,
      setFilteredCount,
      isPending,
    }),
    [filters, updateFilter, clearFilters, filteredCount, setFilteredCount, isPending],
  )

  return <FilterContext.Provider value={contextValue()}>{children}</FilterContext.Provider>
}

export const useFilters = () => {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider")
  }
  return context
}
