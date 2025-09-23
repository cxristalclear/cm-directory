'use client'

import Link from 'next/link'
import { Building2 } from 'lucide-react'

import { useFilters } from '../contexts/FilterContext'

export default function Header() {
  const { filters, clearFilters, filteredCount } = useFilters()

  const activeFilterCount =
    filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)

  return (
    <header className="relative overflow-hidden">
      <div className="gradient-bg">
        <nav className="relative z-10 border-b border-white/10">
          <div className="container mx-auto flex items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="font-sans text-xl font-bold text-white">CM Directory</h1>
                <p className="text-xs text-blue-100">Manufacturing Network</p>
              </div>
            </Link>
            <div className="hidden items-center gap-4 md:flex">
              <Link href="/about" className="text-sm font-medium text-white/90 hover:text-white">
                About
              </Link>
              <Link
                href="/add-company"
                className="inline-flex items-center justify-center rounded-lg bg-white/90 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-white/70 backdrop-blur hover:bg-white"
              >
                Add Your Company
              </Link>
            </div>
          </div>
        </nav>

        <div className="relative z-10 py-8 md:py-10">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-4xl">
              <h2 className="mb-2 text-3xl font-bold leading-tight text-white md:text-5xl">
                Find Your Next Manufacturing Partner
              </h2>
              <p className="mb-4 text-lg leading-relaxed text-blue-100 md:text-xl">
                Connect with verified contract manufacturers. Filter by location, capabilities, and production volume.
              </p>
              <div className="flex flex-col items-center justify-center gap-3 text-white sm:flex-row sm:gap-4">
                <span className="text-sm font-medium uppercase tracking-widest text-blue-100">
                  Showing {filteredCount} manufacturers
                </span>
                {activeFilterCount > 0 && (
                  <button
                    onClick={clearFilters}
                    className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Clear filters ({activeFilterCount})
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </div>
      </div>
    </header>
  )
}
