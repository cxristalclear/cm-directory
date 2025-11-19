import type { Point } from 'geojson'

import type { FacilityFormData } from '@/types/admin'
export type FetchImplementation = typeof fetch
import { getStateProvince, getPostalCode, hasMinimumAddressData } from './addressCompat'
import { formatCountryLabel, normalizeCountryCode } from '@/utils/locationFilters'

export type NullableString = string | null | undefined

export type FacilityAddressFields = Pick<
  FacilityFormData,
  'street_address' | 'city' | 'state' | 'state_province' | 'state_code' | 'zip_code' | 'postal_code' | 'country' | 'country_code'
>

export type FacilityAddressLike = {
  [K in keyof FacilityAddressFields]?: NullableString
}

export interface GeocodeFacilityOptions {
  mapboxToken?: string
  fetchImpl?: FetchImplementation
  addressOverride?: string
}

export type GeocodeFacilitySuccess = {
  latitude: number
  longitude: number
  location: string
}

export type GeocodeFacilityPoint = GeocodeFacilitySuccess & {
  point: Point
  pointWkt: string
}

export type GeocodeFacilityErrorCode =
  | 'missing-token'
  | 'invalid-address'
  | 'request-failed'
  | 'bad-response'
  | 'not-found'

export class GeocodeFacilityError extends Error {
  code: GeocodeFacilityErrorCode

  constructor(code: GeocodeFacilityErrorCode, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'GeocodeFacilityError'
    this.code = code
  }
}

interface MapboxGeocodingFeature {
  id: string
  place_name?: string
  center?: [number, number]
}

interface MapboxGeocodingResponse {
  features?: MapboxGeocodingFeature[]
}

export function buildFacilityAddress(facility: FacilityAddressLike): string {
  const parts: string[] = []

  const addPart = (value: NullableString) => {
    if (typeof value !== 'string') return
    const trimmed = value.trim()
    if (trimmed) {
      parts.push(trimmed)
    }
  }

  addPart(facility.street_address)
  addPart(facility.city)
  addPart(getStateProvince(facility))  // ✅ Uses compatibility layer
  addPart(getPostalCode(facility))     // ✅ Uses compatibility layer
  const normalizedCountry = facility.country_code
    ? normalizeCountryCode(facility.country_code)
    : facility.country
      ? normalizeCountryCode(facility.country)
      : null
  const isoCountry =
  normalizedCountry && /^[a-z]{2}$/.test(normalizedCountry) ? normalizedCountry : null
  const countryDisplay = isoCountry
    ? formatCountryLabel(isoCountry)
    : facility.country || undefined
  addPart(countryDisplay)

  return parts.join(', ')
}

export async function geocodeFacility(
  facility: FacilityAddressLike,
  options: GeocodeFacilityOptions = {}
): Promise<GeocodeFacilitySuccess> {
  const address = options.addressOverride ?? buildFacilityAddress(facility)

  if (!address) {
    throw new GeocodeFacilityError(
      'invalid-address',
      'Facility does not contain enough address information for geocoding.'
    )
  }

  const mapboxToken = (options.mapboxToken ?? process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? '').trim()

  if (!mapboxToken) {
    throw new GeocodeFacilityError('missing-token', 'Mapbox access token is not configured.')
  }

  const fetchImplementation: FetchImplementation | undefined =
    options.fetchImpl ??
    (typeof globalThis.fetch === 'function' ? globalThis.fetch.bind(globalThis) : undefined)

  if (!fetchImplementation) {
    throw new GeocodeFacilityError(
      'request-failed',
      'A fetch implementation is required to contact the Mapbox Geocoding API.'
    )
  }

  const encodedAddress = encodeURIComponent(address)
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${mapboxToken}&limit=1`

  let response: Awaited<ReturnType<FetchImplementation>>

  try {
    response = await fetchImplementation(url)
  } catch (error) {
    throw new GeocodeFacilityError(
      'request-failed',
      'Failed to reach the Mapbox Geocoding API.',
      { cause: error }
    )
  }

  if (!response.ok) {
    throw new GeocodeFacilityError(
      'request-failed',
      `Mapbox Geocoding API responded with status ${response.status}.`
    )
  }

  let data: MapboxGeocodingResponse

  try {
    data = (await response.json()) as MapboxGeocodingResponse
  } catch (error) {
    throw new GeocodeFacilityError(
      'bad-response',
      'Unable to parse response from the Mapbox Geocoding API.',
      { cause: error }
    )
  }

  const feature = data.features && data.features.length > 0 ? data.features[0] : undefined

  if (!feature || !feature.center || feature.center.length < 2) {
    throw new GeocodeFacilityError(
      'not-found',
      'Mapbox Geocoding API did not return a usable result for the provided address.'
    )
  }

  const [longitude, latitude] = feature.center

  return {
    latitude,
    longitude,
    location: feature.place_name ?? address,
  }
}

export function createGeoJSONPoint(latitude: number, longitude: number): Point {
  return {
    type: 'Point',
    coordinates: [longitude, latitude],
  }
}

export function formatPointAsWkt(latitude: number, longitude: number): string {
  return `POINT(${longitude} ${latitude})`
}

export async function geocodeFacilityToPoint(
  facility: FacilityAddressLike,
  options: GeocodeFacilityOptions = {},
): Promise<GeocodeFacilityPoint> {
  const result = await geocodeFacility(facility, options)

  return {
    ...result,
    point: createGeoJSONPoint(result.latitude, result.longitude),
    pointWkt: formatPointAsWkt(result.latitude, result.longitude),
  }
}

export async function geocodeFacilityFormData<T extends FacilityFormData>(
  facility: T,
  options: GeocodeFacilityOptions = {},
): Promise<T> {
  if (!hasMinimumAddressData(facility)) {
    return facility
  }

  const hasCoords =
    typeof facility.latitude === 'number' &&
    Number.isFinite(facility.latitude) &&
    typeof facility.longitude === 'number' &&
    Number.isFinite(facility.longitude)

  if (hasCoords) {
    return facility
  }

  try {
    const result = await geocodeFacility(facility, options)
    return {
      ...facility,
      latitude: result.latitude,
      longitude: result.longitude,
    } as T
  } catch (error) {
    console.warn('Geocoding failed for facility:', error)
    return facility
  }
}

/**
 * Geocode a facility and return it with updated latitude/longitude coordinates.
 * Returns the original facility unchanged if geocoding fails or coordinates already exist.
 */
