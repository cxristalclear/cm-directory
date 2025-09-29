"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { MapPin, RotateCcw } from "lucide-react"
import type { FeatureCollection, Point } from "geojson"

import { useFilters } from "@/contexts/FilterContext"
import { serializeFiltersToSearchParams } from "@/lib/filters/url"
import type { MapFacility } from "@/lib/queries/mapSearch"
import type { FilterState } from "@/types/company"
import { createPopupFromFacility } from "../lib/mapbox-utils"

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "pk.demo_token"

interface CompanyMapProps {
  initialFacilities: MapFacility[]
  initialFilters: FilterState
  routeDefaults?: {
    state?: string
    certSlug?: string
  }
}

type FacilityFeatureProperties = {
  company_name: string
  company_slug: string
  city: string
  state: string
}

type MapApiResponse = {
  clusters: Array<{ id: string; coordinates: [number, number]; point_count: number }>
  leaves: MapFacility[]
  totalCount: number
}

function buildFilterParams(
  filters: FilterState,
  routeDefaults?: CompanyMapProps["routeDefaults"],
): URLSearchParams {
  const params = serializeFiltersToSearchParams(filters)

  if (routeDefaults?.certSlug) {
    params.set("cert", routeDefaults.certSlug)
  }

  if (routeDefaults?.state) {
    params.set("defaultState", routeDefaults.state)
  }

  return params
}

