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

/**
 * Custom React hook that loads canonical country and state option lists from Supabase and provides loading and error state.
 * @example
 * useCanonicalLocations()
 * // {
 * //   countries: [{ iso2: 'US', name: 'United States' }],
 * //   states: [{ country_iso2: 'US', code: 'CA', name: 'California' }],
 * //   loading: false,
 * //   error: null
 * // }
 * @param {void} none - No arguments.
 * @returns {{countries: Array<{iso2: string, name: string}>, states: Array<{country_iso2: string, code: string, name: string}>, loading: boolean, error: string | null}} Returns an object containing country and state option arrays, a loading flag, and an optional error message.
 */
export function useCanonicalLocations(): CanonicalLocationState {
  const supabase = useMemo(() => createClientComponentClient<Database>(), [])
  const [countries, setCountries] = useState<CountryOption[]>([])
  const [states, setStates] = useState<StateOption[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    /**
    * Load countries and states from Supabase and update local state while managing loading and error flags.
    * @example
    * sync()
    * Promise<void>
    * @param {void} none - No parameters.
    * @returns {Promise<void>} Resolves when location data is loaded (or an error has been set) and loading is cleared.
    **/
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
