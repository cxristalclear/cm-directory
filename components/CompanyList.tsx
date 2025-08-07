'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

interface Company {
  id: string
  company_name: string
  slug: string
  website_url: string
  employee_count_range: string
  facilities: {
    city: string
    state: string
  }[]
  capabilities: {
    pcb_assembly_smt: boolean
    prototyping: boolean
    box_build_assembly: boolean
  }[]
}

export default function CompanyList() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCompanies()
  }, [])

  const fetchCompanies = async () => {
    const { data, error } = await supabase
      .from('companies')
      .select(`
        id,
        company_name,
        slug,
        website_url,
        employee_count_range,
        facilities (city, state),
        capabilities (pcb_assembly_smt, prototyping, box_build_assembly)
      `)
      .limit(20)

    if (data) {
      setCompanies(data as any)
    }
    setLoading(false)
  }

  if (loading) return <div>Loading companies...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Featured Companies</h2>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {companies.map((company) => (
          <div key={company.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
            <h3 className="font-bold text-lg text-orange-900">
              <Link href={`/companies/${company.slug}`} className="hover:text-blue-600">
                {company.company_name}
              </Link>
            </h3>
            <p className="text-sm text-gray-600">
              {company.facilities?.[0]?.city}, {company.facilities?.[0]?.state}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {company.employee_count_range} employees
            </p>
            <div className="flex gap-2 mt-2">
              {company.capabilities?.[0]?.pcb_assembly_smt && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">SMT</span>
              )}
              {company.capabilities?.[0]?.prototyping && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Prototyping</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}