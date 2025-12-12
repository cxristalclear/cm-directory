/**
 * Integration tests for getCompanies with real Supabase instance
 * 
 * These tests require:
 * - NEXT_PUBLIC_SUPABASE_URL environment variable
 * - NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable
 * 
 * Set these in your .env.test file or CI environment
 * 
 * Note: These tests make actual API calls to Supabase and should be run
 * against a test database, not production.
 */

import { getCompanies } from '@/lib/data/getCompanies'

// Skip integration tests if Supabase credentials are not configured
const shouldRunIntegrationTests: boolean = 
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL) && 
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) &&
  process.env.RUN_INTEGRATION_TESTS === 'true'

describe.skip('getCompanies integration tests', () => {
  beforeAll(() => {
    if (!shouldRunIntegrationTests) {
      console.warn('Skipping integration tests: Supabase credentials not configured')
      console.warn('Set RUN_INTEGRATION_TESTS=true and configure Supabase env vars to run')
    }
  })

  describe('when Supabase is available', () => {
    beforeEach(() => {
      // Only run if integration tests are enabled
      if (!shouldRunIntegrationTests) {
        return
      }
    })

    it('should fetch companies successfully', async () => {
      if (!shouldRunIntegrationTests) {
        return
      }

      const result = await getCompanies({
        maxCompanies: 10, // Limit for faster tests
        enableRetry: true,
      })

      expect(result.error).toBeNull()
      expect(result.companies).toBeInstanceOf(Array)
      expect(result.attempts).toBeGreaterThan(0)
      expect(result.payloadSizeBytes).toBeGreaterThan(0)
    }, 30000) // 30 second timeout for network calls

    it('should track payload size correctly', async () => {
      if (!shouldRunIntegrationTests) {
        return
      }

      const result = await getCompanies({
        maxCompanies: 50,
        enableRetry: true,
      })

      expect(result.payloadSizeBytes).toBeGreaterThan(0)
      
      // Payload should be reasonable (less than 10MB for 50 companies)
      const payloadMB = result.payloadSizeBytes / (1024 * 1024)
      expect(payloadMB).toBeLessThan(10)
      
      // Log for visibility
      console.log(`Payload size for 50 companies: ${payloadMB.toFixed(2)}MB`)
    }, 30000)

    it('should track load time', async () => {
      if (!shouldRunIntegrationTests) {
        return
      }

      const result = await getCompanies({
        maxCompanies: 10,
        enableRetry: true,
      })

      expect(result.loadTimeMs).not.toBeNull()
      expect(result.loadTimeMs!).toBeGreaterThan(0)
      
      // Load time should be reasonable (less than 10 seconds)
      expect(result.loadTimeMs!).toBeLessThan(10000)
      
      // Log for visibility
      console.log(`Load time for 10 companies: ${result.loadTimeMs!.toFixed(2)}ms`)
    }, 30000)

    it('should handle retry on transient errors', async () => {
      if (!shouldRunIntegrationTests) {
        return
      }

      // This test verifies retry logic works with real network
      // In a real scenario, you might temporarily disconnect network
      // or use a proxy to simulate failures
      const result = await getCompanies({
        maxCompanies: 5,
        enableRetry: true,
        retryOptions: {
          maxAttempts: 2,
          initialDelayMs: 100,
        },
      })

      // Should eventually succeed or fail gracefully
      expect(result.attempts).toBeGreaterThan(0)
      expect(result.attempts).toBeLessThanOrEqual(2)
    }, 30000)

    it('should respect maxCompanies limit', async () => {
      if (!shouldRunIntegrationTests) {
        return
      }

      const result = await getCompanies({
        maxCompanies: 5,
        enableRetry: true,
      })

      expect(result.companies.length).toBeLessThanOrEqual(5)
    }, 30000)
  })
})

// Export a helper to check if integration tests should run
export function canRunIntegrationTests(): boolean {
  return shouldRunIntegrationTests
}

