"use client"

import { useState } from 'react'
import { Building2, Globe, Users, Calendar, DollarSign, CheckCircle, MapPin } from 'lucide-react'
import type { Company } from '@/types/company'
import CompanyHeader from '@/components/CompanyHeader'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import ClaimEditSection from '@/components/ClaimEditSection'


interface CompanyDetailClientProps {
  company: Company
  showBackButton?: boolean
}

export default function CompanyDetailClient({ company }: CompanyDetailClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'capabilities' | 'certifications' | 'technical'>('overview')

  // Safely access properties with optional chaining
  const capabilities = company?.capabilities?.[0]
  const companyName = company?.company_name

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Company Header with shared styling */}
        <CompanyHeader />
      {/* Hero Header Section */}
      <div className="bg-gradient-to-br from-white-600 via-white-700 to-white-800">
        <div className="container mx-auto px-4 py-6">
          <Breadcrumbs 
          items={[
            { name: 'Home', url: '/' },
            { name: company.company_name, url: `/companies/${company.slug}` }
          ]}
          className="mb-6 text-blue-100" // For dark backgrounds
        />
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-blue-500 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-8">
                  <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">{companyName} </h1>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-700 border border-green-400/30">
                    <CheckCircle className="w-3 h-3 mr-1.5" />
                    Verified Manufacturer
                  </span>
                </div>
                {company.facilities?.[0] && (
                    <span className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-3.5 h-3.5 mr-1" />
                      {company.facilities[0].city}, {company.facilities[0].state}
                    </span>
                  )}
              </div>
            </div>
          </div>

          {/* Quick Stats Grid
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-500/80 backdrop-blur-sm rounded-xl p-4 border border-blue-300">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">Location</p>
                  <p className="font-semibold text-white">
                    {company.facilities?.[0]
                      ? `${company.facilities[0].city}, ${company.facilities[0].state}`
                      : "Multiple"}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/80 backdrop-blur-sm rounded-xl p-4 border border-blue-300">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">Team Size</p>
                  <p className="font-semibold text-white">{company.employee_count_range || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/80 backdrop-blur-sm rounded-xl p-4 border border-blue-300">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">Founded</p>
                  <p className="font-semibold text-white">{company.year_founded || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="bg-blue-500/80 backdrop-blur-sm rounded-xl p-4 border border-blue-300">
              <div className="flex items-center gap-3">
                <Award className="w-5 h-5 text-white/70" />
                <div>
                  <p className="text-xs text-white/70 uppercase tracking-wide">Certifications</p>
                  <p className="font-semibold text-white">
                    {company?.certifications?.length || 0} Active
                  </p>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </div> 
    
      
      {/* Tabs */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex gap-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-2 border-b-2 transition-colors font-medium whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('capabilities')}
              className={`py-4 px-2 border-b-2 transition-colors font-medium whitespace-nowrap ${
                activeTab === 'capabilities'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Capabilities
            </button>
            <button
              onClick={() => setActiveTab('certifications')}
              className={`py-4 px-2 border-b-2 transition-colors font-medium whitespace-nowrap ${
                activeTab === 'certifications'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Certifications
            </button>
            <button
              onClick={() => setActiveTab('technical')}
              className={`py-4 px-2 border-b-2 transition-colors font-medium whitespace-nowrap ${
                activeTab === 'technical'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Technical Specs
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
                {/* Company Overview */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Company Overview</h2>
                  
                  {company?.description ? (
                    <p className="text-gray-700 leading-relaxed mb-6">{company.description}</p>
                  ) : (
                    <p className="text-gray-500 mb-6">No description available.</p>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company?.year_founded && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Calendar className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="text-sm text-gray-500">Founded</p>
                          <p className="font-semibold text-gray-900">{company.year_founded}</p>
                        </div>
                      </div>
                    )}

                    {company?.annual_revenue_range && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <DollarSign className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="text-sm text-gray-500">Annual Revenue</p>
                          <p className="font-semibold text-gray-900">{company.annual_revenue_range}</p>
                        </div>
                      </div>
                    )}

                    {company?.employee_count_range && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-500">Team Size</p>
                          <p className="font-semibold text-gray-900">{company.employee_count_range} employees</p>
                        </div>
                      </div>
                    )}

                    {company?.website_url && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <Globe className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Website</p>
                          <a
                            href={company.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Visit Site →
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Industries */}
                {company?.industries && company.industries.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Industries Served</h2>
                    <div className="flex flex-wrap gap-2">
                      {company.industries.map((industry, index) => (
                        <span
                          key={index}
                          className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                        >
                          {industry?.industry_name || 'Industry'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Facilities */}
                {company?.facilities && company.facilities.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Facilities</h2>
                    <div className="space-y-4">
                      {company.facilities.map((facility, index) => (
                        <div key={index} className="border-l-4 border-blue-500 pl-4 py-1">
                          <h3 className="font-semibold text-gray-900">
                            {facility?.facility_type || 'Manufacturing Facility'}
                            {facility.is_primary && (
                              <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Primary</span>
                            )}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {facility.street_address}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {facility.city}, {facility.state} {facility.zip_code}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {activeTab === 'capabilities' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Manufacturing Capabilities</h2>
                {capabilities ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {capabilities.pcb_assembly_smt && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">SMT PCB Assembly</span>
                      </div>
                    )}
                    {capabilities.pcb_assembly_through_hole && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Through-Hole Assembly</span>
                      </div>
                    )}
                    {capabilities.pcb_assembly_fine_pitch && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Fine Pitch Assembly</span>
                      </div>
                    )}
                    {capabilities.cable_harness_assembly && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Cable & Harness Assembly</span>
                      </div>
                    )}
                    {capabilities.box_build_assembly && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Box Build Assembly</span>
                      </div>
                    )}
                    {capabilities.prototyping && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Prototyping Services</span>
                      </div>
                    )}
                    {capabilities.low_volume_production && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Low Volume Production</span>
                      </div>
                    )}
                    {capabilities.medium_volume_production && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">Medium Volume Production</span>
                      </div>
                    )}
                    {capabilities.high_volume_production && (
                      <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-700">High Volume Production</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No capability information available.</p>
                )}
              </div>
            )}

            {activeTab === 'certifications' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Certifications</h2>
                {company?.certifications && company.certifications.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {company.certifications.map((cert, index) => (
                      <div key={index} className="border border-gray-200 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {cert?.certification_type || 'Certification'}
                          </h3>
                          {cert?.status === 'Active' && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                              Active
                            </span>
                          )}
                        </div>
                        {cert?.certificate_number && (
                          <p className="text-sm text-gray-600">#{cert.certificate_number}</p>
                        )}
                        {cert?.expiration_date && (
                          <p className="text-sm text-gray-500 mt-2">
                            Expires: {new Date(cert.expiration_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No certification information available.</p>
                )}
              </div>
            )}

            {activeTab === 'technical' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                {company?.technical_specs && company.technical_specs.length > 0 && company.technical_specs[0] ? (
                  <div className="space-y-4">
                    {company.technical_specs[0] && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">Min PCB Trace Width</span>
                        <span className="font-semibold"></span>
                      </div>
                    )}
                    {company.technical_specs[0].max_pcb_layers && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">Max PCB Layers</span>
                        <span className="font-semibold">{company.technical_specs[0].max_pcb_layers}</span>
                      </div>
                    )}
                    {company.technical_specs[0].max_pcb_size_inches && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">Max Board Size</span>
                        <span className="font-semibold">{company.technical_specs[0].max_pcb_size_inches}</span>
                      </div>
                    )}
                    {company.technical_specs[0] && (
                      <div className="flex justify-between py-3 border-b">
                        <span className="text-gray-600">SMT Placement Accuracy</span>
                        <span className="font-semibold"></span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-500">No technical specifications available.</p>
                )}

                {company?.business_info && company.business_info.length > 0 && company.business_info[0] && (
                  <div className="mt-8">
                    <h3 className="font-semibold text-gray-900 mb-4">Business Information</h3>
                    <div className="space-y-3">
                      {company.business_info[0].min_order_qty && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600 text-sm">Minimum Order</span>
                          <span className="text-sm font-semibold">{company.business_info[0].min_order_qty}</span>
                        </div>
                      )}
                      {company.business_info[0].prototype_lead_time && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600 text-sm">Prototype Lead Time</span>
                          <span className="text-sm font-semibold">{company.business_info[0].prototype_lead_time}</span>
                        </div>
                      )}
                      {company.business_info[0].production_lead_time && (
                        <div className="flex justify-between py-2 border-b">
                          <span className="text-gray-600 text-sm">Production Lead Time</span>
                          <span className="text-sm font-semibold">{company.business_info[0].production_lead_time}</span>
                        </div>
                      )}
                      {company.business_info[0].payment_terms && (
                        <div className="flex justify-between py-2">
                          <span className="text-gray-600 text-sm">Payment Terms</span>
                          <span className="text-sm font-semibold">{company.business_info[0].payment_terms}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Key Differentiators */}
              {company?.key_differentiators && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                  <h3 className="font-bold text-gray-900 mb-3">Key Differentiators</h3>
                  <p className="text-sm text-gray-700">{company.key_differentiators}</p>
                </div>
              )}
            {/* Contact Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Get in Touch</h3>
              <div className="space-y-3">
                {company?.website_url && (
                  <a
                    href={company.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg text-blue-700 hover:bg-blue-100 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                    <span className="font-medium">Visit Website</span>
                  </a>
                )}
              </div>
            </div>

            {/* Quick Facts */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">Quick Facts</h3>
              <div className="pl-4 pr-4 space-y-1">
                <div className="flex justify-between items-center py-1 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Status</span>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
                {company?.year_founded && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Years in Business</span>
                    <span className="text-sm font-medium text-gray-900">
                      {new Date().getFullYear() - company.year_founded} years
                    </span>
                  </div>
                )}
                {company?.facilities && Array.isArray(company.facilities) && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Facilities</span>
                    <span className="text-sm font-medium text-gray-900">{company.facilities.length}</span>
                  </div>
                )}
                {company?.certifications && Array.isArray(company.certifications) && (
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <span className="text-sm text-gray-500">Certifications</span>
                    <span className="text-sm font-medium text-gray-900">{company.certifications.length}</span>
                  </div>
                )}
                {company?.industries && Array.isArray(company.industries) && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-sm text-gray-500">Industries</span>
                    <span className="text-sm font-medium text-gray-900">{company.industries.length}</span>
                  </div>
                )}
              </div>
            </div>
            

            {/* Company Highlights */}
            {(company?.capabilities?.[0]?.prototyping || company?.capabilities?.[0]?.low_volume_production) && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <h3 className="font-bold text-gray-900 mb-3">Specializations</h3>
                <div className="space-y-2">
                  {company?.capabilities?.[0]?.prototyping && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Prototyping Services</span>
                    </div>
                  )}
                  {company?.capabilities?.[0]?.low_volume_production && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">Low Volume Production</span>
                    </div>
                  )}
                  {company?.capabilities?.[0]?.high_volume_production && (
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">High Volume Production</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          <div className="lg:col-span-3 mt-8">
              {company.slug && (
                <ClaimEditSection
                  companyName={company.company_name}
                  companySlug={company.slug}
                />
                )}
              </div>
        </div>
      </div>
    </div>
  )
}