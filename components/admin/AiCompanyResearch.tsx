'use client'

import { useState } from 'react'
import { researchCompany, researchBatchCompanies, parseBatchInput } from '@/lib/ai/researchCompany'
import type { CompanyFormData } from '@/types/admin'
import CompanyPreview from './CompanyPreview'

type Mode = 'single' | 'batch'

interface ResearchedCompany {
  data: CompanyFormData
  enrichmentInfo: string
}

interface AiCompanyResearchProps {
  onSaveCompany: (data: CompanyFormData, isDraft: boolean) => Promise<void>
  onAllCompaniesSaved?: () => void
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

  const handleSingleResearch = async () => {
    if (!companyName.trim()) {
      setError('Please enter a company name')
      return
    }

    setLoading(true)
    setError(null)
    setResearchedCompanies([])

    try {
      const result = await researchCompany(companyName, website || undefined)

      if (result.success && result.data) {
        setResearchedCompanies([{
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

    const companies = parseBatchInput(batchInput)
    if (companies.length === 0) {
      setError('No valid companies found in input')
      return
    }

    setLoading(true)
    setError(null)
    setResearchedCompanies([])
    setBatchProgress({ current: 0, total: companies.length, company: '' })

    try {
      const results = await researchBatchCompanies(
        companies,
        (current, total, company) => {
          setBatchProgress({ current, total, company })
        }
      )

      const successful = results
        .filter(r => r.success && r.data)
        .map(r => ({
          data: r.data!,
          enrichmentInfo: r.enrichmentData || 'No enrichment data available'
        }))

      if (successful.length === 0) {
        setError('No companies were successfully researched')
      } else {
        setResearchedCompanies(successful)
        setCurrentPreviewIndex(0)
        if (successful.length < companies.length) {
          setError(`Successfully researched ${successful.length} of ${companies.length} companies`)
        }
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
      
      const updated = researchedCompanies.filter((_, i) => i !== currentPreviewIndex)
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

  const handleEdit = (updatedData: CompanyFormData) => {
    const updated = [...researchedCompanies]
    updated[currentPreviewIndex] = {
      ...updated[currentPreviewIndex],
      data: updatedData
    }
    setResearchedCompanies(updated)
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
            disabled={loading}
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
            disabled={loading}
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
                disabled={loading}
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
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={handleSingleResearch}
              disabled={loading || !companyName.trim()}
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
                Paste multiple companies (one per line, format: Name, Website)
              </label>
              <textarea
                id="batchInput"
                value={batchInput}
                onChange={(e) => setBatchInput(e.target.value)}
                rows={8}
                placeholder="Acme Corp, https://acme.com&#10;TechCo, https://techco.com&#10;Manufacturing Inc, https://mfg.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                disabled={loading}
              />
            </div>

            <button
              type="button"
              onClick={handleBatchResearch}
              disabled={loading || !batchInput.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <span>🔍</span>
              {loading
                ? `Researching... (${batchProgress.current}/${batchProgress.total})`
                : `Research All (${parseBatchInput(batchInput).length} companies)`}
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
        />
      )}
    </div>
  )
}