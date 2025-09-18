"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, RotateCcw } from "lucide-react"
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
  const { filters, setFilteredCount } = useFilters()
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [isLoading, setIsLoading] = useState(true)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const currentFacilitiesRef = useRef<FacilityWithCompany[]>([])

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

  // Store current facilities for use in callbacks
  useEffect(() => {
    currentFacilitiesRef.current = filteredFacilities.facilities
    console.log('Updated facilities ref:', filteredFacilities.facilities.length, 'facilities')
  }, [filteredFacilities.facilities])

  // Function to add clustering layers
  const addClusteringLayers = useCallback((facilitiesToAdd?: FacilityWithCompany[]) => {
    const facilities = facilitiesToAdd || currentFacilitiesRef.current
    
    if (!map.current || facilities.length === 0) {
      console.log('Cannot add layers:', { 
        hasMap: !!map.current, 
        facilityCount: facilities.length,
        facilitiesProvided: !!facilitiesToAdd
      })
      return
    }

    console.log('Adding clustering layers for', facilities.length, 'facilities')
    console.log('First facility:', facilities[0])

    // Remove existing layers and source
    try {
      if (map.current.getLayer('clusters')) map.current.removeLayer('clusters')
      if (map.current.getLayer('cluster-count')) map.current.removeLayer('cluster-count')
      if (map.current.getLayer('unclustered-point')) map.current.removeLayer('unclustered-point')
      if (map.current.getSource('facilities')) map.current.removeSource('facilities')
    } catch (error) {
      // Layers might not exist yet, this is normal
    }

    // Create GeoJSON
    const geojson = {
      type: 'FeatureCollection' as const,
      features: facilities.map((facility) => {
        const coords = [facility.longitude, facility.latitude]
        console.log('Facility coords:', facility.company?.company_name, coords)
        return {
          type: 'Feature' as const,
          properties: {
            company_name: facility.company?.company_name || 'Unknown Company',
            company_slug: facility.company?.slug || '',
            city: facility.city || 'Unknown City',
            state: facility.state || 'Unknown State',
            facility_type: facility.facility_type || 'Manufacturing Facility'
          },
          geometry: {
            type: 'Point' as const,
            coordinates: coords
          }
        }
      })
    }

    console.log('GeoJSON created with', geojson.features.length, 'features')

    // Check if source already exists and update it, or create new
    const existingSource = map.current.getSource('facilities') as mapboxgl.GeoJSONSource
    if (existingSource) {
      console.log('Updating existing source')
      existingSource.setData(geojson)
      // Check if layers exist - if not, we need to add them
      if (!map.current.getLayer('clusters')) {
        console.log('Layers missing after source update, adding them')
      } else {
        console.log('Layers already exist, skipping layer addition')
        return // Only return if layers exist
      }
    } else {
      console.log('Creating new source')
      // Add source
      map.current.addSource('facilities', {
        type: 'geojson',
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50
      })
    }

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

    console.log('Clustering layers added successfully')
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.demo_token") {
      setIsLoading(false)
      return
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
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

    // Event handlers
    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current) return
      
      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ['clusters']
      })

      if (features.length === 0) return

      const clusterId = features[0].properties?.cluster_id
      if (clusterId === undefined) return

      const source = map.current.getSource('facilities') as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current) return

        map.current.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom || 10
        })
      })
    }

    const handlePointClick = (e: mapboxgl.MapMouseEvent) => {
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
      console.log('Map initial load complete')
      setIsLoading(false)
      setIsStyleLoaded(true)
      // Don't add layers here - wait for facilities data
    })

    // Handle style changes (this fires after style.load)
    map.current.on('style.load', () => {
      console.log('Style loaded event fired')
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
  }, [addClusteringLayers])

  // Remove automatic style changes - only change when user clicks button

  // Update layers when facilities change AND map is ready
  useEffect(() => {
    if (!map.current || !isStyleLoaded || isLoading || filteredFacilities.facilities.length === 0) {
      console.log('Skipping layer update:', {
        hasMap: !!map.current,
        isStyleLoaded,
        isLoading,
        facilityCount: filteredFacilities.facilities.length
      })
      return
    }

    console.log('Map is ready, updating layers with', filteredFacilities.facilities.length, 'facilities')
    addClusteringLayers(filteredFacilities.facilities)

    // Fit bounds to show all facilities
    if (filteredFacilities.facilities.length > 0) {
      const bounds = new mapboxgl.LngLatBounds()
      filteredFacilities.facilities.forEach((facility) => {
        bounds.extend([facility.longitude, facility.latitude])
      })

      // Use setTimeout to ensure layers are rendered before fitting bounds
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
      console.log('User changing style to:', newStyle)
      setMapStyle(newStyle)
      setIsStyleLoaded(false) // Reset style loaded state
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