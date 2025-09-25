import type { Metadata } from "next"
import Link from "next/link"
import Script from "next/script"

import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { companySearch, parseCursor } from "@/lib/queries/companySearch"
import { sanitizeCompaniesForListing } from "@/lib/payloads/listing"

function normalizeCertParam(param: string) {
  return param.replace(/-/g, " ").replace(/\b\w/g, (match) => match.toUpperCase())
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ cert: string }>
}): Promise<Metadata> {
  const { cert } = await params
  const certNice = normalizeCertParam(cert)
  const title = `${certNice} Contract Manufacturers | CM Directory`
  const description = `Browse verified electronics manufacturers with ${certNice}. Compare capabilities (SMT, Through-Hole, Box Build) and locations.`
  const canonical = `https://www.example.com/contract-manufacturers/${cert}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: "website" },
    twitter: { card: "summary", title, description },
  }
}

export default async function CertManufacturers({
  params,
  searchParams,
}: {
  params: Promise<{ cert: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [{ cert }, resolvedSearch] = await Promise.all([params, searchParams])
  const filters = parseFiltersFromSearchParams(resolvedSearch)
  const cursor = parseCursor(resolvedSearch)
  const certNice = normalizeCertParam(cert)
  const basePath = `/contract-manufacturers/${cert}`

  const mergedFilters = {
    ...filters,
    capabilities: filters.capabilities,
  }

  const searchResult = await companySearch({
    filters: mergedFilters,
    routeDefaults: { certSlug: cert },
    cursor,
    includeFacetCounts: true,
  })

  const companies = sanitizeCompaniesForListing(searchResult.companies)
  const activeFilterCount =
    mergedFilters.states.length + mergedFilters.capabilities.length + (mergedFilters.productionVolume ? 1 : 0)

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${certNice} Contract Manufacturers`,
    url: `https://www.example.com/contract-manufacturers/${cert}`,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Script id="cert-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <Header
        totalCount={searchResult.totalCount}
        visibleCount={companies.length}
        activeFilterCount={activeFilterCount}
        clearHref={basePath}
      />

      <main className="container mx-auto px-4 py-6">
        <nav aria-label="Breadcrumb" className="mb-3 text-sm text-gray-600">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="underline">
                Home
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/pcb-assembly-manufacturers" className="underline">
                PCB Assembly
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-gray-500">
              {certNice}
            </li>
          </ol>
        </nav>

        <section className="mb-8 rounded-xl bg-white p-6 shadow-sm">
          <h1 className="text-3xl font-bold mb-2">{certNice} Contract Manufacturers</h1>
          <p className="text-gray-600">
            Medical, aerospace, and regulated industries often require {certNice}. Compare verified partners and contact directly.
          </p>
        </section>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <FilterSidebar basePath={basePath} filters={mergedFilters} facetCounts={searchResult.facetCounts} clearHref={basePath} />
          </div>
          <div className="lg:col-span-8 space-y-4">
            <LazyCompanyMap companies={companies} />
            <CompanyList
              companies={companies}
              totalCount={searchResult.totalCount}
              hasNext={searchResult.hasNext}
              hasPrev={searchResult.hasPrev}
              nextCursor={searchResult.nextCursor}
              prevCursor={searchResult.prevCursor}
            />
          </div>
        </div>
      </main>
    </div>
  )
}
