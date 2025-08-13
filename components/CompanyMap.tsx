'use client'

import { useEffect, useMemo, useRef } from 'react'
import mapboxgl, { GeoJSONSource, Map as MapboxMap, MapboxGeoJSONFeature } from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

import { useFilters } from '../contexts/FilterContext'
import type { Company, FacilityWithCompany } from '../types/company'
import { createPopupFromFacility } from '../lib/mapbox-utils'

// NOTE: Token handling is out of scope for this refactor per the spec.
// Ensure NEXT_PUBLIC_MAPBOX_TOKEN is configured at the app level.
mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface CompanyMapProps {
  allCompanies: Company[]
}

// ---- Source & Layer IDs -----------------------------------------------------------------------
const SRC_ID = 'companies-src'
const LAYER_CLUSTER_CIRCLES = 'companies-cluster-circles'
const LAYER_CLUSTER_COUNT = 'companies-cluster-count'
const LAYER_UNCLUSTERED = 'companies-unclustered-points'

// ---- Clustering defaults ----------------------------------------------------------------------
const CLUSTER_MAX_ZOOM = 14 // stop clustering beyond this zoom (decluster sooner)
const clusterRadiusPx = () =>
  typeof window !== 'undefined' && window.innerWidth <= 768 ? 35 : 50

// GeoJSON types used in this component
export type PropertiesWithFacility = { facility: FacilityWithCompany }
export type FeatureCollectionWithFacilities = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  PropertiesWithFacility
>

