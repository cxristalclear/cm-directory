'use client'

import React, { Component, ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class FilterErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Filter error caught:', error, errorInfo)
    
    // You can log to an error reporting service here
    // Example: logErrorToService(error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    
    // Clear filters from URL
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.search = ''
      window.history.replaceState({}, '', url.toString())
      window.location.reload()
    }
  }

  /**
  * Error boundary around filter-related UI that catches rendering errors and shows a fallback or default error panel
  * @component
  * @example
  *   <FilterErrorBoundary fallback={<div>Failed to load filters</div>}>
  *     <Filters />
  *   </FilterErrorBoundary>
  * @prop {React.ReactNode} children - The child elements to render when no error has occurred.
  * @prop {React.ReactNode} [fallback] - Optional custom fallback UI to display when an error is caught. If provided, this node is rendered instead of the default error panel.
  * @state {boolean} hasError - Whether an error has been captured by the boundary; when true the component renders the fallback or default error UI.
  * @state {Error|null} error - The captured Error object (if any); used to display a detailed message during development.
  * @lifecycle static getDerivedStateFromError(error) - Typical static lifecycle that sets hasError=true and stores the error so the boundary can render a fallback UI.
  * @lifecycle componentDidCatch(error, info) - Typical lifecycle used to log/report the error (e.g., send to monitoring) and preserve any additional info about the failure.
  * @method handleReset() - Resets the boundary state (clears hasError and error) to allow children to attempt rendering again; wired to the "Reset Filters" button.
  * @rendering
  *   - When no error: returns this.props.children.
  *   - When an error is present:
  *     1) If this.props.fallback is provided, returns that node.
  *     2) Otherwise returns a default styled error card containing:
  *        - An alert icon and heading "Filter Error".
  *        - A brief message explaining there was a problem loading filters (e.g., invalid filter parameters).
  *        - In development only (process.env.NODE_ENV === 'development'), a preformatted block showing error.message.
  *        - A "Reset Filters" destructive button that invokes handleReset; icons and utility classes are used for presentation.
  */
  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="rounded-xl border-2 border-red-200 bg-red-50 p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Filter Error
              </h3>
              <p className="text-red-700 mb-4">
                There was a problem loading the filters. This might be due to invalid filter parameters.
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <pre className="text-xs bg-red-100 text-red-800 p-3 rounded-lg mb-4 overflow-auto">
                  {this.state.error.message}
                </pre>
              )}
              
              <button
                onClick={this.handleReset}
                className="btn btn--destructive"
              >
                <RefreshCw className="w-4 h-4" />
                Reset Filters
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default FilterErrorBoundary
