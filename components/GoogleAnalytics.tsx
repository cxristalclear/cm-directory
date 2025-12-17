'use client'

import Script from 'next/script'
import { analyticsConfig } from '@/lib/config'
import { useCookieConsent } from '@/hooks/useCookieConsent'

/**
 * Google Analytics component that only loads after user consent
 * Blocks GA script until consent is given
 */
export default function GoogleAnalytics() {
  const { hasConsent, isLoading } = useCookieConsent()

  // Don't render anything if analytics is disabled or still loading consent
  if (!analyticsConfig.enabled || isLoading || !hasConsent) {
    // Log warning in development/production to help diagnose missing env var
    if (process.env.NODE_ENV === 'development' || typeof window !== 'undefined') {
      if (!analyticsConfig.enabled) {
        console.warn('[GA] Google Analytics is disabled. Set NEXT_PUBLIC_GA_MEASUREMENT_ID environment variable to enable.')
      } else if (!hasConsent) {
        // Only log in dev to avoid console spam
        if (process.env.NODE_ENV === 'development') {
          console.log('[GA] Waiting for cookie consent...')
        }
      }
    }
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gaId}`}
        strategy="afterInteractive"
        onLoad={() => {
          if (process.env.NODE_ENV === 'development') {
            console.log('[GA] Google Analytics script loaded successfully')
          }
        }}
        onError={() => {
          console.error('[GA] Failed to load Google Analytics script')
        }}
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsConfig.gaId}');
          ${process.env.NODE_ENV === 'development' ? "console.log('[GA] Google Analytics initialized with ID:', '" + analyticsConfig.gaId + "');" : ''}
        `}
      </Script>
    </>
  )
}

