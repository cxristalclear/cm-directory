'use client'

import { useState } from 'react'
import type { CompanyFormData } from '@/types/admin'
import CompanyForm from './CompanyForm'

interface CompanyPreviewProps {
  companyData: CompanyFormData
  enrichmentInfo: string
  onSave: (isDraft: boolean) => Promise<void>
  onEdit: (updatedData: CompanyFormData) => void
  onCancel: () => void
  currentIndex?: number
  totalCount?: number
  onNavigate?: (direction: 'prev' | 'next') => void
  onSaveAll?: () => Promise<void>
  isSavingAll?: boolean
  batchSaveProgress?: {
    current: number
    total: number
    failed: number
    currentCompanyName: string
    errors: Array<{ companyId: string; company: string; reason: string }>
  }
  batchSaveErrors?: Array<{ companyId: string; company: string; reason: string }>
  onRetryFailed?: () => Promise<void>
}

export default function CompanyPreview({
  companyData,
  enrichmentInfo,
  onSave,
  onEdit,
  onCancel,
  currentIndex,
  totalCount,
  onNavigate,
  onSaveAll,
  isSavingAll,
  batchSaveProgress,
  batchSaveErrors,
  onRetryFailed,
}: CompanyPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showSaveAllConfirm, setShowSaveAllConfirm] = useState(false)

  const handleSave = async (isDraft: boolean) => {
    setSaving(true)
    try {
      await onSave(isDraft)
    } finally {
      setSaving(false)
    }
  }

  const handleEditSubmit = async (updatedData: CompanyFormData) => {
    onEdit(updatedData)
    setIsEditing(false)
    return Promise.resolve()
  }

  const handleSaveAllClick = async () => {
    setShowSaveAllConfirm(false)
    setSaving(true)
    try {
      if (onSaveAll) {
        await onSaveAll()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleRetryClick = async () => {
    setSaving(true)
    try {
      if (onRetryFailed) {
        await onRetryFailed()
      }
    } finally {
      setSaving(false)
    }
  }

  const facilitiesCount = companyData.facilities?.length || 0
  const capabilitiesCount = companyData.capabilities 
    ? Object.values(companyData.capabilities).filter(Boolean).length 
    : 0
  const certificationsCount = companyData.certifications?.length || 0
  const industriesCount = companyData.industries?.length || 0

  if (isEditing) {
    return (
      <div className="space-y-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Edit Company Data</h3>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              ← Back to Preview
            </button>
          </div>
        </div>

        <CompanyForm 
          initialData={companyData} 
          onSubmit={handleEditSubmit}
          loading={false}
        />
      </div>
    )
  }

  // Show batch save progress overlay
  if (isSavingAll && batchSaveProgress) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💾</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Saving All Companies</h3>
              <p className="text-sm text-gray-600">
                Progress: {batchSaveProgress.current} of {batchSaveProgress.total}
              </p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-blue-600 h-2.5 transition-all duration-300"
              style={{
                width: `${((batchSaveProgress?.current ?? 0) / (batchSaveProgress?.total ?? 1)) * 100}%`,
              }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            {Math.round(((batchSaveProgress?.current ?? 0) / (batchSaveProgress?.total ?? 1)) * 100)}%
          </p>
        </div>

        {/* Current Company Being Saved */}
        {batchSaveProgress.currentCompanyName && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Currently saving:</span>{' '}
              <span className="font-semibold text-gray-900">{batchSaveProgress.currentCompanyName}</span>
            </p>
          </div>
        )}

        {/* Error Summary During Save */}
        {batchSaveProgress.failed > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">{batchSaveProgress.failed} companies failed so far.</span> They can be retried after completion.
            </p>
          </div>
        )}

        {/* Disable all buttons during save */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <span className="inline-block animate-spin text-xl">⏳</span>
          <p className="text-sm text-gray-600">Saving companies...</p>
        </div>
      </div>
    )
  }

  // Show error/summary after batch save
  if (batchSaveErrors && batchSaveErrors.length > 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Batch Save Complete (With Errors)</h3>
            <p className="text-sm text-gray-600">
              {(batchSaveProgress?.current ?? 0) - (batchSaveProgress?.failed ?? 0)} of {batchSaveProgress?.total ?? 0} saved successfully
            </p>
          </div>
        </div>

        {/* Failed Companies List */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h4 className="font-semibold text-red-900 mb-3">Failed Companies ({batchSaveErrors.length})</h4>
          <div className="space-y-2">
            {batchSaveErrors.map((error, idx) => (
              <div key={idx} className="bg-white p-3 rounded border border-red-100">
                <p className="text-sm font-medium text-gray-900">{error.company}</p>
                <p className="text-xs text-red-700 mt-1">{error.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={handleRetryClick}
            disabled={saving}
            className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span>🔄</span>
            {saving ? 'Retrying...' : 'Retry Failed'}
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            ✕ Cancel
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">✅</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Research Complete - Review Data</h3>
            {currentIndex && totalCount && totalCount > 1 && (
              <p className="text-sm text-gray-600">
                Company {currentIndex} of {totalCount}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Company Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{companyData.company_name}</h4>
        {companyData.website_url && (
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Website:</span>{' '}
            <a href={companyData.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              {companyData.website_url}
            </a>
          </p>
        )}
        {companyData.year_founded && (
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Founded:</span> {companyData.year_founded}
          </p>
        )}
        {companyData.employee_count_range && (
          <p className="text-sm text-gray-700 mb-2">
            <span className="font-medium">Employees:</span> {companyData.employee_count_range}
          </p>
        )}
        {companyData.annual_revenue_range && (
          <p className="text-sm text-gray-700">
            <span className="font-medium">Revenue:</span> {companyData.annual_revenue_range}
          </p>
        )}
      </div>

      {/* Description */}
      {companyData.description && (
        <div className="mb-6">
          <h5 className="text-sm font-medium text-gray-700 mb-2">Description</h5>
          <p className="text-sm text-gray-600">{companyData.description}</p>
        </div>
      )}

      {/* Detailed Data Sections */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Facilities Details */}
        {facilitiesCount > 0 && (
          <details className="bg-green-50 border border-green-200 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-900 flex items-center gap-2">
              🏭 {facilitiesCount} Facilities Found
            </summary>
            <div className="mt-3 space-y-2">
              {companyData.facilities?.map((facility, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-green-100">
                  <div className="font-medium text-sm">{facility.facility_type}</div>
                  <div className="text-xs text-gray-600 mt-1">
                    {[facility.city, facility.state_province || facility.state, facility.country].filter(Boolean).join(', ')}
                  </div>
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Capabilities Details */}
        {capabilitiesCount > 0 && companyData.capabilities && (
          <details className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-900 flex items-center gap-2">
              ⚙️ {capabilitiesCount} Capabilities Detected
            </summary>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {Object.entries(companyData.capabilities)
                .filter(([, value]) => value === true)
                .map(([key]) => (
                  <div key={key} className="bg-white px-2 py-1 rounded border border-purple-100 text-xs">
                    {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </div>
                ))}
            </div>
          </details>
        )}
       
        {/* Certifications Details */}
        {certificationsCount > 0 && (
          <details className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-900 flex items-center gap-2">
              🏆 {certificationsCount} Certifications Found
            </summary>
            <div className="mt-3 space-y-2">
              {companyData.certifications?.map((cert, idx) => (
                <div key={idx} className="bg-white p-3 rounded border border-yellow-100">
                  <div className="flex items-center justify-between">
                    <div className="font-medium text-sm">{cert.certification_type}</div>
                    {cert.status && (
                      <span className={`text-xs px-2 py-1 rounded ${
                        cert.status === 'Active' ? 'bg-green-100 text-green-800' :
                        cert.status === 'Expired' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {cert.status}
                      </span>
                    )}
                  </div>
                  {cert.certificate_number && (
                    <div className="text-xs text-gray-600 mt-1">Cert #: {cert.certificate_number}</div>
                  )}
                </div>
              ))}
            </div>
          </details>
        )}

        {/* Industries Details */}
        {industriesCount > 0 && (
          <details className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <summary className="cursor-pointer font-medium text-gray-900 flex items-center gap-2">
              🏢 {industriesCount} Industries Served
            </summary>
            <div className="mt-3 flex flex-wrap gap-2">
              {companyData.industries?.map((industry, idx) => (
                <div key={idx} className="bg-white px-3 py-1 rounded border border-blue-100 text-sm">
                  {industry.industry_name}
                </div>
              ))}
            </div>
          </details>
        )}
    </div>

      {/* Source Notes */}
      {enrichmentInfo && (
        <details className="mb-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            View Source Data
          </summary>
          <div className="mt-2 p-3 bg-gray-50 rounded-lg">
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">{enrichmentInfo}</pre>
          </div>
        </details>
      )}

      {/* Navigation (for batch mode) */}
      {totalCount && totalCount > 1 && onNavigate && (
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => onNavigate('prev')}
            disabled={currentIndex === 1 || saving || isSavingAll}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            {currentIndex} of {totalCount}
          </span>
          <button
            onClick={() => onNavigate('next')}
            disabled={currentIndex === totalCount || saving || isSavingAll}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Save All Confirmation Modal */}
      {showSaveAllConfirm && totalCount && totalCount > 1 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Save All Companies?</h4>
            <p className="text-sm text-gray-600 mb-6">
              This will save all {totalCount} researched companies to the database.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSaveAllConfirm(false)}
                disabled={saving}
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAllClick}
                disabled={saving}
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <span>✓</span>
                {saving ? 'Saving...' : 'Confirm Save All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(true)}
            disabled={saving || isSavingAll}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onCancel}
            disabled={saving || isSavingAll}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            ✕ Cancel
          </button>
        </div>

        <div className="flex gap-3">
          {totalCount && totalCount > 1 && onSaveAll && (
            <button
              onClick={() => setShowSaveAllConfirm(true)}
              disabled={saving || isSavingAll}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
            >
              <span>⚡</span>
              Save All {totalCount}
            </button>
          )}
          <button
            onClick={() => handleSave(false)}
            disabled={saving || isSavingAll}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            <span>💾</span>
            {saving ? 'Saving...' : 'Save to Database'}
          </button>
        </div>
      </div>
    </div>
  )
}
