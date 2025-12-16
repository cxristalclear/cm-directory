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
    return null
  }

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsConfig.gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsConfig.gaId}');
        `}
      </Script>
    </>
  )
}

