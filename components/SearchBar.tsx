"use client"

import { type FormEvent, useMemo, useState, useEffect, useId } from "react"
import { Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

import { useFilters } from "@/contexts/FilterContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/components/utils"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import { trackSearch } from "@/lib/utils/analytics"

type HeroSearchVariant = "hero" | "inline"

interface SearchBarProps {
  className?: string
  companies?: HomepageCompanyWithLocations[]
  variant?: HeroSearchVariant
}

type QuickFilter =
  | { label: string; type: "search"; value: string }
  | { label: string; type: "capability"; value: CapabilitySlug }
  | { label: string; type: "country"; value: string }
  | { label: string; type: "productionVolume"; value: ProductionVolume }

const HERO_PLACEHOLDER_PROMPTS = [
  'Try "Turnkey PCB Assembly in Texas"',
  'Search certifications like "ISO 9001"',
  'Looking for "Low-volume SMT" partners?',
] as const

const QUICK_FILTERS: QuickFilter[] = [
  { label: "ISO 9001", type: "search", value: "ISO 9001 certified" },
  { label: "SMT", type: "capability", value: "smt"},
  { label: "Box Build", type: "capability", value: "box_build" },
  { label: "USA Only", type: "country", value: "US" },
  { label: "Prototype Ready", type: "productionVolume", value: "low" },
]

export default function SearchBar({
  className,
  companies = [],
  variant = "hero",
}: SearchBarProps) {
  const { filters, updateFilter } = useFilters()
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [inputValue, setInputValue] = useState(filters.searchQuery)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  useEffect(() => {
    if (!isFocused) {
      setInputValue(filters.searchQuery)
    }
  }, [filters.searchQuery, isFocused])

  useEffect(() => {
    const rotation = window.setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % HERO_PLACEHOLDER_PROMPTS.length)
    }, 4200)

    return () => window.clearInterval(rotation)
  }, [])

  const debouncedUpdateFilter = useDebouncedCallback(
    (value: string) => {
      updateFilter("searchQuery", value)
    },
    200
  )

  useEffect(() => {
    return () => {
      debouncedUpdateFilter.flush()
    }
  }, [debouncedUpdateFilter])

  const suggestions = useMemo(() => {
    const term = inputValue.trim().toLowerCase()
    if (!term) return []

    return companies
      .filter((company) => {
        const names = [company.company_name, company.dba_name].filter(
          (name): name is string => typeof name === "string" && name.length > 0,
        )
        return names.some((name) => name.toLowerCase().includes(term))
      })
      .slice(0, 6)
  }, [companies, inputValue])

  const handleChange = (nextValue: string) => {
    setInputValue(nextValue)
    debouncedUpdateFilter(nextValue.trim())
  }

  const handleSuggestionSelect = (value: string) => {
    const trimmedValue = value.trim()
    updateFilter("searchQuery", trimmedValue)
    setInputValue(trimmedValue)
    setIsFocused(false)
    setActiveIndex(-1)
    
    // Track search event when suggestion is selected
    if (trimmedValue) {
      trackSearch({
        search_query: trimmedValue,
        event_label: `Search (suggestion): ${trimmedValue}`,
      })
    }
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const query = inputValue.trim()
    updateFilter("searchQuery", query)
    
    // Track search event
    if (query) {
      trackSearch({
        search_query: query,
        event_label: `Search: ${query}`,
      })
    }
  }

  const showSuggestions = isFocused && suggestions.length > 0

  const [blurTimeoutId, setBlurTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (blurTimeoutId) {
        clearTimeout(blurTimeoutId)
      }
    }
  }, [blurTimeoutId])
  const handleFocus = () => {
    if (blurTimeoutId) {
      clearTimeout(blurTimeoutId)
      setBlurTimeoutId(null)
    }
    setIsFocused(true)
  }

  const handleBlur = () => {
    const id = setTimeout(() => {
      setIsFocused(false)
      setActiveIndex(-1)
    }, 150)
    setBlurTimeoutId(id)
  }

  const generatedId = useId()
  const suggestionListId = `${generatedId}-hero-search-suggestions`
  const inputId = `${generatedId}-hero-search-input`

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return

    if (event.key === "ArrowDown") {
      event.preventDefault()
      setActiveIndex((prev) => {
        const nextIndex = prev + 1
        return nextIndex >= suggestions.length ? suggestions.length - 1 : nextIndex
      })
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActiveIndex((prev) => {
        const nextIndex = prev - 1
        return nextIndex < 0 ? -1 : nextIndex
      })
    } else if (event.key === "Enter") {
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        event.preventDefault()
        const selected = suggestions[activeIndex]
        const displayName = selected.company_name || selected.dba_name || "Untitled Company"
        handleSuggestionSelect(displayName)
      }
    } else if (event.key === "Escape") {
      event.preventDefault()
      setIsFocused(false)
      setActiveIndex(-1)
    }
  }

  const formClasses =
    variant === "inline"
      ? "flex w-full flex-col gap-2 rounded-xl border border-slate-200 bg-white/95 p-2 text-slate-900 shadow-sm ring-1 ring-gray-100 md:flex-row md:items-center md:gap-3"
      : "flex w-full flex-col gap-3 rounded-3xl border border-white/20 bg-white/10 p-3 text-white shadow-lg backdrop-blur md:flex-row md:items-center"

  const inputClasses =
    variant === "inline"
      ? "h-11 w-full border-slate-200 bg-transparent pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-500"
      : "w-full border-white/40 bg-white/95 pl-11 text-base text-slate-900 placeholder:text-slate-500"

  const buttonClasses =
    variant === "inline"
      ? "h-11 w-full rounded-lg px-4 text-xs font-semibold md:w-auto"
      : "w-full rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 md:w-auto min-h-[44px] px-6 text-base font-semibold"

  const iconColor =
    variant === "inline" ? "text-slate-400" : "text-primary"

  const placeholderText = HERO_PLACEHOLDER_PROMPTS[placeholderIndex] ?? HERO_PLACEHOLDER_PROMPTS[0]

  const isQuickFilterActive = (quickFilter: QuickFilter) => {
    switch (quickFilter.type) {
      case "search":
        return filters.searchQuery.trim().toLowerCase() === quickFilter.value.trim().toLowerCase()
      case "capability":
        return filters.capabilities.includes(quickFilter.value)
      case "country":
        return filters.countries.includes(quickFilter.value)
      case "productionVolume":
        return filters.productionVolume === quickFilter.value
      default:
        return false
    }
  }

  const handleQuickFilterClick = (quickFilter: QuickFilter) => {
    if (quickFilter.type === "search") {
      const trimmed = quickFilter.value.trim()
      setInputValue(trimmed)
      updateFilter("searchQuery", trimmed)
      setIsFocused(false)
      setActiveIndex(-1)
      return
    }

    if (quickFilter.type === "capability") {
      const hasCapability = filters.capabilities.includes(quickFilter.value)
      updateFilter(
        "capabilities",
        hasCapability
          ? filters.capabilities.filter((capability) => capability !== quickFilter.value)
          : [...filters.capabilities, quickFilter.value]
      )
      return
    }

    if (quickFilter.type === "country") {
      const hasCountry = filters.countries.includes(quickFilter.value)
      updateFilter(
        "countries",
        hasCountry
          ? filters.countries.filter((country) => country !== quickFilter.value)
          : [quickFilter.value]
      )
      return
    }

    if (quickFilter.type === "productionVolume") {
      updateFilter(
        "productionVolume",
        filters.productionVolume === quickFilter.value ? null : quickFilter.value
      )
    }
  }

  return (
    <div className={cn("space-y-6", variant === "hero" ? "text-white" : "text-slate-900")}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          formClasses,
          className,
        )}
        aria-label="Search manufacturers by name"
      >
        <div className="flex-1">
          <label className="sr-only" htmlFor={inputId}>
            Search manufacturers by company name
          </label>
          <div className="relative">
            <Search className={cn("pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2", iconColor)} />
            <Input
              id={inputId}
              type="search"
              value={inputValue}
              onChange={(event) => handleChange(event.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholderText}
              aria-expanded={showSuggestions}
              aria-controls={showSuggestions ? suggestionListId : undefined}
              aria-activedescendant={
                activeIndex >= 0 && showSuggestions ? `${suggestionListId}-option-${activeIndex}` : undefined
              }
              className={inputClasses}
            />
            {showSuggestions && (
              <ul
                role="listbox"
                id={suggestionListId}
                className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-white/60 bg-white/95 text-slate-900 shadow-2xl"
              >
                {suggestions.map((company, index) => {
                  const displayName = company.company_name || company.dba_name || "Untitled Company"
                  return (
                    <li
                      key={company.id}
                      id={`${suggestionListId}-option-${index}`}
                      role="option"
                      aria-selected={activeIndex === index}
                      className="border-b last:border-0"
                    >
                      <button
                        type="button"
                        className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-blue-50"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => handleSuggestionSelect(displayName)}
                      >
                        <span className="font-semibold text-slate-900">{displayName}</span>
                        {company.dba_name && company.dba_name !== displayName && (
                          <span className="text-xs text-slate-500">DBA: {company.dba_name}</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
        <Button type="submit" size={variant === "inline" ? "sm" : "lg"} className={buttonClasses}>
          Search
        </Button>
      </form>

      <div className={cn(
        "flex flex-wrap items-center gap-2",
        variant === "hero" ? "text-white/90" : "text-slate-600"
      )}>
        <span
          className={cn(
            "text-[11px] font-medium lowercase",
            variant === "hero" ? "text-white/70" : "text-slate-500"
          )}
        >
          Quick filters
        </span>
        {QUICK_FILTERS.map((quickFilter) => {
          const active = isQuickFilterActive(quickFilter)
          return (
            <button
              key={quickFilter.label}
              type="button"
              onClick={() => handleQuickFilterClick(quickFilter)}
              className={cn(
                "group inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-[11px] font-semibold leading-tight transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                variant === "hero"
                  ? active
                    ? "border-primary bg-primary text-primary-foreground  focus-visible:ring-primary"
                    : "border-white/40 bg-white/10 text-white hover:border-white/60 hover:bg-white/20 focus-visible:ring-white/60"
                  : active
                    ? "border-primary bg-primary text-white focus-visible:ring-primary"
                    : "border-slate-200 bg-white text-slate-700 hover:border-primary/30 hover:text-primary focus-visible:ring-primary/60"
              )}
              aria-pressed={active}
            >
              <span>{quickFilter.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
