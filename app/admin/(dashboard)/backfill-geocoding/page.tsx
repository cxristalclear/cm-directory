'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { geocodeFacilityToPoint, GeocodeFacilityError } from '@/lib/admin/geocoding'
import type { Database } from '@/lib/database.types'

type Facility = Database['public']['Tables']['facilities']['Row']

interface GeocodingResult {
  facilityId: string
  companyName: string
  location: string
  success: boolean
  latitude?: number
  longitude?: number
  error?: string
}

export default function BackfillGeocodingPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<GeocodingResult[]>([])
  const [summary, setSummary] = useState<{ total: number; success: number; failed: number } | null>(null)
  const supabase = createClient()

  const handleBackfill = async () => {
    setLoading(true)
    setResults([])
    setSummary(null)

    try {
      // Step 1: Find facilities without coordinates
      const { data: facilities, error: fetchError } = await supabase
        .from('facilities')
        .select(`
          id, 
          company_id, 
          facility_type, 
          street_address, 
          city, 
          state, 
          zip_code, 
          country,
          companies (
            company_name
          )
        `)
        .or('latitude.is.null,longitude.is.null')
        .order('created_at', { ascending: true })

      if (fetchError) throw fetchError

      if (!facilities || facilities.length === 0) {
        setSummary({ total: 0, success: 0, failed: 0 })
        return
      }

      // Step 2: Geocode each facility
      const geocodingResults: GeocodingResult[] = []
      let successCount = 0
      let failCount = 0

      for (const facility of facilities) {
        const companyName = facility.companies?.company_name || 'Unknown Company'
        const location = `${facility.city}, ${facility.state}`

        try {
          // Geocode
          const geocodeResult = await geocodeFacilityToPoint({
            street_address: facility.street_address,
            city: facility.city,
            state: facility.state,
            zip_code: facility.zip_code,
            country: facility.country,
          })

          // Update facility
          const { error: updateError } = await supabase
            .from('facilities')
            .update({
              latitude: geocodeResult.latitude,
              longitude: geocodeResult.longitude,
            })
            .eq('id', facility.id)

          if (updateError) throw updateError

          geocodingResults.push({
            facilityId: facility.id,
            companyName,
            location,
            success: true,
            latitude: geocodeResult.latitude,
            longitude: geocodeResult.longitude,
          })

          successCount++

          // Rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))

        } catch (error) {
          let errorMessage = 'Unknown error'
          
          if (error instanceof GeocodeFacilityError) {
            errorMessage = error.message
          } else if (error instanceof Error) {
            errorMessage = error.message
          }

          geocodingResults.push({
            facilityId: facility.id,
            companyName,
            location,
            success: false,
            error: errorMessage,
          })

          failCount++
        }

        // Update UI with progress
        setResults([...geocodingResults])
      }

      setSummary({
        total: facilities.length,
        success: successCount,
        failed: failCount,
      })

    } catch (error) {
      console.error('Backfill error:', error)
      alert('Failed to backfill geocoding. Check console for details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="glass-card p-6">
        <h1 className="text-3xl font-semibold gradient-text mb-2">
          🌍 Backfill Geocoding
        </h1>
        <p className="text-gray-600">
          Add latitude, longitude, and location geometry to facilities that are missing coordinates.
        </p>
      </div>

      {/* Action Card */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold mb-4">Backfill Missing Coordinates</h2>
        <p className="text-gray-600 mb-4">
          This will geocode all facilities that don&apos;t have latitude/longitude coordinates.
          The process may take a few seconds depending on how many facilities need geocoding.
        </p>
        
        <button
          onClick={handleBackfill}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span>
              Geocoding in progress...
            </>
          ) : (
            <>
              <span>🚀</span>
              Start Backfill
            </>
          )}
        </button>
      </div>

      {/* Summary Card */}
      {summary && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Summary</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
              <div className="text-sm text-gray-600">Total Processed</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{summary.success}</div>
              <div className="text-sm text-gray-600">Successful</div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{summary.failed}</div>
              <div className="text-sm text-gray-600">Failed</div>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="glass-card p-6">
          <h2 className="text-xl font-semibold mb-4">📋 Results</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {results.map((result, index) => (
              <div
                key={result.facilityId}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? 'bg-green-50 border-green-200'
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {index + 1}. {result.companyName}
                    </div>
                    <div className="text-sm text-gray-600">{result.location}</div>
                    {result.success && (
                      <div className="text-xs text-green-700 mt-1">
                        ✅ Geocoded: {result.latitude?.toFixed(4)}, {result.longitude?.toFixed(4)}
                      </div>
                    )}
                    {!result.success && (
                      <div className="text-xs text-red-700 mt-1">
                        ❌ {result.error}
                      </div>
                    )}
                  </div>
                  <div className="text-2xl">
                    {result.success ? '✅' : '❌'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}