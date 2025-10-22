import {
  buildFacilityAddress,
  geocodeFacility,
  GeocodeFacilityError,
  FetchImplementation,
} from '@/lib/admin/geocoding'

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

describe('geocodeFacility', () => {
  let originalFetch: typeof global.fetch | undefined

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
    jest.restoreAllMocks()
  })

  it('uses the global fetch implementation to geocode a facility', async () => {
    const jsonMock = jest.fn().mockResolvedValue({
      features: [
        {
          center: [-71.0589, 42.3601],
          place_name: 'Boston, MA',
        },
      ],
    })

    const fetchResponse = {
      ok: true,
      status: 200,
      json: jsonMock,
    }

    const fetchMock = jest.fn().mockResolvedValue(fetchResponse)
    global.fetch = fetchMock as unknown as FetchImplementation

    const result = await geocodeFacility({ ...baseFacility })

    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [requestUrl] = fetchMock.mock.calls[0]
    expect(requestUrl).toContain('123%20Main%20St')
    expect(requestUrl).toContain('access_token=test-token')
    expect(result).toEqual({
      latitude: 42.3601,
      longitude: -71.0589,
      location: 'Boston, MA',
    })
    expect(jsonMock).toHaveBeenCalledTimes(1)
  })

  it('wraps fetch rejections in a GeocodeFacilityError', async () => {
    const fetchMock = jest.fn().mockRejectedValue(new Error('network down'))
    global.fetch = fetchMock as unknown as FetchImplementation

    await expect(geocodeFacility({ ...baseFacility })).rejects.toMatchObject({
      code: 'request-failed',
    })
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('throws a missing-token error when the Mapbox token is absent', async () => {
    delete process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    expect.assertions(2)

    try {
      await geocodeFacility({ ...baseFacility })
    } catch (error) {
      expect(error).toBeInstanceOf(GeocodeFacilityError)
      if (error instanceof GeocodeFacilityError) {
        expect(error.code).toBe('missing-token')
      }
    }
  })
})
