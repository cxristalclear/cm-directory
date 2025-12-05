import { useEffect, useState } from 'react'

/**
* Debounces a value and returns the debounced value after the specified delay.
* @example
* useDebounce('searchTerm', 500)
* 'searchTerm'
* @param {{T}} {{value}} - The value to debounce.
* @param {{number}} {{delay}} - The debounce delay in milliseconds (defaults to 300).
* @returns {{T}} The debounced value.
**/
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}