export default function CompanyMap({ initialFacilities, initialFilters, routeDefaults }: CompanyMapProps) {
  const { filters: liveFilters } = useFilters()
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const currentFacilitiesRef = useRef<MapFacility[]>(initialFacilities)
  const pendingRequestRef = useRef<AbortController | null>(null)
  const lastQuerySignatureRef = useRef<string | null>(null)
  const shouldFitBoundsRef = useRef(true)

  const [facilities, setFacilities] = useState<MapFacility[]>(initialFacilities)
  const [totalFacilities, setTotalFacilities] = useState<number>(initialFacilities.length)
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/light-v11")
  const [isLoading, setIsLoading] = useState(true)
  const [isStyleLoaded, setIsStyleLoaded] = useState(false)
  const [isFetching, setIsFetching] = useState(false)

  const filters = liveFilters ?? initialFilters

  const buildParams = useCallback(() => buildFilterParams(filters, routeDefaults), [filters, routeDefaults])

  const requestFacilities = useCallback(
    (force = false) => {
      if (!mapRef.current || !isStyleLoaded || isLoading) {
        return
      }

      const bounds = mapRef.current.getBounds()
      const zoom = mapRef.current.getZoom()

      if (!bounds || !Number.isFinite(zoom)) {
        return
      }

      const params = buildParams()
      params.set(
        "bbox",
        `${bounds.getWest()},${bounds.getSouth()},${bounds.getEast()},${bounds.getNorth()}`,
      )
      params.set("zoom", `${Math.max(0, Math.round(zoom))}`)

      const queryString = params.toString()
      if (!force && queryString === lastQuerySignatureRef.current) {
        return
      }

      lastQuerySignatureRef.current = queryString

      if (pendingRequestRef.current) {
        pendingRequestRef.current.abort()
      }

      const controller = new AbortController()
      pendingRequestRef.current = controller
      setIsFetching(true)

      fetch(`/api/map?${queryString}`, { signal: controller.signal })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to load map facilities: ${response.status}`)
          }
          return response.json() as Promise<MapApiResponse>
        })
        .then((payload) => {
          if (Array.isArray(payload?.leaves)) {
            setFacilities(payload.leaves)
            currentFacilitiesRef.current = payload.leaves
          } else {
            setFacilities([])
            currentFacilitiesRef.current = []
          }

          if (typeof payload?.totalCount === "number") {
            setTotalFacilities(payload.totalCount)
          } else {
            setTotalFacilities(Array.isArray(payload?.leaves) ? payload.leaves.length : 0)
          }
        })
        .catch((error) => {
          if ((error as Error).name === "AbortError") {
            return
          }
          console.error("Map facilities fetch failed", error)
          setFacilities([])
          currentFacilitiesRef.current = []
          setTotalFacilities(0)
        })
        .finally(() => {
          setIsFetching(false)
          if (pendingRequestRef.current === controller) {
            pendingRequestRef.current = null
          }
        })
    },
    [buildParams, isLoading, isStyleLoaded],
  )

  useEffect(() => {
    currentFacilitiesRef.current = facilities
  }, [facilities])

  useEffect(() => {
    lastQuerySignatureRef.current = null
    shouldFitBoundsRef.current = true
    requestFacilities(true)
  }, [buildParams, requestFacilities])

  useEffect(() => {
    return () => {
      if (pendingRequestRef.current) {
        pendingRequestRef.current.abort()
        pendingRequestRef.current = null
      }
    }
  }, [])

  const addClusteringLayers = useCallback((facilitiesToAdd?: MapFacility[]) => {
    const facilitiesForMap = facilitiesToAdd ?? currentFacilitiesRef.current

    if (!mapRef.current || facilitiesForMap.length === 0) {
      return
    }

    try {
      if (mapRef.current.getLayer("clusters")) mapRef.current.removeLayer("clusters")
      if (mapRef.current.getLayer("cluster-count")) mapRef.current.removeLayer("cluster-count")
      if (mapRef.current.getLayer("unclustered-point")) mapRef.current.removeLayer("unclustered-point")
      if (mapRef.current.getSource("facilities")) mapRef.current.removeSource("facilities")
    } catch (error) {
      // Layers may not exist yet
      console.debug("Map layer cleanup skipped", error)
    }

    const geojson: FeatureCollection<Point, FacilityFeatureProperties> = {
      type: "FeatureCollection",
      features: facilitiesForMap.map((facility) => ({
        type: "Feature",
        properties: {
          company_name: facility.company_name || "Unknown Company",
          company_slug: facility.slug || "",
          city: facility.city || "Unknown City",
          state: facility.state || "Unknown State",
        },
        geometry: {
          type: "Point",
          coordinates: [facility.lng, facility.lat],
        },
      })),
    }

    const existingSource = mapRef.current.getSource("facilities") as mapboxgl.GeoJSONSource | undefined
    if (existingSource) {
      existingSource.setData(geojson)
      if (mapRef.current.getLayer("clusters")) {
        return
      }
    } else {
      mapRef.current.addSource("facilities", {
        type: "geojson",
        data: geojson,
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 50,
      })
    }

    mapRef.current.addLayer({
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

    mapRef.current.addLayer({
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

    mapRef.current.addLayer({
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
    if (!mapContainerRef.current || mapRef.current) {
      return
    }

    if (!process.env.NEXT_PUBLIC_MAPBOX_TOKEN || process.env.NEXT_PUBLIC_MAPBOX_TOKEN === "pk.demo_token") {
      setIsLoading(false)
      return
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [-98.5795, 39.8283],
      zoom: 3.5,
      pitch: 0,
      bearing: 0,
      antialias: true,
      fadeDuration: 300,
    })

    mapRef.current.addControl(
      new mapboxgl.NavigationControl({
        showCompass: true,
        showZoom: true,
        visualizePitch: true,
      }),
      "top-right",
    )
    mapRef.current.addControl(new mapboxgl.FullscreenControl(), "top-right")
    mapRef.current.addControl(new mapboxgl.ScaleControl(), "bottom-left")

    const handleMoveEnd = () => {
      shouldFitBoundsRef.current = false
      requestFacilities()
    }

    const handleClusterClick = (event: mapboxgl.MapMouseEvent) => {
      if (!mapRef.current) return

      const features = mapRef.current.queryRenderedFeatures(event.point, {
        layers: ["clusters"],
      })

      if (features.length === 0) return

      const clusterId = features[0].properties?.cluster_id
      if (clusterId === undefined) return

      const source = mapRef.current.getSource("facilities") as mapboxgl.GeoJSONSource
      source.getClusterExpansionZoom(clusterId, (error, zoom) => {
        if (error || !mapRef.current) return

        mapRef.current.easeTo({
          center: (features[0].geometry as Point).coordinates as [number, number],
          zoom: zoom ?? 10,
        })
      })
    }

    const handlePointClick = (event: mapboxgl.MapMouseEvent) => {
      if (!mapRef.current || !event.features?.[0]) return

      const coordinates = (event.features[0].geometry as Point).coordinates.slice() as [number, number]
      const props = event.features[0].properties as FacilityFeatureProperties | undefined

      if (!props) return

      while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360
      }

      const popup = createPopupFromFacility({
        company: {
          company_name: props.company_name,
          slug: props.company_slug,
        },
        city: props.city,
        state: props.state,
      })

      popup.setLngLat(coordinates).addTo(mapRef.current)
    }

    mapRef.current.on("click", "clusters", handleClusterClick)
    mapRef.current.on("click", "unclustered-point", handlePointClick)

    mapRef.current.on("mouseenter", "clusters", () => {
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer"
    })
    mapRef.current.on("mouseleave", "clusters", () => {
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = ""
    })
    mapRef.current.on("mouseenter", "unclustered-point", () => {
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = "pointer"
    })
    mapRef.current.on("mouseleave", "unclustered-point", () => {
      if (mapRef.current) mapRef.current.getCanvas().style.cursor = ""
    })

    mapRef.current.on("load", () => {
      setIsLoading(false)
      setIsStyleLoaded(true)
      shouldFitBoundsRef.current = true
      requestFacilities(true)
    })

    mapRef.current.on("style.load", () => {
      setIsStyleLoaded(true)
      if (currentFacilitiesRef.current.length > 0) {
        addClusteringLayers(currentFacilitiesRef.current)
      }
      shouldFitBoundsRef.current = false
      requestFacilities(true)
    })

    mapRef.current.on("moveend", handleMoveEnd)

    return () => {
      if (mapRef.current) {
        mapRef.current.off("moveend", handleMoveEnd)
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [addClusteringLayers, mapStyle, requestFacilities])

  useEffect(() => {
    if (!mapRef.current || !isStyleLoaded || isLoading || facilities.length === 0) {
      return
    }

    addClusteringLayers(facilities)

    if (!shouldFitBoundsRef.current) {
      return
    }

    const bounds = new mapboxgl.LngLatBounds()
    for (const facility of facilities) {
      bounds.extend([facility.lng, facility.lat])
    }

    if (!bounds.isEmpty()) {
      shouldFitBoundsRef.current = false
      mapRef.current.fitBounds(bounds, {
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
        maxZoom: 10,
        duration: 600,
      })
    }
  }, [facilities, isStyleLoaded, isLoading, addClusteringLayers])

  const handleStyleChange = (newStyle: string) => {
    if (mapRef.current && newStyle !== mapStyle) {
      setMapStyle(newStyle)
      setIsStyleLoaded(false)
      mapRef.current.setStyle(newStyle)
    }
  }

  const resetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
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
            Map visualization requires a Mapbox access token. Filtered facilities appear here when a token is configured.
          </p>
          <div className="mt-4 text-xs text-gray-400">Showing {totalFacilities} facilities</div>
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
              <span className="font-medium text-gray-900">{totalFacilities}</span>
            </div>
            <span className="text-gray-600">{totalFacilities === 1 ? "facility" : "facilities"}</span>
            {isFetching && <span className="text-xs text-gray-400">Updating…</span>}
          </div>
        </div>
      </div>

      {(isLoading || isFetching) && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70 backdrop-blur-sm">
          <div className="flex items-center gap-3 rounded-full border border-blue-100 bg-white px-4 py-2 shadow-sm">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            <span className="text-sm font-medium text-blue-700">
              {isLoading ? "Loading map…" : "Refreshing facilities…"}
            </span>
          </div>
        </div>
      )}

      <div ref={mapContainerRef} className="h-[600px] w-full" />
    </div>
  )
}
