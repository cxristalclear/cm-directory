'use client'

import { useState } from 'react'
import type { CompanyFormData } from '@/types/admin'
import CompanyPreview from './CompanyPreview'
import { normalizeWebsiteUrl } from '@/lib/admin/utils'

type Mode = 'single' | 'batch'

interface ResearchedCompany {
  id: string
  data: CompanyFormData
  enrichmentInfo: string
}

interface BatchSaveProgress {
  current: number
  total: number
  failed: number
  currentCompanyName: string
  errors: Array<{ companyId: string; company: string; reason: string }>
}

interface AiCompanyResearchProps {
  onSaveCompany: (data: CompanyFormData, isDraft: boolean) => Promise<void>
  onAllCompaniesSaved?: () => void
}

interface ResearchResultResponse {
  success: boolean
  data?: CompanyFormData
  error?: string
  enrichmentData?: string
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
    seen.add(normalizedName.toLowerCase())
  }
  return seen.size
}

function createTempCompanyId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `temp-${Date.now()}-${Math.random().toString(16).slice(2)}`
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

export default function AiCompanyResearch({ 
  onSaveCompany, 
  onAllCompaniesSaved 
}: AiCompanyResearchProps) {
  const [mode, setMode] = useState<Mode>('single')
  const [loading, setLoading] = useState(false)
  const [companyName, setCompanyName] = useState('')
  const [website, setWebsite] = useState('')
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
          enrichmentInfo: result.enrichmentData || 'No enrichment data available'
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

      for (let i = 0; i < uniqueCompanies.length; i++) {
        const raw = uniqueCompanies[i]
        const normalizedName = raw.name
        const normalizedWebsite = raw.website

        setBatchProgress({
          current: i + 1,
          total: uniqueCompanies.length,
          company: normalizedName,
        })

        try {
          const result = await requestResearch(normalizedName, normalizedWebsite)

          if (result.success && result.data) {
            successful.push({
              id: createTempCompanyId(),
              data: result.data,
              enrichmentInfo: result.enrichmentData || 'No enrichment data available',
            })
          } else {
            errors.push({
              index: i,
              company: normalizedName,
              reason: result.error || 'Failed to research company',
            })
          }
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'Unknown error'
          errors.push({
            index: i,
            company: normalizedName,
            reason,
          })
        }
      }

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

  const handleSave = async (isDraft: boolean) => {
    const currentCompany = researchedCompanies[currentPreviewIndex]
    if (!currentCompany) return

    try {
      await onSaveCompany(currentCompany.data, isDraft)
      
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

    const errors: Array<{ companyId: string; company: string; reason: string }> = []
    let successCount = 0
    let failCount = 0
    const savedCompanyIds = new Set<string>()

    for (let i = 0; i < researchedCompanies.length; i++) {
      const company = researchedCompanies[i]
      
      try {
        setBatchSaveProgress(prev => ({
          ...prev,
          currentCompanyName: company.data.company_name,
        }))

        await onSaveCompany(company.data, false)
        successCount++
        savedCompanyIds.add(company.id)
        
        setBatchSaveProgress(prev => ({
          ...prev,
          current: prev.current + 1,
        }))
      } catch (err) {
        failCount++
        const reason = err instanceof Error ? err.message : 'Unknown error'
        errors.push({
          companyId: company.id,
          company: company.data.company_name,
          reason,
        })

        setBatchSaveProgress(prev => ({
          ...prev,
          current: prev.current + 1,
          failed: prev.failed + 1,
          errors: [...prev.errors, { companyId: company.id, company: company.data.company_name, reason }],
        }))
      }
    }

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
    const newErrors: Array<{ companyId: string; company: string; reason: string }> = []
    let failCount = 0
    const retriedSuccessIds = new Set<string>()

    for (const errorItem of batchSaveProgress.errors) {
      const company = researchedCompanies.find(c => c.id === errorItem.companyId)
      if (!company) continue

      try {
        setBatchSaveProgress(prev => ({
          ...prev,
          currentCompanyName: company.data.company_name,
        }))

        await onSaveCompany(company.data, false)
        retriedSuccessIds.add(company.id)
      } catch (err) {
        failCount++
        const reason = err instanceof Error ? err.message : 'Unknown error'
        newErrors.push({
          companyId: company.id,
          company: company.data.company_name,
          reason,
        })
      }
    }

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

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI Company Research
          </h2>
        </div>

        <div className="flex gap-4 mb-6">
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
                placeholder="Acme Corp | https://acme.com&#10;TechCo, techco.com&#10;Manufacturing Inc"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
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
