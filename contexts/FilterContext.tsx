'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useTransition,
  type ReactNode,
} from 'react'
import { useRouter, usePathname } from 'next/navigation'

import {
  parseFiltersFromSearchParams,
  serializeFiltersToSearchParams,
  type FilterUrlState,
} from '@/lib/filters/url'
import type { FilterContextType, FilterState, SetFiltersAction } from '@/types/company'

const EMPTY_FILTERS: FilterState = {
  states: [],
  capabilities: [],
  productionVolume: null,
}

const FilterContext = createContext<FilterContextType | undefined>(undefined)

type FilterProviderProps = {
  children: ReactNode
  initialFilters?: Partial<FilterState>
  initialFilteredCount?: number
}

function arraysEqual(first: string[], second: string[]): boolean {
  if (first.length !== second.length) return false
  return first.every((value, index) => value === second[index])
}

function toUrlFilterState(filters?: Partial<FilterState>): FilterUrlState {
  const record: Record<string, string | string[]> = {}

  if (filters?.states && filters.states.length > 0) {
    record.state = filters.states
  }

  if (filters?.capabilities && filters.capabilities.length > 0) {
    record.capability = filters.capabilities
  }

  if (filters?.productionVolume) {
    record.volume = filters.productionVolume
  }

  return parseFiltersFromSearchParams(record)
}

function normalizeFilters(filters?: Partial<FilterState>): FilterState {
  const normalized = toUrlFilterState(filters)
  return {
    states: [...normalized.states],
    capabilities: [...normalized.capabilities],
    productionVolume: normalized.productionVolume,
  }
}

export function FilterProvider({ children, initialFilters, initialFilteredCount }: FilterProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [filters, setFiltersState] = useState<FilterState>(() =>
    normalizeFilters(initialFilters ?? EMPTY_FILTERS),
  )
  const [filteredCount, setFilteredCount] = useState(initialFilteredCount ?? 0)

  useEffect(() => {
    const normalized = normalizeFilters(initialFilters ?? EMPTY_FILTERS)

    setFiltersState(previous => {
      if (
        arraysEqual(previous.states, normalized.states) &&
        arraysEqual(previous.capabilities, normalized.capabilities) &&
        previous.productionVolume === normalized.productionVolume
      ) {
        return previous
      }
      return normalized
    })
  }, [initialFilters])

  const updateURLParams = useCallback(
    (nextFilters: FilterState) => {
      const urlFilters = toUrlFilterState(nextFilters)
      const params = serializeFiltersToSearchParams(urlFilters)
      const query = params.toString()
      const target = query ? `${pathname}?${query}` : pathname

      startTransition(() => {
        router.replace(target, { scroll: false })
      })
    },
    [pathname, router, startTransition],
  )

  const setFilters = useCallback(
    (value: SetFiltersAction) => {
      setFiltersState(previous => {
        const resolved =
          typeof value === 'function' ? (value as (input: FilterState) => FilterState)(previous) : value
        const normalized = normalizeFilters(resolved)

        setTimeout(() => {
          updateURLParams(normalized)
        }, 0)

        return normalized
      })
    },
    [updateURLParams],
  )

  const updateFilter = useCallback(
    <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
      setFilters(current => ({
        ...current,
        [key]: value,
      }))
    },
    [setFilters],
  )

  const clearFilters = useCallback(() => {
    setFilters(() => EMPTY_FILTERS)
  }, [setFilters])

  const contextValue = useMemo<FilterContextType>(
    () => ({
      filters,
      updateFilter,
      setFilters,
      clearFilters,
      filteredCount,
      setFilteredCount,
      isPending,
    }),
    [filters, updateFilter, setFilters, clearFilters, filteredCount, setFilteredCount, isPending],
  )

  return <FilterContext.Provider value={contextValue}>{children}</FilterContext.Provider>
}

export function useFilters() {
  const context = useContext(FilterContext)
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider')
  }
  return context
}
