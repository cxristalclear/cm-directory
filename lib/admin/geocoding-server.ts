import { createClient } from '@/lib/supabase-server'
import {
  geocodeFacility,
  type FacilityAddressLike,
  type GeocodeFacilityOptions,
  type GeocodeFacilitySuccess,
} from './geocoding'

/**
 * Geocodes a facility using the Mapbox API and persists the latitude/longitude
 * back to the `facilities` table in Supabase.
 */
export async function geocodeAndUpdateFacility(
  facilityId: string,
  options: GeocodeFacilityOptions = {}
): Promise<GeocodeFacilitySuccess> {
  const supabase = await createClient()

  const { data: facility, error: fetchError } = await supabase
    .from('facilities')
    .select(
      'id, street_address, city, state, state_province, state_code, zip_code, postal_code, country, country_code'
    )
    .eq('id', facilityId)
    .single()

  if (fetchError || !facility) {
    throw new Error('Facility not found')
  }

  const geocodeResult = await geocodeFacility(facility as FacilityAddressLike, options)

  const { error: updateError } = await supabase
    .from('facilities')
    .update({
      latitude: geocodeResult.latitude,
      longitude: geocodeResult.longitude,
    })
    .eq('id', facilityId)

  if (updateError) {
    throw new Error(`Failed to update facility: ${updateError.message}`)
  }

  return geocodeResult
}
