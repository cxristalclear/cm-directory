"use client"

import { useEffect, useRef, useState, useMemo } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, Layers, RotateCcw } from "lucide-react"
import type { Company, FacilityWithCompany } from "../types/company"
import { createPopupFromFacility } from "../lib/mapbox-utils"
import { filterCompanies } from "../utils/filtering"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.demo_token"

interface CompanyMapProps {
  allCompanies: Company[]
}

export default function CompanyMap({ allCompanies }: CompanyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const { filters, setFilteredCount } = useFilters()
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [isLoading, setIsLoading] = useState(true)

  const filteredFacilities = useMemo(() => {
    const filteredCompanies = filterCompanies(allCompanies, filters)

    // Extract facilities from filtered companies
    const facilities = filteredCompanies
      .flatMap(
        (company) =>
          company.facilities?.map((facility) => ({
            ...facility,
            company: company,
          })) || [],
      )
      .filter((f): f is FacilityWithCompany => 
        f.latitude != null && 
        f.longitude != null &&
        !isNaN(f.latitude) &&
        !isNaN(f.longitude)
      )

    return { facilities, filteredCount: filteredCompanies.length }
  }, [filters, allCompanies])

  useEffect(() => {
    setFilteredCount(filteredFacilities.filteredCount)
  }, [filteredFacilities.filteredCount, setFilteredCount])

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

  // Show demo message if no token
  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.demo_token") {
    return (
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-sm border border-gray-200/50 p-8 text-center min-h-[500px] flex items-center justify-center">
        <div className="max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Interactive Map</h3>
          <p className="text-gray-500 text-sm">
            Map visualization requires a Mapbox access token. The filtered companies would be displayed as interactive markers on a US map.
          </p>
          <div className="mt-4 text-xs text-gray-400">
            Showing {filteredFacilities.filteredCount} companies
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
      {/* Map Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-2">
          <div className="flex gap-1">
            <button
              onClick={() => handleStyleChange("mapbox://styles/mapbox/light-v11")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-200 ${
                mapStyle === "mapbox://styles/mapbox/light-v11"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Light
            </button>
            <button
              onClick={() => handleStyleChange("mapbox://styles/mapbox/outdoors-v12")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-200 ${
                mapStyle === "mapbox://styles/mapbox/outdoors-v12"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Terrain
            </button>
            <button
              onClick={() => handleStyleChange("mapbox://styles/mapbox/satellite-streets-v12")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-200 ${
                mapStyle === "mapbox://styles/mapbox/satellite-streets-v12"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Satellite
            </button>
          </div>
        </div>

        <button
          onClick={resetView}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-2 hover:bg-white/95 transition-colors duration-200"
          title="Reset View"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Results Counter */}
      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
              <span className="font-medium text-gray-900">{filteredFacilities.facilities.length}</span>
            </div>
            <span className="text-gray-600">
              {filteredFacilities.facilities.length === 1 ? "facility" : "facilities"}
            </span>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-600 font-medium">Loading map...</span>
          </div>
        </div>
      )}

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[500px]" />
    </div>
  )
}