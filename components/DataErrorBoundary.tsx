'use client'

import { Component, type ReactNode } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

/**
 * Error boundary for data loading errors
 * Displays user-friendly error messages with retry options
 */
export class DataErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Data loading error caught:', error, errorInfo)
    
    // Log to error reporting service (Sentry ready)
    // if (typeof window !== 'undefined' && window.Sentry) {
    //   window.Sentry.captureException(error, {
    //     contexts: {
    //       react: errorInfo,
    //     },
    //   })
    // }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Determine error type for better messaging
      const errorMessage = this.state.error?.message || 'Unknown error'
      const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network')
      const isTimeoutError = errorMessage.includes('timeout') || errorMessage.includes('TIMEDOUT')

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
                Unable to Load Data
              </h3>
              <p className="text-red-700 mb-4">
                {isNetworkError
                  ? 'We couldn\'t connect to our servers. Please check your internet connection and try again.'
                  : isTimeoutError
                  ? 'The request took too long to complete. Please try again.'
                  : 'There was a problem loading the data. Please try refreshing the page.'}
              </p>
              
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4">
                  <summary className="text-sm text-red-600 cursor-pointer mb-2">
                    Error Details (Development Only)
                  </summary>
                  <pre className="text-xs bg-red-100 text-red-800 p-3 rounded-lg overflow-auto">
                    {this.state.error.message}
                  </pre>
                </details>
              )}
              
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default DataErrorBoundary



