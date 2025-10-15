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
}: CompanyPreviewProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = async (isDraft: boolean) => {
    setSaving(true)
    try {
      await onSave(isDraft)
    } finally {
      setSaving(false)
    }
  }

  const handleEditSubmit = async (updatedData: CompanyFormData, isDraft: boolean) => {
    // Update the data in parent component
    onEdit(updatedData)
    // Exit edit mode
    setIsEditing(false)
    return Promise.resolve()
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
                    {[facility.city, facility.state, facility.country].filter(Boolean).join(', ')}
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
                .filter(([_, value]) => value === true)
                .map(([key, _]) => (
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

      {/* Enrichment Info */}
      {enrichmentInfo && (
        <details className="mb-6">
          <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
            View ZoomInfo Enrichment Data
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
            disabled={currentIndex === 1}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Previous
          </button>
          <span className="text-sm text-gray-600">
            {currentIndex} of {totalCount}
          </span>
          <button
            onClick={() => onNavigate('next')}
            disabled={currentIndex === totalCount}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(true)}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            ✏️ Edit
          </button>
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            ❌ Cancel
          </button>
        </div>

        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          <span>💾</span>
          {saving ? 'Saving...' : 'Save to Database'}
        </button>
      </div>
    </div>
  )
}