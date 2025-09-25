"use client"

import { lazy, Suspense } from 'react'
import { MapErrorBoundary } from './MapErrorBoundary'
import { MapPin } from 'lucide-react'
import type { ListingCompany } from '../types/company'

// Lazy load the map component
const CompanyMap = lazy(() => import('./CompanyMap'))

interface LazyCompanyMapProps {
  allCompanies: ListingCompany[]
}

// Loading placeholder component
const MapLoadingFallback = () => (
  <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-sm border border-gray-200/50 p-8 text-center min-h-[500px] flex items-center justify-center">
    <div className="max-w-md">
      <div className="relative">
        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-600 mb-2">Loading Map</h3>
      <p className="text-gray-500 text-sm">
        Preparing interactive facility locations...
      </p>
    </div>
  </div>
)

export default function LazyCompanyMap({ allCompanies }: LazyCompanyMapProps) {
  return (
    <MapErrorBoundary>
      <Suspense fallback={<MapLoadingFallback />}>
        <CompanyMap allCompanies={allCompanies} />
      </Suspense>
    </MapErrorBoundary>
  )
}