import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { getCanonicalUrl, siteConfig } from "@/lib/config"
import { CERTIFICATION_DIRECTORY } from "@/lib/certifications-data"
import { supabase } from "@/lib/supabase"
import type { Company } from "@/types/company"
import Navbar from "@/components/navbar"

const siteName = siteConfig.name

export async function generateStaticParams() {
  return Object.keys(CERTIFICATION_DIRECTORY).map(certification => ({
    certification
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ certification: string }> 
}): Promise<Metadata> {
  const { certification } = await params
  const certData = CERTIFICATION_DIRECTORY[certification]
  
  if (!certData) {
    return {
      title: `Certification Not Found | ${siteName}`,
      description: 'The requested certification page could not be found.'
    }
  }
  
  const pageUrl = getCanonicalUrl(`/certifications/${certification}`)

  return {
    title: certData.title,
    description: `Find ${certData.name} certified contract manufacturers. ${certData.description}. Browse verified manufacturers with active certifications.`,
    openGraph: {
      title: certData.title,
      description: certData.description,
      type: 'website',
      url: pageUrl,
      siteName: siteConfig.name,
      images: [
        {
          url: siteConfig.ogImage,
          alt: certData.title,
        },
      ],
    },
    alternates: {
      canonical: pageUrl,
    },
  }
}

export default async function CertificationPage({
  params,
  searchParams,
}: {
  params: Promise<{ certification: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ certification }, sp] = await Promise.all([params, searchParams])
  const initialFilters = parseFiltersFromSearchParams(sp)
  const certData = CERTIFICATION_DIRECTORY[certification]
  
  if (!certData) {
    notFound()
  }
  
  // Fetch companies with this certification
  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      *,
      certifications!inner (*),
      capabilities (*),
      facilities (*),
      industries (industry_name)
    `)
    .eq('certifications.certification_type', certData.dbName)
    .eq('certifications.status', 'Active')
    .eq('is_active', true)
  
  if (error) {
    console.error('Failed to fetch companies:', error)
  }
  
  const typedCompanies = companies as Company[] | null
  return (
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-12">
            <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/certifications" className="hover:text-white">Certifications</Link>
              <span>/</span>
              <span className="text-white">{certData.name}</span>
            </nav>
            
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl font-semibold">
                {certData.name.split(" ")[0]}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-3">{certData.title}</h1>
                <p className="text-xl text-blue-100 max-w-3xl">{certData.description}</p>
              </div>
            </div>
            
            <div className="mt-8 flex gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-2xl font-bold">{typedCompanies?.length || 0}</span>
                <span className="text-blue-100 ml-2">Certified Manufacturers</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
                <span className="text-sm text-blue-100">Industry Focus:</span>
                <span className="text-white font-semibold ml-2">{certData.industry}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* SEO Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">About {certData.name} Certification</h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                {certData.description}. This certification is essential for manufacturers
                serving the {certData.industry.toLowerCase()} sector.
              </p>
              <h3 className="text-lg font-semibold mt-6 mb-3">Why Choose {certData.name} Certified Manufacturers?</h3>
              <p>
                Working with {certData.name} certified contract manufacturers ensures compliance
                with industry standards, quality consistency, and regulatory requirements.
              </p>
            </div>
          </div>
          
          {/* Company Listings */}
          <h2 className="text-2xl font-bold mb-6">
            {certData.name} Certified Manufacturers
          </h2>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <FilterSidebar allCompanies={typedCompanies || []} />
            </div>
            <div className="lg:col-span-8">
              <CompanyList allCompanies={typedCompanies || []} />
            </div>
          </div>
        </div>
      </div>
    </FilterProvider>
  )
}
