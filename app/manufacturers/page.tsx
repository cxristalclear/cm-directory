import Link from "next/link"
import type { Metadata } from "next"
import { MapPin } from "lucide-react"
import { supabase } from "@/lib/supabase"

export const metadata: Metadata = {
  title: 'Contract Manufacturers by State | Browse All Locations',
  description: 'Find contract manufacturers across the United States. Browse by state to find local manufacturing partners with the capabilities and certifications you need.',
}

export default async function ManufacturersIndexPage() {
  // Get counts by state
  const { data: stateCounts } = await supabase
    .from('facilities')
    .select('state')
    .not('state', 'is', null)
  
  const stateStats = stateCounts?.reduce((acc, { state }) => {
    acc[state] = (acc[state] || 0) + 1
    return acc
  }, {} as Record<string, number>) || {}
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Contract Manufacturers by State</h1>
        <p className="text-xl text-gray-600 mb-8">
          Browse our directory of verified contract manufacturers organized by location
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(stateStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([state, count]) => (
              <Link
                key={state}
                href={`/manufacturers/${state.toLowerCase()}`}
                className="bg-white p-4 rounded-lg border hover:border-blue-500 hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-lg">{state}</h3>
                    <p className="text-sm text-gray-500">{count} manufacturers</p>
                  </div>
                  <MapPin className="w-5 h-5 text-gray-400" />
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  )
}