'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, Link, RefreshCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
    
    // You can add error tracking here (e.g., Sentry)
    // if (typeof window !== 'undefined') {
    //   Sentry.captureException(error)
    // }
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-10 h-10 text-red-600" />
            </div>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. This has been logged and we&apos;ll look into it.
          </p>

          {/* Error Details (Development only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
              <p className="text-sm font-mono text-red-800 break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="btn btn--primary btn--lg flex-1"
            >
              <RefreshCcw className="w-4 h-4" />
              Try Again
            </button>
            <Link
              href="/"
              className="btn btn--muted btn--lg flex-1"
            >
              <Home className="w-4 h-4" />
              Go Home
            </Link>
          </div>

          {/* Support Info */}
          <p className="mt-6 text-sm text-gray-500">
            Need help?{' '}
            <a
              href="mailto:support@cm-directory.com"
              className="btn btn--link font-medium"
            >
              Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
