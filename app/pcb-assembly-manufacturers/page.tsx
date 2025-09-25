import Script from "next/script"

import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { companySearch, parseCursor } from "@/lib/queries/companySearch"
import { sanitizeCompaniesForListing } from "@/lib/payloads/listing"

export const metadata = {
  title: "PCB Assembly Manufacturers | CM Directory",
  description: "Browse contract manufacturers that offer SMT and through-hole PCB assembly services.",
}

export default async function PcbAssemblyManufacturers({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedParams = await searchParams
  const filters = parseFiltersFromSearchParams(resolvedParams)
  const cursor = parseCursor(resolvedParams)

  const searchResult = await companySearch({ filters, cursor, includeFacetCounts: true })
  const companies = sanitizeCompaniesForListing(searchResult.companies)
  const activeFilterCount = filters.states.length + filters.capabilities.length + (filters.productionVolume ? 1 : 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        totalCount={searchResult.totalCount}
        visibleCount={companies.length}
        activeFilterCount={activeFilterCount}
        clearHref="/pcb-assembly-manufacturers"
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="lg:col-span-4 space-y-4">
            <FilterSidebar
              basePath="/pcb-assembly-manufacturers"
              filters={filters}
              facetCounts={searchResult.facetCounts}
              clearHref="/pcb-assembly-manufacturers"
            />
          </div>
          <div className="lg:col-span-8 space-y-6">
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

      <Script
        id="pcb-assembly-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: "PCB Assembly Manufacturers",
            description: metadata.description,
          }),
        }}
      />
    </div>
  )
}
