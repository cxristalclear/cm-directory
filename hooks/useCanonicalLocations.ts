'use client'

import { useEffect, useMemo, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/database.types'

type CountryOption = {
  iso2: string
  name: string
}

type StateOption = {
  country_iso2: string
  code: string
  name: string
}

type CanonicalLocationState = {
  countries: CountryOption[]
  states: StateOption[]
  loading: boolean
  error: string | null
}

export function useCanonicalLocations(): CanonicalLocationState {
  const supabase = useMemo(() => createClientComponentClient<Database>(), [])
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [states, setStates] = useState<StateOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    const loadLocations = async () => {
      try {
        setLoading(true)
        const [{ data: countryData, error: countryError }, { data: stateData, error: stateError }] =
          await Promise.all([
            supabase.from('countries').select('iso2, name').order('name'),
            supabase.from('states').select('country_iso2, code, name').order('country_iso2').order('name'),
          ])

        if (!isMounted) return

        if (countryError || stateError) {
          setError(countryError?.message || stateError?.message || 'Unable to load location data')
          return
        }

        setCountries(countryData ?? [])
        setStates(stateData ?? [])
        setError(null)
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Unable to load location data')
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    loadLocations()

    return () => {
      isMounted = false
    }
  }, [supabase])

  return { countries, states, loading, error }
}
