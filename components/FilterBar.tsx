"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ChevronDown, Check, X } from "lucide-react"

import { useFilters } from "@/contexts/FilterContext"
import type { CapabilitySlug, ProductionVolume } from "@/lib/filters/url"
import type { HomepageCompanyWithLocations } from "@/types/homepage"
import { EmployeeCountRanges, type EmployeeCountRange } from "@/types/company"
import {
  formatCountryLabel,
  formatStateLabelFromKey,
  getFacilityCountryCode,
  getFacilityStateKey,
  normalizeCountryCode,
  normalizeStateFilterValue,
} from "@/utils/locationFilters"

// --- PORTAL POPOVER (Fixes the clipping issue) ---
type PopoverProps = {
  trigger: React.ReactElement
  children: React.ReactNode
  widthClass?: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

function Popover({ trigger, children, widthClass = "w-72", open, onOpenChange }: PopoverProps) {
  const triggerRef = useRef<HTMLDivElement>(null)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    if (open && triggerRef.current) {
      const updatePosition = () => {
        const rect = triggerRef.current!.getBoundingClientRect()
        setCoords({
          top: rect.bottom + 6,
          left: rect.left
        })
      }
      updatePosition()
      window.addEventListener("scroll", updatePosition, true)
      window.addEventListener("resize", updatePosition)
      return () => {
        window.removeEventListener("scroll", updatePosition, true)
        window.removeEventListener("resize", updatePosition)
      }
    } else {
      setCoords(null)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && triggerRef.current.contains(event.target as Node)) return
      const target = event.target as Element
      if (target.closest('[data-popover-content]')) return
      onOpenChange(false)
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, onOpenChange])

  return (
    <>
      <div ref={triggerRef} onClick={() => onOpenChange(!open)} className="inline-block">
        {trigger}
      </div>
      {open && coords && typeof document !== 'undefined' && createPortal(
        <div 
          data-popover-content
          className={`fixed z-[9999] ${widthClass} rounded-xl border border-gray-200 bg-white shadow-xl animate-in fade-in zoom-in-95 duration-100 p-1`}
          style={{ top: coords.top, left: coords.left }}
        >
          {children}
        </div>,
        document.body
      )}
    </>
  )
}

// --- REST OF THE COMPONENT (Logic remains mostly the same) ---

interface PillButtonProps {
  active?: boolean
  label: string
  count?: number
}

function PillButton({ active = false, label, count }: PillButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all whitespace-nowrap select-none ${
        active
          ? "border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
          : "border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
      {count !== undefined && count > 0 && (
        <span className={`flex h-4 min-w-[16px] items-center justify-center rounded-full px-1 text-[10px] ${
          active ? "bg-blue-200 text-blue-800" : "bg-gray-100 text-gray-600"
        }`}>
          {count}
        </span>
      )}
      <ChevronDown className={`h-3.5 w-3.5 opacity-50 transition-transform ${active ? "rotate-180" : ""}`} />
    </button>
  )
}

const CAPABILITY_NAMES: Record<CapabilitySlug, string> = {
  smt: "SMT Assembly",
  through_hole: "Through-Hole",
  cable_harness: "Cable & Harness",
  box_build: "Box Build",
  prototyping: "Prototyping",
}

const VOLUME_NAMES: Record<ProductionVolume, string> = {
  low: "Low Volume",
  medium: "Medium Volume",
  high: "High Volume",
}

interface FilterBarProps {
  allCompanies: HomepageCompanyWithLocations[]
}

