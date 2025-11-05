import { NextRequest } from 'next/server'
import { POST } from '@/app/api/ai/research/route'
import { researchCompany } from '@/lib/ai/researchCompany'
import type { CompanyFormData } from '@/types/admin'

jest.mock('@/lib/ai/researchCompany', () => ({
  researchCompany: jest.fn(),
}))

const mockedResearchCompany = researchCompany as jest.MockedFunction<typeof researchCompany>

function buildRequest(body: unknown) {
  return new NextRequest('http://localhost/api/ai/research', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

describe('POST /api/ai/research', () => {
  beforeEach(() => {
    jest.clearAllMocks()
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
    })
  })

  it('propagates failures from researchCompany with a 502 status', async () => {
    mockedResearchCompany.mockResolvedValue({
      success: false,
      error: 'ZoomInfo down',
    })

    const response = await POST(
      buildRequest({
        companyName: 'Unlucky Co.',
      })
    )

    expect(response.status).toBe(502)
    await expect(response.json()).resolves.toEqual({
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