export default function CompanyMap({ allCompanies }: CompanyMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null)
  const mapRef = useRef<MapboxMap | null>(null)
  const popupRef = useRef<mapboxgl.Popup | null>(null)

  const { filters, setFilteredCount } = useFilters()

  // ----------------------------
  // Pure filtering (NO setState)
  // ----------------------------
  const { filteredCompanies, fc } = useMemo(() => {
    let filtered = [...allCompanies]

    if (filters.searchTerm) {
      const s = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(
        (company) =>
          company.company_name?.toLowerCase().includes(s) ||
          company.description?.toLowerCase().includes(s) ||
          company.key_differentiators?.toLowerCase().includes(s)
      )
    }

    if (filters.states.length > 0) {
      filtered = filtered.filter((company) =>
        company.facilities?.some((f) => filters.states.includes(f.state))
      )
    }

    if (filters.capabilities.length > 0) {
      filtered = filtered.filter((company) => {
        const cap = company.capabilities?.[0]
        if (!cap) return false
        return filters.capabilities.some((filter) => {
          switch (filter) {
            case 'smt':
              return cap.pcb_assembly_smt
            case 'through_hole':
              return cap.pcb_assembly_through_hole
            case 'cable_harness':
              return cap.cable_harness_assembly
            case 'box_build':
              return cap.box_build_assembly
            case 'prototyping':
              return cap.prototyping
            default:
              return false
          }
        })
      })
    }

    if (filters.volumeCapability.length > 0) {
      filtered = filtered.filter((company) => {
        const cap = company.capabilities?.[0]
        if (!cap) return false
        return filters.volumeCapability.some((v) => {
          switch (v) {
            case 'low':
              return cap.low_volume_production
            case 'medium':
              return cap.medium_volume_production
            case 'high':
              return cap.high_volume_production
            default:
              return false
          }
        })
      })
    }

    if (filters.certifications.length > 0) {
      filtered = filtered.filter((company) =>
        company.certifications?.some((cert) =>
          filters.certifications.includes(
            cert.certification_type.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }

    if (filters.industries.length > 0) {
      filtered = filtered.filter((company) =>
        company.industries?.some((ind) =>
          filters.industries.includes(ind.industry_name.toLowerCase().replace(/\s+/g, '_'))
        )
      )
    }

    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter((company) =>
        filters.employeeRange.includes(company.employee_count_range)
      )
    }

    // derive facilities with lat/lng
    const facilities: FacilityWithCompany[] = (
      filtered.flatMap((company) =>
        company.facilities?.map((f) => ({ ...f, company })) ?? []
      ) as FacilityWithCompany[]
    ).filter((f) => f.latitude != null && f.longitude != null)

    // build a FeatureCollection for Mapbox GL JS
    const featureCollection: FeatureCollectionWithFacilities = {
      type: 'FeatureCollection',
      features: facilities.map((f) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [f.longitude as number, f.latitude as number],
        },
        properties: { facility: f },
      })),
    }

    return { filteredCompanies: filtered, fc: featureCollection }
  }, [allCompanies, filters])

  // Post-render: let the FilterProvider know how many COMPANIES matched
  useEffect(() => {
    setFilteredCount(filteredCompanies.length)
  }, [filteredCompanies.length, setFilteredCount])

  // ----------------------------
  // Map initialization (once)
  // ----------------------------
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // USA centroid-ish
      zoom: 3,
    })

    map.addControl(new mapboxgl.NavigationControl(), 'top-right')
    mapRef.current = map

    map.on('load', () => {
      // 1) single clustered GeoJSON source
      map.addSource(SRC_ID, {
        type: 'geojson',
        data: fc, // seed with current filtered FeatureCollection
        cluster: true,
        clusterRadius: clusterRadiusPx(),
        clusterMaxZoom: CLUSTER_MAX_ZOOM,
      })

      // 2) cluster circles
      map.addLayer({
        id: LAYER_CLUSTER_CIRCLES,
        type: 'circle',
        source: SRC_ID,
        filter: ['has', 'point_count'],
        paint: {
          'circle-radius': ['step', ['get', 'point_count'], 16, 10, 20, 25, 26, 50, 32],
          'circle-color': [
            'step',
            ['get', 'point_count'],
            '#90CAF9',
            10,
            '#64B5F6',
            25,
            '#42A5F5',
            50,
            '#1E88E5',
          ],
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.5,
        },
      })

      // 3) cluster count labels
      map.addLayer({
        id: LAYER_CLUSTER_COUNT,
        type: 'symbol',
        source: SRC_ID,
        filter: ['has', 'point_count'],
        layout: {
          'text-field': ['get', 'point_count_abbreviated'],
          'text-size': 12,
        },
        paint: { 'text-color': '#17324D' },
      })

      // 4) unclustered points
      map.addLayer({
        id: LAYER_UNCLUSTERED,
        type: 'circle',
        source: SRC_ID,
        filter: ['!', ['has', 'point_count']],
        paint: {
          'circle-radius': 6,
          'circle-color': '#0D47A1',
          'circle-stroke-color': '#ffffff',
          'circle-stroke-width': 1.25,
        },
      })

      // Cursor feedback
      map.on('mouseenter', LAYER_CLUSTER_CIRCLES, () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', LAYER_CLUSTER_CIRCLES, () => (map.getCanvas().style.cursor = ''))
      map.on('mouseenter', LAYER_UNCLUSTERED, () => (map.getCanvas().style.cursor = 'pointer'))
      map.on('mouseleave', LAYER_UNCLUSTERED, () => (map.getCanvas().style.cursor = ''))

      // Click cluster -> expand/zoom
      map.on('click', LAYER_CLUSTER_CIRCLES, (e) => {
        const features = map.queryRenderedFeatures(e.point, { layers: [LAYER_CLUSTER_CIRCLES] })
        const clusterFeature = features[0] as MapboxGeoJSONFeature | undefined
        const src = map.getSource(SRC_ID) as GeoJSONSource | undefined
        if (!clusterFeature || !src) return

        const point = clusterFeature.geometry as GeoJSON.Point
        const center = point.coordinates as [number, number]
        const clusterId = (clusterFeature.properties as { cluster_id?: number } | null)?.cluster_id
        if (typeof clusterId !== 'number') return

        src.getClusterExpansionZoom(clusterId, (err, expansionZoom) => {
          const targetZoom =
            typeof expansionZoom === 'number' && !err
              ? expansionZoom
              : Math.min(CLUSTER_MAX_ZOOM + 2, 16)
          map.easeTo({ center, zoom: targetZoom })
        })
      })

      // Click single point -> safe popup
      map.on('click', LAYER_UNCLUSTERED, (e) => {
        const feature = e.features?.[0] as MapboxGeoJSONFeature | undefined
        if (!feature) return

        const coords = (feature.geometry as GeoJSON.Point).coordinates as [number, number]
        const props = feature.properties as unknown as PropertiesWithFacility
        const facility = props.facility

        // Close previous popup if open
        if (popupRef.current) {
          popupRef.current.remove()
          popupRef.current = null
        }

        // Build popup using SAFE builder from PR A (setDOMContent under the hood)
        const popup = createPopupFromFacility(facility)
        popup.setLngLat(coords).addTo(map)
        popupRef.current = popup
      })
    })

    return () => {
      if (popupRef.current) {
        popupRef.current.remove()
        popupRef.current = null
      }
      map.remove()
      mapRef.current = null
    }
    // We intentionally run this effect only once to initialize/teardown the Mapbox instance.
    // Re-creating the map on prop changes would cause leaks & double-registrations.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ----------------------------
  // Update data via setData (no teardown)
  // ----------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const src = map.getSource(SRC_ID) as GeoJSONSource | undefined
    if (!src) return
    // Update source when filtered FeatureCollection changes
    src.setData(fc)
  }, [fc])

  return (
    <div className="relative h-full space-y-6">
      <div ref={mapContainerRef} className="h-[600px] rounded-lg shadow-lg" />

      {/* simple count pill */}
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded shadow">
        <p className="font-semibold">{fc.features.length} Locations</p>
      </div>

      {/* Ad block (unchanged styling placeholder) */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="text-xs text-gray-400 mb-3 uppercase tracking-wide text-center">
          Sponsored
        </div>
        <div
          className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center w-full"
          style={{ height: '100px' }}
        >
          <div className="text-center text-gray-500">
            <div className="text-sm font-medium">Map Footer Banner</div>
            <div className="text-xs mt-1">100% × 100px</div>
            <div className="text-xs text-gray-400 mt-1">Advertisement</div>
          </div>
        </div>
      </div>
    </div>
  )
}
