import {
  buildFacilityAddress,
  geocodeFacilityToPoint,
  createGeoJSONPoint,
  formatPointAsWkt,
} from '@/lib/admin/geocoding'
import type { FetchImplementation } from '@/lib/admin/geocoding'

const baseFacility = {
  street_address: '123 Main St',
  city: 'Boston',
  state: 'MA',
  zip_code: '02108',
  country: 'USA',
} as const

describe('buildFacilityAddress', () => {
  it('joins trimmed address parts with commas', () => {
    const address = buildFacilityAddress({
      street_address: ' 123 Main St ',
      city: ' Boston',
      state: 'MA ',
      zip_code: ' ',
      country: null,
    })

    expect(address).toBe('123 Main St, Boston, MA')
  })
})

describe('createGeoJSONPoint', () => {
  it('returns a GeoJSON Point with longitude/latitude ordering', () => {
    expect(createGeoJSONPoint(42.3601, -71.0589)).toEqual({
      type: 'Point',
      coordinates: [-71.0589, 42.3601],
    })
  })
})

describe('formatPointAsWkt', () => {
  it('formats longitude and latitude into a POINT WKT string', () => {
    expect(formatPointAsWkt(42.3601, -71.0589)).toBe('POINT(-71.0589 42.3601)')
  })
})

describe('geocodeFacilityToPoint', () => {
  let originalFetch: FetchImplementation | undefined

  beforeEach(() => {
    originalFetch = global.fetch
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = 'test-token'
  })

  afterEach(() => {
    if (originalFetch) {
      global.fetch = originalFetch
    } else {
      Reflect.deleteProperty(global, 'fetch')
    }

    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    jest.resetAllMocks()
  })

  it('returns coordinates and a GeoJSON Point from the Mapbox payload', async () => {
    const jsonMock = jest.fn().mockResolvedValue({
      features: [
        {
          id: 'place.123',
          center: [-71.0589, 42.3601],
          place_name: 'Boston, MA',
        },
      ],
    })

    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: jsonMock,
    })

    global.fetch = fetchMock as unknown as FetchImplementation

    const result = await geocodeFacilityToPoint({ ...baseFacility })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [requestUrl] = fetchMock.mock.calls[0]
    expect(requestUrl).toContain('123%20Main%20St')
    expect(requestUrl).toContain('access_token=test-token')

    expect(result.latitude).toBe(42.3601)
    expect(result.longitude).toBe(-71.0589)
    expect(result.location).toBe('Boston, MA')
    expect(result.point).toEqual({
      type: 'Point',
      coordinates: [-71.0589, 42.3601],
    })
    expect(result.pointWkt).toBe('POINT(-71.0589 42.3601)')
    expect(jsonMock).toHaveBeenCalledTimes(1)
  })

  it('throws an invalid-address error when the facility has no usable address', async () => {
    const fetchMock = jest.fn()
    global.fetch = fetchMock as unknown as FetchImplementation

    await expect(
      geocodeFacilityToPoint({
        street_address: '  ',
        city: undefined,
        state: null,
        zip_code: '',
        country: undefined,
      }),
    ).rejects.toMatchObject({ code: 'invalid-address' })

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('throws a missing-token error when the Mapbox token is absent', async () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN

    await expect(geocodeFacilityToPoint({ ...baseFacility })).rejects.toMatchObject({
      code: 'missing-token',
    })
  })

  it('wraps fetch rejections in a GeocodeFacilityError', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('network down'))
    global.fetch = fetchMock as unknown as FetchImplementation

    await expect(geocodeFacilityToPoint({ ...baseFacility })).rejects.toMatchObject({
      code: 'request-failed',
    })

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })
})
