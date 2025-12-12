import { Suspense } from "react"
import CompanyList from "@/components/CompanyList"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { MapErrorBoundary } from "@/components/MapErrorBoundary"
import Navbar from "@/components/navbar"
import FilterBar from "@/components/FilterBar"
import { FilterProvider } from "@/contexts/FilterContext"
import { featureFlags, getCanonicalUrl, siteConfig } from "@/lib/config"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { getCompanies } from "@/lib/data/getCompanies"
import type { PageProps } from "@/types/nxt"
import SearchBar from "@/components/SearchBar"
import ActiveFiltersBar from "@/components/ActiveFiltersBar"
import AddCompanyCallout from "@/components/AddCompanyCallout"
import FilterErrorBoundary from "@/components/FilterErrorBoundary"
import FilterSidebar from "@/components/FilterSidebar"
import FilterDebugger from "@/components/FilterDebugger"
import VenkelAd from "@/components/VenkelAd"
import { jsonLdScriptProps } from "@/lib/schema"
import DataErrorBoundary from "@/components/DataErrorBoundary"
import CompanyListErrorBoundary from "@/components/CompanyListErrorBoundary"
import EmptyState from "@/components/EmptyState"

export const revalidate = 300

const MAX_COMPANIES = 500
const siteName = siteConfig.name

export const metadata = {
  title: `${siteName} - Find Electronics Contract Manufacturers`,
  description:
    "Engineer-first directory of verified electronics contract manufacturers. Filter by capabilities, certifications, industries, and location.",
  alternates: { canonical: siteConfig.url },
  openGraph: {
    title: `${siteName} - Electronics Contract Manufacturers`,
    description:
      "Find and compare PCB assembly partners by capability, certification, and location.",
    url: siteConfig.url,
    siteName: siteConfig.name,
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `${siteName} - Electronics Contract Manufacturers`,
    description:
      "Filter verified manufacturers by capability, certification, and location.",
  },
}

type HomeSearchParams = Record<string, string | string[] | undefined>

export default async function Home({
  searchParams,
}: PageProps<Record<string, string | string[]>, HomeSearchParams>) {
  const resolvedSearchParams: HomeSearchParams = (await searchParams) ?? {}
  const initialFilters = parseFiltersFromSearchParams(resolvedSearchParams)
  
  // Use enhanced getCompanies with retry and error handling
  const dataResult = await getCompanies({
    maxCompanies: MAX_COMPANIES,
    enableRetry: true,
  })

  // If fetch failed, throw error to be caught by error.tsx
  if (dataResult.error) {
    throw dataResult.error
  }

  const companies = dataResult.companies
  const isEmpty = companies.length === 0
  const useHorizontalFilterBar = false
  const itemListSchema = {
    "@context": "https://schema.org" as const,
    "@type": "ItemList",
    name: `${siteName} Directory`,
    url: siteConfig.url,
    itemListElement: companies
      .filter((company) => Boolean(company.slug))
      .slice(0, 100)
      .map((company, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: getCanonicalUrl(`/companies/${company.slug}`),
        name: company.company_name,
        ...(company.description ? { description: company.description } : {}),
      })),
  }

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <DataErrorBoundary>
        <FilterProvider initialFilters={initialFilters}>
          <div className="page-shell">
          <Navbar />
          <Header />
          <script {...jsonLdScriptProps(itemListSchema)} />
          
          <main className="page-container section section--tight space-y-4">
            {/* Top Ad Removed to bring content higher */}

            {useHorizontalFilterBar ? (
              <div className="space-y-3">
                <SearchBar companies={companies} variant="inline" />
                <FilterBar allCompanies={companies} />
                <ActiveFiltersBar variant="inline" />
                <div className="flex justify-center">
                  <div className="w-full lg:w-full">
                    <MapErrorBoundary>
                      <LazyCompanyMap allCompanies={companies} />
                    </MapErrorBoundary>
                  </div>
                </div>

                  <div className="companies-directory space-y-3">
                    {isEmpty ? (
                      <EmptyState variant="empty-database" />
                    ) : (
                      <Suspense
                        fallback={
                          <div className="card-compact animate-pulse p-8">
                            <div className="mb-4 h-6 w-1/4 rounded bg-muted" />
                            <div className="space-y-3">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 rounded-md bg-muted" />
                              ))}
                            </div>
                          </div>
                        }
                      >
                        <CompanyListErrorBoundary>
                          <CompanyList allCompanies={companies} showInlineSearch={false} />
                        </CompanyListErrorBoundary>
                      </Suspense>
                    )}
                  </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-12 lg:gap-x-[15px] items-start">
                {/* Sidebar - Sticky, centered within its column while still left of the map */}
                <div className="lg:col-span-2 space-y-3 sticky top-4 z-10 lg:order-first lg:flex lg:flex-col lg:items-center lg:mx-auto">
                  <FilterErrorBoundary>
                    <Suspense fallback={<div className="card-compact animate-pulse p-4">Loading filters...</div>}>
                      <FilterSidebar allCompanies={companies} />
                      {featureFlags.showDebug && <FilterDebugger allCompanies={companies} />}
                    </Suspense>
                  </FilterErrorBoundary>

                  <VenkelAd size="sidebar" className="card-compact w-full" />
                  
                  <AddCompanyCallout />
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-10 space-y-5 lg:order-last">
                  <SearchBar companies={companies} variant="inline" />
                  <ActiveFiltersBar variant="inline" />

                  <div className="flex justify-center">
                    <div className="w-full lg:w-full rounded-2xl border border-gray-200 bg-slate-50 shadow-sm overflow-hidden">
                      <MapErrorBoundary>
                        <LazyCompanyMap allCompanies={companies} />
                      </MapErrorBoundary>
                    </div>
                  </div>

                  <div className="companies-directory space-y-3 mt-6">
                    {isEmpty ? (
                      <EmptyState variant="empty-database" />
                    ) : (
                      <Suspense
                        fallback={
                          <div className="card-compact animate-pulse p-8">
                            <div className="mb-4 h-6 w-1/4 rounded bg-muted" />
                            <div className="space-y-3">
                              {[1, 2, 3].map(i => (
                                <div key={i} className="h-24 rounded-md bg-muted" />
                              ))}
                            </div>
                          </div>
                        }
                      >
                        <CompanyListErrorBoundary>
                          <CompanyList allCompanies={companies} showInlineSearch={false} />
                        </CompanyListErrorBoundary>
                      </Suspense>
                    )}
                  </div>
                </div>
              </div>
            )}
          </main>
          </div>
        </FilterProvider>
      </DataErrorBoundary>
    </Suspense>
  )
}
