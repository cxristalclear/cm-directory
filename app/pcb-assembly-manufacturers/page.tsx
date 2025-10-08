import { Suspense } from "react"
import Script from "next/script"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { FilterProvider } from "@/contexts/FilterContext"
import { CapabilitySlug, parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"
import { Company } from "@/types/company" // Import the Company type

export const metadata = {
  title: "PCB Assembly Manufacturers | CM Directory",
  description: "Browse contract manufacturers that offer SMT and through-hole PCB assembly services.",
}

async function getCompanies(): Promise<Company[]> {
  const { data } = await supabase
    .from("companies")
    .select("*, capabilities(*), facilities(*)")
    .eq("is_active", true)

  if (!data) {
    return []
  }

  // Filter out facilities with a null company_id to match the strict Company type
  const cleanedData = data.map(company => ({
    ...company,
    facilities: company.facilities?.filter(f => f.company_id) ?? [],
  }))

  return cleanedData as unknown as Company[]
}

export default async function PcbAssemblyManufacturers({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [companies, sp] = await Promise.all([getCompanies(), searchParams])
  const urlFilters = parseFiltersFromSearchParams(sp)
  const initialFilters = {
    countries: urlFilters.countries,
    states: urlFilters.states,
    capabilities: urlFilters.capabilities.length > 0 
      ? urlFilters.capabilities 
      : ['smt', 'through_hole'] as CapabilitySlug[],
    productionVolume: urlFilters.productionVolume,
  }

  return (
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
        <Header companies={companies} />
        <main className="container mx-auto px-4 py-8">

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4 space-y-4">
              <Suspense fallback={<div>Loading filters...</div>}>
                <FilterSidebar allCompanies={companies} />
              </Suspense>
            </div>
            <div className="lg:col-span-8 space-y-6">
              <LazyCompanyMap allCompanies={companies} />
              <Suspense fallback={<div className="rounded-xl border border-dashed border-gray-300 p-6">Loading companies…</div>}>
                <CompanyList allCompanies={companies} />
              </Suspense>
            </div>
          </div>
        </main>
      </div>
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
    </FilterProvider>
  )
}