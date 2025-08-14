import { supabase } from "@/lib/supabase"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { Company } from "@/types/company"

// Extended types for additional fields not in your current types file
interface Contact {
  id: string
  contact_type: string
  full_name?: string
  title?: string
  email?: string
  phone?: string
}

interface BusinessInfo {
  id: string
  min_order_qty?: string
  prototype_lead_time?: string
  production_lead_time?: string
  payment_terms?: string
}

interface TechnicalSpec {
  id: string
  min_pcb_trace_width?: string
  max_pcb_layers?: number
  max_board_size?: string
  smt_placement_accuracy?: string
}

// Extended Company type with additional relations
interface CompanyWithRelations extends Company {
  contacts?: Contact[]
  business_info?: BusinessInfo[]
  technical_specs?: TechnicalSpec[]
  dba_name?: string
  year_founded?: number
  annual_revenue_range?: string
  website_url?: string
}

// Ad Placeholder Component
const AdPlaceholder = ({
  width,
  height,
  label,
  className = "",
}: {
  width: string
  height: string
  label: string
  className?: string
}) => (
  <div
    className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
    style={{ width, height }}
  >
    <div className="text-center text-gray-500">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-1">
        {width} × {height}
      </div>
      <div className="text-xs text-gray-400 mt-1">Advertisement</div>
    </div>
  </div>
)

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  // Await the params
  const { slug } = await params

  const { data: company } = await supabase
    .from("companies")
    .select(`
      *,
      facilities (*),
      capabilities (*),
      industries (industry_name),
      certifications (certification_type, status, expiration_date),
      technical_specs (*),
      business_info (*),
      contacts (*)
    `)
    .eq("slug", slug)
    .single<CompanyWithRelations>()

  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=1200')] opacity-5"></div>

        <div className="relative container mx-auto px-4 py-8">
          <Link
            href="/"
            className="inline-flex items-center text-blue-200 hover:text-white mb-4 transition-colors duration-200 group"
          >
            <svg
              className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Directory
          </Link>

          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-1 leading-tight">{company.company_name}</h1>
                  {company.dba_name && <p className="text-lg text-blue-200 mb-1">DBA: {company.dba_name}</p>}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-200 border border-green-400/30">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></div>
                      Verified Manufacturer
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:w-auto w-full">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20 hover:bg-white/15 transition-all duration-200">
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
      </div>

      <div className="container mx-auto px-4 pt-4">
        <div className="flex justify-center mb-4">
          <AdPlaceholder width="728px" height="90px" label="Header Banner" className="hidden md:block" />
          <AdPlaceholder width="320px" height="50px" label="Mobile Banner" className="md:hidden" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-900">Company Overview</h2>
              </div>

              {company.description && <p className="text-gray-700 mb-4 leading-relaxed">{company.description}</p>}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3a4 4 0 118 0v4m-4 8a4 4 0 11-8 0v-4h8v4z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Founded</p>
                    <p className="font-semibold text-gray-900">{company.year_founded || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Annual Revenue</p>
                    <p className="font-semibold text-gray-900">{company.annual_revenue_range || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Team Size</p>
                    <p className="font-semibold text-gray-900">{company.employee_count_range || "N/A"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">Website</p>
                    {company.website_url ? (
                      <a
                        href={company.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Visit Site →
                      </a>
                    ) : (
                      <p className="font-semibold text-gray-900">N/A</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {company.capabilities && company.capabilities.length > 0 && company.capabilities[0] && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Manufacturing Capabilities</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {company.capabilities[0].pcb_assembly_smt && (
                    <div className="group bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-sm">PCB Assembly - SMT</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].pcb_assembly_through_hole && (
                    <div className="group bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-sm">Through Hole Assembly</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].pcb_assembly_fine_pitch && (
                    <div className="group bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 text-blue-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        <span className="font-medium text-sm">Fine Pitch Assembly</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].cable_harness_assembly && (
                    <div className="group bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border border-indigo-200 text-indigo-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <span className="font-medium text-sm">Cable/Harness Assembly</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].box_build_assembly && (
                    <div className="group bg-gradient-to-r from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border border-indigo-200 text-indigo-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                        <span className="font-medium text-sm">Box Build Assembly</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].prototyping && (
                    <div className="group bg-gradient-to-r from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border border-green-200 text-green-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        <span className="font-medium text-sm">Prototyping Services</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].low_volume_production && (
                    <div className="group bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-sm">Low Volume Production</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].medium_volume_production && (
                    <div className="group bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-sm">Medium Volume Production</span>
                      </div>
                    </div>
                  )}
                  {company.capabilities[0].high_volume_production && (
                    <div className="group bg-gradient-to-r from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border border-purple-200 text-purple-800 px-3 py-2 rounded-xl transition-all duration-200 cursor-default">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                        <span className="font-medium text-sm">High Volume Production</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {company.industries && company.industries.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-6 4h6"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Industry Specializations</h2>
                </div>

                <div className="flex flex-wrap gap-2">
                  {company.industries.map((ind, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 rounded-xl font-medium transition-all duration-200 cursor-default text-sm"
                    >
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full mr-2"></div>
                      {ind.industry_name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {company.certifications && company.certifications.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-7 h-7 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Certifications & Standards</h2>
                </div>

                <div className="space-y-3">
                  {company.certifications.map((cert, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-2.5 h-2.5 rounded-full ${cert.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                        ></div>
                        <span className="font-semibold text-gray-900">{cert.certification_type}</span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            cert.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {cert.status}
                        </span>
                        {cert.expiration_date && (
                          <p className="text-xs text-gray-500 mt-1">Expires: {cert.expiration_date}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-3 h-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-900">Locations</h3>
              </div>

              {company.facilities && company.facilities.length > 0 ? (
                <div className="space-y-2">
                  {company.facilities.map((facility, index) => (
                    <div
                      key={index}
                      className="p-2.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <p className="font-semibold text-gray-900 text-sm">
                        {facility.facility_type || "Manufacturing Facility"}
                      </p>
                      <p className="text-gray-600 text-sm flex items-center gap-1 mt-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                        </svg>
                        {facility.city}, {facility.state} {facility.zip_code}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No location information available</p>
              )}
            </div>

            {company.contacts && company.contacts.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Contact Information</h3>
                </div>

                <div className="space-y-3">
                  {company.contacts.map((contact, index) => (
                    <div
                      key={index}
                      className="p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200"
                    >
                      <p className="font-semibold text-gray-900 text-sm mb-1">{contact.contact_type}</p>
                      {contact.full_name && <p className="text-gray-700 text-sm">{contact.full_name}</p>}
                      {contact.title && <p className="text-xs text-gray-500 mb-1">{contact.title}</p>}
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm transition-colors duration-200"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <p className="text-sm text-gray-700 flex items-center gap-1 mt-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                            />
                          </svg>
                          {contact.phone}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {company.business_info && company.business_info.length > 0 && company.business_info[0] && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Business Terms</h3>
                </div>

                <div className="space-y-2">
                  {company.business_info[0].min_order_qty && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">MOQ</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.business_info[0].min_order_qty}
                      </span>
                    </div>
                  )}
                  {company.business_info[0].prototype_lead_time && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Prototype Lead</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.business_info[0].prototype_lead_time}
                      </span>
                    </div>
                  )}
                  {company.business_info[0].production_lead_time && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Production Lead</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.business_info[0].production_lead_time}
                      </span>
                    </div>
                  )}
                  {company.business_info[0].payment_terms && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Payment Terms</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.business_info[0].payment_terms}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {company.technical_specs && company.technical_specs.length > 0 && company.technical_specs[0] && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-4 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-3 h-3 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Technical Specifications</h3>
                </div>

                <div className="space-y-2">
                  {company.technical_specs[0].min_pcb_trace_width && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Min Trace Width</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.technical_specs[0].min_pcb_trace_width}
                      </span>
                    </div>
                  )}
                  {company.technical_specs[0].max_pcb_layers && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Max PCB Layers</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.technical_specs[0].max_pcb_layers}
                      </span>
                    </div>
                  )}
                  {company.technical_specs[0].max_board_size && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">Max Board Size</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.technical_specs[0].max_board_size}
                      </span>
                    </div>
                  )}
                  {company.technical_specs[0].smt_placement_accuracy && (
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm font-medium text-gray-600">SMT Accuracy</span>
                      <span className="text-sm font-semibold text-gray-900">
                        {company.technical_specs[0].smt_placement_accuracy}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
          </div>
        </div>

        <div className="flex justify-center mt-8 pt-6 border-t border-gray-200">
          <AdPlaceholder width="728px" height="90px" label="Footer Banner" className="hidden md:block" />
          <AdPlaceholder width="320px" height="50px" label="Mobile Footer" className="md:hidden" />
        </div>
      </div>
    </div>
  )
}
