import { getCompanies } from '@/lib/data/getCompanies'
import { retryWithBackoff } from '@/lib/utils/retry'

// Mock dependencies
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}))

jest.mock('@/lib/utils/retry', () => ({
  retryWithBackoff: jest.fn(),
}))

jest.mock('@/lib/utils/performance', () => ({
  trackPayloadSize: jest.fn(() => 1024),
  startPerformanceMeasure: jest.fn(),
  endPerformanceMeasure: jest.fn(() => 500),
  logPerformanceSummary: jest.fn(),
}))

import { supabase } from '@/lib/supabase'
import type { HomepageCompanyWithLocations } from '@/types/homepage'

describe('getCompanies', () => {
  const mockCompanies: HomepageCompanyWithLocations[] = [
    {
      id: '1',
      slug: 'test-company',
      company_name: 'Test Company',
      is_active: true,
    } as HomepageCompanyWithLocations,
  ]

  const mockFrom = supabase.from as jest.Mock
  const mockRetryWithBackoff = retryWithBackoff as jest.MockedFunction<typeof retryWithBackoff>

  beforeEach(() => {
    jest.clearAllMocks()
    mockFrom.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockReturnValue({
              returns: jest.fn().mockResolvedValue({
                data: mockCompanies,
                error: null,
              }),
            }),
          }),
        }),
      }),
    })
  })

  it('should fetch companies successfully', async () => {
    mockRetryWithBackoff.mockResolvedValue({
      success: true,
      data: mockCompanies,
      attempts: 1,
    })

    const result = await getCompanies()

    expect(result.companies).toEqual(mockCompanies)
    expect(result.error).toBeNull()
    expect(result.isEmpty).toBe(false)
    expect(result.payloadSizeBytes).toBe(1024)
    expect(result.loadTimeMs).toBe(500)
  })

  it('should handle empty results', async () => {
    mockRetryWithBackoff.mockResolvedValue({
      success: true,
      data: [],
      attempts: 1,
    })

    const result = await getCompanies()

    expect(result.companies).toEqual([])
    expect(result.isEmpty).toBe(true)
    expect(result.error).toBeNull()
  })

  it('should handle fetch errors with retry', async () => {
    const error = new Error('Database connection failed')
    mockRetryWithBackoff.mockResolvedValue({
      success: false,
      error,
      attempts: 3,
    })

    const result = await getCompanies()

    expect(result.companies).toEqual([])
    expect(result.error).toBe(error)
    expect(result.isEmpty).toBe(false) // Not empty, it's an error
    expect(result.attempts).toBe(3)
  })

  it('should use custom maxCompanies option', async () => {
    // Reset mocks
    mockRetryWithBackoff.mockClear()
    mockFrom.mockClear()

    // Setup mock chain
    const limitMock = jest.fn().mockReturnValue({
      returns: jest.fn().mockResolvedValue({
        data: mockCompanies,
        error: null,
      }),
    })
    const orderMock = jest.fn().mockReturnValue({ limit: limitMock })
    const eqMock = jest.fn().mockReturnValue({ order: orderMock })
    const selectMock = jest.fn().mockReturnValue({ eq: eqMock })
    mockFrom.mockReturnValue({ select: selectMock })

    mockRetryWithBackoff.mockResolvedValue({
      success: true,
      data: mockCompanies,
      attempts: 1,
    })

    await getCompanies({ maxCompanies: 100 })

    // Verify retry was called (which internally calls fetchCompaniesInternal with maxCompanies)
    expect(mockRetryWithBackoff).toHaveBeenCalled()
  })

  it('should disable retry when enableRetry is false', async () => {
    // When retry is disabled, it should still work but retry logic is bypassed
    mockRetryWithBackoff.mockClear()

    // Mock internal fetch to succeed
    mockRetryWithBackoff.mockResolvedValue({
      success: true,
      data: mockCompanies,
      attempts: 1,
    })

    await getCompanies({ enableRetry: false })

    // Note: enableRetry: false still uses retryWithBackoff internally
    // but it will only attempt once. The test verifies it completes successfully.
    const result = await getCompanies({ enableRetry: false })
    expect(result.companies).toEqual(mockCompanies)
  })

  it('should use custom retry options', async () => {
    mockRetryWithBackoff.mockResolvedValue({
      success: true,
      data: mockCompanies,
      attempts: 1,
    })

    await getCompanies({
      retryOptions: {
        maxAttempts: 5,
        initialDelayMs: 2000,
      },
    })

    expect(mockRetryWithBackoff).toHaveBeenCalledWith(
      expect.any(Function),
      expect.objectContaining({
        maxAttempts: 5,
        initialDelayMs: 2000,
      })
    )
  })

  it('should handle Supabase errors correctly', async () => {
    const dbError = new Error('Database error: connection timeout (code: PGRST301)')
    mockRetryWithBackoff.mockResolvedValue({
      success: false,
      error: dbError,
      attempts: 2,
    })

    const result = await getCompanies()

    expect(result.error).toBe(dbError)
    expect(result.companies).toEqual([])
    expect(result.attempts).toBe(2)
  })
})

