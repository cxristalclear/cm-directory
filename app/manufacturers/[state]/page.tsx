import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowRight } from "lucide-react"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import type { Company } from "@/types/company"

// State data with SEO-friendly names and info
const STATE_DATA: Record<string, {
  name: string
  abbreviation: string
  fullName: string
  description: string
  majorCities: string[]
}> = {
  'california': {
    name: 'California',
    abbreviation: 'CA',
    fullName: 'California',
    description: 'Silicon Valley and Southern California host advanced electronics and medical device manufacturers',
    majorCities: ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco']
  },
  'texas': {
    name: 'Texas',
    abbreviation: 'TX',
    fullName: 'Texas',
    description: 'Major manufacturing hub with aerospace, defense, and energy sector specializations',
    majorCities: ['Houston', 'Dallas', 'Austin', 'San Antonio']
  },
  'ohio': {
    name: 'Ohio',
    abbreviation: 'OH',
    fullName: 'Ohio',
    description: 'Traditional manufacturing powerhouse with automotive and industrial expertise',
    majorCities: ['Columbus', 'Cleveland', 'Cincinnati', 'Dayton']
  },
  'michigan': {
    name: 'Michigan',
    abbreviation: 'MI',
    fullName: 'Michigan',
    description: 'Automotive manufacturing capital with growing medical device and aerospace sectors',
    majorCities: ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights']
  },
  // Add more states as needed
}

// Generate static params for all states
export async function generateStaticParams() {
  // Get unique states from your database
  const { data: facilities } = await supabase
    .from('facilities')
    .select('state')
    .not('state', 'is', null)

  const uniqueStates = [
    ...new Set(
      (facilities ?? [])
        .map((facility) => facility?.state)
        .filter((state): state is string => typeof state === 'string' && state.length > 0)
        .map((state) => state.toLowerCase()),
    ),
  ]

  return uniqueStates
    .filter((state) => STATE_DATA[state]) // Only states we have data for
    .map((state) => ({ state }))
}

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ state: string }>
}): Promise<Metadata> {
  const { state } = await params
  const stateData = STATE_DATA[state.toLowerCase()]
  
  if (!stateData) {
    return {
      title: 'State Not Found | CM Directory',
      description: 'The requested state page could not be found.'
    }
  }
  
  // Get company count for this state
  const { count } = await supabase
    .from('facilities')
    .select('*', { count: 'exact', head: true })
    .eq('state', stateData.abbreviation)
  
  return {
    title: `Contract Manufacturers in ${stateData.fullName} | ${count || 0}+ Verified Companies`,
    description: `Find ${count || ''} verified contract manufacturers in ${stateData.fullName}. ${stateData.description}. Compare capabilities, certifications, and get quotes from local manufacturing partners.`,
    
    openGraph: {
      title: `${stateData.fullName} Contract Manufacturers Directory`,
      description: `Browse verified contract manufacturers in ${stateData.fullName}. ${stateData.description}`,
      type: 'website',
    },
    
    alternates: {
      canonical: `https://yourdomain.com/manufacturers/${state}`,
    },
  }
}

