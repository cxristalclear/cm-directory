import CompanyMap from '../components/CompanyMap'
import CompanyList from '../components/CompanyList'

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="bg-blue-900 text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold">Contract Manufacturer Directory</h1>
          <p className="text-xl mt-2">Find the right manufacturing partner for your project</p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CompanyMap />
          </div>
          <div className="lg:col-span-1">
            <CompanyList />
          </div>
        </div>
      </div>
    </main>
  )
}