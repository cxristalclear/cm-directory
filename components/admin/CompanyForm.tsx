'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Plus } from 'lucide-react'
import type { CompanyFormData, FacilityFormData, IndustryFormData, CertificationFormData } from '@/types/admin'
import { useCanonicalLocations } from '@/hooks/useCanonicalLocations'
import { formatCountryLabel, formatStateLabelFromKey, normalizeCountryCode, normalizeStateFilterValue } from '@/utils/locationFilters'

interface CompanyFormProps {
  initialData?: CompanyFormData
  onSubmit: (data: CompanyFormData, isDraft: boolean) => Promise<void>
  loading?: boolean
}

const employeeRanges = ['<50', '50-150', '150-500', '500-1000', '1000+']
const revenueRanges = ['<$10M', '$10M-50M', '$50M-150M', '$150M+']
const facilityTypes = ['HQ', 'Manufacturing', 'Engineering', 'Sales Office']
const certificationStatuses = ['Active', 'Expired', 'Pending']

export default function CompanyForm({ initialData, onSubmit, loading = false }: CompanyFormProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<CompanyFormData>(
    initialData || {
      company_name: '',
      facilities: [],
      industries: [],
      certifications: [],
    }
  )

  const { countries, states, loading: locationsLoading, error: locationsError } = useCanonicalLocations()

  const facilityStateOptions = useMemo(() => {
    const availableStates = states || []
    if (!formData.facilities) return []

    return formData.facilities.map((facility) => {
      const selectedCountryCode =
        facility.country_code ||
        (facility.country ? normalizeCountryCode(facility.country) : null) ||
        ''
      if (!selectedCountryCode) {
        return []
      }
      return availableStates.filter(
        (state) => state.country_iso2 === selectedCountryCode,
      )
    })
  }, [formData.facilities, states])

  const updateField = <K extends keyof CompanyFormData>(field: K, value: CompanyFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const updateFacilities = (
    updater: (facilities: FacilityFormData[]) => FacilityFormData[],
  ) => {
    setFormData((prev) => {
      const currentFacilities = prev.facilities ? [...prev.facilities] : []
      const nextFacilities = updater(currentFacilities)
      return { ...prev, facilities: nextFacilities }
    })
  }

  const patchFacility = (index: number, patch: Partial<FacilityFormData>) => {
    updateFacilities((facilities) =>
      facilities.map((facility, i) => (i === index ? { ...facility, ...patch } : facility)),
    )
  }

  const handleSubmit = (isDraft: boolean) => {
    onSubmit(formData, isDraft)
  }

  const handleCountryChange = (index: number, iso2: string) => {
    const normalized = normalizeCountryCode(iso2) || null
    const displayName =
      normalized && normalized.length === 2
        ? countries.find((option) => option.iso2 === normalized)?.name || formatCountryLabel(normalized)
        : null

    patchFacility(index, {
      country: displayName,
      country_code: normalized,
      state_code: null,
      state_province: null,
    })
  }

  const handleCountryInput = (index: number, value: string) => {
    const trimmed = value.trim()
    const normalized = trimmed && trimmed.length <= 3 ? normalizeCountryCode(trimmed) : null
    patchFacility(index, {
      country: value || null,
      country_code: normalized,
    })
  }

  const handleStateSelect = (index: number, stateCode: string, stateName?: string | null) => {
    if (!stateCode) {
      patchFacility(index, {
        state_code: null,
        state_province: null,
      })
      return
    }

    const derivedName = stateName || formatStateLabelFromKey(stateCode)
    patchFacility(index, {
      state_code: stateCode,
      state_province: derivedName || stateCode,
    })
  }

  const handleCustomStateChange = (index: number, value: string) => {
    const normalizedCode = value ? normalizeStateFilterValue(value) : null
    patchFacility(index, {
      state_province: value || null,
      state_code: normalizedCode || null,
    })
  }

  // Facility management
  const addFacility = () => {
    updateFacilities((facilities) => [
      ...facilities,
      {
        facility_type: 'Manufacturing',
        country: formatCountryLabel('US'),
        country_code: 'US',
        state_code: null,
        state_province: null,
        postal_code: null,
        is_primary: facilities.length === 0,
        latitude: null,
        longitude: null,
        location: null,
      },
    ])
  }

  const updateFacility = <K extends keyof FacilityFormData>(index: number, field: K, value: FacilityFormData[K]) => {
    updateFacilities((facilities) =>
      facilities.map((facility, i) =>
        i === index ? { ...facility, [field]: value } : facility,
      ),
    )
  }

  const removeFacility = (index: number) => {
    updateFacilities((facilities) => facilities.filter((_, i) => i !== index))
  }

  // Industry management
  const addIndustry = () => {
    const newIndustry: IndustryFormData = { industry_name: '' }
    updateField('industries', [...(formData.industries || []), newIndustry])
  }

  const updateIndustry = (index: number, value: string) => {
    const updated = [...(formData.industries || [])]
    updated[index] = { ...updated[index], industry_name: value }
    updateField('industries', updated)
  }

  const removeIndustry = (index: number) => {
    const updated = formData.industries?.filter((_, i) => i !== index) || []
    updateField('industries', updated)
  }

  // Certification management
  const addCertification = () => {
    const newCert: CertificationFormData = {
      certification_type: '',
      status: 'Active',
    }
    updateField('certifications', [...(formData.certifications || []), newCert])
  }

  const updateCertification = <K extends keyof CertificationFormData>(index: number, field: K, value: CertificationFormData[K]) => {
    const updated = [...(formData.certifications || [])]
    updated[index] = { ...updated[index], [field]: value }
    updateField('certifications', updated)
  }

  const removeCertification = (index: number) => {
    const updated = formData.certifications?.filter((_, i) => i !== index) || []
    updateField('certifications', updated)
  }

  // Capabilities management
  const updateCapability = (field: string, value: boolean) => {
    updateField('capabilities', {
      ...(formData.capabilities || {}),
      [field]: value,
    })
  }

  // Technical specs management
  const updateTechnicalSpec = (field: string, value: unknown) => {
    updateField('technical_specs', {
      ...(formData.technical_specs || {}),
      [field]: value,
    })
  }

  // Business info management
  const updateBusinessInfo = (field: string, value: unknown) => {
    updateField('business_info', {
      ...(formData.business_info || {}),
      [field]: value,
    })
  }

  return (
    <form className="space-y-8 glass-card">
      {/* Basic Information Section */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="company_name" className="block text-sm font-medium text-gray-700">
              Company Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="company_name"
              required
              value={formData.company_name}
              onChange={(e) => updateField('company_name', e.target.value)}
              className="mt-1 block w-full admin-input glow-on-focus"
            />
          </div>

          <div>
            <label htmlFor="dba_name" className="block text-sm font-medium text-gray-700">
              DBA Name
            </label>
            <input
              type="text"
              id="dba_name"
              value={formData.dba_name || ''}
              onChange={(e) => updateField('dba_name', e.target.value)}
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label htmlFor="website_url" className="block text-sm font-medium text-gray-700">
              Website URL
            </label>
            <input
              type="url"
              id="website_url"
              value={formData.website_url || ''}
              onChange={(e) => updateField('website_url', e.target.value)}
              placeholder="https://example.com"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label htmlFor="year_founded" className="block text-sm font-medium text-gray-700">
              Year Founded
            </label>
            <input
              type="number"
              id="year_founded"
              min="1800"
              max={new Date().getFullYear()}
              value={formData.year_founded || ''}
              onChange={(e) => updateField('year_founded', parseInt(e.target.value) || undefined)}
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label htmlFor="employee_count_range" className="block text-sm font-medium text-gray-700">
              Employee Count
            </label>
            <select
              id="employee_count_range"
              value={formData.employee_count_range || ''}
              onChange={(e) => updateField('employee_count_range', e.target.value)}
              className="mt-1 block w-full admin-select"
            >
              <option value="">Select range</option>
              {employeeRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="annual_revenue_range" className="block text-sm font-medium text-gray-700">
              Annual Revenue
            </label>
            <select
              id="annual_revenue_range"
              value={formData.annual_revenue_range || ''}
              onChange={(e) => updateField('annual_revenue_range', e.target.value)}
              className="mt-1 block w-full admin-select"
            >
              <option value="">Select range</option>
              {revenueRanges.map((range) => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => updateField('description', e.target.value)}
              className="mt-1 block w-full admin-textarea"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="key_differentiators" className="block text-sm font-medium text-gray-700">
              Key Differentiators
            </label>
            <textarea
              id="key_differentiators"
              rows={3}
              value={formData.key_differentiators || ''}
              onChange={(e) => updateField('key_differentiators', e.target.value)}
              className="mt-1 block w-full admin-textarea"
            />
          </div>
        </div>
      </div>

      {/* Facilities Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Facilities</h2>
          <button
            type="button"
            onClick={addFacility}
            className="admin-btn-secondary inline-flex items-center gap-2 px-3 py-2"
          >
            <Plus className="h-4 w-4" />
            Add Facility
          </button>
        </div>

        <div className="space-y-6">
          {locationsError && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {locationsError}. You can still enter countries and regions manually.
            </div>
          )}
          {formData.facilities?.map((facility, index) => {
            const selectedCountryCode = normalizeCountryCode(facility.country_code || facility.country) || ''
            const stateOptions = facilityStateOptions[index] || []
            const showCountrySelect = countries.length > 0 && !locationsError

            return (
            <div key={index} className="glass-card p-4 relative">
              <button
                type="button"
                onClick={() => removeFacility(index)}
                className="admin-btn-danger absolute top-3 right-3 inline-flex items-center justify-center p-2"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Facility Type</label>
                  <select
                    value={facility.facility_type}
                    onChange={(e) => updateFacility(index, 'facility_type', e.target.value)}
                    className="mt-1 block w-full admin-select"
                  >
                    {facilityTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={facility.is_primary || false}
                      onChange={(e) => updateFacility(index, 'is_primary', e.target.checked)}
                      className="admin-checkbox"
                    />
                    <span className="text-sm font-medium text-gray-700">Primary Location</span>
                  </label>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Street Address</label>
                  <input
                    type="text"
                    value={facility.street_address || ''}
                    onChange={(e) => updateFacility(index, 'street_address', e.target.value)}
                    className="mt-1 block w-full admin-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    value={facility.city || ''}
                    onChange={(e) => updateFacility(index, 'city', e.target.value)}
                    className="mt-1 block w-full admin-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Country</label>
                  {showCountrySelect ? (
                    <select
                      value={selectedCountryCode}
                      onChange={(e) => handleCountryChange(index, e.target.value)}
                      className="mt-1 block w-full admin-select"
                      disabled={locationsLoading}
                    >
                      <option value="">{locationsLoading ? 'Loading countries...' : 'Select country'}</option>
                      {countries.map((country) => (
                        <option key={country.iso2} value={country.iso2}>
                          {country.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={facility.country || ''}
                      onChange={(e) => handleCountryInput(index, e.target.value)}
                      className="mt-1 block w-full admin-input"
                      placeholder="United States"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">State/Province</label>
                  {stateOptions.length > 0 ? (
                    <select
                      value={facility.state_code || ''}
                      onChange={(e) => {
                        const option = stateOptions.find((state) => state.code === e.target.value)
                        handleStateSelect(index, e.target.value, option?.name)
                      }}
                      className="mt-1 block w-full admin-select"
                      disabled={locationsLoading}
                    >
                      <option value="">Select state/province</option>
                      {stateOptions.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      maxLength={50}
                      placeholder="CA, TX, Ontario, Bayern, etc."
                      value={facility.state_province || ''}
                      onChange={(e) => handleCustomStateChange(index, e.target.value)}
                      className="mt-1 block w-full admin-input"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP/Postal Code</label>
                  <input
                    type="text"
                    value={facility.postal_code || facility.zip_code || ''}
                    onChange={(e) => {
                      updateFacility(index, 'postal_code', e.target.value)
                    }}
                    className="mt-1 block w-full admin-input"
                  />
                </div>
              </div>
            </div>
          )})}

          {(!formData.facilities || formData.facilities.length === 0) && (
            <p className="text-center text-gray-500 py-4">No facilities added yet</p>
          )}
        </div>
      </div>

      {/* Capabilities Section */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Capabilities</h2>

        <div className="space-y-6">
          {/* PCB Assembly */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">PCB Assembly</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.pcb_assembly_smt || false}
                  onChange={(e) => updateCapability('pcb_assembly_smt', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">SMT</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.pcb_assembly_through_hole || false}
                  onChange={(e) => updateCapability('pcb_assembly_through_hole', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Through-Hole</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.pcb_assembly_mixed || false}
                  onChange={(e) => updateCapability('pcb_assembly_mixed', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Mixed Technology</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.pcb_assembly_fine_pitch || false}
                  onChange={(e) => updateCapability('pcb_assembly_fine_pitch', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Fine Pitch</span>
              </label>
            </div>
          </div>

          {/* Other Manufacturing */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Other Manufacturing</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.cable_harness_assembly || false}
                  onChange={(e) => updateCapability('cable_harness_assembly', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Cable/Harness</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.box_build_assembly || false}
                  onChange={(e) => updateCapability('box_build_assembly', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Box Build</span>
              </label>
            </div>
          </div>

          {/* Testing */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Testing</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.testing_ict || false}
                  onChange={(e) => updateCapability('testing_ict', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">ICT</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.testing_functional || false}
                  onChange={(e) => updateCapability('testing_functional', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Functional</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.testing_environmental || false}
                  onChange={(e) => updateCapability('testing_environmental', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Environmental</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.testing_rf_wireless || false}
                  onChange={(e) => updateCapability('testing_rf_wireless', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">RF/Wireless</span>
              </label>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Services</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.design_services || false}
                  onChange={(e) => updateCapability('design_services', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Design Services</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.supply_chain_management || false}
                  onChange={(e) => updateCapability('supply_chain_management', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Supply Chain</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.prototyping || false}
                  onChange={(e) => updateCapability('prototyping', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Prototyping</span>
              </label>
            </div>
          </div>

          {/* Volume */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Production Volume</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.low_volume_production || false}
                  onChange={(e) => updateCapability('low_volume_production', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Low Volume</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.medium_volume_production || false}
                  onChange={(e) => updateCapability('medium_volume_production', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Medium Volume</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.high_volume_production || false}
                  onChange={(e) => updateCapability('high_volume_production', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">High Volume</span>
              </label>
            </div>
          </div>

          {/* Service Models */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Service Models</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.turnkey_services || false}
                  onChange={(e) => updateCapability('turnkey_services', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Turnkey</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.capabilities?.consigned_services || false}
                  onChange={(e) => updateCapability('consigned_services', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Consigned</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Industries Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Industries Served</h2>
          <button
            type="button"
            onClick={addIndustry}
            className="admin-btn-secondary inline-flex items-center gap-2 px-3 py-2"
          >
            <Plus className="h-4 w-4" />
            Add Industry
          </button>
        </div>

        <div className="space-y-3">
          {formData.industries?.map((industry, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="text"
                value={industry.industry_name}
                onChange={(e) => updateIndustry(index, e.target.value)}
                placeholder="e.g., Aerospace, Medical, Automotive"
                className="flex-1 admin-input"
              />
              <button
                type="button"
                onClick={() => removeIndustry(index)}
                className="admin-btn-danger inline-flex items-center justify-center p-2"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}

          {(!formData.industries || formData.industries.length === 0) && (
            <p className="text-center text-gray-500 py-4">No industries added yet</p>
          )}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Certifications</h2>
          <button
            type="button"
            onClick={addCertification}
            className="admin-btn-secondary inline-flex items-center gap-2 px-3 py-2"
          >
            <Plus className="h-4 w-4" />
            Add Certification
          </button>
        </div>

        <div className="space-y-6">
          {formData.certifications?.map((cert, index) => (
            <div key={index} className="glass-card p-4 relative">
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="admin-btn-danger absolute top-3 right-3 inline-flex items-center justify-center p-2"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Certification Type</label>
                  <input
                    type="text"
                    value={cert.certification_type}
                    onChange={(e) => updateCertification(index, 'certification_type', e.target.value)}
                    placeholder="e.g., ISO 9001, AS9100, IPC-A-610"
                    className="mt-1 block w-full admin-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Certificate Number</label>
                  <input
                    type="text"
                    value={cert.certificate_number || ''}
                    onChange={(e) => updateCertification(index, 'certificate_number', e.target.value)}
                    className="mt-1 block w-full admin-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select
                    value={cert.status || 'Active'}
                    onChange={(e) => updateCertification(index, 'status', e.target.value as 'Active' | 'Expired' | 'Pending')}
                    className="mt-1 block w-full admin-select"
                  >
                    {certificationStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Issued Date</label>
                  <input
                    type="date"
                    value={cert.issued_date || ''}
                    onChange={(e) => updateCertification(index, 'issued_date', e.target.value)}
                    className="mt-1 block w-full admin-input"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expiration Date</label>
                  <input
                    type="date"
                    value={cert.expiration_date || ''}
                    onChange={(e) => updateCertification(index, 'expiration_date', e.target.value)}
                    className="mt-1 block w-full admin-input"
                  />
                </div>
              </div>
            </div>
          ))}

          {(!formData.certifications || formData.certifications.length === 0) && (
            <p className="text-center text-gray-500 py-4">No certifications added yet</p>
          )}
        </div>
      </div>

      {/* Technical Specs Section */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Technical Specifications (Optional)</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Smallest Component Size</label>
            <input
              type="text"
              value={formData.technical_specs?.smallest_component_size || ''}
              onChange={(e) => updateTechnicalSpec('smallest_component_size', e.target.value)}
              placeholder="e.g., 0201, 0402"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Finest Pitch Capability</label>
            <input
              type="text"
              value={formData.technical_specs?.finest_pitch_capability || ''}
              onChange={(e) => updateTechnicalSpec('finest_pitch_capability', e.target.value)}
              placeholder="e.g., 0.3mm, 0.4mm"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max PCB Size (inches)</label>
            <input
              type="text"
              value={formData.technical_specs?.max_pcb_size_inches || ''}
              onChange={(e) => updateTechnicalSpec('max_pcb_size_inches', e.target.value)}
              placeholder="e.g., 24x24"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Max PCB Layers</label>
            <input
              type="number"
              value={formData.technical_specs?.max_pcb_layers || ''}
              onChange={(e) => updateTechnicalSpec('max_pcb_layers', parseInt(e.target.value) || undefined)}
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Clean Room Class</label>
            <input
              type="text"
              value={formData.technical_specs?.clean_room_class || ''}
              onChange={(e) => updateTechnicalSpec('clean_room_class', e.target.value)}
              placeholder="e.g., Class 100, ISO 7"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div className="sm:col-span-2">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Process Capabilities</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_specs?.lead_free_soldering || false}
                  onChange={(e) => updateTechnicalSpec('lead_free_soldering', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Lead-Free Soldering</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_specs?.conformal_coating || false}
                  onChange={(e) => updateTechnicalSpec('conformal_coating', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Conformal Coating</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_specs?.potting_encapsulation || false}
                  onChange={(e) => updateTechnicalSpec('potting_encapsulation', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Potting/Encapsulation</span>
              </label>
            </div>
          </div>

          <div className="sm:col-span-2">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Inspection/Testing</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_specs?.x_ray_inspection || false}
                  onChange={(e) => updateTechnicalSpec('x_ray_inspection', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">X-Ray</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_specs?.aoi_inspection || false}
                  onChange={(e) => updateTechnicalSpec('aoi_inspection', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">AOI</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_specs?.flying_probe_testing || false}
                  onChange={(e) => updateTechnicalSpec('flying_probe_testing', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Flying Probe</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.technical_specs?.burn_in_testing || false}
                  onChange={(e) => updateTechnicalSpec('burn_in_testing', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Burn-In</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Business Info Section */}
      <div className="glass-card p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Business Information (Optional)</h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Minimum Order Quantity</label>
            <input
              type="text"
              value={formData.business_info?.min_order_qty || ''}
              onChange={(e) => updateBusinessInfo('min_order_qty', e.target.value)}
              placeholder="e.g., 100 units"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Prototype Lead Time</label>
            <input
              type="text"
              value={formData.business_info?.prototype_lead_time || ''}
              onChange={(e) => updateBusinessInfo('prototype_lead_time', e.target.value)}
              placeholder="e.g., 2-3 weeks"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Production Lead Time</label>
            <input
              type="text"
              value={formData.business_info?.production_lead_time || ''}
              onChange={(e) => updateBusinessInfo('production_lead_time', e.target.value)}
              placeholder="e.g., 4-6 weeks"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Payment Terms</label>
            <input
              type="text"
              value={formData.business_info?.payment_terms || ''}
              onChange={(e) => updateBusinessInfo('payment_terms', e.target.value)}
              placeholder="e.g., Net 30"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Engineering Support Hours</label>
            <input
              type="text"
              value={formData.business_info?.engineering_support_hours || ''}
              onChange={(e) => updateBusinessInfo('engineering_support_hours', e.target.value)}
              placeholder="e.g., 8am-6pm EST"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Sales Territory</label>
            <input
              type="text"
              value={formData.business_info?.sales_territory || ''}
              onChange={(e) => updateBusinessInfo('sales_territory', e.target.value)}
              placeholder="e.g., North America, Global"
              className="mt-1 block w-full admin-input"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Notable Customers</label>
            <textarea
              rows={2}
              value={formData.business_info?.notable_customers || ''}
              onChange={(e) => updateBusinessInfo('notable_customers', e.target.value)}
              placeholder="List notable customers (if allowed to disclose)"
              className="mt-1 block w-full admin-textarea"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">Awards & Recognition</label>
            <textarea
              rows={2}
              value={formData.business_info?.awards_recognition || ''}
              onChange={(e) => updateBusinessInfo('awards_recognition', e.target.value)}
              placeholder="List any awards or industry recognition"
              className="mt-1 block w-full admin-textarea"
            />
          </div>

          <div className="sm:col-span-2">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Capabilities</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.business_info?.rush_order_capability || false}
                  onChange={(e) => updateBusinessInfo('rush_order_capability', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">Rush Order Capability</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.business_info?.twenty_four_seven_production || false}
                  onChange={(e) => updateBusinessInfo('twenty_four_seven_production', e.target.checked)}
                  className="admin-checkbox"
                />
                <span className="text-sm text-gray-700">24/7 Production</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="glass-card p-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push('/admin/companies')}
          disabled={loading}
          className="admin-btn-secondary px-4 py-2 disabled:opacity-50"
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => handleSubmit(true)}
            disabled={loading}
            className="admin-btn-secondary px-4 py-2 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save as Draft'}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit(false)}
            disabled={loading}
            className="admin-btn-primary px-4 py-2 disabled:opacity-50"
          >
            {loading ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </div>
    </form>
  )
}
