'use client'

import { useEffect } from 'react'
import NextLink from 'next/link'
import { AlertTriangle, Home } from 'lucide-react'
import Navbar from '@/components/navbar'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <head>
        <meta name="robots" content="noindex, nofollow" />
      </head>
      <body>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full">
            <div className="card-elevated rounded-2xl p-8 text-center">
              <div className="mb-6 flex justify-center">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Critical Error
              </h1>
              <p className="text-gray-600 mb-6">
                We encountered a critical error. Please try refreshing the page or return to the homepage.
              </p>

              {process.env.NODE_ENV === 'development' && (
                <div className="mb-6 p-4 bg-red-50 rounded-lg text-left">
                  <p className="text-sm font-mono text-red-800 break-all">
                    {error.message}
                  </p>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={reset}
                  className="btn btn-primary btn--lg flex-1"
                >
                  Reload Page
                </button>
                <NextLink
                  href="/"
                  className="btn btn--muted btn--lg flex-1"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </NextLink>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
