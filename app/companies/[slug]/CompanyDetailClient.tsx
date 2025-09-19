"use client"

import { useState } from 'react'
import Link from "next/link"
import { Building2, MapPin, Globe, Award, Users, Briefcase, ArrowLeft } from 'lucide-react'
import type { Company } from '@/types/company'
import CompanyHeader from '@/components/CompanyHeader'

interface CompanyDetailClientProps {
  company: Company
  showBackButton?: boolean
}

export default function CompanyDetailClient({ company, showBackButton = true }: CompanyDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'capabilities' | 'certifications'>('overview')

  // Safely access properties with optional chaining
  const primaryFacility = company?.facilities?.[0]
  const capabilities = company?.capabilities?.[0]
  const companyName = company?.company_name

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header with shared styling */}
      <CompanyHeader />

      {/* Company Info Section */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
            {showBackButton && (
            <Link
                href="/"
                className="inline-flex items-center gap-2 text-black/80 hover:text-grey transition-colors mb-4 text-sm"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Directory
            </Link>
            )}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Building2 className="w-10 h-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-1 leading-tight">{company.company_name}</h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700 border border-green-400/30">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                      Verified Manufacturer
                    </span>
                  </div>
                </div>
            </div>
        </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:w-auto w-full">
              <div className="bg-blue/10 backdrop-blur-sm rounded-xl p-3 border border-blue/20 hover:bg-blue/15 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wide">Location</p>
                    <p className="font-semibold text-sm">
                      {company.facilities?.[0]
                        ? `${company.facilities[0].city}, ${company.facilities[0].state}`
                        : "Multiple"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all duration-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wide">Employees</p>
                    <p className="font-semibold text-sm">{company.employee_count_range || "N/A"}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all duration-200 col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-blue-200 uppercase tracking-wide">Founded</p>
                    <p className="font-semibold text-sm">{company.year_founded || "N/A"}</p>
                  </div>
                </div>
              </div>
            </div>
            </div>
        </div>

            

      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('capabilities')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'capabilities'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Capabilities
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`py-4 px-2 border-b-2 transition-colors ${
                activeTab === 'certifications'
                  ? 'border-blue-600 text-blue-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Certifications
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === 'overview' && (
              <>
                {/* Description */}
                {company?.description && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                    <p className="text-gray-600 leading-relaxed">{company.description}</p>
                  </div>
                )}

                {/* Industries */}
                {company?.industries && Array.isArray(company.industries) && company.industries.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Briefcase className="w-5 h-5" />
                      Industries Served
                    </h2>
                    <div className="flex flex-wrap gap-2">
                      {company.industries.map((industry, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                        >
                          {industry?.industry_name || 'Industry'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                {company?.facilities && Array.isArray(company.facilities) && company.facilities.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Facilities
                    </h2>
                    <div className="space-y-4">
                      {company.facilities.map((facility, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4">
                          <h3 className="font-semibold text-gray-900">
                            {facility?.facility_type || 'Manufacturing Facility'}
                          </h3>
                          {facility?.street_address && (
                            <p className="text-gray-600">
                              {facility.street_address}
                            </p>
                          )}
                          {(facility?.city || facility?.state) && (
                            <p className="text-gray-600">
                              {facility?.city}{facility?.city && facility?.state && ', '}{facility?.state} {facility?.zip_code}
                            </p>
                          )}
                          {facility?.facility_size_sqft && (
                            <p className="text-sm text-gray-500 mt-1">
                              {Number(facility.facility_size_sqft).toLocaleString()} sq ft
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'capabilities' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Manufacturing Capabilities</h2>
                {capabilities && Object.keys(capabilities).length > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(capabilities).map(([key, value]) => {
                      // Skip ID fields and false/null values
                      if (key === 'id' || key === 'company_id' || key.includes('_id') || key === 'created_at' || value === false || value === null || value === undefined) {
                        return null
                      }
                      // Only show true boolean values or string values
                      if (value === true || (typeof value === 'string' && value.length > 0)) {
                        const label = key
                          .replace(/_/g, ' ')
                          .replace(/\b\w/g, (l: string) => l.toUpperCase())
                        return (
                          <div key={key} className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span className="text-gray-700">{label}</span>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No capability information available.</p>
                )}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Certifications
                </h2>
                {company?.certifications && Array.isArray(company.certifications) && company.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.certifications.map((cert, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900">
                          {cert?.certification_type || 'Certification'}
                        </h3>
                        {cert?.issuing_body && (
                          <p className="text-sm text-gray-600 mt-1">Issued by: {cert.issuing_body}</p>
                        )}
                        {cert?.issued_date && (
                          <p className="text-sm text-gray-500 mt-1">
                            Issued: {new Date(cert.issued_date).toLocaleDateString()}
                          </p>
                        )}
                        {cert?.status === 'Active' && (
                          <span className="inline-block mt-2 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Active
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No certification information available.</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
              <div className="space-y-3">
                {company?.website_url && (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-gray-600 hover:text-blue-600"
                  >
                    <Globe className="w-4 h-4" />
                    <span >Visit Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Facts</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium text-gray-900">Active</p>
                </div>
                {company?.year_founded && (
                  <div>
                    <p className="text-sm text-gray-500">Founded</p>
                    <p className="font-medium text-gray-900">{company.year_founded}</p>
                  </div>
                )}
                {company?.facilities && Array.isArray(company.facilities) && (
                  <div>
                    <p className="text-sm text-gray-500">Facilities</p>
                    <p className="font-medium text-gray-900">{company.facilities.length} location(s)</p>
                  </div>
                )}
                {company?.certifications && Array.isArray(company.certifications) && (
                  <div>
                    <p className="text-sm text-gray-500">Certifications</p>
                    <p className="font-medium text-gray-900">{company.certifications.length}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}