"use client"

import { useFilters } from "@/contexts/FilterContext"

export default function Header() {
  useFilters()

  return (
    <header className="relative overflow-hidden">
      <div className="gradient-bg">
        <div className="relative z-10 py-4 md:py-6">
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-2 text-2xl font-bold leading-tight text-white md:text-4xl">
                Find Your Next Manufacturing Partner
              </h1>
              <p className="mb-4 text-base leading-relaxed text-blue-100 md:text-lg">
                Connect with verified contract manufacturers. Use interactive filters to discover contract manufacturers aligned with your technical, compliance, and capacity requirements.
              </p>
            </div>
          </div>
        </div>
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
        </div>
      </div>
    </header>
  )
}
