"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, Layers, RotateCcw } from "lucide-react"
import type { Company, FacilityWithCompany } from "../types/company"
import { createPopupFromFacility } from "../lib/mapbox-utils"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.demo_token"

interface CompanyMapProps {
  allCompanies: Company[]
}

export default function CompanyMap({ allCompanies }: CompanyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const { filters} = useFilters()
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [isLoading, setIsLoading] = useState(true)

  const filteredFacilities = useMemo(() => {
    let filtered = [...allCompanies]

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (company) =>
          company.company_name?.toLowerCase().includes(searchLower) ||
          company.description?.toLowerCase().includes(searchLower) ||
          company.key_differentiators?.toLowerCase().includes(searchLower),
      )
    }

    // State filter
    if (filters.states.length > 0) {
      filtered = filtered.filter((company) => company.facilities?.some((f) => filters.states.includes(f.state)))
    }

    // Capabilities filter
    if (filters.capabilities.length > 0) {
      filtered = filtered.filter((company) => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.capabilities.some((filter) => {
          switch (filter) {
            case "smt":
              return cap.pcb_assembly_smt
            case "through_hole":
              return cap.pcb_assembly_through_hole
            case "cable_harness":
              return cap.cable_harness_assembly
            case "box_build":
              return cap.box_build_assembly
            case "prototyping":
              return cap.prototyping
            default:
              return false
          }
        })
      })
    }

    // Volume capability filter
    if (filters.volumeCapability.length > 0) {
      filtered = filtered.filter((company) => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.volumeCapability.some((vol) => {
          switch (vol) {
            case "low":
              return cap.low_volume_production
            case "medium":
              return cap.medium_volume_production
            case "high":
              return cap.high_volume_production
            default:
              return false
          }
        })
      })
    }

    // Certifications filter
    if (filters.certifications.length > 0) {
      filtered = filtered.filter((company) =>
        company.certifications?.some((cert) =>
          filters.certifications.includes(cert.certification_type.toLowerCase().replace(/\s+/g, "_")),
        ),
      )
    }

    // Industries filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        company.industries?.some((ind) =>
          filters.industries.includes(ind.industry_name.toLowerCase().replace(/\s+/g, "_")),
        ),
      )
    }

    // Employee range filter
    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter((company) => filters.employeeRange.includes(company.employee_count_range))
    }

    // Extract facilities from filtered companies
    const facilities = filtered
      .flatMap(
        (company) =>
          company.facilities?.map((facility) => ({
            ...facility,
            company: company,
          })) || [],
      )
      .filter((f): f is FacilityWithCompany => f.latitude !== null && f.longitude !== null)

    return { facilities, filteredCount: filtered.length }
  }, [filters, allCompanies])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.demo_token") {
      setIsLoading(false)
      return
    }

    // Initialize map with initial style
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11", // Use static initial style
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
      fadeDuration: 300,
    })

    // Add controls
    map.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      "top-right",
    )

    map.current.addControl(new mapboxgl.FullscreenControl(), "top-right")
    map.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")

    // Map load event
    map.current.on("load", () => {
      setIsLoading(false)
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, []) // Empty dependency array - only run once on mount

  // Separate effect for style changes
  useEffect(() => {
    if (map.current && !isLoading) {
      map.current.setStyle(mapStyle)
    }
  }, [mapStyle, isLoading])

  useEffect(() => {
    if (!map.current || isLoading) return

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove())
    markers.current = []

    const facilities = filteredFacilities.facilities

    facilities.forEach((facility) => {
      const el = document.createElement("div")
      el.className = `
        relative w-6 h-6 cursor-pointer
      `

      // Inner marker with gradient
      el.innerHTML = `
        <div class="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border-2 border-white shadow-lg"></div>
        <div class="absolute inset-1 bg-white rounded-full flex items-center justify-center">
          <div class="w-2 h-2 bg-blue-600 rounded-full"></div>
        </div>
      `

      // Create enhanced popup
      const popup = createPopupFromFacility(facility)
      popup.setMaxWidth("320px")

      const marker = new mapboxgl.Marker(el)
        .setLngLat([facility.longitude, facility.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      markers.current.push(marker)
    })

    // Fit bounds to show all markers if there are any
    if (facilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      facilities.forEach((facility) => {
        bounds.extend([facility.longitude, facility.latitude])
      })

      map.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 10,
        duration: 1000,
      })
    }
  }, [filteredFacilities.facilities, isLoading]) // Use memoized facilities

  const handleStyleChange = (newStyle: string) => {
    setMapStyle(newStyle)
  }

  const resetView = () => {
    if (map.current) {
      map.current.flyTo({
        center: [-98.5795, 39.8283],
        zoom: 3.5,
        pitch: 0,
        bearing: 0,
        duration: 1500,
      })
    }
  }

  const AdPlaceholder = ({
    width,
    height,
    label,
    className = "",
  }: {
    width: string
    height: string
    label: string
    className?: string
  }) => (
    <div
      className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <div className="text-center text-gray-500">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs mt-1">
          {width} × {height}
        </div>
        <div className="text-xs text-gray-400 mt-1">Advertisement</div>
      </div>
    </div>
  )

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.demo_token") {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 font-sans">Manufacturing Locations</h2>
            <p className="text-sm text-gray-600 mt-1">
              Interactive map showing {filteredFacilities.facilities.length} verified facilities
            </p>
          </div>
        </div>

        <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="h-[600px] w-full flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Map Unavailable</h3>
              <p className="text-gray-600 max-w-md">
                To display the interactive map, please add your Mapbox token to the environment variables.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Showing {filteredFacilities.facilities.length} facilities based on current filters.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Map Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 font-sans">Manufacturing Locations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Interactive map showing {filteredFacilities.facilities.length} verified facilities
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div className="relative bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Loading map...</span>
            </div>
          </div>
        )}

        {/* Map Controls Overlay */}
        <div className="absolute top-4 left-4 z-10 flex flex-col space-y-3">
          {/* Location Counter */}
          <div className="glass-effect rounded-xl px-4 py-3 shadow-lg">
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-blue-600" />
              <div>
                <p className="font-bold text-gray-900">{filteredFacilities.facilities.length}</p>
                <p className="text-xs text-gray-600">Locations</p>
              </div>
            </div>
          </div>

          {/* Map Style Selector */}
          <div className="glass-effect rounded-xl p-3 shadow-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Layers className="w-4 h-4 text-gray-600" />
              <span className="text-xs font-medium text-gray-700">Map Style</span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => handleStyleChange("mapbox://styles/mapbox/light-v11")}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  mapStyle === "mapbox://styles/mapbox/light-v11"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Light
              </button>
              <button
                onClick={() => handleStyleChange("mapbox://styles/mapbox/satellite-streets-v12")}
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  mapStyle === "mapbox://styles/mapbox/satellite-streets-v12"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Satellite
              </button>
            </div>
          </div>

          {/* Reset View Button */}
          <button
            onClick={resetView}
            className="glass-effect rounded-xl p-3 shadow-lg hover:bg-white/80 transition-colors group"
            title="Reset view"
          >
            <RotateCcw className="w-4 h-4 text-gray-600 group-hover:text-blue-600 transition-colors" />
          </button>
        </div>

        {/* Map */}
        <div ref={mapContainer} className="h-[600px] w-full" style={{ minHeight: "600px" }} />

        {/* Map Legend */}
        <div className="absolute bottom-4 right-4 glass-effect rounded-xl p-3 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full border border-white shadow-sm"></div>
              <span className="text-xs text-gray-600">Manufacturing Facility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}