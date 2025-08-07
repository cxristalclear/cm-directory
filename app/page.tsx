import { Suspense } from 'react'
import CompanyMap from '../components/CompanyMap'
import CompanyList from '../components/CompanyList'
import FilterSidebar from '@/components/FilterSidebar'
import { FilterProvider } from '../contexts/FilterContext'
import { supabase } from '../lib/supabase'

async function getData() {
  const { data: companies } = await supabase
    .from('companies')
    .select(`
      *,
      facilities (*),
      capabilities (*),
      industries (industry_name),
      certifications (certification_type, status)
    `)
    .eq('is_active', true)

  return companies || []
}

export default async function Home() {
  const companies = await getData()

  return (
    <FilterProvider>
      <main className="min-h-screen bg-gray-50">
        <div className="bg-blue-900 text-white py-8">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold">Contract Manufacturer Directory</h1>
            <p className="text-xl mt-2">Find the right manufacturing partner for your project</p>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Filter Sidebar */}
            <div className="lg:col-span-3">
              <Suspense fallback={<div>Loading filters...</div>}>
                <FilterSidebar allCompanies={companies} />
              </Suspense>
            </div>
            
            {/* Map */}
            <div className="lg:col-span-6">
              <Suspense fallback={<div>Loading map...</div>}>
                <CompanyMap allCompanies={companies} />
              </Suspense>
            </div>
            
            {/* Company List */}
            <div className="lg:col-span-3">
              <Suspense fallback={<div>Loading companies...</div>}>
                <CompanyList allCompanies={companies} />
              </Suspense>
            </div>
          </div>
        </div>
      </main>
    </FilterProvider>
  )
}