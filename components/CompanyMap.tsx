"use client"

import { useEffect, useRef, useState, useMemo, useCallback } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapPin, RotateCcw } from "lucide-react"
import type { FeatureCollection, Point } from "geojson"
import type { ListingCompany, ListingFacilityWithCompany } from "../types/company"
import { createPopupFromFacility } from "../lib/mapbox-utils"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.demo_token"

interface CompanyMapProps {
  allCompanies: ListingCompany[]
}

type FacilityWithCoordinates = ListingFacilityWithCompany & {
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

export default function CompanyMap({ companies }: CompanyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [isLoading, setIsLoading] = useState(true)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const currentFacilitiesRef = useRef<FacilityWithCoordinates[]>([])

  const facilities = useMemo(() => {
    return companies
      .flatMap((company) =>
        company.facilities.map((facility) => ({
          ...facility,
          company,
        })),
      )
      .filter((facility): facility is FacilityWithCoordinates => {
        const { latitude, longitude, company } = facility
        return (
          Boolean(company) &&
          typeof latitude === "number" &&
          Number.isFinite(latitude) &&
          typeof longitude === "number" &&
          Number.isFinite(longitude)
        )
      })
  }, [companies])

  useEffect(() => {
    currentFacilitiesRef.current = facilities
  }, [facilities])

  const addClusteringLayers = useCallback((facilitiesToAdd?: FacilityWithCoordinates[]) => {
    const facilitiesForMap = facilitiesToAdd || currentFacilitiesRef.current

    if (!map.current || facilitiesForMap.length === 0) {
      return
    }

    try {
      if (map.current.getLayer("clusters")) map.current.removeLayer("clusters")
      if (map.current.getLayer("cluster-count")) map.current.removeLayer("cluster-count")
      if (map.current.getLayer("unclustered-point")) map.current.removeLayer("unclustered-point")
      if (map.current.getSource("facilities")) map.current.removeSource("facilities")
    } catch (error) {
      // Layers may not exist yet
    }

    const geojson: FeatureCollection<Point, FacilityFeatureProperties> = {
      type: "FeatureCollection",
      features: facilitiesForMap.map((facility) => ({
        type: "Feature",
        properties: {
          company_name: facility.company.company_name || "Unknown Company",
          company_slug: facility.company.slug || "",
          city: facility.city || "Unknown City",
          state: facility.state || "Unknown State",
          facility_type: facility.facility_type || "Manufacturing Facility",
        },
        geometry: {
          type: "Point",
          coordinates: [facility.longitude, facility.latitude],
        },
      })),
    }

    const existingSource = map.current.getSource("facilities") as mapboxgl.GeoJSONSource
    if (existingSource) {
      existingSource.setData(geojson)
      if (map.current.getLayer("clusters")) {
        return
      }
    } else {
      map.current.addSource("facilities", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })
    }

    map.current.addLayer({
      id: "clusters",
      type: "circle",
      source: "facilities",
      filter: ["has", "point_count"],
      paint: {
        "circle-color": [
          "step",
          ["get", "point_count"],
          "#3B82F6",
          10,
          "#1D4ED8",
          30,
          "#1E40AF",
        ],
        "circle-radius": [
          "step",
          ["get", "point_count"],
          20,
          10,
          25,
          30,
          30,
        ],
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    })

    map.current.addLayer({
      id: "cluster-count",
      type: "symbol",
      source: "facilities",
      filter: ["has", "point_count"],
      layout: {
        "text-field": "{point_count_abbreviated}",
        "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
        "text-size": 12,
      },
      paint: {
        "text-color": "#ffffff",
      },
    })

    map.current.addLayer({
      id: "unclustered-point",
      type: "circle",
      source: "facilities",
      filter: ["!", ["has", "point_count"]],
      paint: {
        "circle-color": "#3B82F6",
        "circle-radius": 8,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
      },
    })
  }, [])

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

    const handleClusterClick = (e: mapboxgl.MapMouseEvent) => {
      if (!map.current) return

      const features = map.current.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      })

      if (features.length === 0) return

      const clusterId = features[0].properties?.cluster_id
      if (clusterId === undefined) return

      const source = map.current.getSource("facilities") as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (err, zoom) => {
        if (err || !map.current) return

        map.current.easeTo({
          center: (features[0].geometry as GeoJSON.Point).coordinates as [number, number],
          zoom: zoom || 10,
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
          slug: props.company_slug,
        },
        city: props.city,
        state: props.state,
      })

      popup.setLngLat(coordinates).addTo(map.current)
    }

    map.current.on("click", "clusters", handleClusterClick)
    map.current.on("click", "unclustered-point", handlePointClick)

    map.current.on("mouseenter", "clusters", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer"
    })

    map.current.on("mouseleave", "clusters", () => {
      if (map.current) map.current.getCanvas().style.cursor = ""
    })

    map.current.on("mouseenter", "unclustered-point", () => {
      if (map.current) map.current.getCanvas().style.cursor = "pointer"
    })

    map.current.on("mouseleave", "unclustered-point", () => {
      if (map.current) map.current.getCanvas().style.cursor = ""
    })

    map.current.on("load", () => {
      setIsLoading(false)
      setIsStyleLoaded(true)
    })

    map.current.on("style.load", () => {
      setIsStyleLoaded(true)
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

  useEffect(() => {
    if (!map.current || !isStyleLoaded || isLoading || facilities.length === 0) {
      return
    }

    addClusteringLayers(facilities)

    const bounds = new mapboxgl.LngLatBounds()
    facilities.forEach((facility) => {
      bounds.extend([facility.longitude, facility.latitude])
    })

    setTimeout(() => {
      if (map.current && facilities.length > 0) {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 10,
          duration: 1000,
        })
      }
    }, 100)
  }, [facilities, isStyleLoaded, isLoading, addClusteringLayers])

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

  if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.demo_token") {
    return (
      <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-sm border border-gray-200/50 p-8 text-center min-h-[500px] flex items-center justify-center">
        <div className="max-w-md">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Interactive Map</h3>
          <p className="text-gray-500 text-sm">
            Map visualization requires a Mapbox access token. Filtered companies appear here when a token is configured.
          </p>
          <div className="mt-4 text-xs text-gray-400">Showing {companies.length} companies</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden">
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

      <div className="absolute bottom-4 left-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/50 px-3 py-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-600 rounded-full" />
              <span className="font-medium text-gray-900">{facilities.length}</span>
            </div>
            <span className="text-gray-600">{facilities.length === 1 ? "facility" : "facilities"}</span>
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-sm z-20 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 font-medium">Loading map...</span>
          </div>
        </div>
      )}

      <div ref={mapContainer} className="w-full h-[500px]" />
    </div>
  )
}
