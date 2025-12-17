import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl: string
  className?: string
}

/**
 * Pagination component following SEO best practices.
 * Displays: Previous | 1 2 3 ... | Next
 */
export default function Pagination({
  currentPage,
  totalPages,
  baseUrl,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = []
    const maxVisible = 7 // Show up to 7 page numbers

    if (totalPages <= maxVisible) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Always show first page
      pages.push(1)

      if (currentPage <= 4) {
        // Near the start: 1 2 3 4 5 ... last
        for (let i = 2; i <= 5; i++) {
          pages.push(i)
        }
        pages.push("...")
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Near the end: 1 ... (n-4) (n-3) (n-2) (n-1) n
        pages.push("...")
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // In the middle: 1 ... (current-1) current (current+1) ... last
        pages.push("...")
        pages.push(currentPage - 1)
        pages.push(currentPage)
        pages.push(currentPage + 1)
        pages.push("...")
        pages.push(totalPages)
      }
    }

    return pages
  }

  const pageNumbers = getPageNumbers()

  const getPageUrl = (page: number) => {
    if (page === 1) {
      return baseUrl
    }
    return `${baseUrl}?page=${page}`
  }

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-2 ${className}`}
    >
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Link>
      ) : (
        <span
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
          aria-disabled="true"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === "...") {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-2 text-gray-500"
                aria-hidden="true"
              >
                ...
              </span>
            )
          }

          const pageNum = page as number
          const isCurrentPage = pageNum === currentPage

          if (isCurrentPage) {
            return (
              <span
                key={pageNum}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 border border-blue-600 rounded-lg"
                aria-current="page"
                aria-label={`Page ${pageNum}, current page`}
              >
                {pageNum}
              </span>
            )
          }

          return (
            <Link
              key={pageNum}
              href={getPageUrl(pageNum)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              aria-label={`Go to page ${pageNum}`}
            >
              {pageNum}
            </Link>
          )
        })}
      </div>

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Go to next page"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <span
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
          aria-disabled="true"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </span>
      )}
    </nav>
  )
}

