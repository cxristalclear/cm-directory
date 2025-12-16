'use client'

import Link from 'next/link'
import { Building2, FilterX, Search, Home } from 'lucide-react'
import { useContext } from 'react'
import { FilterContext } from '@/contexts/FilterContext'

interface EmptyStateProps {
  variant: 'no-results' | 'empty-database' | 'not-found'
  title?: string
  description?: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

/**
 * Reusable empty state component for various scenarios
 */
export default function EmptyState({
  variant,
  title,
  description,
  actionLabel,
  actionHref,
  onAction,
}: EmptyStateProps) {
  // Try to get filters, but handle case where FilterContext might not be available
  const filterContext = useContext(FilterContext)
  const filters = filterContext?.filters
  const clearFilters = filterContext?.clearFilters
  
  const hasActiveFilters = filters ? (
    filters.countries.length > 0 ||
    filters.states.length > 0 ||
    filters.capabilities.length > 0 ||
    filters.productionVolume !== null ||
    filters.employeeCountRanges.length > 0 ||
    (filters.searchQuery && filters.searchQuery.trim().length > 0)
  ) : false

  // Default content based on variant
  const getDefaultContent = () => {
    switch (variant) {
      case 'no-results':
        return {
          icon: Search,
          defaultTitle: 'No partners found',
          defaultDescription: hasActiveFilters
            ? 'No companies match your current filters. Try adjusting your search criteria or clearing some filters to see more results.'
            : 'No companies are available at this time.',
          showClearFilters: hasActiveFilters,
        }
      case 'empty-database':
        return {
          icon: Building2,
          defaultTitle: 'No Companies Available',
          defaultDescription: 'The directory is currently empty. Companies will appear here once they are added to the database.',
          showClearFilters: false,
        }
      case 'not-found':
        return {
          icon: Building2,
          defaultTitle: 'Company Not Found',
          defaultDescription: 'The manufacturer profile you\'re looking for doesn\'t exist or may have been removed.',
          showClearFilters: false,
        }
    }
  }

  const content = getDefaultContent()
  const Icon = content.icon
  const displayTitle = title || content.defaultTitle
  const displayDescription = description || content.defaultDescription

  const handleClearFilters = () => {
    if (clearFilters) {
      clearFilters()
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 p-12 text-center">
      <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      
      <h3 className="mb-2 text-lg font-bold text-gray-900">
        {displayTitle}
      </h3>
      
      <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
        {displayDescription}
      </p>

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
        {content.showClearFilters && (
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors font-medium text-sm"
          >
            <FilterX className="w-4 h-4" />
            Clear All Filters
          </button>
        )}
        
        {actionHref && (
          <Link
            href={actionHref}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            {variant === 'not-found' ? (
              <>
                <Home className="w-4 h-4" />
                {actionLabel || 'Return to Directory'}
              </>
            ) : (
              actionLabel || 'View All Companies'
            )}
          </Link>
        )}
        
        {onAction && !actionHref && (
          <button
            onClick={onAction}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            {actionLabel || 'Take Action'}
          </button>
        )}

        {variant === 'not-found' && !actionHref && (
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Home className="w-4 h-4" />
            Return to Directory
          </Link>
        )}
      </div>

      {/* Show active filter count hint for no-results variant */}
      {variant === 'no-results' && hasActiveFilters && filters && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            {filters.countries.length + filters.states.length + filters.capabilities.length} filter{filters.countries.length + filters.states.length + filters.capabilities.length !== 1 ? 's' : ''} active
          </p>
        </div>
      )}
    </div>
  )
}

