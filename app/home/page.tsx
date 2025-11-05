import { Suspense } from "react"
import { SpeedInsights } from "@vercel/speed-insights/next"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import FilterDebugger from "@/components/FilterDebugger"
import Header from "@/components/Header"
import { FilterErrorBoundary } from "@/components/FilterErrorBoundary"
import { MapErrorBoundary } from "@/components/MapErrorBoundary"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import { siteConfig, featureFlags, getCanonicalUrl } from "@/lib/config"
import AddCompanyCallout from "@/components/AddCompanyCallout"
import type { PageProps } from "@/types/nxt"
import type { HomepageCompany } from "@/types/homepage"
import Navbar from "@/components/navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/dist/client/link"

const pageUrl = getCanonicalUrl("/home")

export const revalidate = 300

const COMPANY_FIELDS = `
  id,
  slug,
  company_name,
  dba_name,
  description,
  employee_count_range,
  is_active,
  website_url,
  updated_at,
  facilities (
    id,
    company_id,
    city,
    state,
    country,
    latitude,
    longitude,
    facility_type,
    is_primary
  ),
  capabilities (
    pcb_assembly_smt,
    pcb_assembly_through_hole,
    cable_harness_assembly,
    box_build_assembly,
    prototyping,
    low_volume_production,
    medium_volume_production,
    high_volume_production
  ),
  certifications (
    id,
    certification_type
  ),
  industries (
    id,
    industry_name
  )
`

const MAX_COMPANIES = 500

