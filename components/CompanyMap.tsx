"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, RotateCcw } from "lucide-react"
import type { FeatureCollection, Point } from "geojson"
import type { Company, FacilityWithCompany } from "../types/company"
import { createPopupFromFacility } from "../lib/mapbox-utils"
import { filterCompanies, getLocationFilteredFacilities } from "../utils/filtering"
import { useDebounce } from "../hooks/useDebounce"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.demo_token"

interface CompanyMapProps {
  allCompanies: Company[]
}

type FacilityWithCoordinates = FacilityWithCompany & {
  latitude: number
  longitude: number
}

type FacilityFeatureProperties = {
  company_name: string
  company_slug: string
  city: string
  state: string
  facility_type: string
}

export default function CompanyMap({ allCompanies }: CompanyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const { filters, setFilteredCount } = useFilters()
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [isLoading, setIsLoading] = useState(true)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const currentFacilitiesRef = useRef<FacilityWithCoordinates[]>([])

  // Debounce filter changes for better performance
  const debouncedFilters = useDebounce(filters, 300)

  // UPDATED: Use location-aware filtering
  const filteredFacilities = useMemo(() => {
    // Get filtered companies count for display
    const filteredCompanies = filterCompanies(allCompanies, debouncedFilters)
    
    // Get facilities that match BOTH company filters AND location filters
    const facilities = getLocationFilteredFacilities(
      allCompanies,
      debouncedFilters,
      (company, facility) => ({
        ...facility,
        company,
      })
    ).filter((facility): facility is FacilityWithCoordinates => {
      const { latitude, longitude, company } = facility
      return (
        Boolean(company) &&
        typeof latitude === 'number' &&
        Number.isFinite(latitude) &&
        typeof longitude === 'number' &&
        Number.isFinite(longitude)
      )
    })

    return { facilities, filteredCount: filteredCompanies.length }
  }, [debouncedFilters, allCompanies])

  useEffect(() => {
    setFilteredCount(filteredFacilities.filteredCount)
  }, [filteredFacilities.filteredCount, setFilteredCount])

  // Store current facilities for use in callbacks
  useEffect(() => {
    currentFacilitiesRef.current = filteredFacilities.facilities
  }, [filteredFacilities.facilities])

  // Function to add clustering layers
  const addClusteringLayers = useCallback((facilitiesToAdd?: FacilityWithCoordinates[]) => {
    if (!map.current) return

    const facilities = facilitiesToAdd || currentFacilitiesRef.current
    if (facilities.length === 0) return

    // Remove existing layers and source if they exist
    if (map.current.getLayer('clusters')) map.current.removeLayer('clusters')
    if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count')
    if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point')
    if (map.current.getSource('facilities')) map.current.removeSource('facilities')

    // Create GeoJSON from facilities
    const geojson: FeatureCollection<Point, FacilityFeatureProperties> = {
      type: 'FeatureCollection',
      features: facilities.map((facility) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [facility.longitude, facility.latitude]
        },
        properties: {
          company_name: facility.company.company_name,
          company_slug: facility.company.slug,
          city: facility.city || '',
          state: facility.state || '',
          facility_type: facility.facility_type || 'Manufacturing'
        }
      }))
    }

    // Add source with clustering
    map.current.addSource('facilities', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    })

    // Add cluster circles
    map.current.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'facilities',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#3B82F6', // blue-500
          10,
          '#1D4ED8', // blue-700
          30,
          '#1E40AF'  // blue-800
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20, // small clusters
          10,
          25, // medium clusters
          30,
          30  // large clusters
        ],
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })

    // Add cluster count text
    map.current.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'facilities',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      },
      paint: {
        'text-color': '#ffffff'
      }
    })

    // Add unclustered points
    map.current.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'facilities',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#3B82F6',
        'circle-radius': 8,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff'
      }
    })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 3.5,
      pitch: 0,
      bearing: 0
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    // Click handler for clusters
    const handleClusterClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!map.current) return
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      })

      if (!features[0]) return

      const clusterId = features[0].properties?.cluster_id
      const source = map.current.getSource('facilities')

      if (source && 'getClusterExpansionZoom' in source) {
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current) return

          const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number]
          map.current.easeTo({
            center: coordinates,
            zoom: zoom || map.current.getZoom() + 2
          })
        })
      }
    }

    // Click handler for individual points
    const handlePointClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!map.current || !e.features?.[0]) return

      const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number]
      const props = e.features[0].properties

      if (!props) return

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      const popup = createPopupFromFacility({
        company: {
          company_name: props.company_name,
          slug: props.company_slug
        },
        city: props.city,
        state: props.state
      })

      popup.setLngLat(coordinates).addTo(map.current)
    }

    // Set up persistent event handlers
    map.current.on('click', 'clusters', handleClusterClick)
    map.current.on('click', 'unclustered-point', handlePointClick)

    map.current.on('mouseenter', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', 'clusters', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })

    map.current.on('mouseenter', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = 'pointer'
    })

    map.current.on('mouseleave', 'unclustered-point', () => {
      if (map.current) map.current.getCanvas().style.cursor = ''
    })

    // Wait for initial load
    map.current.on('load', () => {
      setIsLoading(false)
      setIsStyleLoaded(true)
    })

    // Handle style changes
    map.current.on('style.load', () => {
      setIsStyleLoaded(true)
      // Re-add layers with current facilities
      if (currentFacilitiesRef.current.length > 0) {
        addClusteringLayers(currentFacilitiesRef.current)
      }
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [addClusteringLayers, mapStyle])

  // Update layers when facilities change AND map is ready
  useEffect(() => {
    if (!map.current || !isStyleLoaded || isLoading || filteredFacilities.facilities.length === 0) {
      return
    }

    addClusteringLayers(filteredFacilities.facilities)

    // Fit bounds to show all facilities
    if (filteredFacilities.facilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      filteredFacilities.facilities.forEach((facility) => {
        bounds.extend([facility.longitude, facility.latitude])
      })

      setTimeout(() => {
        if (map.current) {
          map.current.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 10,
            duration: 1000,
          })
        }
      }, 100)
    }
  }, [filteredFacilities.facilities, isStyleLoaded, isLoading, addClusteringLayers])

  const handleStyleChange = (newStyle: string) => {
    if (map.current && newStyle !== mapStyle) {
      setMapStyle(newStyle)
      setIsStyleLoaded(false)
      map.current.setStyle(newStyle)
    }
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
              Outdoors
            </button>
            <button
              onClick={() => handleStyleChange("mapbox://styles/mapbox/dark-v11")}
              className={`px-3 py-1.5 text-xs font-medium rounded transition-colors duration-200 ${
                mapStyle === "mapbox://styles/mapbox/dark-v11"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Dark
            </button>
          </div>
        </div>

        <button
          onClick={resetView}
          className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-2 hover:bg-white transition-colors duration-200"
          title="Reset view"
        >
          <RotateCcw className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Results Counter */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 px-4 py-2">
          <p className="text-sm font-medium text-gray-600">
            <span className="text-blue-600 font-semibold">{filteredFacilities.facilities.length}</span> locations
            {' '}from{' '}
            <span className="text-blue-600 font-semibold">{filteredFacilities.filteredCount}</span> companies
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-[600px]" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  )
}