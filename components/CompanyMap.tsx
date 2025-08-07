'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { supabase } from '@/lib/supabase'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!

interface Facility {
  id: string
  company_id: string
  city: string
  state: string
  latitude: number
  longitude: number
  companies: {
    company_name: string
    website_url: string
    slug: string
  }
}

export default function CompanyMap() {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [facilities, setFacilities] = useState<Facility[]>([])

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    const { data, error } = await supabase
      .from('facilities')
      .select(`
        id,
        company_id,
        city,
        state,
        latitude,
        longitude,
        companies (
          company_name,
          website_url,
          slug
        )
      `)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)

    if (data) {
      setFacilities(data as any)
    }
  }

  useEffect(() => {
    if (!mapContainer.current || facilities.length === 0) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/light-v11',
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 4
    })

    // Add markers for each facility
    facilities.forEach((facility) => {
      if (facility.latitude && facility.longitude) {
        // Create marker element
        const el = document.createElement('div')
        el.className = 'w-8 h-8 bg-blue-600 rounded-full border-2 border-white shadow-lg cursor-pointer hover:bg-blue-700 transition-colors'
        
        // Create popup
        const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(`
          <div class="p-2">
            <h3 class="font-bold">${facility.companies?.company_name}</h3>
            <p class="text-sm">${facility.city}, ${facility.state}</p>
            <a href="/companies/${facility.companies?.slug}" class="text-blue-500 text-sm">View Details →</a>
          </div>
        `)

        // Add marker to map
        new mapboxgl.Marker(el)
          .setLngLat([facility.longitude, facility.latitude])
          .setPopup(popup)
          .addTo(map.current!)
      }
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    return () => {
      map.current?.remove()
    }
  }, [facilities])

  return (
    <div className="relative">
      <div ref={mapContainer} className="h-[600px] rounded-lg shadow-lg" />
      <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded shadow">
        <p className="font-semibold">{facilities.length} Locations</p>
      </div>
    </div>
  )
}