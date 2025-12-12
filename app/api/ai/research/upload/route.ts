import { NextRequest, NextResponse } from 'next/server'
import { researchCompanyFromDocument } from '@/lib/ai/researchCompany'
import { createClient } from '@/lib/supabase-server'
import {
  SUPPORTED_DOCUMENT_HINT,
  extractTextFromDocument,
  isSupportedDocument,
} from '@/lib/documents/extractText'
import { parseFormDataWithSizeLimit, REQUEST_SIZE_LIMITS } from '@/lib/utils/request-limits'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in to use AI research' },
        { status: 401 }
      )
    }

    // User authentication verified above

    // Parse form data with size limit (10MB for file uploads)
    const parseResult = await parseFormDataWithSizeLimit(request, REQUEST_SIZE_LIMITS.FILE_UPLOAD)
    
    if (parseResult.error) {
      return NextResponse.json(
        { success: false, error: parseResult.error },
        { status: 413 } // 413 Payload Too Large
      )
    }

    const formData = parseResult.data
    if (!formData) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data payload' },
        { status: 400 }
      )
    }

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: `A file is required. Supported types: ${SUPPORTED_DOCUMENT_HINT}` },
        { status: 400 }
      )
    }

    const providedFileName = formData.get('fileName')?.toString().trim()
    const fileName = providedFileName || file.name || 'uploaded-document'

    if (!isSupportedDocument(fileName)) {
      return NextResponse.json(
        { success: false, error: `Unsupported file type. Upload ${SUPPORTED_DOCUMENT_HINT}.` },
        { status: 400 }
      )
    }

    const companyName = formData.get('companyName')?.toString().trim()
    if (!companyName) {
      return NextResponse.json(
        { success: false, error: 'companyName is required for document uploads' },
        { status: 400 }
      )
    }

    const companySlug = formData.get('companySlug')?.toString().trim()
    const createNew = formData.get('createNew')?.toString() === 'true'

    const arrayBuffer = await file.arrayBuffer()
    let documentText: string
    try {
      documentText = await extractTextFromDocument(Buffer.from(arrayBuffer), fileName)
    } catch (error) {
      console.error('Failed to extract document text:', error)
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unable to extract text from document',
        },
        { status: 400 }
      )
    }

    const result = await researchCompanyFromDocument({
      documentText,
      fileName,
      companyNameHint: companyName,
      companySlugHint: companySlug || undefined,
      createNew,
    })

    return NextResponse.json(result, {
      status: result.success ? 200 : 422,
    })
  } catch (error) {
    console.error('AI document upload API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
