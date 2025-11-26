"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { useFilters } from "../contexts/FilterContext"
import { MapPin, RotateCcw, Layers, Globe, Loader2, Plus, Minus, Building2 } from "lucide-react"
import type { FeatureCollection, Point } from "geojson"
import type { HomepageCompanyWithLocations, HomepageFacilityWithCompany } from "@/types/homepage"
import { createPopupFromFacility } from "../lib/mapbox-utils"
import { filterCompanies, getLocationFilteredFacilities } from "../utils/filtering"
import { getFallbackBounds } from "../utils/locationBounds"
import { useDebounce } from "../hooks/useDebounce"
import { getFacilityStateLabel } from "@/utils/locationFilters"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.demo_token"

interface CompanyMapProps {
  allCompanies: HomepageCompanyWithLocations[]
}

type FacilityWithCoordinates = HomepageFacilityWithCompany & {
  latitude: number
  longitude: number
}

type FacilityFeatureProperties = {
  company_name: string
  company_slug: string
  city: string
  state: string
  state_province: string
  country: string
  facility_type: string
}

export default function CompanyMap({ allCompanies }: CompanyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const { filters, setFilteredCount } = useFilters()
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [isLoading, setIsLoading] = useState(true)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const [showStyleMenu, setShowStyleMenu] = useState(false)
  const currentFacilitiesRef = useRef<FacilityWithCoordinates[]>([])

  const debouncedFilters = useDebounce(filters, 300)

  const filteredFacilities = useMemo(() => {
    const filteredCompanies = filterCompanies(allCompanies, debouncedFilters)
    const facilities = getLocationFilteredFacilities(
      allCompanies,
      debouncedFilters,
      (company, facility) => ({ ...facility, company })
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

  useEffect(() => {
    currentFacilitiesRef.current = filteredFacilities.facilities
  }, [filteredFacilities.facilities])

  const addClusteringLayers = useCallback((facilitiesToAdd?: FacilityWithCoordinates[]) => {
    const mapInstance = map.current
    if (!mapInstance || !mapInstance.isStyleLoaded?.()) return

    const facilities = facilitiesToAdd || currentFacilitiesRef.current

    if (facilities.length === 0) {
      const existingSource = mapInstance.getSource('facilities') as mapboxgl.GeoJSONSource | undefined
      if (existingSource) existingSource.setData({ type: 'FeatureCollection', features: [] })
      return
    }

    const geojson: FeatureCollection<Point, FacilityFeatureProperties> = {
      type: 'FeatureCollection',
      features: facilities
        .filter(facility => facility.company && facility.company.slug)
        .map((facility) => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [facility.longitude, facility.latitude] },
          properties: {
            company_name: facility.company.company_name,
            company_slug: facility.company.slug!,
            city: facility.city || '',
            state: getFacilityStateLabel(facility) || '',
            state_province: facility.state_province || facility.state || '',
            country: facility.country || '',
            facility_type: facility.facility_type || 'Manufacturing'
          }
        }))
    }

    const existingSource = mapInstance.getSource('facilities') as mapboxgl.GeoJSONSource | undefined
    if (existingSource) {
      existingSource.setData(geojson)
      return
    }

    mapInstance.addSource('facilities', {
      type: 'geojson',
      data: geojson,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50,
    })

    mapInstance.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'facilities',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': ['step', ['get', 'point_count'], '#2563EB', 10, '#1D4ED8', 30, '#1E40AF'],
        'circle-radius': ['step', ['get', 'point_count'], 20, 10, 25, 30, 30],
        'circle-stroke-width': 3,
        'circle-stroke-color': '#ffffff',
      },
    })

    mapInstance.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'facilities',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12,
      },
      paint: { 'text-color': '#ffffff' },
    })

    mapInstance.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'facilities',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#2563EB',
        'circle-radius': 7,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#ffffff',
      },
    })
  }, [])

  useEffect(() => {
    if (!mapContainer.current || map.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: [-98.5795, 39.8283],
      zoom: 5,
      pitch: 0,
      bearing: 0,
      attributionControl: false
    })

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')

    const handleClusterClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!map.current) return
      const features = map.current.queryRenderedFeatures(e.point, { layers: ['clusters'] })
      if (!features[0]) return
      const clusterId = features[0].properties?.cluster_id
      const source = map.current.getSource('facilities') as mapboxgl.GeoJSONSource
      
      if (source && 'getClusterExpansionZoom' in source) {
        source.getClusterExpansionZoom(clusterId, (err, zoom) => {
          if (err || !map.current) return
          const coordinates = (features[0].geometry as GeoJSON.Point).coordinates as [number, number]
          map.current.easeTo({ center: coordinates, zoom: zoom || map.current.getZoom() + 2 })
        })
      }
    }

    const handlePointClick = (e: mapboxgl.MapLayerMouseEvent) => {
      if (!map.current || !e.features?.[0]) return
      const coordinates = (e.features[0].geometry as GeoJSON.Point).coordinates.slice() as [number, number]
      const props = e.features[0].properties
      if (!props) return

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      createPopupFromFacility({
        company: { company_name: props.company_name, slug: props.company_slug },
        city: props.city,
        state: props.state,
        state_province: props.state_province,
        country: props.country,
        facility_type: props.facility_type,
      }).setLngLat(coordinates).addTo(map.current!)
    }

    map.current.on('click', 'clusters', handleClusterClick)
    map.current.on('click', 'unclustered-point', handlePointClick)
    map.current.on('mouseenter', 'clusters', () => map.current && (map.current.getCanvas().style.cursor = 'pointer'))
    map.current.on('mouseleave', 'clusters', () => map.current && (map.current.getCanvas().style.cursor = ''))
    map.current.on('mouseenter', 'unclustered-point', () => map.current && (map.current.getCanvas().style.cursor = 'pointer'))
    map.current.on('mouseleave', 'unclustered-point', () => map.current && (map.current.getCanvas().style.cursor = ''))

    map.current.on('load', () => {
      setIsLoading(false)
      setIsStyleLoaded(true)
    })

    map.current.on('style.load', () => {
      setIsStyleLoaded(true)
      if (currentFacilitiesRef.current.length > 0) {
        addClusteringLayers(currentFacilitiesRef.current)
      }
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, [addClusteringLayers, mapStyle])

  const resetView = useCallback(() => {
    map.current?.flyTo({ center: [-98.5795, 39.8283], zoom: 3.5, pitch: 0, bearing: 0, duration: 1500 })
  }, [])

  useEffect(() => {
    if (!map.current || !isStyleLoaded || isLoading) return
    addClusteringLayers(filteredFacilities.facilities)

    if (filteredFacilities.facilities.length === 0) {
      const fallback = getFallbackBounds(filters)
      if (!map.current) return
      if (fallback) {
        if (fallback.selectionCount > 1) {
          map.current.fitBounds(fallback.bounds, { padding: 50, maxZoom: 8, duration: 1000 })
        } else {
          map.current.flyTo({ center: fallback.center, zoom: fallback.zoom, duration: 1200 })
        }
      } else {
        resetView()
      }
      return
    }

    const bounds = new mapboxgl.LngLatBounds()
    filteredFacilities.facilities.forEach((f) => bounds.extend([f.longitude, f.latitude]))
    
    setTimeout(() => {
      map.current?.fitBounds(bounds, { padding: { top: 100, bottom: 50, left: 50, right: 50 }, maxZoom: 10, duration: 1000 })
    }, 100)
  }, [filteredFacilities.facilities, isStyleLoaded, isLoading, addClusteringLayers, filters, resetView])

  const handleStyleChange = (newStyle: string) => {
    if (map.current && newStyle !== mapStyle) {
      setMapStyle(newStyle)
      setIsStyleLoaded(false)
      setShowStyleMenu(false)
      map.current.setStyle(newStyle)
    }
  }

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.demo_token") {
    return (
      <div className="relative h-[500px] w-full rounded-2xl border border-gray-200 bg-gray-50 flex items-center justify-center text-center p-8">
        <div>
          <MapPin className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <h3 className="font-medium text-gray-900">Interactive Map</h3>
          <p className="text-sm text-gray-500 mt-1">Requires Mapbox token to display</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-[600px] w-full rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden shadow-sm group isolate">
      {/* Floating Status Pill - Glass Effect */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 animate-in fade-in slide-in-from-top-4 duration-500">
        <div className="bg-white/80 backdrop-blur-md border border-white/20 shadow-lg px-5 py-2.5 rounded-full flex items-center gap-4 hover:bg-white/90 transition-all ring-1 ring-black/5">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <div className="p-1 bg-blue-100 text-blue-600 rounded-full">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <span className="text-gray-900 font-bold tabular-nums">{filteredFacilities.facilities.length}</span> locations
          </div>
          <div className="w-px h-4 bg-gray-300/50" />
          <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
            <div className="p-1 bg-gray-100 text-gray-600 rounded-full">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="text-gray-900 font-bold tabular-nums">{filteredFacilities.filteredCount}</span> companies
          </div>
        </div>
      </div>

      {/* Controls Container */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-3">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden flex flex-col divide-y divide-gray-100">
          <button onClick={() => map.current?.zoomIn()} className="p-2.5 hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors active:bg-gray-100">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => map.current?.zoomOut()} className="p-2.5 hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-colors active:bg-gray-100">
            <Minus className="w-4 h-4" />
          </button>
        </div>
        <button onClick={resetView} className="bg-white p-2.5 rounded-xl shadow-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:bg-gray-50 transition-all active:scale-95" title="Reset View">
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Left: Layers */}
      <div className="absolute bottom-6 left-6 z-10">
        <div className="relative" onMouseEnter={() => setShowStyleMenu(true)} onMouseLeave={() => setShowStyleMenu(false)}>
          <button className="bg-white p-3 rounded-xl shadow-lg border border-gray-200 text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-all group">
            <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          
          <div className={`absolute bottom-full left-0 mb-3 w-44 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden transition-all duration-200 origin-bottom-left ${showStyleMenu ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
            <div className="p-1.5 space-y-0.5">
              {[
                { id: 'light-v11', label: 'Standard Map', icon: MapPin },
                { id: 'outdoors-v12', label: 'Terrain View', icon: Globe },
                { id: 'satellite-streets-v12', label: 'Satellite', icon: Layers }
              ].map((style) => (
                <button
                  key={style.id}
                  onClick={() => handleStyleChange(`mapbox://styles/mapbox/${style.id}`)}
                  className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-lg flex items-center gap-3 transition-colors ${mapStyle.includes(style.id) ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-200' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <style.icon className={`w-3.5 h-3.5 ${mapStyle.includes(style.id) ? 'text-blue-600' : 'text-gray-400'}`} />
                  {style.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div ref={mapContainer} className="w-full h-full" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-20">
          <div className="bg-white px-6 py-4 rounded-2xl shadow-2xl border border-gray-100 flex items-center gap-3 animate-in fade-in zoom-in duration-300">
            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
            <span className="text-sm font-semibold text-gray-700">Loading manufacturing map...</span>
          </div>
        </div>
      )}
    </div>
  )
}