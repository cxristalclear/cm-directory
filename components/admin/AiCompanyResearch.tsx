'use client'

import { useCallback, useEffect, useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import type { CompanyFormData } from '@/types/admin'
import CompanyPreview from './CompanyPreview'
import { normalizeWebsiteUrl } from '@/lib/admin/utils'
import { DOCUMENT_ACCEPT_ATTRIBUTE, DOCUMENT_TYPE_HINT } from '@/lib/documents/constants'

type Mode = 'single' | 'batch' | 'upload'

interface ResearchedCompany {
  id: string
  data: CompanyFormData
  enrichmentInfo: string
  enrichmentPayload?: unknown
}

interface BatchSaveProgress {
  current: number
  total: number
  failed: number
  currentCompanyName: string
  errors: Array<{ companyId: string; company: string; reason: string }>
}

interface AiCompanyResearchProps {
  onSaveCompany: (data: CompanyFormData, isDraft: boolean, enrichmentPayload?: unknown) => Promise<void>
  onAllCompaniesSaved?: () => void
}

interface ResearchResultResponse {
  success: boolean
  data?: CompanyFormData
  error?: string
  enrichmentData?: string
  enrichmentRaw?: unknown
}

interface CompanySearchResult {
  id: string
  company_name: string | null
  slug: string | null
  website_url: string | null
}

const WEBSITE_PATTERN = /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/i

function looksLikeWebsite(value?: string): boolean {
  if (!value) return false
  const trimmed = value.trim().toLowerCase()
  return trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('www.') ||
    WEBSITE_PATTERN.test(trimmed)
}

function splitNameAndWebsite(input: string): { name: string; website?: string } {
  const trimmed = input.trim()
  let name = trimmed
  let websiteCandidate: string | undefined

  const pipeIndex = trimmed.indexOf('|')
  if (pipeIndex !== -1) {
    const candidate = trimmed.slice(pipeIndex + 1).trim()
    if (looksLikeWebsite(candidate)) {
      websiteCandidate = candidate
      name = trimmed.slice(0, pipeIndex).trim()
    }
  } else {
    const commaIndex = trimmed.indexOf(',')
    if (commaIndex !== -1) {
      const candidate = trimmed.slice(commaIndex + 1).trim()
      if (looksLikeWebsite(candidate)) {
        websiteCandidate = candidate
        name = trimmed.slice(0, commaIndex).trim()
      }
    }
  }

  if (!websiteCandidate) {
    const websiteRegex = /((?:https?:\/\/)?(?:www\.)?[a-z0-9][a-z0-9.-]+\.[a-z]{2,}(?:\/\S*)?)/i
    const match = trimmed.match(websiteRegex)
    if (match) {
      const candidate = match[0]
      if (looksLikeWebsite(candidate)) {
        websiteCandidate = candidate
        if (typeof match.index === 'number') {
          const before = trimmed.slice(0, match.index).trim()
          const after = trimmed.slice(match.index + candidate.length).trim()
          name = before || after || trimmed.replace(candidate, '').trim()
        }
      }
    }
  }

  const normalizedWebsite = websiteCandidate
    ? normalizeWebsiteUrl(websiteCandidate) || undefined
    : undefined

  return {
    name,
    website: normalizedWebsite,
  }
}

function parseBatchEntries(input: string): Array<{ name: string; website?: string }> {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)
    .map(line => {
      const { name: parsedName, website: inlineWebsite } = splitNameAndWebsite(line)
      return {
        name: parsedName,
        website: inlineWebsite,
      }
    })
}

function countUniqueBatchEntries(input: string): number {
  const seen = new Set<string>()
  for (const entry of parseBatchEntries(input)) {
    const normalizedName = entry.name.trim()
    if (!normalizedName) continue
    const key = `${normalizedName.toLowerCase()}|${entry.website || ''}`
    seen.add(key)
  }
  return seen.size
}
function createTempCompanyId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

const SUPPORTED_UPLOAD_EXTENSIONS = ['md', 'markdown', 'txt', 'doc', 'docx']

