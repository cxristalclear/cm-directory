"use client"

import { useCallback } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import type { CompanyPageInfo } from "@/lib/queries/companySearch"

import { buildCursorUrl } from "./paginationUtils"

interface PaginationProps {
  pageInfo: Pick<
    CompanyPageInfo,
    "hasNextPage" | "hasPreviousPage" | "nextCursor" | "prevCursor"
  >
}

export default function Pagination({ pageInfo }: PaginationProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const updateCursor = useCallback(
    (cursor: string | null) => {
      const params = new URLSearchParams(searchParams?.toString())
      const nextUrl = buildCursorUrl(pathname, params, cursor)
      router.replace(nextUrl, { scroll: false })
    },
    [pathname, router, searchParams],
  )

  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          onClick={() => updateCursor(pageInfo.prevCursor)}
          disabled={!pageInfo.hasPreviousPage}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => updateCursor(pageInfo.nextCursor)}
          disabled={!pageInfo.hasNextPage}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
      <div className="hidden flex-1 items-center justify-between sm:flex">
        <div className="text-sm text-gray-700">Use the arrows to load more companies</div>
        <div>
          <nav className="inline-flex -space-x-px rounded-md shadow-sm">
            <button
              type="button"
              onClick={() => updateCursor(pageInfo.prevCursor)}
              disabled={!pageInfo.hasPreviousPage}
              className="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => updateCursor(pageInfo.nextCursor)}
              disabled={!pageInfo.hasNextPage}
              className="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  )
}
