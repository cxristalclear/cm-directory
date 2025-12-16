'use client'

import { useState, useEffect } from 'react'

const CONSENT_STORAGE_KEY = 'cookie-consent'
const CONSENT_VERSION = '1.0' // Increment if you need to re-prompt users

export type ConsentStatus = 'pending' | 'accepted' | 'rejected' | null

interface ConsentData {
  status: 'accepted' | 'rejected'
  timestamp: number
  version: string
}

/**
 * Hook to manage cookie consent state
 * Stores consent preference in localStorage
 */
export function useCookieConsent() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check localStorage for existing consent
    try {
      const stored = localStorage.getItem(CONSENT_STORAGE_KEY)
      if (stored) {
        const consentData: ConsentData = JSON.parse(stored)
        // If version changed, reset consent
        if (consentData.version === CONSENT_VERSION) {
          setConsentStatus(consentData.status)
        } else {
          // Version mismatch, clear old consent
          localStorage.removeItem(CONSENT_STORAGE_KEY)
          setConsentStatus('pending')
        }
      } else {
        setConsentStatus('pending')
      }
    } catch (error) {
      // If localStorage fails, default to pending
      console.warn('Failed to read cookie consent from localStorage:', error)
      setConsentStatus('pending')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const acceptConsent = () => {
    const consentData: ConsentData = {
      status: 'accepted',
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    }
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData))
      setConsentStatus('accepted')
    } catch (error) {
      console.warn('Failed to save cookie consent to localStorage:', error)
    }
  }

  const rejectConsent = () => {
    const consentData: ConsentData = {
      status: 'rejected',
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    }
    try {
      localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consentData))
      setConsentStatus('rejected')
    } catch (error) {
      console.warn('Failed to save cookie consent to localStorage:', error)
    }
  }

  const hasConsent = consentStatus === 'accepted'
  const showBanner = consentStatus === 'pending'

  return {
    consentStatus,
    hasConsent,
    showBanner,
    isLoading,
    acceptConsent,
    rejectConsent,
  }
}

