'use client'

import { useCookieConsent } from '@/hooks/useCookieConsent'
import Link from 'next/link'

/**
 * Cookie consent banner component
 * Displays a banner at the bottom of the page until user accepts or rejects cookies
 * Complies with GDPR/CCPA requirements
 */
export default function CookieConsentBanner() {
  const { showBanner, acceptConsent, rejectConsent, isLoading } = useCookieConsent()

  if (!showBanner || isLoading) {
    return null
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white p-4 shadow-lg sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-description"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="text-base font-semibold text-slate-900 sm:text-lg"
            >
              Cookie Consent
            </h2>
            <p
              id="cookie-consent-description"
              className="mt-1 text-sm text-slate-600"
            >
              We use cookies to analyze site usage and improve your experience.
              By clicking &quot;Accept&quot;, you consent to our use of cookies.
              You can learn more in our{' '}
              <Link
                href="/privacy"
                className="font-medium text-primary underline hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-shrink-0">
            <button
              onClick={rejectConsent}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Reject cookies"
            >
              Reject
            </button>
            <button
              onClick={acceptConsent}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              aria-label="Accept cookies"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