function getFileExtension(fileName: string | undefined | null): string | null {
  if (!fileName) return null
  const parts = fileName.split('.')
  if (parts.length < 2) return null
  return parts.pop()?.toLowerCase() ?? null
}

function isSupportedUploadFile(file: File | null): boolean {
  if (!file) return false
  const extension = getFileExtension(file.name)
  if (!extension) return false
  return SUPPORTED_UPLOAD_EXTENSIONS.includes(extension)
}

function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B'
  }
  const units = ['B', 'KB', 'MB', 'GB']
  let value = bytes
  let unitIndex = 0
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024
    unitIndex += 1
  }
  return `${value.toFixed(value < 10 && unitIndex > 0 ? 1 : 0)} ${units[unitIndex]}`
}

/**
 * Call the secure AI research API endpoint and return the normalized result.
 * Keeps API details in one place and ensures consumer components get a typed response.
 */
async function requestResearch(companyName: string, website?: string): Promise<ResearchResultResponse> {
  const payload = {
    companyName,
    ...(website ? { website } : {}),
  }

  const response = await fetch('/api/ai/research', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const data = (await response.json().catch(() => null)) as ResearchResultResponse | null

  if (!data) {
    throw new Error(`Unexpected response from AI research service (HTTP ${response.status})`)
  }

  return data
}

async function requestDocumentResearch(formData: FormData): Promise<ResearchResultResponse> {
  const response = await fetch('/api/ai/research/upload', {
    method: 'POST',
    body: formData,
  })

  const data = (await response.json().catch(() => null)) as ResearchResultResponse | null

  if (!data) {
    throw new Error(`Unexpected response from AI document service (HTTP ${response.status})`)
  }

  return data
}

export default function AiCompanyResearch({ 
  onSaveCompany, 
  onAllCompaniesSaved 
}: AiCompanyResearchProps) {
  const [mode, setMode] = useState<Mode>('single')
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
  const [uploadCompanyName, setUploadCompanyName] = useState('')
  const [uploadCompanySlug, setUploadCompanySlug] = useState('')
  const [uploadCreateNew, setUploadCreateNew] = useState(true)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [companySearchResults, setCompanySearchResults] = useState<CompanySearchResult[]>([])
  const [companySearchLoading, setCompanySearchLoading] = useState(false)
  const [companySearchError, setCompanySearchError] = useState<string | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [batchInput, setBatchInput] = useState('')
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, company: '' })
  const [researchedCompanies, setResearchedCompanies] = useState<ResearchedCompany[]>([])
  const [currentPreviewIndex, setCurrentPreviewIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  
  // Batch save state
  const [isSavingAll, setIsSavingAll] = useState(false)
  const [batchSaveProgress, setBatchSaveProgress] = useState<BatchSaveProgress>({
    current: 0,
    total: 0,
    failed: 0,
    currentCompanyName: '',
    errors: [],
  })
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const selectedCompanyNameRef = useRef<string>('')
  const searchAbortControllerRef = useRef<AbortController | null>(null)
  const searchDebounceRef = useRef<number | null>(null)
  const [isDraggingFile, setIsDraggingFile] = useState(false)

  const resetUploadFileInput = () => {
    setUploadFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleFileSelection = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null
    if (file && !isSupportedUploadFile(file)) {
      setError(`Unsupported file type. Upload ${DOCUMENT_TYPE_HINT}.`)
      setUploadFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } else {
      setUploadFile(file)
    }
  }

  useEffect(() => {
    const query = uploadCompanyName.trim()

    if (searchDebounceRef.current) {
      window.clearTimeout(searchDebounceRef.current)
      searchDebounceRef.current = null
    }

    if (searchAbortControllerRef.current) {
      searchAbortControllerRef.current.abort()
    }

    if (query.length < 2) {
      setCompanySearchResults([])
      setCompanySearchLoading(false)
      setCompanySearchError(null)
      return
    }

    const controller = new AbortController()
    searchAbortControllerRef.current = controller
    setCompanySearchError(null)

    searchDebounceRef.current = window.setTimeout(async () => {
      try {
        setCompanySearchLoading(true)
        const response = await fetch(`/api/admin/companies/search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          throw new Error('Failed to search companies')
        }
        const data = (await response.json()) as { companies?: CompanySearchResult[] }
        setCompanySearchResults(data.companies ?? [])
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.error('Company search failed', err)
          setCompanySearchError('Unable to search companies')
        }
      } finally {
        setCompanySearchLoading(false)
      }
    }, 250) as unknown as number

    return () => {
      if (searchDebounceRef.current) {
        window.clearTimeout(searchDebounceRef.current)
        searchDebounceRef.current = null
      }
      controller.abort()
    }
  }, [uploadCompanyName])

  const clearCompanySelection = useCallback((options?: { clearSlug?: boolean }) => {
    setSelectedCompanyId(null)
    selectedCompanyNameRef.current = ''
    const shouldClearSlug = options?.clearSlug ?? uploadCreateNew
    if (shouldClearSlug) {
      setUploadCompanySlug('')
    }
  }, [uploadCreateNew])

  useEffect(() => {
    if (!selectedCompanyId) {
      return
    }
    if (uploadCompanyName.trim() !== selectedCompanyNameRef.current.trim()) {
      clearCompanySelection({ clearSlug: true })
    }
  }, [uploadCompanyName, selectedCompanyId, clearCompanySelection])

  useEffect(() => {
    if (uploadCreateNew) {
      clearCompanySelection({ clearSlug: true })
    }
  }, [uploadCreateNew, clearCompanySelection])

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (!isDraggingFile) {
      setIsDraggingFile(true)
    }
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    if (isDraggingFile) {
      setIsDraggingFile(false)
    }
  }

  const handleFileDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingFile(false)
    const file = event.dataTransfer.files?.[0] ?? null
    if (file) {
      if (isSupportedUploadFile(file)) {
        setUploadFile(file)
      } else {
        setError(`Unsupported file type. Upload ${DOCUMENT_TYPE_HINT}.`)
      }
    }
  }

  const synchronizeSlugWithSelection = (result?: CompanySearchResult | null) => {
    if (result?.slug) {
      setUploadCompanySlug(result.slug)
    } else {
      setUploadCompanySlug('')
    }
  }

  const handleCompanySelect = (result: CompanySearchResult) => {
    const safeName = result.company_name || ''
    setUploadCompanyName(safeName)
    synchronizeSlugWithSelection(result)
    setUploadCreateNew(false)
    setSelectedCompanyId(result.id)
    selectedCompanyNameRef.current = safeName
    setCompanySearchResults([])
    setCompanySearchError(null)
  }

  const handleSingleResearch = async () => {
    const { name: extractedName, website: inlineWebsite } = splitNameAndWebsite(companyName)
    const normalizedName = extractedName.trim()
    if (!normalizedName) {
      setError('Please enter a company name')
      return
    }

    const normalizedWebsite = website.trim()
      ? normalizeWebsiteUrl(website) || undefined
      : inlineWebsite

    setLoading(true)
    setError(null)
    setResearchedCompanies([])

    try {
      const result = await requestResearch(normalizedName, normalizedWebsite)

      if (result.success && result.data) {
        setResearchedCompanies([{
          id: createTempCompanyId(),
          data: result.data,
          enrichmentInfo: result.enrichmentData || 'No enrichment data available',
          enrichmentPayload: result.enrichmentRaw,
        }])
        setCurrentPreviewIndex(0)
      } else {
        setError(result.error || 'Failed to research company')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleBatchResearch = async () => {
    if (!batchInput.trim()) {
      setError('Please enter company data')
      return
    }

    const parsedCompanies = parseBatchEntries(batchInput)
    const uniqueCompanies: Array<{ name: string; website?: string }> = []
    const duplicateNames: string[] = []
    const seenNames = new Set<string>()

    for (const entry of parsedCompanies) {
      const normalizedName = entry.name.trim()
      if (!normalizedName) continue

      const key = normalizedName.toLowerCase()
      if (seenNames.has(key)) {
        duplicateNames.push(normalizedName)
        continue
      }

      seenNames.add(key)
      uniqueCompanies.push({
        name: normalizedName,
        website: entry.website,
      })
    }

    if (uniqueCompanies.length === 0) {
      setError('No valid companies found in input')
      return
    }

    const messageParts: string[] = []
    if (duplicateNames.length > 0) {
      messageParts.push(`Skipped duplicates: ${duplicateNames.join(', ')}`)
    }

    setLoading(true)
    setError(null)
    setResearchedCompanies([])
    setBatchProgress({ current: 0, total: uniqueCompanies.length, company: '' })

    try {
      const successful: ResearchedCompany[] = []
      const errors: Array<{ index: number; company: string; reason: string }> = []

      const researchPromises = uniqueCompanies.map((raw, index) => {
        const normalizedName = raw.name
        const normalizedWebsite = raw.website

        return requestResearch(normalizedName, normalizedWebsite)
          .then(result => {
            if (result.success && result.data) {
              successful.push({
                id: createTempCompanyId(),
                data: result.data,
                enrichmentInfo: result.enrichmentData || 'No enrichment data available',
                enrichmentPayload: result.enrichmentRaw,
              })
            } else {
              errors.push({
                index,
                company: normalizedName,
                reason: result.error || 'Failed to research company',
              })
            }
          })
          .catch(err => {
            const reason = err instanceof Error ? err.message : 'Unknown error'
            errors.push({
              index,
              company: normalizedName,
              reason,
            })
          })

          .finally(() => {
            setBatchProgress(prev => ({
              ...prev,
              current: prev.current + 1,
              company: normalizedName,
            }))
          })
      })

      await Promise.all(researchPromises)
      errors.sort((a, b) => a.index - b.index)

      if (successful.length === 0) {
        messageParts.push(errors[0]?.reason || 'No companies were successfully researched')
        setError(messageParts.join(' '))
      } else {
        setResearchedCompanies(successful)
        setCurrentPreviewIndex(0)

        if (successful.length < uniqueCompanies.length) {
          const firstFailure = errors[0]?.reason
          const message = firstFailure
            ? `Successfully researched ${successful.length} of ${uniqueCompanies.length} companies. Example failure: ${firstFailure}`
            : `Successfully researched ${successful.length} of ${uniqueCompanies.length} companies`
          messageParts.push(message)
        }

        setError(messageParts.length > 0 ? messageParts.join(' ') : null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setLoading(false)
      setBatchProgress({ current: 0, total: 0, company: '' })
    }
  }

  const handleUploadResearch = async () => {
    const normalizedName = uploadCompanyName.trim()
    if (!normalizedName) {
      setError('Please enter the company name (or slug) for this document.')
      return
    }

    if (!uploadFile) {
      setError('Select a document to upload.')
      return
    }

    if (!isSupportedUploadFile(uploadFile)) {
      setError(`Unsupported file type. Upload ${DOCUMENT_TYPE_HINT}.`)
      return
    }

    setLoading(true)
    setError(null)
    setResearchedCompanies([])

    try {
      const formData = new FormData()
      formData.append('file', uploadFile)
      formData.append('fileName', uploadFile.name)
      formData.append('companyName', normalizedName)
      formData.append('createNew', String(uploadCreateNew))
      if (uploadCompanySlug.trim()) {
        formData.append('companySlug', uploadCompanySlug.trim())
      }

      const result = await requestDocumentResearch(formData)

      if (result.success && result.data) {
        setResearchedCompanies([
          {
            id: createTempCompanyId(),
            data: result.data,
            enrichmentInfo:
              result.enrichmentData || `Uploaded document: ${uploadFile.name}`,
            enrichmentPayload: result.enrichmentRaw,
          },
        ])
        setCurrentPreviewIndex(0)
        resetUploadFileInput()
      } else {
        setError(result.error || 'Failed to process uploaded document')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process uploaded document')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (isDraft: boolean) => {
    const currentCompany = researchedCompanies[currentPreviewIndex]
    if (!currentCompany) return

    try {
      await onSaveCompany(currentCompany.data, isDraft, currentCompany.enrichmentPayload)
      
      const updated = researchedCompanies.filter(company => company.id !== currentCompany.id)
      setResearchedCompanies(updated)
      
      if (updated.length > 0) {
        setCurrentPreviewIndex(Math.min(currentPreviewIndex, updated.length - 1))
      } else {
        // All companies saved - trigger redirect callback
        if (onAllCompaniesSaved) {
          onAllCompaniesSaved()
        }
        // Reset form
        setCompanyName('')
        setWebsite('')
        setBatchInput('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save company')
    }
  }

  const handleSaveAll = async () => {
    if (researchedCompanies.length === 0) return

    setIsSavingAll(true)
    setBatchSaveProgress({
      current: 0,
      total: researchedCompanies.length,
      failed: 0,
      currentCompanyName: '',
      errors: [],
    })

    const results = await Promise.allSettled(
      researchedCompanies.map(async company => {
        try {
          await onSaveCompany(company.data, false, company.enrichmentPayload)
          return company.id
        } finally {
          setBatchSaveProgress(prev => ({
            ...prev,
            current: prev.current + 1,
            currentCompanyName: company.data.company_name,
          }))
        }
      })
    )

    const savedCompanyIds = new Set<string>()
    const errors: Array<{ companyId: string; company: string; reason: string }> = []

    results.forEach((result, index) => {
      const company = researchedCompanies[index]
      if (result.status === 'fulfilled') {
        savedCompanyIds.add(result.value)
      } else {
        const reason = result.reason instanceof Error ? result.reason.message : 'Unknown error'
        errors.push({
          companyId: company.id,
          company: company.data.company_name,
          reason,
        })
      }
    })

    const successCount = savedCompanyIds.size
    const failCount = errors.length

    setBatchSaveProgress(prev => ({
      ...prev,
      failed: failCount,
      errors,
    }))

    setIsSavingAll(false)

    if (savedCompanyIds.size > 0) {
      const remaining = researchedCompanies.filter(company => !savedCompanyIds.has(company.id))
      setResearchedCompanies(remaining)
      setCurrentPreviewIndex(remaining.length > 0 ? Math.min(currentPreviewIndex, remaining.length - 1) : 0)
    }

    // Show result
    if (failCount === 0) {
      // All succeeded - redirect
      if (onAllCompaniesSaved) {
        onAllCompaniesSaved()
      }
    } else {
      // Some failed - show summary
      setError(
        `Saved ${successCount} of ${researchedCompanies.length} companies. ` +
        `${failCount} failed. Check the summary below to retry.`
      )
    }
  }

  const handleEdit = (updatedData: CompanyFormData) => {
    const updated = [...researchedCompanies]
    updated[currentPreviewIndex] = {
      ...updated[currentPreviewIndex],
      data: updatedData
    }
    setResearchedCompanies(updated)
  }

  const handleRetryFailedCompanies = async () => {
    if (batchSaveProgress.errors.length === 0) return

    setIsSavingAll(true)
    const retriedSuccessIds = new Set<string>()

    const retryableCompanies = batchSaveProgress.errors
      .map(errorItem => researchedCompanies.find(company => company.id === errorItem.companyId))
      .filter((company): company is ResearchedCompany => Boolean(company))

    const retryResults = await Promise.all(
      retryableCompanies.map(async company => {
        try {
          await onSaveCompany(company.data, false, company.enrichmentPayload)
          retriedSuccessIds.add(company.id)
          return null
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'Unknown error'
          return {
            companyId: company.id,
            company: company.data.company_name,
            reason,
          }
        }
      })
    )

    const newErrors = retryResults.filter((result): result is { companyId: string; company: string; reason: string } => Boolean(result))
    const failCount = newErrors.length

    setIsSavingAll(false)

    if (retriedSuccessIds.size > 0) {
      const remaining = researchedCompanies.filter(company => !retriedSuccessIds.has(company.id))
      setResearchedCompanies(remaining)
      setCurrentPreviewIndex(remaining.length > 0 ? Math.min(currentPreviewIndex, remaining.length - 1) : 0)
    }

    if (failCount === 0) {
      // All succeeded now
      if (onAllCompaniesSaved) {
        onAllCompaniesSaved()
      }
    } else {
      // Still some failures
      setBatchSaveProgress(prev => ({
        ...prev,
        failed: failCount,
        errors: newErrors,
      }))
      setError(`Still ${failCount} companies failed. Please try again or continue manually.`)
    }
  }

  const currentCompany = researchedCompanies[currentPreviewIndex]
  const trimmedUploadName = uploadCompanyName.trim()
  const shouldShowSearchDropdown =
    trimmedUploadName.length >= 2 &&
    !selectedCompanyId &&
    (companySearchLoading || companySearchResults.length > 0 || !!companySearchError)

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI Company Research
          </h2>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <button
            type="button"
            onClick={() => setMode('single')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'single'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading || isSavingAll}
          >
            Single Company
          </button>
          <button
            type="button"
            onClick={() => setMode('batch')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'batch'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading || isSavingAll}
          >
            Batch Mode
          </button>
          <button
            type="button"
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            disabled={loading || isSavingAll}
          >
            Upload Doc
          </button>
        </div>

        {mode === 'single' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="companyName"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Acme Manufacturing"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || isSavingAll}
              />
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
                Website (Optional)
              </label>
              <input
                type="url"
                id="website"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || isSavingAll}
              />
            </div>

            <button
              type="button"
              onClick={handleSingleResearch}
              disabled={loading || !companyName.trim() || isSavingAll}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              {loading ? 'Researching...' : 'Research Company'}
            </button>
          </div>
        )}

        {mode === 'upload' && (
          <div className="space-y-5">
            <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <input
                id="uploadCreateNew"
                type="checkbox"
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={uploadCreateNew}
                onChange={(e) => setUploadCreateNew(e.target.checked)}
                disabled={loading || isSavingAll}
              />
              <label htmlFor="uploadCreateNew" className="text-sm text-gray-700">
                <span className="font-medium">Create a new company record</span>
                <span className="block text-xs text-gray-500">
                  Uncheck this if you are updating an existing company from the document upload.
                </span>
              </label>
            </div>

            <div className="relative">
              <label htmlFor="uploadCompanyName" className="block text-sm font-medium text-gray-700 mb-1">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="uploadCompanyName"
                value={uploadCompanyName}
                onChange={(e) => setUploadCompanyName(e.target.value)}
                placeholder="e.g., Kodiak Assembly Solutions"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading || isSavingAll}
                autoComplete="off"
              />
              {selectedCompanyId && !uploadCreateNew && (
                <p className="mt-1 text-xs text-green-700">
                  Linked to existing company. Slug will be included automatically.
                </p>
              )}
              {shouldShowSearchDropdown && (
                <div className="absolute z-20 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl">
                  {companySearchLoading && (
                    <div className="px-4 py-3 text-sm text-gray-500">Searching companies…</div>
                  )}
                  {!companySearchLoading && companySearchResults.length === 0 && (
                    <div className="px-4 py-3 text-sm text-gray-500">No companies found.</div>
                  )}
                  {companySearchResults.map((result) => (
                    <button
                      type="button"
                      key={result.id}
                      className="flex w-full flex-col items-start gap-1 px-4 py-3 text-left hover:bg-blue-50"
                      onClick={() => handleCompanySelect(result)}
                    >
                      <span className="text-sm font-medium text-gray-900">
                        {result.company_name ?? 'Unnamed company'}
                      </span>
                      <span className="text-xs text-gray-500 flex flex-wrap gap-2">
                        {result.slug && <span>slug: {result.slug}</span>}
                        {result.website_url && <span>{result.website_url}</span>}
                      </span>
                    </button>
                  ))}
                  {companySearchError && (
                    <div className="px-4 py-3 text-sm text-red-600 border-t border-gray-100">
                      {companySearchError}
                    </div>
                  )}
                </div>
              )}
            </div>

            {!uploadCreateNew && (
              <div>
                <label htmlFor="uploadCompanySlug" className="block text-sm font-medium text-gray-700 mb-1">
                  Existing Slug
                </label>
                <input
                  type="text"
                  id="uploadCompanySlug"
                  value={uploadCompanySlug}
                  onChange={(e) => setUploadCompanySlug(e.target.value)}
                  placeholder="kodiak-assembly"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading || isSavingAll}
                />
                <p className="mt-1 text-xs text-gray-500">Auto-filled when you pick a company from the list.</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Company Document <span className="text-red-500">*</span>
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileDrop}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    fileInputRef.current?.click()
                  }
                }}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors ${
                  isDraggingFile
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-blue-400'
                } ${loading || isSavingAll ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}
              >
                <p className="text-sm font-medium text-gray-900">Drop your Markdown or Word document here</p>
                <p className="mt-2 text-xs text-gray-500">Supported: {DOCUMENT_TYPE_HINT}</p>
                {uploadFile && (
                  <div className="mt-4 text-sm text-gray-700">
                    <p className="font-medium">{uploadFile.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(uploadFile.size)}</p>
                  </div>
                )}
                {!uploadFile && (
                  <p className="mt-4 text-xs text-gray-500">Click to browse your files</p>
                )}
              </div>
              <input
                type="file"
                id="uploadFile"
                accept={DOCUMENT_ACCEPT_ATTRIBUTE}
                ref={fileInputRef}
                onChange={handleFileSelection}
                className="sr-only"
                disabled={loading || isSavingAll}
              />
            </div>

            <button
              type="button"
              onClick={handleUploadResearch}
              disabled={loading || isSavingAll || !uploadFile || !trimmedUploadName}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>📄</span>
              {loading ? 'Processing document...' : 'Process Uploaded Document'}
            </button>
          </div>
        )}

        {mode === 'batch' && (
          <div className="space-y-4">
            <div>
              <label htmlFor="batchInput" className="block text-sm font-medium text-gray-700 mb-1">
                Paste multiple companies (one per line, optionally add website with &quot;|&quot; or &quot;,&quot;)
              </label>
              <textarea
                id="batchInput"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={8}
                placeholder="Acme Corp | https://acme.com\nTechCo, techco.com\nManufacturing Inc"                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={loading || isSavingAll}
              />
            </div>

            <button
              type="button"
              onClick={handleBatchResearch}
              disabled={loading || !batchInput.trim() || isSavingAll}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              {loading
                ? `Researching... (${batchProgress.current}/${batchProgress.total})`
                : `Research All (${countUniqueBatchEntries(batchInput)} companies)`}
            </button>

            {loading && batchProgress.company && (
              <div className="text-sm text-gray-600 text-center">
                Currently researching: <span className="font-medium">{batchProgress.company}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </div>

      {researchedCompanies.length > 0 && currentCompany && (
        <CompanyPreview
          companyData={currentCompany.data}
          enrichmentInfo={currentCompany.enrichmentInfo}
          onSave={handleSave}
          onEdit={handleEdit}
          onCancel={() => {
            setResearchedCompanies([])
            setCurrentPreviewIndex(0)
            setBatchSaveProgress({
              current: 0,
              total: 0,
              failed: 0,
              currentCompanyName: '',
              errors: [],
            })
          }}
          currentIndex={currentPreviewIndex + 1}
          totalCount={researchedCompanies.length}
          onNavigate={(direction) => {
            if (direction === 'next' && currentPreviewIndex < researchedCompanies.length - 1) {
              setCurrentPreviewIndex(currentPreviewIndex + 1)
            } else if (direction === 'prev' && currentPreviewIndex > 0) {
              setCurrentPreviewIndex(currentPreviewIndex - 1)
            }
          }}
          onSaveAll={handleSaveAll}
          isSavingAll={isSavingAll}
          batchSaveProgress={isSavingAll ? batchSaveProgress : undefined}
          batchSaveErrors={batchSaveProgress.errors.length > 0 ? batchSaveProgress.errors : undefined}
          onRetryFailed={batchSaveProgress.errors.length > 0 ? handleRetryFailedCompanies : undefined}
        />
      )}
    </div>
  )
}
