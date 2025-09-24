import { Suspense } from "react"
import Script from "next/script"
import ActiveFiltersBar from "@/components/ActiveFiltersBar"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"

export const metadata = {
  title: "PCB Assembly Manufacturers | CM Directory",
  description: "Browse contract manufacturers that offer SMT and through-hole PCB assembly services.",
}

async function getCompanies() {
  const { data } = await supabase
    .from("companies")
    .select("*, capabilities(*), facilities(*)")
    .eq("is_active", true)

  return data ?? []
}

export default async function PcbAssemblyManufacturers({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [companies, sp] = await Promise.all([getCompanies(), searchParams])
  const initialFilters = parseFiltersFromSearchParams(sp)

  return (
    <FilterProvider initialFilters={initialFilters}>
      <div className="min-h-screen bg-gray-50">
        <Header companies={companies} />
        <main className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <ActiveFiltersBar />
          </div>

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
