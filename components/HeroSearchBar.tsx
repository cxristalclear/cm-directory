"use client"

import { type FormEvent, useMemo, useState, useEffect } from "react"
import { Search } from "lucide-react"
import { useDebouncedCallback } from "use-debounce"

import { useFilters } from "@/contexts/FilterContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/components/utils"
import type { HomepageCompanyWithLocations } from "@/types/homepage"

interface HeroSearchBarProps {
  className?: string
  companies?: HomepageCompanyWithLocations[]
}

export default function HeroSearchBar({ className, companies = [] }: HeroSearchBarProps) {
  const { filters, updateFilter } = useFilters()
  const [isFocused, setIsFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [inputValue, setInputValue] = useState(filters.searchQuery)

  useEffect(() => {
    if (!isFocused) {
      setInputValue(filters.searchQuery)
    }
  }, [filters.searchQuery, isFocused])

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
  }, [companies, filters.searchQuery])

  const handleChange = (nextValue: string) => {
    setInputValue(nextValue)
    debouncedUpdateFilter(nextValue.trim())
  }

  const handleSuggestionSelect = (value: string) => {
    updateFilter("searchQuery", value.trim())
    setInputValue(value.trim())
    setIsFocused(false)
    setActiveIndex(-1)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateFilter("searchQuery", inputValue.trim())
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

  const suggestionListId = "hero-search-suggestions"

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

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex w-full flex-col gap-3 rounded-3xl border border-white/20 bg-white/10 p-3 text-white shadow-lg backdrop-blur md:flex-row md:items-center",
        className,
      )}
      aria-label="Search manufacturers by name"
    >
      <div className="flex-1">
        <label className="sr-only" htmlFor="hero-search-input">
          Search manufacturers by company name
        </label>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-blue-600/80" />
          <Input
            id="hero-search-input"
            type="search"
            value={inputValue}
            onChange={(event) => handleChange(event.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            placeholder="Search manufacturers by company name"
            aria-expanded={showSuggestions}
            aria-controls={showSuggestions ? suggestionListId : undefined}
            aria-activedescendant={
              activeIndex >= 0 && showSuggestions ? `${suggestionListId}-option-${activeIndex}` : undefined
            }
            className="w-full border-white/40 bg-white/95 pl-11 text-base text-slate-900 placeholder:text-slate-500"
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
      <Button
        type="submit"
        size="lg"
        className="w-full rounded-2xl bg-white text-blue-600 hover:bg-white md:w-auto"
      >
        Search
      </Button>
    </form>
  )
}
