'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { useFilters } from '../contexts/FilterContext'
import type { Company, FacilityWithCompany } from '../types/company'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface CompanyMapProps {
  allCompanies: Company[]
}

export default function CompanyMap({ allCompanies }: CompanyMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const markers = useRef<mapboxgl.Marker[]>([])
  const { filters, setFilteredCount } = useFilters()
  const [filteredFacilities, setFilteredFacilities] = useState<FacilityWithCompany[]>([])

  // Filter companies based on current filters - memoized with useCallback
  const filterCompanies = useCallback(() => {
    let filtered = [...allCompanies]

    // Search term filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower) ||
        company.key_differentiators?.toLowerCase().includes(searchLower)
      )
    }

    // State filter
    if (filters.states.length > 0) {
      filtered = filtered.filter(company =>
        company.facilities?.some((f) => filters.states.includes(f.state))
      )
    }

    // Capabilities filter
    if (filters.capabilities.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.capabilities.some(filter => {
          switch(filter) {
            case 'smt': return cap.pcb_assembly_smt
            case 'through_hole': return cap.pcb_assembly_through_hole
            case 'cable_harness': return cap.cable_harness_assembly
            case 'box_build': return cap.box_build_assembly
            case 'prototyping': return cap.prototyping
            default: return false
          }
        })
      })
    }

    // Volume capability filter
    if (filters.volumeCapability.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.volumeCapability.some(vol => {
          switch(vol) {
            case 'low': return cap.low_volume_production
            case 'medium': return cap.medium_volume_production
            case 'high': return cap.high_volume_production
            default: return false
          }
        })
      })
    }

    // Certifications filter
    if (filters.certifications.length > 0) {
      filtered = filtered.filter(company =>
        company.certifications?.some((cert) =>
          filters.certifications.includes(
            cert.certification_type.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }

    // Industries filter
    if (filters.industries.length > 0) {
      filtered = filtered.filter(company =>
        company.industries?.some((ind) =>
          filters.industries.includes(
            ind.industry_name.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }

    // Employee range filter
    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter(company =>
        filters.employeeRange.includes(company.employee_count_range)
      )
    }

    // Extract facilities from filtered companies
    const facilities = filtered.flatMap(company =>
      company.facilities?.map((facility) => ({
        ...facility,
        company: company
      })) || []
    ).filter((f): f is FacilityWithCompany => f.latitude !== null && f.longitude !== null)

    setFilteredFacilities(facilities)
    setFilteredCount(filtered.length)
    return facilities
  }, [filters, allCompanies, setFilteredCount])

  // Initial map setup
  useEffect(() => {
    if (!mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283],
      zoom: 4
    })

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
    }
  }, [])

  // Update markers when filters change
  useEffect(() => {
    if (!map.current) return

    // Clear existing markers
    markers.current.forEach(marker => marker.remove())
    markers.current = []

    // Filter and add new markers
    const facilities = filterCompanies()

    facilities.forEach((facility) => {
      const el = document.createElement('div')
      el.className = 'w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors'
      
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
        <div class="p-2">
          <h3 class="font-bold">${facility.company.company_name}</h3>
          <p class="text-sm">${facility.city}, ${facility.state}</p>
          <a href="/companies/${facility.company.slug}" class="text-blue-500 text-sm">View Details →</a>
        </div>
      `)

      const marker = new mapboxgl.Marker(el)
        .setLngLat([facility.longitude, facility.latitude])
        .setPopup(popup)
        .addTo(map.current!)

      markers.current.push(marker)
    })

    // Auto-adjust map bounds if we have filtered results
    if (facilities.length > 0 && facilities.length < allCompanies.length * 0.5) {
      const bounds = new mapboxgl.LngLatBounds()
      facilities.forEach((f) => {
        bounds.extend([f.longitude, f.latitude])
      })
      map.current.fitBounds(bounds, { padding: 50, maxZoom: 10 })
    }
  }, [filterCompanies, allCompanies])

  return (
    <div className="relative h-full">
      <div ref={mapContainer} className="h-[600px] rounded-lg shadow-lg" />
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded shadow">
        <p className="font-semibold">{filteredFacilities.length} Locations</p>
      </div>
    </div>
  )
}