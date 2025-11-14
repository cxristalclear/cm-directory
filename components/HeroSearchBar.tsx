"use client"

import { type FormEvent, useMemo, useState } from "react"
import { Search } from "lucide-react"
import { useDebounce } from "use-debounce"

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
  const [debouncedQuery] = useDebounce(filters.searchQuery, 200)

  const suggestions = useMemo(() => {
    const term = debouncedQuery.trim().toLowerCase()
    if (!term) return []

    return companies
      .filter((company) => {
        const names = [company.company_name, company.dba_name].filter(
          (name): name is string => typeof name === "string" && name.length > 0,
        )
        return names.some((name) => name.toLowerCase().includes(term))
      })
      .slice(0, 6)
  }, [companies, debouncedQuery])

  const handleChange = (nextValue: string) => {
    updateFilter("searchQuery", nextValue.trim())
  }

  const handleSuggestionSelect = (value: string) => {
    updateFilter("searchQuery", value.trim())
    setIsFocused(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    updateFilter("searchQuery", filters.searchQuery.trim())
  }

  const showSuggestions = isFocused && suggestions.length > 0

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
            value={filters.searchQuery}
            onChange={(event) => handleChange(event.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => {
              setTimeout(() => setIsFocused(false), 150)
            }}
            placeholder="Search manufacturers by company name"
            className="w-full border-white/40 bg-white/95 pl-11 text-base text-slate-900 placeholder:text-slate-500"
          />
          {showSuggestions && (
            <ul
              role="listbox"
              className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-white/60 bg-white/95 text-slate-900 shadow-2xl"
            >
              {suggestions.map((company) => {
                const displayName = company.company_name || company.dba_name || "Untitled Company"
                return (
                  <li key={company.id} className="border-b border-slate-100 last:border-0">
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
