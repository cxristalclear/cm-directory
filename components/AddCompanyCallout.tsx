'use client'

import Link from 'next/link'
import { Plus, CheckCircle } from 'lucide-react'

interface AddCompanyCalloutProps {
  className?: string
}

export default function AddCompanyCallout({ className = '' }: AddCompanyCalloutProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-md p-4 ${className}`}>
      <div className="flex flex-col gap-3">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900 mb-1.5">Not seeing your company?</h3>
          <p className="text-xs text-gray-600 mb-2.5">
            Add your manufacturing company to our directory and get discovered by potential customers.
          </p>
          <ul className="space-y-1">
            <li className="flex items-center gap-1.5 text-xs text-gray-700">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Free listing</span>
            </li>
            <li className="flex items-center gap-1.5 text-xs text-gray-700">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Increase visibility</span>
            </li>
            <li className="flex items-center gap-1.5 text-xs text-gray-700">
              <CheckCircle className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>Connect with buyers</span>
            </li>
          </ul>

          {/* Button below the text */}
          <Link
            href="/list-your-company"
            className="mt-3 inline-flex items-center justify-center gap-1.5 w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Add Your Company
          </Link>
        </div>
      </div>
    </div>
  )
}
