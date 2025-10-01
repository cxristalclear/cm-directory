import { Suspense } from "react"
import Script from "next/script"
import LazyCompanyMap from "@/components/LazyCompanyMap"
import CompanyList from "@/components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import FilterDebugger from "@/components/FilterDebugger"
import Header from "@/components/Header"
import { FilterProvider } from "@/contexts/FilterContext"
import { parseFiltersFromSearchParams } from "@/lib/filters/url"
import { supabase } from "@/lib/supabase"

export const metadata = {
  title: "CM Directory — Find Electronics Contract Manufacturers (PCB Assembly, Box Build, Cable Harness)",
  description:
    "Engineer-first directory of verified electronics contract manufacturers. Filter by capabilities (SMT, Through-Hole, Box Build), certifications (ISO 13485, AS9100), industries, and state.",
  alternates: { canonical: "https://www.example.com/" },
  openGraph: {
    title: "CM Directory — Electronics Contract Manufacturers",
    description:
      "Find and compare PCB assembly partners by capability, certification, and location.",
    url: "https://www.example.com/",
    siteName: "CM Directory",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "CM Directory — Electronics Contract Manufacturers",
    description:
      "Filter verified manufacturers by capability, certification, and location.",
  },
};

const SHOW_DEBUG = process.env.NEXT_PUBLIC_SHOW_DEBUG === "true";

const AdPlaceholder = ({ width, height, label, className = "" }: { width: string; height: string; label: string; className?: string }) => (
  <div className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`} style={{ width, height }}>
    <div className="text-center text-gray-500">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-1">{width} × {height}</div>
      <div className="text-xs text-gray-400 mt-1">Advertisement</div>
    </div>
  </div>
);

async function getData() {
  const { data: companies, error } = await supabase
    .from("companies")
    .select(`
      *,
      facilities(*),
      capabilities(*),
      certifications(*),
      industries(*)
    `)
    .eq("is_active", true);
  if (error) return [];
  return companies || [];
}

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const initialFilters = parseFiltersFromSearchParams(sp)
  const companies = await getData()

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      {/* Website JSON-LD */}
      <Script id="website-jsonld" type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "CM Directory",
          url: "https://www.example.com/",
          potentialAction: {
            "@type": "SearchAction",
            target: "https://www.example.com/?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })
      }} />
      <FilterProvider initialFilters={initialFilters}>
        <div className="min-h-screen bg-gray-50">
          <Header companies={companies} />

          <main className="container mx-auto px-4 py-6">
            {/* Top Content Ad - Native/Sponsored */}
            <div className="mb-6 bg-white rounded-xl shadow-xl p-4">
              <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Featured Partner</div>
              <AdPlaceholder
                width="100%"
                height="120px"
                label="Sponsored Content / Featured Manufacturer"
                className="border-blue-200"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Filter Sidebar */}
              <div className="lg:col-span-3 space-y-4">
                <Suspense fallback={<div>Loading filters...</div>}>
                  <FilterSidebar allCompanies={companies} />
                  {SHOW_DEBUG && <FilterDebugger allCompanies={companies} />}
                </Suspense>

                {/* Bottom Sidebar Ad */}
                <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
              </div>

              <div className="lg:col-span-9 space-y-4">
                {/* Map - No extra Suspense needed, LazyCompanyMap handles it internally */}
                <LazyCompanyMap allCompanies={companies} />

                {/* List */}
                <div className="companies-directory">
                  <Suspense fallback={<div>Loading companies...</div>}>
                    <CompanyList allCompanies={companies} />
                  </Suspense>
                </div>

                {/* Bottom Content Ad */}
                <div className="bg-white rounded-xl shadow-xl p-4">
                  <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide text-center">Sponsored</div>
                  <AdPlaceholder
                    width="100%"
                    height="150px"
                    label="Bottom Banner / Native Content"
                    className="border-green-200"
                  />
                </div>
              </div>
            </div>
          </main>
        </div>
      </FilterProvider>
    </Suspense>
  );
}