// AI-Enhanced SEO Metadata with JSON-LD Schema
export const metadata = {
  title: "CM Directory – Find Electronics Contract Manufacturers (PCB Assembly, Box Build, Cable Harness)",
  description:
    "Search verified electronics contract manufacturers by capability, certification, and location. Filter by SMT, Through-Hole, Box Build, ISO 13485, AS9100, and more. List your company for free.",
  alternates: { 
    canonical: siteConfig.url 
  },
  openGraph: {
    title: "CM Directory – Electronics Contract Manufacturers",
    description:
      "Find and compare PCB assembly partners by capability, certification, and location. Connect with qualified manufacturers worldwide.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
    images: [
      {
        url: `${siteConfig.url}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "CM Directory - Contract Manufacturing Search Platform"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "CM Directory – Electronics Contract Manufacturers",
    description:
      "Filter verified manufacturers by capability, certification, and location. Find your next manufacturing partner.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  other: {
    'ai-summary': 'CM Directory is an engineer-first platform for finding electronics contract manufacturers. Search by capabilities (SMT, Through-Hole, Box Build), certifications (ISO 13485, AS9100), and location.',
  }
}

const AdPlaceholder = ({ width, height, label, className = "" }: { width: string; height: string; label: string; className?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`} style={{ width, height }}>
    <div className="text-center text-gray-500">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-1">{width} × {height}</div>
      <div className="text-xs text-gray-400 mt-1">Advertisement</div>
    </div>
  </div>
)

// JSON-LD Schema Generator
function generateJSONLD(companies: HomepageCompany[]) {
  const schemas = [
    // WebSite Schema
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      'name': 'CM Directory',
      'url': siteConfig.url,
      'description': 'Engineer-first directory of verified electronics contract manufacturers',
      'potentialAction': {
        '@type': 'SearchAction',
        'target': `${siteConfig.url}/?search={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    },
    // BreadcrumbList Schema
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': 'Home',
          'item': siteConfig.url
        }
      ]
    },
    // Organization Schema
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      'name': 'CM Directory',
      'url': siteConfig.url,
      'logo': `${siteConfig.url}/logo.png`,
      'description': 'Directory of verified electronics contract manufacturers',
      'sameAs': []
    },
    // FAQPage Schema
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      'mainEntity': [
        {
          '@type': 'Question',
          'name': 'What is CM Directory?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'CM Directory is an engineer-first platform for finding verified electronics contract manufacturers. Filter by capabilities, certifications, and location to find your ideal manufacturing partner.'
          }
        },
        {
          '@type': 'Question',
          'name': 'How do I search for manufacturers?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Use our advanced filters to search by capabilities (SMT, Through-Hole, Box Build), certifications (ISO 13485, AS9100), industries, and location. View results on an interactive map or in list format.'
          }
        },
        {
          '@type': 'Question',
          'name': 'Can manufacturers list for free?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Yes! Basic listings are free. Manufacturers can create a profile with their capabilities, certifications, and contact information. Featured placement options are available for premium visibility.'
          }
        },
        {
          '@type': 'Question',
          'name': 'What capabilities can I search for?',
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': 'Search for PCB Assembly (SMT, Through-Hole), Cable Harness Assembly, Box Build Assembly, Prototyping, and production volumes (Low, Medium, High Volume).'
          }
        }
      ]
    }
  ]

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
    />
  )
}

// ---------- Data Fetch ----------
async function getData(): Promise<HomepageCompany[]> {
  try {
    const { data, error } = await supabase
      .from("companies")
      .select(COMPANY_FIELDS)
      .eq("is_active", true)
      .order("updated_at", { ascending: false })
      .limit(MAX_COMPANIES)
      .returns<HomepageCompany[]>()

    if (error) {
      console.error("Error fetching companies:", error)
      return []
    }

    return data ?? []
  } catch (error) {
    console.error("Unexpected error fetching companies:", error)
    return []
  }
}

type HomeSearchParams = Record<string, string | string[] | undefined>

export default async function Home({
  searchParams,
}: PageProps<Record<string, string | string[]>, HomeSearchParams>) {
  const resolvedSearchParams: HomeSearchParams = (await searchParams) ?? {}

  const initialFilters = parseFiltersFromSearchParams(resolvedSearchParams)

  const companies = await getData()

  // Calculate stats
  const stats = {
    manufacturers: companies.length,
    capabilities: 25,
    countries: new Set(companies.flatMap(c => c.facilities?.map(f => f.country) || [])).size,
    avgResponse: '<48h'
  }

  // Get featured companies (top 6 by updated_at)
  const featuredCompanies = companies.slice(0, 6)

  return (
    <>
      {generateJSONLD(companies)}
      
      <Suspense fallback={<div className="p-4">Loading…</div>}>
        <SpeedInsights />
        <FilterProvider initialFilters={initialFilters}>
          <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
            <Navbar />
            
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                <div className="gradient-bg">
                    <div className="relative z-10 py-8 md:py-12">
                        <div className="container mx-auto px-4 text-center">
                            <div className="mx-auto max-w-4xl">
                                <h1 className="mb-3 text-3xl font-bold leading-tight text-white md:text-5xl">
                                Find Your Next Contract Manufacturing Partner
                                </h1>
                                <p className="mb-6 text-lg leading-relaxed text-blue-100 md:text-xl">
                                Search {stats.manufacturers}+ verified electronics manufacturers by capability, certification, and region. 
                                Connect directly with qualified partners.
                                </p>
                                <div className="flex gap-4 justify-center flex-wrap">
                                    <Button size="lg" className="rounded-xl px-8">
                                        <Link href="/search">
                                        Search Manufacturers
                                        </Link>
                                    </Button>
                                    <Button size="lg" variant="outline" className="rounded-xl px-8">
                                        <Link href="/list-your-company">
                                        List Your Company
                                        </Link>
                                    </Button>
                                </div>  
                            </div>
                        </div>
                        {/* Stats Grid */}
                        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
                        {[
                            { label: 'Manufacturers', value: `${stats.manufacturers}+` },
                            { label: 'Capabilities', value: `${stats.capabilities}+` },
                            { label: 'Countries', value: `${stats.countries}+` },
                            { label: 'Avg. Response', value: stats.avgResponse }
                        ].map((stat) => (
                            <Card key={stat.label} className="border-slate-200">
                            <CardContent className="p-6 text-center">
                                <p className="text-3xl font-bold text-blue-600">{stat.value}</p>
                                <p className="text-slate-600 mt-2">{stat.label}</p>
                            </CardContent>
                            </Card>
                        ))}
                        </div>
                    </div>
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
                        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-white/5 blur-3xl" />
                    </div>
                </div>
            </section>

            {/* Two-Audience Section */}
            <section className="py-12 px-4 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="border-slate-200 shadow-lg">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold mb-4 text-slate-900">For Buyers & Engineers</h2>
                      <ul className="space-y-3 text-slate-700">
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-3 text-xl">✓</span>
                          <span>Filter by country, capability, and certifications (ISO 13485, AS9100, IPC)</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-3 text-xl">✓</span>
                          <span>Compare profiles with verified badges and detailed capabilities</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-3 text-xl">✓</span>
                          <span>View manufacturers on interactive map by location</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-blue-600 mr-3 text-xl">✓</span>
                          <span>Contact manufacturers directly through verified channels</span>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <Button className="w-full rounded-xl">Start Your Search</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-slate-200 shadow-lg">
                    <CardContent className="p-8">
                      <h2 className="text-2xl font-bold mb-4 text-slate-900">For Manufacturers</h2>
                      <ul className="space-y-3 text-slate-700">
                        <li className="flex items-start">
                          <span className="text-green-600 mr-3 text-xl">✓</span>
                          <span>Free basic listing with unlimited updates</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-3 text-xl">✓</span>
                          <span>Showcase certifications, capabilities, and facility locations</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-3 text-xl">✓</span>
                          <span>Receive qualified leads from OEMs, startups, and engineers</span>
                        </li>
                        <li className="flex items-start">
                          <span className="text-green-600 mr-3 text-xl">✓</span>
                          <span>Upgrade to featured placement for top visibility</span>
                        </li>
                      </ul>
                      <div className="mt-6">
                        <Button variant="outline" className="w-full rounded-xl">Get Listed Free</Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            {/* Featured Manufacturers Section */}
            {featuredCompanies.length > 0 && (
              <section className="py-12 px-4 bg-white">
                <div className="max-w-6xl mx-auto">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-900">Featured Manufacturers</h2>
                      <p className="text-slate-600 mt-2">Recently updated verified partners</p>
                    </div>
                    <Button variant="outline" className="rounded-xl">View All</Button>
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {featuredCompanies.map((company) => (
                      <Card key={company.id} className="border-slate-200 hover:shadow-lg transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-3">
                            <h3 className="font-bold text-lg text-slate-900 line-clamp-1">
                              {company.company_name}
                            </h3>
                            {company.certifications && company.certifications.length > 0 && (
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                Certified
                              </span>
                            )}
                          </div>
                          {company.facilities && company.facilities[0] && (
                            <p className="text-sm text-slate-600 mb-3">
                              📍 {company.facilities[0].city}, {company.facilities[0].state || company.facilities[0].country}
                            </p>
                          )}
                          <p className="text-sm text-slate-700 line-clamp-2 mb-4">
                            {company.description || 'Full-service contract manufacturer'}
                          </p>
                          <div className="flex gap-2 flex-wrap">
                            {company.capabilities?.[0]?.pcb_assembly_smt && (
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">SMT</span>
                            )}
                            {company.capabilities?.[0]?.pcb_assembly_through_hole && (
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">Through-Hole</span>
                            )}
                            {company.capabilities?.[0]?.box_build_assembly && (
                              <span className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded">Box Build</span>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* Main Content - Search Interface */}
            <section className="py-12 px-4 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900 mb-3">Search All Manufacturers</h2>
                  <p className="text-slate-600">Use our advanced filters to find the perfect manufacturing partner</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Filter Sidebar */}
                  <div className="lg:col-span-3 space-y-4">
                    <FilterErrorBoundary>
                      <Suspense fallback={<div className="bg-white rounded-xl shadow-lg p-6 animate-pulse">Loading filters...</div>}>
                        <FilterSidebar allCompanies={companies} />
                        {featureFlags.showDebug && <FilterDebugger allCompanies={companies} />}
                      </Suspense>
                    </FilterErrorBoundary>

                    {/* Sidebar Ad */}
                    <AdPlaceholder width="100%" height="250px" label="Sidebar Ad" />
                    <AddCompanyCallout className="mt-6" />
                  </div>

                  <div className="lg:col-span-9 space-y-6">
                    {/* Map with Error Boundary */}
                    <MapErrorBoundary>
                      <LazyCompanyMap allCompanies={companies} />
                    </MapErrorBoundary>

                    {/* Company List */}
                    <div className="companies-directory">
                      <Suspense fallback={
                        <div className="bg-white rounded-xl shadow-sm p-8 animate-pulse">
                          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                          <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                              <div key={i} className="h-32 bg-gray-200 rounded"></div>
                            ))}
                          </div>
                        </div>
                      }>
                        <CompanyList allCompanies={companies} />
                      </Suspense>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <section className="py-12 px-4 bg-white">
              <div className="max-w-6xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">How CM Directory Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                  {[
                    {
                      step: '1',
                      title: 'Search & Filter',
                      description: 'Use our advanced filters to find manufacturers by capability, certification, location, and industry specialization.'
                    },
                    {
                      step: '2',
                      title: 'Compare & Review',
                      description: 'View detailed profiles with certifications, capabilities, facility locations, and verified contact information.'
                    },
                    {
                      step: '3',
                      title: 'Connect Directly',
                      description: 'Contact manufacturers directly through their website or inquiry form. No middleman, no commissions.'
                    }
                  ].map((item) => (
                    <Card key={item.step} className="border-slate-200 text-center">
                      <CardContent className="p-8">
                        <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                          {item.step}
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-slate-900">{item.title}</h3>
                        <p className="text-slate-600">{item.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* FAQ Section */}
            <section className="py-12 px-4 bg-slate-50">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">Frequently Asked Questions</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      q: 'What is CM Directory?',
                      a: 'CM Directory is an engineer-first platform for finding verified electronics contract manufacturers. Filter by capabilities, certifications, and location to find your ideal manufacturing partner.'
                    },
                    {
                      q: 'How do I search for manufacturers?',
                      a: 'Use our advanced filters to search by capabilities (SMT, Through-Hole, Box Build), certifications (ISO 13485, AS9100), industries, and location. View results on an interactive map or in list format.'
                    },
                    {
                      q: 'Can manufacturers list for free?',
                      a: 'Yes! Basic listings are free. Manufacturers can create a profile with their capabilities, certifications, and contact information. Featured placement options are available for premium visibility.'
                    },
                    {
                      q: 'What capabilities can I search for?',
                      a: 'Search for PCB Assembly (SMT, Through-Hole), Cable Harness Assembly, Box Build Assembly, Prototyping, and production volumes (Low, Medium, High Volume).'
                    },
                    {
                      q: 'How are companies verified?',
                      a: 'We manually review new submissions, validate websites and certifications where provided, and conduct periodic refresh checks to ensure accuracy.'
                    },
                    {
                      q: 'Is there a fee for buyers?',
                      a: 'No, CM Directory is completely free for buyers. Search, compare, and contact manufacturers at no cost.'
                    }
                  ].map((faq, index) => (
                    <Card key={index} className="border-slate-200">
                      <CardContent className="p-6">
                        <details className="group">
                          <summary className="font-semibold text-slate-900 cursor-pointer list-none flex items-center justify-between">
                            {faq.q}
                            <span className="transition group-open:rotate-180">
                              ▼
                            </span>
                          </summary>
                          <p className="text-slate-600 mt-3 leading-relaxed">{faq.a}</p>
                        </details>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="py-16 px-4 bg-blue-600 text-white">
              <div className="max-w-4xl mx-auto text-center">
                <h2 className="text-4xl font-bold mb-4">Ready to Find Your Manufacturing Partner?</h2>
                <p className="text-xl mb-8 text-blue-100">
                  Join {stats.manufacturers}+ verified manufacturers and start connecting today
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-slate-100 rounded-xl px-8">
                    Search Manufacturers
                  </Button>
                  <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700 rounded-xl px-8">
                    List Your Company Free
                  </Button>
                </div>
              </div>
            </section>
          </div>
        </FilterProvider>
      </Suspense>
    </>
  )
}