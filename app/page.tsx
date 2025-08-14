import { Suspense } from "react"
import CompanyMap from "../components/CompanyMap"
import CompanyList from "../components/CompanyList"
import FilterSidebar from "@/components/FilterSidebar"
import Header from "@/components/Header"
import { FilterProvider } from "../contexts/FilterContext"
import { supabase } from "../lib/supabase"

// Ad Placeholder Component
const AdPlaceholder = ({
  width,
  height,
  label,
  className = "",
}: {
  width: string
  height: string
  label: string
  className?: string
}) => (
  <div
    className={`bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}
    style={{ width, height }}
  >
    <div className="text-center text-gray-500">
      <div className="text-sm font-medium">{label}</div>
      <div className="text-xs mt-1">
        {width} × {height}
      </div>
      <div className="text-xs text-gray-400 mt-1">Advertisement</div>
    </div>
  </div>
)

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
    .eq("is_active", true)

  if (error) {
    console.error("Error fetching companies:", error)
    return []
  }

  return companies || []
}

export default async function Home() {
  const companies = await getData()

  return (
    <FilterProvider>
      <div className="min-h-screen bg-gray-50">
        <Header />

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
              </Suspense>

              {/* Bottom Sidebar Ad */}
              <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
            </div>

            <div className="lg:col-span-9 space-y-4">
              {/* Map */}
              <Suspense fallback={<div>Loading map...</div>}>
                <CompanyMap allCompanies={companies} />
              </Suspense>

              {/* Company Cards directly below map */}
              <Suspense fallback={<div>Loading companies...</div>}>
                <CompanyList allCompanies={companies} />
              </Suspense>
            </div>
          </div>

          {/* In-Feed Ad (appears after some results on mobile) */}
          <div className="lg:hidden mt-6 bg-white rounded-lg shadow-sm p-4">
            <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Sponsored</div>
            <AdPlaceholder width="100%" height="100px" label="Mobile In-Feed Ad" className="border-blue-200" />
          </div>

          {/* Footer Ad Section */}
          <div className="mt-12 pt-6 border-t border-gray-200">
            <div className="flex justify-center mb-6">
              <AdPlaceholder width="728px" height="90px" label="Footer Leaderboard" className="hidden md:block" />
            </div>

            {/* Additional footer content can go here */}
            <div className="text-center text-gray-500 text-sm">
              <p>© 2025 Contract Manufacturer Directory. Powered by Venkel.</p>
            </div>
          </div>
        </main>
      </div>
    </FilterProvider>
  )
}