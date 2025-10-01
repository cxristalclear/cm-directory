import Link from "next/link"
import type { Metadata } from "next"
import { Settings } from "lucide-react"

export const metadata: Metadata = {
  title: 'Add Your Company | CM Directory',
  description: 'Find contract manufacturers by capability: PCB assembly, cable harness, box build, testing, and more.',
}

export default function CapabilitiesIndexPage() {
  const capabilities = [
    { slug: 'pcb-assembly', name: 'PCB Assembly', count: 45 },
    { slug: 'cable-harness', name: 'Cable & Harness Assembly', count: 32 },
    { slug: 'box-build', name: 'Box Build Assembly', count: 28 },
    { slug: 'prototyping', name: 'Prototyping Services', count: 38 },
    { slug: 'testing', name: 'Testing Services', count: 41 },
  ]
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-4">Browse by Manufacturing Capability</h1>
        <p className="text-xl text-gray-600 mb-8">
          Find contract manufacturers with specific capabilities and services
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {capabilities.map(cap => (
            <Link
              key={cap.slug}
              href={`/capabilities/${cap.slug}`}
              className="bg-white p-6 rounded-lg border hover:border-blue-500 hover:shadow-lg transition-all"
            >
              <Settings className="w-8 h-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-lg mb-2">{cap.name}</h3>
              <p className="text-gray-500">{cap.count} manufacturers</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}