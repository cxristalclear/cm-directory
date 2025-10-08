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

const changeTypeVariants: Record<
  ChangeLog['change_type'],
  'success' | 'info' | 'warning' | 'error'
> = {
  created: 'success',
  updated: 'info',
  claimed: 'warning',
  verified: 'success',
  approved: 'success',
  rejected: 'error',
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
      <div className="glass-card p-12 text-center text-gray-500">
        No change history available
      </div>
    )
  }

  return (
    <div className="glass-card">
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
                          className={`admin-badge admin-badge-${changeTypeVariants[change.change_type]}`}
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
                        <div className="mt-3 text-sm">
                          <p className="font-medium text-gray-900 mb-2">
                            Changed:{' '}
                            <span className="font-mono gradient-text">{change.field_name}</span>
                          </p>
                          <div className="gradient-border rounded-2xl p-1">
                            <div className="grid items-stretch gap-3 md:grid-cols-[1fr_auto_1fr]">
                              <div className="glass-card h-full p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                  Old Value
                                </p>
                                <p className="text-sm text-gray-800 font-mono break-words">
                                  {change.old_value || <span className="text-gray-400 italic">null</span>}
                                </p>
                              </div>
                              <div className="hidden md:flex items-center justify-center">
                                <ArrowRight className="h-5 w-5 text-gray-400" />
                              </div>
                              <div className="glass-card h-full p-4">
                                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                  New Value
                                </p>
                                <p className="text-sm text-gray-900 font-mono break-words">
                                  {change.new_value || <span className="text-gray-400 italic">null</span>}
                                </p>
                              </div>
                            </div>
                            <div className="md:hidden mt-3 flex justify-center">
                              <ArrowRight className="h-5 w-5 text-gray-400" />
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