'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'

type PaginationProps = {
  hasNext: boolean
  hasPrev: boolean
  nextCursor?: string | null
  prevCursor?: string | null
  onCursorChange: (cursor: string | null) => void
}

export default function Pagination({
  hasNext,
  hasPrev,
  nextCursor,
  prevCursor,
  onCursorChange,
}: PaginationProps) {
  const previousCursor = prevCursor ?? null
  const upcomingCursor = nextCursor ?? null

  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={() => onCursorChange(previousCursor)}
        disabled={!hasPrev}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeftIcon className="mr-2 h-4 w-4" />
        Previous
      </button>
      <button
        type="button"
        onClick={() => onCursorChange(upcomingCursor)}
        disabled={!hasNext}
        className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
        <ChevronRightIcon className="ml-2 h-4 w-4" />
      </button>
    </div>
  )
}
