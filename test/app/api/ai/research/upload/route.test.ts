import type { CompanyFormData } from '@/types/admin'
import { POST } from '@/app/api/ai/research/upload/route'
import { researchCompanyFromDocument } from '@/lib/ai/researchCompany'
import { createClient } from '@/lib/supabase-server'
import type { NextRequest } from 'next/server'

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
  researchCompanyFromDocument: jest.fn(),
}))

jest.mock('@/lib/supabase-server', () => ({
  createClient: jest.fn(),
}))

const mockedResearchCompanyFromDocument = researchCompanyFromDocument as jest.MockedFunction<
  typeof researchCompanyFromDocument
>
const mockedCreateClient = createClient as jest.MockedFunction<typeof createClient>

class PolyfilledFile {
  private readonly data: Buffer
  readonly name: string
  readonly type: string
  readonly lastModified: number

  constructor(bits: BlobPart[], name: string, options?: FilePropertyBag) {
    this.name = name
    this.type = options?.type ?? ''
    this.lastModified = options?.lastModified ?? Date.now()
    this.data = Buffer.concat(
      bits.map((part) => {
        if (typeof part === 'string') {
          return Buffer.from(part)
        }
        if (part instanceof ArrayBuffer) {
          return Buffer.from(part)
        }
        if (ArrayBuffer.isView(part)) {
          return Buffer.from(part.buffer)
        }
        if (part instanceof Blob && typeof (part as Blob).arrayBuffer === 'function') {
          throw new Error('Blob parts are not supported in this test polyfill')
        }
        return Buffer.from(String(part))
      })
    )
  }

  get size(): number {
    return this.data.length
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    const arrayBuffer = this.data.buffer.slice(
      this.data.byteOffset,
      this.data.byteOffset + this.data.byteLength
    )
    return arrayBuffer
  }
}

if (typeof global.File === 'undefined' || typeof File.prototype.arrayBuffer !== 'function') {
  ;(global as typeof globalThis & { File: typeof PolyfilledFile }).File = PolyfilledFile
}

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

const createFile = (content: string, name: string, type = 'text/markdown') =>
  new File([content], name, { type })

type FormEntries = Record<string, FormDataEntryValue | undefined>

const buildRequest = (entries: FormEntries): NextRequest =>
  ({
    formData: async () =>
      ({
        get: (key: string) => entries[key] ?? null,
      } as unknown as FormData),
  } as unknown as NextRequest)

describe('POST /api/ai/research/upload', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockedCreateClient.mockResolvedValue(buildSupabaseClient() as any)
  })

  it('returns 401 when the user is not authenticated', async () => {
    const supabase = buildSupabaseClient()
    supabase.auth.getUser.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('Missing session'),
    })
    mockedCreateClient.mockResolvedValueOnce(supabase as any)

    const response = await POST(buildRequest({}))
    expect(response.status).toBe(401)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'Unauthorized - Please log in to use AI research',
    })
  })

  it('rejects when no file is provided', async () => {
    const response = await POST(buildRequest(new FormData()))

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: expect.stringContaining('file is required'),
    })
    expect(mockedResearchCompanyFromDocument).not.toHaveBeenCalled()
  })

  it('rejects unsupported file extensions', async () => {
    const response = await POST(
      buildRequest({
        file: createFile('test', 'invalid.pdf', 'application/pdf'),
        companyName: 'DocCo',
      })
    )
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: expect.stringContaining('Unsupported file type'),
    })
  })

  it('rejects when companyName is missing', async () => {
    const response = await POST(
      buildRequest({
        file: createFile('content', 'info.md'),
      })
    )
    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      error: 'companyName is required for document uploads',
    })
    expect(mockedResearchCompanyFromDocument).not.toHaveBeenCalled()
  })

  it('returns the AI result when document processing succeeds', async () => {
    const companyData = { company_name: 'Doc Upload Inc.' } as CompanyFormData
    mockedResearchCompanyFromDocument.mockResolvedValue({
      success: true,
      data: companyData,
      enrichmentData: 'source',
      enrichmentRaw: { source: 'document_upload' },
    })

    const response = await POST(
      buildRequest({
        file: createFile('# Title', 'info.md'),
        fileName: 'info.md',
        companyName: 'Doc Upload Inc.',
        createNew: 'true',
      })
    )
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      data: companyData,
      enrichmentData: 'source',
      enrichmentRaw: { source: 'document_upload' },
    })
    expect(mockedResearchCompanyFromDocument).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: 'info.md',
        companyNameHint: 'Doc Upload Inc.',
      })
    )
  })
})
