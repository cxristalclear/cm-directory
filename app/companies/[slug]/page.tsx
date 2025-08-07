import { supabase } from '@/lib/supabase'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function CompanyPage({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  // Await the params
  const { slug } = await params;
  
  const { data: company } = await supabase
    .from('companies')
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
    .eq('slug', slug)
    .single()

  if (!company) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/" className="text-blue-200 hover:text-white mb-4 inline-block">
            ← Back to Directory
          </Link>
          <h1 className="text-4xl font-bold">{company.company_name}</h1>
          {company.dba_name && (
            <p className="text-xl mt-2">DBA: {company.dba_name}</p>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Overview */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">Company Overview</h2>
              {company.description && (
                <p className="text-black mb-4">{company.description}</p>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-semibold">Founded:</span> {company.year_founded || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Employees:</span> {company.employee_count_range || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Revenue:</span> {company.annual_revenue_range || 'N/A'}
                </div>
                <div>
                  <span className="font-semibold">Website:</span>{' '}
                  <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Visit Site →
                  </a>
                </div>
              </div>
            </div>

            {/* Capabilities */}
            {company.capabilities?.[0] && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Manufacturing Capabilities</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {company.capabilities[0].pcb_assembly_smt && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded">PCB Assembly - SMT</span>
                  )}
                  {company.capabilities[0].pcb_assembly_through_hole && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded">Through Hole</span>
                  )}
                  {company.capabilities[0].pcb_assembly_fine_pitch && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded">Fine Pitch</span>
                  )}
                  {company.capabilities[0].cable_harness_assembly && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded">Cable/Harness</span>
                  )}
                  {company.capabilities[0].box_build_assembly && (
                    <span className="bg-blue-100 text-blue-800 px-3 py-2 rounded">Box Build</span>
                  )}
                  {company.capabilities[0].prototyping && (
                    <span className="bg-green-100 text-green-800 px-3 py-2 rounded">Prototyping</span>
                  )}
                  {company.capabilities[0].low_volume_production && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-2 rounded">Low Volume</span>
                  )}
                  {company.capabilities[0].medium_volume_production && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-2 rounded">Medium Volume</span>
                  )}
                  {company.capabilities[0].high_volume_production && (
                    <span className="bg-purple-100 text-purple-800 px-3 py-2 rounded">High Volume</span>
                  )}
                </div>
              </div>
            )}

            {/* Certifications */}
            {company.certifications && company.certifications.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Certifications</h2>
                <div className="space-y-2">
                  {company.certifications.map((cert: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="font-medium">{cert.certification_type}</span>
                      <span className={`text-sm ${cert.status === 'Active' ? 'text-green-600' : 'text-gray-500'}`}>
                        {cert.status} {cert.expiration_date && `(Expires: ${cert.expiration_date})`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Industries */}
            {company.industries && company.industries.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Industry Specializations</h2>
                <div className="flex flex-wrap gap-2">
                  {company.industries.map((ind: any, index: number) => (
                    <span key={index} className="bg-gray-100 text-black px-3 py-2 rounded">
                      {ind.industry_name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Locations */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-xl font-bold mb-4">Locations</h3>
              {company.facilities?.map((facility: any, index: number) => (
                <div key={index} className="mb-3">
                  <p className="font-semibold">{facility.facility_type || 'Facility'}</p>
                  <p className="text-black">
                    {facility.city}, {facility.state} {facility.zip_code}
                  </p>
                </div>
              ))}
            </div>

            {/* Contact */}
            {company.contacts && company.contacts.length > 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                {company.contacts.map((contact: any, index: number) => (
                  <div key={index} className="mb-4">
                    <p className="font-semibold">{contact.contact_type}</p>
                    {contact.full_name && <p>{contact.full_name}</p>}
                    {contact.title && <p className="text-sm text-black">{contact.title}</p>}
                    {contact.email && (
                      <a href={`mailto:${contact.email}`} className="text-blue-600 hover:underline text-sm">
                        {contact.email}
                      </a>
                    )}
                    {contact.phone && <p className="text-sm">{contact.phone}</p>}
                  </div>
                ))}
              </div>
            )}

            {/* Business Info */}
            {company.business_info?.[0] && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Business Terms</h3>
                <div className="space-y-2 text-sm">
                  {company.business_info[0].min_order_qty && (
                    <div>
                      <span className="font-semibold">MOQ:</span> {company.business_info[0].min_order_qty}
                    </div>
                  )}
                  {company.business_info[0].prototype_lead_time && (
                    <div>
                      <span className="font-semibold">Prototype Lead:</span> {company.business_info[0].prototype_lead_time}
                    </div>
                  )}
                  {company.business_info[0].production_lead_time && (
                    <div>
                      <span className="font-semibold">Production Lead:</span> {company.business_info[0].production_lead_time}
                    </div>
                  )}
                  {company.business_info[0].payment_terms && (
                    <div>
                      <span className="font-semibold">Payment Terms:</span> {company.business_info[0].payment_terms}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}