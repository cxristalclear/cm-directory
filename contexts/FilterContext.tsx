'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useTransition,
  type ReactNode,
} from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useDebouncedCallback } from "use-debounce"
import { parseFiltersFromSearchParams, serializeFiltersToSearchParams } from "@/lib/filters/url"
import type { FilterContextType, FilterState } from "@/types/company"

const FilterContext = createContext<FilterContextType | undefined>(undefined)

type FilterProviderProps = {
  children: ReactNode
  initialFilters?: FilterState
}

function createDefaultFilters(): FilterState {
  return {
    states: [],
    capabilities: [],
    productionVolume: null,
  }
}

function filtersEqual(a: FilterState, b: FilterState): boolean {
  if (a.productionVolume !== b.productionVolume) {
    return false
  }
  if (a.states.length !== b.states.length || a.capabilities.length !== b.capabilities.length) {
    return false
  }
  return a.states.every((value, index) => value === b.states[index]) &&
    a.capabilities.every((value, index) => value === b.capabilities[index])
}

export function FilterProvider({ children, initialFilters }: FilterProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [filters, setFiltersState] = useState<FilterState>(() => initialFilters ?? createDefaultFilters())
  const [filteredCount, setFilteredCount] = useState<number>(0)

  useEffect(() => {
    const parsed = parseFiltersFromSearchParams(searchParams)
    setFiltersState((previous) => {
      return filtersEqual(previous, parsed) ? previous : parsed
    })
  }, [searchParams])

  const replaceUrl = useCallback(
    (nextFilters: FilterState) => {
      const params = serializeFiltersToSearchParams(nextFilters)
      const query = params.toString()
      const nextUrl = query ? `${pathname}?${query}` : pathname

      startTransition(() => {
        router.replace(nextUrl, { scroll: false })
      })
    },
    [pathname, router, startTransition],
  )

  const debouncedReplace = useDebouncedCallback((next: FilterState) => {
    replaceUrl(next)
  }, 150)

  const setFilters = useCallback<FilterContextType["setFilters"]>(
    (value) => {
      if (typeof value === "function") {
        setFiltersState((previous) => {
          const next = value(previous)
          debouncedReplace(next)
          return next
        })
      } else {
        setFiltersState(value)
        debouncedReplace(value)
      }
    },
    [debouncedReplace],
  )

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters((previous) => ({ ...previous, [key]: Array.isArray(value) ? [...value] : value }))
    },
    [setFilters],
  )

  const clearFilters = useCallback(() => {
    debouncedReplace.cancel()
    setFiltersState(createDefaultFilters())
    startTransition(() => {
      router.replace(pathname, { scroll: false })
    })
  }, [debouncedReplace, pathname, router, startTransition])

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

export function useFilters(): FilterContextType {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error("useFilters must be used within FilterProvider")
  }
  return context
}