export default function FilterBar({ allCompanies }: FilterBarProps) {
  const { filters, updateFilter } = useFilters()
  
  // State for which popover is open (only one at a time)
  const [activePopover, setActivePopover] = useState<string | null>(null)

  // Search states
  const [locationSearch, setLocationSearch] = useState("")
  const [capabilitySearch, setCapabilitySearch] = useState("")
  const [employeeSearch] = useState("")

  const { countries, states } = useMemo(() => {
    const countryCounts = new Map<string, number>()
    const stateCounts = new Map<string, number>()

    allCompanies.forEach(company => {
      company.facilities?.forEach(facility => {
        const country = getFacilityCountryCode(facility)
        const stateKey = getFacilityStateKey(facility)
        if (country) countryCounts.set(country, (countryCounts.get(country) || 0) + 1)
        if (stateKey) stateCounts.set(stateKey, (stateCounts.get(stateKey) || 0) + 1)
      })
    })

    const countryList = Array.from(countryCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA || 0)
      .map(([code, count]) => ({ code, count, label: formatCountryLabel(code) }))

    const stateList = Array.from(stateCounts.entries())
      .sort(([, countA], [, countB]) => countB - countA || 0)
      .map(([key, count]) => ({ key, count, label: formatStateLabelFromKey(key) }))

    return { countries: countryList, states: stateList }
  }, [allCompanies])

  const filteredCountries = useMemo(() => {
    const term = locationSearch.toLowerCase()
    return countries.filter(({ label }) => label.toLowerCase().includes(term))
  }, [countries, locationSearch])

  const filteredStates = useMemo(() => {
    const term = locationSearch.toLowerCase()
    return states.filter(({ label }) => label.toLowerCase().includes(term))
  }, [states, locationSearch])

  const filteredCapabilities = useMemo(() => {
    const term = capabilitySearch.toLowerCase()
    return (Object.keys(CAPABILITY_NAMES) as CapabilitySlug[]).filter(cap =>
      CAPABILITY_NAMES[cap].toLowerCase().includes(term)
    )
  }, [capabilitySearch])

  const toggleCountry = (code: string) => {
    const normalized = normalizeCountryCode(code)
    if (!normalized) return
    updateFilter(
      "countries",
      filters.countries.includes(normalized)
        ? filters.countries.filter(c => c !== normalized)
        : [...filters.countries, normalized],
    )
  }

  const toggleState = (state: string) => {
    const normalized = normalizeStateFilterValue(state)
    if (!normalized) return
    updateFilter(
      "states",
      filters.states.includes(normalized)
        ? filters.states.filter(s => s !== normalized)
        : [...filters.states, normalized],
    )
  }

  const toggleCapability = (cap: CapabilitySlug) => {
    updateFilter(
      "capabilities",
      filters.capabilities.includes(cap)
        ? filters.capabilities.filter(c => c !== cap)
        : [...filters.capabilities, cap],
    )
  }

  const toggleVolume = (volume: ProductionVolume) => {
    updateFilter("productionVolume", filters.productionVolume === volume ? null : volume)
  }

  const filteredEmployeeRanges = useMemo(() => {
    const term = employeeSearch.toLowerCase()
    return EmployeeCountRanges.filter(range => range.toLowerCase().includes(term)).map(range => ({
      range,
      active: filters.employeeCountRanges.includes(range as EmployeeCountRange),
    }))
  }, [employeeSearch, filters.employeeCountRanges])

  const toggleEmployeeRange = (range: EmployeeCountRange) => {
    updateFilter(
      "employeeCountRanges",
      filters.employeeCountRanges.includes(range)
        ? filters.employeeCountRanges.filter(r => r !== range)
        : [...filters.employeeCountRanges, range],
    )
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1 px-1 -mx-1">
      {/* Location Filter */}
      <Popover
        open={activePopover === "location"}
        onOpenChange={(isOpen) => setActivePopover(isOpen ? "location" : null)}
        widthClass="w-80"
        trigger={
          <PillButton 
            label="Location" 
            active={filters.countries.length + filters.states.length > 0} 
            count={filters.countries.length + filters.states.length} 
          />
        }
      >
        <div className="p-3 space-y-3">
          <div className="relative">
            <input
              type="text"
              value={locationSearch}
              onChange={e => setLocationSearch(e.target.value)}
              placeholder="Filter countries or states..."
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
              autoFocus
            />
            {locationSearch && (
              <button 
                onClick={() => setLocationSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-1">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 sticky top-0 bg-white">Countries</p>
              {filteredCountries.map(({ code, label, count }) => (
                <CheckboxRow
                  key={code}
                  label={label}
                  count={count}
                  checked={filters.countries.includes(code)}
                  onChange={() => toggleCountry(code)}
                />
              ))}
              {filteredCountries.length === 0 && <p className="text-xs text-gray-400 italic">No matches</p>}
            </div>
            <div className="space-y-1 border-l border-gray-100 pl-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 sticky top-0 bg-white">States</p>
              {filteredStates.map(({ key, label, count }) => (
                <CheckboxRow
                  key={key}
                  label={label}
                  count={count}
                  checked={filters.states.includes(key)}
                  onChange={() => toggleState(key)}
                />
              ))}
              {filteredStates.length === 0 && <p className="text-xs text-gray-400 italic">No matches</p>}
            </div>
          </div>
        </div>
      </Popover>

      {/* Capabilities Filter */}
      <Popover
        open={activePopover === "capabilities"}
        onOpenChange={(isOpen) => setActivePopover(isOpen ? "capabilities" : null)}
        trigger={
          <PillButton 
            label="Capabilities" 
            active={filters.capabilities.length > 0} 
            count={filters.capabilities.length} 
          />
        }
      >
        <div className="p-3 space-y-3">
          <input
            type="text"
            value={capabilitySearch}
            onChange={e => setCapabilitySearch(e.target.value)}
            placeholder="Search capabilities..."
            className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs focus:bg-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
          />
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {filteredCapabilities.map(cap => (
              <CheckboxRow
                key={cap}
                label={CAPABILITY_NAMES[cap]}
                checked={filters.capabilities.includes(cap)}
                onChange={() => toggleCapability(cap)}
              />
            ))}
            {filteredCapabilities.length === 0 && <p className="text-xs text-gray-400">No matches</p>}
          </div>
        </div>
      </Popover>

      {/* Volume Filter */}
      <Popover
        open={activePopover === "volume"}
        onOpenChange={(isOpen) => setActivePopover(isOpen ? "volume" : null)}
        widthClass="w-56"
        trigger={
          <PillButton 
            label={filters.productionVolume ? VOLUME_NAMES[filters.productionVolume] : "Volume"}
            active={Boolean(filters.productionVolume)} 
          />
        }
      >
        <div className="p-2 space-y-1">
          {(Object.keys(VOLUME_NAMES) as ProductionVolume[]).map(vol => (
            <CheckboxRow
              key={vol}
              label={VOLUME_NAMES[vol]}
              checked={filters.productionVolume === vol}
              onChange={() => toggleVolume(vol)}
              type="radio"
            />
          ))}
        </div>
      </Popover>

      {/* Employees Filter */}
      <Popover
        open={activePopover === "employees"}
        onOpenChange={(isOpen) => setActivePopover(isOpen ? "employees" : null)}
        widthClass="w-60"
        trigger={
          <PillButton 
            label="Employees" 
            active={filters.employeeCountRanges.length > 0}
            count={filters.employeeCountRanges.length}
          />
        }
      >
        <div className="p-3 space-y-3">
          <div className="space-y-1 max-h-60 overflow-y-auto">
            {filteredEmployeeRanges.map(({ range, active }) => (
              <CheckboxRow
                key={range}
                label={range}
                checked={active}
                onChange={() => toggleEmployeeRange(range as EmployeeCountRange)}
              />
            ))}
          </div>
        </div>
      </Popover>
    </div>
  )
}

// --- Subcomponents ---

interface CheckboxRowProps {
  label: string
  count?: number
  checked: boolean
  onChange: () => void
  type?: "checkbox" | "radio"
}

function CheckboxRow({ label, count, checked, onChange, type = "checkbox" }: CheckboxRowProps) {
  return (
    <label className={`
      flex items-center justify-between gap-3 rounded-lg px-2 py-1.5 cursor-pointer transition-colors
      ${checked ? "bg-blue-50/50" : "hover:bg-gray-50"}
    `}>
      <div className="flex items-center gap-2.5 min-w-0">
        <div className={`
          flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all
          ${type === "radio" ? "rounded-full" : "rounded-md"}
          ${checked 
            ? "border-blue-600 bg-blue-600 text-white" 
            : "border-gray-300 bg-white group-hover:border-gray-400"}
        `}>
          {checked && (
            type === "radio" 
              ? <div className="h-1.5 w-1.5 rounded-full bg-white" />
              : <Check className="h-3 w-3 stroke-[3px]" />
          )}
        </div>
        <span className={`text-xs truncate ${checked ? "font-medium text-gray-900" : "text-gray-600"}`}>
          {label}
        </span>
      </div>
      {count !== undefined && (
        <span className="text-[10px] text-gray-400 tabular-nums">{count}</span>
      )}
      
      {/* Hidden input for accessibility */}
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
    </label>
  )
}
