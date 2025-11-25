import type { NextRequest } from 'next/server'
import { POST } from '@/app/api/ai/research/route'
import { researchCompany } from '@/lib/ai/researchCompany'
import { createClient } from '@/lib/supabase-server'
import type { CompanyFormData } from '@/types/admin'

jest.mock('next/server', () => {
  class MockNextRequest {}
  const NextResponse = {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  }
  return { NextRequest: MockNextRequest, NextResponse }
})

jest.mock('@/lib/ai/researchCompany', () => ({
  researchCompany: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}))

const mockedResearchCompany = researchCompany as jest.MockedFunction<typeof researchCompany>
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>

const buildSupabaseClient = () => {
  const getUser = jest.fn().mockResolvedValue({
    data: { user: { email: 'tester@example.com' } },
    error: null,
  })
  return {
    auth: {
      getUser,
    },
  }
}

const buildRequest = (body: unknown): NextRequest =>
  ({
    json: async () => body,
  } as unknown as NextRequest)

describe('POST /api/ai/research', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedCreateClient.mockResolvedValue(buildSupabaseClient() as any)
  })

  it('returns 401 when the user is not authenticated', async () => {
    const supabase = buildSupabaseClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Auth error'),
    })
    mockedCreateClient.mockResolvedValueOnce(supabase as any)

    const response = await POST(buildRequest({ companyName: 'Nope' }))
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Unauthorized - Please log in to use AI research',
    })
    expect(mockedResearchCompany).not.toHaveBeenCalled()
  })

  it('rejects requests without a companyName', async () => {
    const response = await POST(buildRequest({}))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'companyName is required',
    })
    expect(mockedResearchCompany).not.toHaveBeenCalled()
  })

  it('rejects requests with an empty companyName after trimming', async () => {
    const response = await POST(buildRequest({ companyName: '   ' }))
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'companyName is required',
    })
    expect(mockedResearchCompany).not.toHaveBeenCalled()
  })

  it('calls researchCompany with trimmed values and forwards successful responses', async () => {
    const companyData = { company_name: 'Trimmed Co.' } as CompanyFormData

    mockedResearchCompany.mockResolvedValue({
      success: true,
      data: companyData,
      enrichmentData: 'enrichment',
      enrichmentRaw: { raw: 'data' },
    })

    const response = await POST(
      buildRequest({
        companyName: '  Trimmed Co.  ',
        website: '  https://trimmed.example.com  ',
      })
    )

    expect(mockedResearchCompany).toHaveBeenCalledWith(
      'Trimmed Co.',
      'https://trimmed.example.com'
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: companyData,
      enrichmentData: 'enrichment',
      enrichmentRaw: { raw: 'data' },
    })
  })

  it('propagates failures from researchCompany with a 502 status', async () => {
    mockedResearchCompany.mockResolvedValue({
      success: false,
      error: 'ZoomInfo down',
      enrichmentRaw: null,
    })

    const response = await POST(
      buildRequest({
        companyName: 'Unlucky Co.',
      })
    )

    expect(response.status).toBe(422)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      error: 'ZoomInfo down',
    })
  })

  it('returns 500 when researchCompany throws', async () => {
    mockedResearchCompany.mockRejectedValue(new Error('Unexpected network failure'))

    const response = await POST(
      buildRequest({
        companyName: 'Cursed Co.',
      })
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Internal server error',
    })
  })
})