export default async function StateManufacturersPage({
  params,
  searchParams,
}: {
  params: Promise<{ state: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ state }, sp] = await Promise.all([params, searchParams])
  const urlFilters = parseFiltersFromSearchParams(sp)
  const stateData = STATE_DATA[state.toLowerCase()]
  const initialFilters = {
    countries: urlFilters.countries.length > 0 ? urlFilters.countries : [],
    states: urlFilters.states.length > 0 ? urlFilters.states : [stateData.abbreviation],
    capabilities: urlFilters.capabilities,
    productionVolume: urlFilters.productionVolume,
  }

  if (!stateData) {
    notFound()
  }
  
  // Fetch all companies in this state
  const { data } = await supabase
    .from('companies')
    .select(`
      *,
      facilities!inner (
        country,
        state,
        city
      ),
      capabilities (*),
      certifications (certification_type),
      industries (industry_name)
    `)
    .eq('facilities.state', stateData.abbreviation)
    .eq('is_active', true)

    const companies: Company[] = (data ?? []) as Company[]
  
  // Get aggregated stats
  const stats = {
    totalCompanies: companies.length,
    certifications: [
      ...new Set(
        companies.flatMap((company) =>
          (company.certifications ?? [])
            .map((certification) => certification?.certification_type)
            .filter((cert): cert is string => typeof cert === 'string' && cert.length > 0),
        ),
      ),
    ],
    capabilities: [
      ...new Set(
        companies.flatMap((company) => {
          const cap = company.capabilities?.[0]
          const caps: string[] = []
          if (cap?.pcb_assembly_smt) caps.push('SMT Assembly')
          if (cap?.cable_harness_assembly) caps.push('Cable Assembly')
          if (cap?.box_build_assembly) caps.push('Box Build')
          return caps
        }),
      ),
    ],
    cities: [
      ...new Set(
        companies.flatMap((company) =>
          (company.facilities ?? [])
            .map((facility) => facility?.city)
            .filter((city): city is string => typeof city === 'string' && city.length > 0),
        ),
      ),
    ],
  }
  
  // Schema for state page
  const stateSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Contract Manufacturers in ${stateData.fullName}`,
    description: stateData.description,
    url: `https://yourdomain.com/manufacturers/${state}`,
    numberOfItems: stats.totalCompanies,
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://yourdomain.com'
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Manufacturers',
          item: 'https://yourdomain.com/manufacturers'
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: stateData.fullName,
          item: `https://yourdomain.com/manufacturers/${state}`
        }
      ]
    }
  }
  
  return (
    <FilterProvider initialFilters={initialFilters}>
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(stateSchema) }}
        />

        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white">
          <div className="container mx-auto px-4 py-12">
            {/* Breadcrumbs */}
            <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
              <Link href="/" className="hover:text-white">Home</Link>
              <span>/</span>
              <Link href="/manufacturers" className="hover:text-white">Manufacturers</Link>
              <span>/</span>
              <span className="text-white">{stateData.fullName}</span>
            </nav>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-2xl font-semibold">
                {stateData.abbreviation}
              </div>
              <div>
                <h1 className="text-4xl font-bold mb-3">
                  Contract Manufacturers in {stateData.fullName}
                </h1>
                <p className="text-xl text-blue-100 max-w-3xl">
                  {stateData.description}
                </p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.totalCompanies}</div>
                <div className="text-sm text-blue-100">Verified Manufacturers</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.cities.length}</div>
                <div className="text-sm text-blue-100">Cities Covered</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.certifications.length}</div>
                <div className="text-sm text-blue-100">Certification Types</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-3xl font-bold">{stats.capabilities.length}</div>
                <div className="text-sm text-blue-100">Capabilities</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* SEO Content Section */}
          <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              Finding Contract Manufacturers in {stateData.fullName}
            </h2>
            <div className="prose max-w-none text-gray-700">
              <p>
                {stateData.fullName} is home to {stats.totalCompanies} contract manufacturers 
                serving diverse industries including aerospace, medical devices, automotive, 
                and consumer electronics. Major manufacturing centers include{' '}
                {stateData.majorCities.slice(0, 3).join(', ')}, and {stateData.majorCities[3]}.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">Key Manufacturing Capabilities</h3>
              <p>
                Contract manufacturers in {stateData.fullName} offer a comprehensive range of services
                including PCB assembly, cable harness manufacturing, box build assembly, and full
                turnkey production. Many facilities maintain certifications such as ISO 9001,
                ISO 13485 for medical devices, and AS9100 for aerospace applications.
              </p>
              
              <h3 className="text-lg font-semibold mt-6 mb-3">Industries Served</h3>
              <p>
                The state&apos;s manufacturing sector supports critical industries with specialized requirements. From prototype development to high-volume production, {stateData.fullName}&apos;s contract manufacturers provide scalable solutions for companies of all sizes.
              </p>
            </div>
            
            {/* Popular Cities */}
            {stats.cities.length > 0 && (
              <div className="mt-8 pt-8 border-t">
                <h3 className="font-semibold mb-4">Manufacturing Hubs in {stateData.fullName}</h3>
                <div className="flex flex-wrap gap-2">
                  {stats.cities.slice(0, 10).map(city => (
                    <Link
                      key={city}
                      href={`/manufacturers/${state}/${city.toLowerCase().replace(/\s+/g, '-')}`}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      {city}
                      <ArrowRight className="inline w-3 h-3 ml-1" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Company Listings */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              All Manufacturers in {stateData.fullName}
            </h2>
            <p className="text-gray-600">
              Browse {stats.totalCompanies} verified contract manufacturers below
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <FilterSidebar allCompanies={companies || []} />
            </div>
            <div className="lg:col-span-8">
              <CompanyList allCompanies={companies || []} />
            </div>
          </div>

          {/* Related States Section */}
          <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-xl font-bold mb-4">Explore Other States</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(STATE_DATA)
                .filter(([key]) => key !== state.toLowerCase())
                .slice(0, 8)
                .map(([stateKey, data]) => (
                  <Link
                    key={stateKey}
                    href={`/manufacturers/${stateKey}`}
                    className="p-4 border rounded-lg hover:border-blue-500 hover:shadow-md transition-all"
                  >
                    <div className="font-semibold text-gray-900">{data.name}</div>
                    <div className="text-sm text-gray-500 mt-1">View manufacturers →</div>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>
      </>
    </FilterProvider>
  )
}