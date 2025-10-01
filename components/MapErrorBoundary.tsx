'use client'

import React, { Component, ReactNode } from 'react'
import { MapPin, AlertTriangle } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class MapErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Map error caught:', error, errorInfo)
    
    // Log to error reporting service
    // Example: logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-sm border border-gray-200/50 p-8 text-center min-h-[500px] flex items-center justify-center">
          <div className="max-w-md">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Map Unavailable
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              The map visualization couldn&apos;t be loaded. This might be due to:
            </p>
            <ul className="text-sm text-gray-600 text-left space-y-1 mb-6 max-w-xs mx-auto">
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Missing or invalid Mapbox access token</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Network connectivity issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-yellow-600 mt-0.5">•</span>
                <span>Browser compatibility problems</span>
              </li>
            </ul>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-4">
                <summary className="text-xs text-gray-500 cursor-pointer mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs bg-gray-100 text-gray-800 p-3 rounded-lg overflow-auto">
                  {this.state.error.message}
                </pre>
              </details>
            )}

            <div className="flex items-center justify-center gap-2 text-gray-500">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">You can still browse companies using the list below</span>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default MapErrorBoundary
