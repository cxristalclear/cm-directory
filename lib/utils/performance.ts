/**
 * Performance tracking utilities
 * Uses browser Performance API for load time and payload size tracking
 */

/**
 * Track payload size in bytes
 */
export function trackPayloadSize(data: unknown, label: string): number {
  if (typeof window === 'undefined') {
    // Server-side: estimate size
    const jsonString = JSON.stringify(data)
    return new Blob([jsonString]).size
  }

  // Client-side: actual measurement
  const jsonString = JSON.stringify(data)
  const sizeInBytes = new Blob([jsonString]).size
  const sizeInKB = sizeInBytes / 1024
  const sizeInMB = sizeInKB / 1024

  if (process.env.NODE_ENV === 'development') {
    console.log(`[Performance] ${label}:`, {
      bytes: sizeInBytes.toLocaleString(),
      kb: sizeInKB.toFixed(2),
      mb: sizeInMB.toFixed(2),
    })
  }

  // Log to performance API
  if ('performance' in window && 'mark' in window.performance) {
    performance.mark(`${label}-size`, {
      detail: { bytes: sizeInBytes, kb: sizeInKB, mb: sizeInMB },
    })
  }

  return sizeInBytes
}

/**
 * Start performance measurement
 */
export function startPerformanceMeasure(label: string): void {
  if (typeof window === 'undefined') return

  if ('performance' in window && 'mark' in window.performance) {
    performance.mark(`${label}-start`)
  }
}

/**
 * End performance measurement and log results
 */
export function endPerformanceMeasure(label: string): number | null {
  if (typeof window === 'undefined') return null

  if ('performance' in window && 'measure' in window.performance) {
    try {
      performance.mark(`${label}-end`)
      performance.measure(label, `${label}-start`, `${label}-end`)
      
      const measure = performance.getEntriesByName(label)[0]
      const duration = measure.duration

      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${label}: ${duration.toFixed(2)}ms`)
      }

      return duration
    } catch (error) {
      // Performance marks might not exist
      return null
    }
  }

  return null
}

/**
 * Log performance summary
 */
export function logPerformanceSummary(label: string, payloadSizeBytes: number, loadTimeMs: number | null): void {
  if (process.env.NODE_ENV !== 'development') return

  const payloadMB = payloadSizeBytes / (1024 * 1024)
  const payloadKB = payloadSizeBytes / 1024

  console.group(`[Performance Summary] ${label}`)
  console.log(`Payload size: ${payloadMB.toFixed(2)} MB (${payloadKB.toFixed(2)} KB)`)
  if (loadTimeMs !== null) {
    console.log(`Load time: ${loadTimeMs.toFixed(2)}ms`)
  }
  console.log(`Target: < 2MB, < 3000ms`)
  console.groupEnd()
}

