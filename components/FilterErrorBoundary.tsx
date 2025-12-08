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
