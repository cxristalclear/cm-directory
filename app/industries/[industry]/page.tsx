import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Briefcase } from "lucide-react"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import type { Company } from "@/types/company"

const INDUSTRY_DATA: Record<string, {
  name: string
  dbName: string
  title: string
  description: string
  requirements: string[]
}> = {
  'medical-devices': {
    name: 'Medical Devices',
    dbName: 'Medical Devices',
    title: 'Medical Device Contract Manufacturers',
    description: 'FDA-compliant manufacturing for medical devices and diagnostic equipment',
    requirements: ['ISO 13485', 'FDA Registration', 'Clean Room', 'Traceability']
  },
  'aerospace-defense': {
    name: 'Aerospace & Defense',
    dbName: 'Aerospace/Defense',
    title: 'Aerospace and Defense Manufacturers',
    description: 'AS9100 certified manufacturing for aviation and defense applications',
    requirements: ['AS9100', 'ITAR', 'NADCAP', 'First Article Inspection']
  },
  'automotive': {
    name: 'Automotive',
    dbName: 'Automotive',
    title: 'Automotive Electronics Manufacturers',
    description: 'IATF 16949 certified manufacturing for automotive electronics and components',
    requirements: ['IATF 16949', 'PPAP', 'APQP', 'Automotive Grade Components']
  },
  'industrial-controls': {
    name: 'Industrial Controls',
    dbName: 'Industrial Controls',
    title: 'Industrial Control System Manufacturers',
    description: 'Rugged electronics manufacturing for industrial automation and control systems',
    requirements: ['UL Certification', 'Conformal Coating', 'Extended Temperature', 'Vibration Testing']
  },
  'consumer-electronics': {
    name: 'Consumer Electronics',
    dbName: 'Consumer Electronics',
    title: 'Consumer Electronics Contract Manufacturers',
    description: 'High-volume manufacturing for consumer electronic products',
    requirements: ['RoHS Compliant', 'FCC Certification', 'High Volume', 'Cost Optimization']
  }
}

export async function generateStaticParams() {
  return Object.keys(INDUSTRY_DATA).map(industry => ({
    industry
  }))
}

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ industry: string }> 
}): Promise<Metadata> {
  const { industry } = await params
  const industryData = INDUSTRY_DATA[industry]
  
  if (!industryData) {
    return {
      title: 'Industry Not Found | CM Directory',
      description: 'The requested industry page could not be found.'
    }
  }
  
  return {
    title: `${industryData.title} | Specialized Manufacturing Partners`,
    description: `Find contract manufacturers specializing in ${industryData.name.toLowerCase()}. ${industryData.description}`,
    openGraph: {
      title: industryData.title,
      description: industryData.description,
      type: 'website',
    },
    alternates: {
      canonical: `https://yourdomain.com/industries/${industry}`,
    },
  }
}

export default async function IndustryPage({
  params,
  searchParams,
}: {
  params: Promise<{ industry: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ industry }, sp] = await Promise.all([params, searchParams])
  const initialFilters = parseFiltersFromSearchParams(sp)
  const industryData = INDUSTRY_DATA[industry]
  
  if (!industryData) {
    notFound()
  }
  
  // Fetch companies in this industry
  const { data: companies } = await supabase
    .from('companies')
    .select(`
      *,
      industries!inner (*),
      capabilities (*),
      certifications (*),
      facilities (*)
    `)
    .eq('industries.industry_name', industryData.dbName)
    .eq('is_active', true)
  
  const typedCompanies = companies as Company[] | null
  
  return (
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white">
        <div className="container mx-auto px-4 py-12">
          <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/industries" className="hover:text-white">Industries</Link>
            <span>/</span>
            <span className="text-white">{industryData.name}</span>
          </nav>
          
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Briefcase className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-3">{industryData.title}</h1>
              <p className="text-xl text-blue-100 max-w-3xl">{industryData.description}</p>
            </div>
          </div>
          
          <div className="mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3 inline-block">
              <span className="text-2xl font-bold">{typedCompanies?.length || 0}</span>
              <span className="text-blue-100 ml-2">Specialized Manufacturers</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* SEO Content */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold mb-4">{industryData.name} Manufacturing Requirements</h2>
          <div className="prose max-w-none text-gray-700">
            <p>
              Contract manufacturers serving the {industryData.name.toLowerCase()} industry must meet
              specific regulatory and quality requirements.
            </p>
            <h3 className="text-lg font-semibold mt-6 mb-3">Key Requirements</h3>
            <ul>
              {industryData.requirements.map(req => (
                <li key={req}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Company Listings */}
        <h2 className="text-2xl font-bold mb-6">
          {industryData.name} Manufacturers
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