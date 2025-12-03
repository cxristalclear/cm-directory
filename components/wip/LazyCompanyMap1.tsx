"use client"

import { lazy, Suspense } from 'react'
import { MapPin, Loader2 } from 'lucide-react'
import { MapErrorBoundary } from '../MapErrorBoundary'
import type { HomepageCompanyWithLocations } from '@/types/homepage'

// Lazy load the map to improve initial page load
const CompanyMap = lazy(() => import('./CompanyMap1'))

interface LazyCompanyMapProps {
  allCompanies: HomepageCompanyWithLocations[]
  className?: string
}

const MapLoadingFallback = () => (
  <div className="relative w-full h-full bg-slate-50 flex items-center justify-center p-8 text-center min-h-[400px]">
    <div className="max-w-md animate-pulse">
      <div className="relative mx-auto w-16 h-16 flex items-center justify-center mb-4">
        <div className="absolute inset-0 bg-blue-100 rounded-full opacity-50 animate-ping" />
        <MapPin className="w-8 h-8 text-blue-400 relative z-10" />
      </div>
      <h3 className="text-base font-semibold text-slate-600 mb-2">Loading Map</h3>
      <div className="flex items-center justify-center gap-2 text-slate-400 text-sm">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span>Initializing geography...</span>
      </div>
    </div>
  </div>
)

export default function LazyCompanyMap({ allCompanies, className = "" }: LazyCompanyMapProps) {
  return (
    <MapErrorBoundary>
      <div className={`relative w-full h-full overflow-hidden bg-slate-100 ${className}`}>
        <Suspense fallback={<MapLoadingFallback />}>
          <CompanyMap allCompanies={allCompanies} />
        </Suspense>
      </div>
    </MapErrorBoundary>
  )
}
