'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useFilters } from '../contexts/FilterContext'

interface CompanyListProps {
  allCompanies: any[]
}

export default function CompanyList({ allCompanies }: CompanyListProps) {
  const { filters } = useFilters()
  const [filteredCompanies, setFilteredCompanies] = useState(allCompanies)

  useEffect(() => {
    let filtered = [...allCompanies]

    // Apply same filtering logic as map
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      filtered = filtered.filter(company =>
        company.company_name?.toLowerCase().includes(searchLower) ||
        company.description?.toLowerCase().includes(searchLower)
      )
    }

    if (filters.states.length > 0) {
      filtered = filtered.filter(company =>
        company.facilities?.some((f: any) => filters.states.includes(f.state))
      )
    }

    if (filters.capabilities.length > 0) {
      filtered = filtered.filter(company => {
        if (!company.capabilities?.[0]) return false
        const cap = company.capabilities[0]
        return filters.capabilities.some(filter => {
          switch(filter) {
            case 'smt': return cap.pcb_assembly_smt
            case 'through_hole': return cap.pcb_assembly_through_hole
            case 'cable_harness': return cap.cable_harness_assembly
            case 'box_build': return cap.box_build_assembly
            case 'prototyping': return cap.prototyping
            default: return false
          }
        })
      })
    }

    if (filters.certifications.length > 0) {
      filtered = filtered.filter(company =>
        company.certifications?.some((cert: any) =>
          filters.certifications.includes(
            cert.certification_type.toLowerCase().replace(/\s+/g, '_')
          )
        )
      )
    }

    if (filters.employeeRange.length > 0) {
      filtered = filtered.filter(company =>
        filters.employeeRange.includes(company.employee_count_range)
      )
    }

    setFilteredCompanies(filtered)
  }, [filters, allCompanies])

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">
        Companies ({filteredCompanies.length})
      </h2>
      <div className="space-y-4 max-h-[600px] overflow-y-auto">
        {filteredCompanies.length === 0 ? (
          <p className="text-gray-500">No companies match your filters</p>
        ) : (
          filteredCompanies.map((company) => (
            <div key={company.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
              <h3 className="font-bold text-lg">
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
          ))
        )}
      </div>
    </div>
  )
}