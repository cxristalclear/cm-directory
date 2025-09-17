import { Suspense } from "react";
import CompanyMap from "../components/CompanyMap";
import CompanyList from "../components/CompanyList";
import FilterSidebar from "@/components/FilterSidebar";
import FilterDebugger from '@/components/FilterDebugger'
import Header from "@/components/Header";
import { FilterProvider } from "../contexts/FilterContext";
import { supabase } from "../lib/supabase";

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
    .eq("is_active", true);
  if (error) return [];
  return companies || [];
}


export default async function Home() {
  const companies = await getData()

  return (
    <Suspense fallback={<div className="p-4">Loading…</div>}>
      <FilterProvider>
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
                  <FilterDebugger allCompanies={companies} />
                </Suspense>

                {/* Bottom Sidebar Ad */}
                <AdPlaceholder width="100%" height="250px" label="Sidebar Skyscraper" />
              </div>

              <div className="lg:col-span-9 space-y-4">
                {/* Map */}
                <Suspense fallback={<div>Loading map...</div>}>
                  <CompanyMap allCompanies={companies} />
                </Suspense>

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