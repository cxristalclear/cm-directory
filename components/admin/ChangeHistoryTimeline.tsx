'use client'

import { Clock, User, ArrowRight } from 'lucide-react'
import { formatDate } from '@/lib/admin/utils'

interface ChangeLog {
  id: string
  changed_by_email: string
  changed_by_name: string
  changed_at: string
  change_type: 'created' | 'claimed' | 'updated' | 'verified' | 'approved' | 'rejected'
  field_name: string | null
  old_value: string | null
  new_value: string | null
}

interface ChangeHistoryTimelineProps {
  changes: ChangeLog[]
}

const changeTypeColors: Record<string, string> = {
  created: 'bg-green-100 text-green-800',
  updated: 'bg-blue-100 text-blue-800',
  claimed: 'bg-purple-100 text-purple-800',
  verified: 'bg-emerald-100 text-emerald-800',
  approved: 'bg-teal-100 text-teal-800',
  rejected: 'bg-red-100 text-red-800',
}

const changeTypeLabels: Record<string, string> = {
  created: 'Created',
  updated: 'Updated',
  claimed: 'Claimed',
  verified: 'Verified',
  approved: 'Approved',
  rejected: 'Rejected',
}

export default function ChangeHistoryTimeline({ changes }: ChangeHistoryTimelineProps) {
  if (!changes || changes.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-12 text-center text-gray-500">
        No change history available
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="p-6">
        <div className="flow-root">
          <ul className="-mb-8">
            {changes.map((change, index) => (
              <li key={change.id}>
                <div className="relative pb-8">
                  {index !== changes.length - 1 && (
                    <span
                      className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  )}
                  <div className="relative flex items-start space-x-3">
                    {/* Icon */}
                    <div>
                      <div className="relative px-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 ring-8 ring-white">
                          <Clock className="h-5 w-5 text-gray-500" />
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            changeTypeColors[change.change_type] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {changeTypeLabels[change.change_type] || change.change_type}
                        </span>
                        <p className="text-sm text-gray-500">
                          {formatDate(change.changed_at)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {change.changed_by_name}
                          <span className="text-gray-500 ml-1">
                            ({change.changed_by_email})
                          </span>
                        </p>
                      </div>

                      {change.field_name && (
                        <div className="mt-2 text-sm">
                          <p className="font-medium text-gray-900 mb-1">
                            Changed: <span className="font-mono text-blue-600">{change.field_name}</span>
                          </p>
                          <div className="flex items-center gap-3 bg-gray-50 rounded-md p-3">
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">Old Value</p>
                              <p className="text-sm text-gray-700 font-mono break-words">
                                {change.old_value || <span className="text-gray-400 italic">null</span>}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs text-gray-500 mb-1">New Value</p>
                              <p className="text-sm text-gray-900 font-mono break-words">
                                {change.new_value || <span className="text-gray-400 italic">null</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}