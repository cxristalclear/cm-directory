'use client'

import Link from 'next/link'
import { Plus, CheckCircle } from 'lucide-react'

interface AddCompanyCalloutProps {
  className?: string
}

export default function AddCompanyCallout({ className = '' }: AddCompanyCalloutProps) {
  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-6 ${className}`}>
      <div className="flex flex-col gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Not seeing your company?</h3>
          <p className="text-sm text-gray-600 mb-3">
            Add your manufacturing company to our directory and get discovered by potential customers.
          </p>
          <ul className="space-y-1.5">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Free listing</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Increase visibility</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Connect with buyers</span>
            </li>
          </ul>

          {/* Button below the text */}
          <Link
            href="/add-your-company"
            className="mt-4 inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Add Your Company
          </Link>
        </div>
      </div>
    </div>
  )
}
