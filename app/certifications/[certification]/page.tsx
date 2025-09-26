import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { companySearch, parseCursor } from "@/lib/queries/companySearch"
import { companyFacilitiesForMap } from "@/lib/queries/mapSearch"
import { sanitizeCompaniesForListing } from "@/lib/payloads/listing"

const CERTIFICATION_DATA: Record<
  string,
  {
    name: string
    dbName: string
    title: string
    description: string
    industry: string
  }
> = {
  "iso-9001": {
    name: "ISO 9001",
    dbName: "ISO 9001",
    title: "ISO 9001 Certified Manufacturers",
    description: "Quality management system certification for consistent product quality",
    industry: "General Manufacturing",
  },
  "iso-13485": {
    name: "ISO 13485",
    dbName: "ISO 13485",
    title: "ISO 13485 Medical Device Manufacturers",
    description: "Medical device quality management certification for regulatory compliance",
    industry: "Medical Devices",
  },
  as9100: {
    name: "AS9100",
    dbName: "AS9100",
    title: "AS9100 Aerospace Manufacturers",
    description: "Aerospace quality management certification for aviation and defense",
    industry: "Aerospace & Defense",
  },
  "iatf-16949": {
    name: "IATF 16949",
    dbName: "IATF 16949",
    title: "IATF 16949 Automotive Manufacturers",
    description: "Automotive quality management system for OEM suppliers",
    industry: "Automotive",
  },
  itar: {
    name: "ITAR Registered",
    dbName: "ITAR",
    title: "ITAR Registered Defense Manufacturers",
    description: "International Traffic in Arms Regulations compliance for defense articles",
    industry: "Defense",
  },
}

export async function generateStaticParams() {
  return Object.keys(CERTIFICATION_DATA).map((certification) => ({ certification }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ certification: string }>
}): Promise<Metadata> {
  const { certification } = await params
  const certData = CERTIFICATION_DATA[certification]

  if (!certData) {
    return {
      title: "Certification Not Found | CM Directory",
      description: "The requested certification page could not be found.",
    }
  }

  return {
    title: certData.title,
    description: `Find ${certData.name} certified contract manufacturers. ${certData.description}. Browse verified manufacturers with active certifications.`,
    openGraph: {
      title: certData.title,
      description: certData.description,
      type: "website",
    },
    alternates: {
      canonical: `https://yourdomain.com/certifications/${certification}`,
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
  const [{ certification }, resolvedSearch] = await Promise.all([params, searchParams])
  const certData = CERTIFICATION_DATA[certification]

  if (!certData) {
    notFound()
  }

  const basePath = `/certifications/${certification}`
  const filters = parseFiltersFromSearchParams(resolvedSearch)
  const cursor = parseCursor(resolvedSearch)

  const [searchResult, mapResult] = await Promise.all([
    companySearch({
      filters,
      routeDefaults: { certSlug: certification },
      cursor,
      includeFacetCounts: true,
    }),
    companyFacilitiesForMap({
      filters,
      routeDefaults: { certSlug: certification },
    }),
  ])

  const companies = sanitizeCompaniesForListing(searchResult.companies)
  const activeFilterCount =
    filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)
  const mapFacilities = mapResult.facilities

  return (
    <FilterProvider initialFilters={filters}>
      <div className="min-h-screen bg-gray-50">
        <Header
          filteredCount={searchResult.filteredCount}
          visibleCount={companies.length}
          activeFilterCount={activeFilterCount}
          clearHref={basePath}
        />

        <main className="container mx-auto px-4 py-8">
          <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link href="/" className="underline">
              Home
            </Link>
            <span>/</span>
            <Link href="/certifications" className="underline">
              Certifications
            </Link>
            <span>/</span>
            <span className="text-gray-500">{certData.name}</span>
          </nav>

          <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
            <h1 className="text-3xl font-bold mb-3">{certData.title}</h1>
            <p className="text-xl text-gray-600">{certData.description}</p>
            <div className="mt-4 flex gap-4">
              <div className="rounded-lg bg-blue-50 px-6 py-3 text-blue-800">
                <span className="text-2xl font-bold">{searchResult.filteredCount}</span>
                <span className="ml-2 text-sm">Certified Manufacturers</span>
              </div>
              <div className="rounded-lg bg-blue-50 px-6 py-3 text-blue-800">
                <span className="text-sm">Industry Focus:</span>
                <span className="ml-2 font-semibold">{certData.industry}</span>
              </div>
            </div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <FilterSidebar basePath={basePath} filters={filters} facetCounts={searchResult.facetCounts} clearHref={basePath} />
            </div>
            <div className="lg:col-span-8 space-y-4">
              <LazyCompanyMap
                initialFacilities={mapFacilities}
                initialFilters={filters}
                routeDefaults={{ certSlug: certification }}
              />
              <CompanyList
                companies={companies}
                filteredCount={searchResult.filteredCount}
                pageInfo={searchResult.pageInfo}
              />
            </div>
          </div>
        </main>
      </div>
    </FilterProvider>
  )
}
