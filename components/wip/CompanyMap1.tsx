"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Layers, Globe, Loader2, MapPin, Minus, Plus, RotateCcw, Building2 } from "lucide-react"
import type { FeatureCollection, Point } from "geojson"

import { useFilters } from "@/contexts/FilterContext"
import { createPopupFromFacility } from "@/lib/mapbox-utils"
import { getLocationFilteredFacilities } from "@/utils/filtering"
import { getFallbackBounds } from "@/utils/locationBounds"
import { useDebounce } from "@/hooks/useDebounce"
import { getFacilityStateLabel } from "@/utils/locationFilters"
import type { HomepageCompanyWithLocations, HomepageFacilityWithCompany } from "@/types/homepage"

// Ensure token exists
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.demo_token"

const DEFAULT_CENTER: [number, number] = [-98.5795, 39.8283]
const DEFAULT_ZOOM = 2.5

interface CompanyMapProps {
  allCompanies: HomepageCompanyWithLocations[]
}

// Local type definitions to replace missing generic types
type FacilityWithCoordinates = HomepageFacilityWithCompany & {
  latitude: number
  longitude: number
}

type FacilityFeatureProperties = {
  facility_id: string
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
  const [isLoading, setIsLoading] = useState(true)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [styleMenuOpen, setStyleMenuOpen] = useState(false)
  
  const { filters } = useFilters()
  const debouncedFilters = useDebounce(filters, 300)

  // 1. Filter and Map Facilities
  const filteredFacilities = useMemo<FacilityWithCoordinates[]>(() => {
    const facilities = getLocationFilteredFacilities(
      allCompanies,
      debouncedFilters,
      (company, facility) => ({ ...facility, company })
    )

    return facilities.filter((facility): facility is FacilityWithCoordinates => {
      const { latitude, longitude, company } = facility
      return (
        Boolean(company) &&
        typeof latitude === "number" &&
        Number.isFinite(latitude) &&
        typeof longitude === "number" &&
        Number.isFinite(longitude)
      )
    })
  }, [allCompanies, debouncedFilters])

  const facilitiesGeoJSONRef = useRef<FeatureCollection<Point, FacilityFeatureProperties> | null>(null)

  // Keep GeoJSON in a ref so addClusterLayers can stay stable for effects
  const facilitiesGeoJSON: FeatureCollection<Point, FacilityFeatureProperties> = useMemo(() => ({
    type: "FeatureCollection",
    features: filteredFacilities.map(facility => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [facility.longitude, facility.latitude],
      },
      properties: {
        facility_id: facility.id,
        company_name: facility.company?.company_name || "Unknown Company",
        company_slug: facility.company?.slug || "",
        city: facility.city || "",
        state: getFacilityStateLabel(facility) || "",
        state_province: facility.state_province || "",
        country: facility.country || "",
        facility_type: facility.facility_type || "Facility",
      },
    })),
  }), [filteredFacilities])

  useEffect(() => {
    facilitiesGeoJSONRef.current = facilitiesGeoJSON
  }, [facilitiesGeoJSON])

  const addClusterLayers = useCallback(() => {
    const geojson = facilitiesGeoJSONRef.current
    const m = map.current
    if (!m || !geojson) return

    if (m.getSource("facilities")) {
      (m.getSource("facilities") as mapboxgl.GeoJSONSource).setData(geojson)
    } else {
      m.addSource("facilities", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })
    }

    // Clusters
    if (!m.getLayer("clusters")) {
      m.addLayer({
        id: "clusters",
        type: "circle",
        source: "facilities",
        filter: ["has", "point_count"],
        paint: {
          "circle-color": [
            "step",
            ["get", "point_count"],
            "#3b82f6", 10, // Blue-500
            "#2563eb", 50, // Blue-600
            "#1d4ed8"      // Blue-700
          ],
          "circle-radius": ["step", ["get", "point_count"], 15, 10, 20, 50, 25],
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })
    }

    // Counts
    if (!m.getLayer("cluster-count")) {
      m.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: "facilities",
        filter: ["has", "point_count"],
        layout: {
          "text-field": "{point_count_abbreviated}",
          "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
          "text-size": 12,
        },
        paint: { "text-color": "#ffffff" },
      })
    }

    // Individual Points
    if (!m.getLayer("unclustered-point")) {
      m.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: "facilities",
        filter: ["!", ["has", "point_count"]],
        paint: {
          "circle-color": "#ef4444", // Red-500
          "circle-radius": 6,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
      })
    }

    // Interactions
    m.on("click", "clusters", (e) => {
      const features = m.queryRenderedFeatures(e.point, { layers: ["clusters"] })
      const clusterId = features[0]?.properties?.cluster_id
      if (typeof clusterId !== "number") return

      const source = m.getSource("facilities") as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current || typeof zoom !== "number" || !features[0]) return
        map.current.easeTo({
          center: (features[0].geometry as Point).coordinates as [number, number],
          zoom,
        })
      })
    })

    m.on("click", "unclustered-point", (e) => {
      const feature = e.features?.[0]
      if (!feature) return
      
      const coordinates = (feature.geometry as Point).coordinates.slice() as [number, number]
      const props = feature.properties as FacilityFeatureProperties

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360
      }

      // Re-construct partial company object for the popup generator
      const popupObj = {
        company: { company_name: props.company_name, slug: props.company_slug },
        city: props.city,
        state: props.state,
        state_province: props.state_province,
        country: props.country,
        facility_type: props.facility_type
      }

      const popup = createPopupFromFacility(popupObj, { offset: 15, closeButton: false })
      popup.setLngLat(coordinates).addTo(m)
    })

    m.on("mouseenter", "clusters", () => { m.getCanvas().style.cursor = "pointer" })
    m.on("mouseleave", "clusters", () => { m.getCanvas().style.cursor = "" })
    m.on("mouseenter", "unclustered-point", () => { m.getCanvas().style.cursor = "pointer" })
    m.on("mouseleave", "unclustered-point", () => { m.getCanvas().style.cursor = "" })
  }, [])

  // 3. Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: mapStyle,
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      projection: { name: 'globe' },
      attributionControl: false,
    })

    map.current.addControl(new mapboxgl.AttributionControl({ compact: true }), 'bottom-right')
    map.current.scrollZoom.disable() // Prevent scroll hijacking

    map.current.on("load", () => {
      setIsLoading(false)
      addClusterLayers()
    })

    return () => {
      map.current?.remove()
      map.current = null
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // 4. Update Style
  useEffect(() => {
    if (!map.current) return
    map.current.setStyle(mapStyle)
    map.current.once("style.load", () => {
      addClusterLayers()
    })
  }, [mapStyle, addClusterLayers])

  // 5. Update Data Layers
  // Update map data when filters change
  useEffect(() => {
    const m = map.current
    if (!m || !m.getSource("facilities")) return

    (m.getSource("facilities") as mapboxgl.GeoJSONSource).setData(facilitiesGeoJSON)

    // Optional: Auto-fit bounds on filter change
    if (filteredFacilities.length > 0 && filteredFacilities.length < allCompanies.length) {
       const bounds = getFallbackBounds(debouncedFilters)
       if (bounds) {
         m.fitBounds(bounds.bounds, { padding: 50, maxZoom: 10, duration: 1000 })
       }
    }
  }, [facilitiesGeoJSON, filteredFacilities.length, allCompanies.length, debouncedFilters])

  const handleStyleChange = (styleId: string) => {
    setMapStyle(styleId)
    setStyleMenuOpen(false)
  }

  return (
    <div className="relative w-full h-full group">
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        {/* Zoom Controls */}
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 p-1 flex flex-col gap-1">
          <button onClick={() => map.current?.zoomIn()} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => map.current?.zoomOut()} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <Minus className="w-4 h-4" />
          </button>
          <button onClick={() => map.current?.flyTo({ center: DEFAULT_CENTER, zoom: DEFAULT_ZOOM })} className="p-2 hover:bg-gray-100 rounded-md text-gray-600 transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Style Switcher */}
        <div className="relative">
          <button 
            onClick={() => setStyleMenuOpen(!styleMenuOpen)}
            className="bg-white/90 backdrop-blur-sm p-2 rounded-lg shadow-sm border border-gray-200/50 text-gray-600 hover:text-blue-600 hover:bg-white transition-colors"
          >
            <Layers className="w-4 h-4" />
          </button>
          
          {styleMenuOpen && (
            <div className="absolute right-full top-0 mr-2 bg-white rounded-xl shadow-xl border border-gray-100 p-2 min-w-[140px]">
              <div className="space-y-1">
                {[
                  { id: "light-v11", label: "Clean Light", icon: MapPin },
                  { id: "streets-v12", label: "Streets", icon: Building2 },
                  { id: "satellite-streets-v12", label: "Satellite", icon: Globe },
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => handleStyleChange(`mapbox://styles/mapbox/${style.id}`)}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center gap-2 transition-colors ${mapStyle.includes(style.id) ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    <style.icon className="w-3 h-3 opacity-70" />
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div ref={mapContainer} className="w-full h-full bg-slate-100" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-[2px] z-20">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <span className="text-sm font-medium text-slate-600">Loading Map...</span>
          </div>
        </div>
      )}
    </div>
  )
}
