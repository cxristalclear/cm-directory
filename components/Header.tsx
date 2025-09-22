/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Link from "next/link"
import { Search, Building2, Filter, MapPin, Award, Settings } from "lucide-react"
import { useFilters } from "../contexts/FilterContext"
import { useRouter } from "next/navigation"
import type { Company } from "../types/company"
import { type LucideIcon } from "lucide-react"
import { getStateName } from '../utils/stateMapping'



interface HeaderProps {
  onSearchToggle?: () => void
  onFilterToggle?: () => void
  companies?: Company[]
}

export default function Header({ onSearchToggle, onFilterToggle, companies = [] }: HeaderProps) {
  const router = useRouter()
  const { filters, updateFilter } = useFilters()
  const [searchValue, setSearchValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const ADD_COMPANY_PATH = "/add-company"; // ← change if your route is different

  const searchRef = useRef<HTMLDivElement>(null)
  // Sync with filters context
  useEffect(() => {
    setSearchValue(filters.searchTerm)
  }, [filters.searchTerm])
  
  // Sync with filters context
  useEffect(() => {
    setSearchValue(filters.searchTerm)
  }, [filters.searchTerm])

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])


  return (
    <header className="relative overflow-hidden">
      {/* Background with gradient */}
      <div className="gradient-bg">
        {/* Navigation Bar */}
        <nav className="relative z-10 border-b border-white/10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Building2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white font-sans">CM Directory</h1>
                  <p className="text-xs text-blue-100">Manufacturing Network</p>
                </div>
              </Link>

                <div className="mt-4 flex flex-wrap items-center gap-6">
                  <a href="/about" className="text-sm font-medium text-white/90 hover:text-white">
                    About
                  </a>
                  <a
                    href={ADD_COMPANY_PATH}
                    className="inline-flex items-center justify-center rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-white/70 backdrop-blur hover:bg-white"
                  >
                    Add Your Company
                  </a>
                </div>

              {/* Mobile menu button */}
              <div className="md:hidden flex items-center space-x-2">
                <button
                  onClick={onSearchToggle}
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Search className="w-5 h-5" />
                </button>
                <button
                  onClick={onFilterToggle}
                  className="p-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <Filter className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="relative z-10 py-8 md:py-10">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 font-sans leading-tight">
                Find Your Next Manufacturing Partner
              </h1>
              <p className="text-lg md:text-xl text-blue-100 mb-2 leading-relaxed">
                Connect with verified contract manufacturers. Search by location, capabilities, and volume.
              </p>
              </div> 
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>
    </header>
  )
}