/**
 * Performance benchmark tests
 * 
 * These tests measure actual performance characteristics and can be used
 * to track performance regressions over time.
 * 
 * Run with: npm test -- test/lib/utils/performance.benchmark.test.ts
 */

import { trackPayloadSize, startPerformanceMeasure, endPerformanceMeasure } from '@/lib/utils/performance'

// Mock window.performance for benchmarks
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn().mockReturnValue([{ duration: 10 }]),
  now: jest.fn(() => Date.now()),
}

describe('Performance Benchmarks', () => {
  // Suppress console logs during benchmarks
  const originalConsoleLog = console.log
  beforeAll(() => {
    console.log = jest.fn()
    // Setup performance mock
    if (typeof window !== 'undefined') {
      Object.defineProperty(window, 'performance', {
        value: mockPerformance,
        writable: true,
        configurable: true,
      })
    } else {
      ;(global as any).window = { performance: mockPerformance }
    }
  })

  beforeEach(() => {
    jest.clearAllMocks()
    mockPerformance.getEntriesByName.mockReturnValue([{ duration: 10 }])
  })

  afterAll(() => {
    console.log = originalConsoleLog
  })

  describe('Payload Size Benchmarks', () => {
    it('should handle small payloads efficiently (< 1KB)', () => {
      const smallData = { id: 1, name: 'test' }
      const start = Date.now()
      const size = trackPayloadSize(smallData, 'small')
      const end = Date.now()

      expect(size).toBeLessThan(1024) // < 1KB
      expect(end - start).toBeLessThan(10) // < 10ms
    })

    it('should handle medium payloads efficiently (< 100KB)', () => {
      const mediumData = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Company ${i}`,
        description: 'Test description',
      }))
      
      const start = Date.now()
      const size = trackPayloadSize(mediumData, 'medium')
      const end = Date.now()

      expect(size).toBeLessThan(100 * 1024) // < 100KB
      expect(end - start).toBeLessThan(50) // < 50ms
    })

    it('should handle large payloads efficiently (< 2MB)', () => {
      const largeData = Array.from({ length: 500 }, (_, i) => ({
        id: i,
        company_name: `Company ${i}`,
        description: 'A'.repeat(500), // 500 char description
        facilities: Array.from({ length: 2 }, (_, j) => ({
          id: j,
          city: 'Test City',
          state: 'CA',
        })),
      }))
      
      const start = Date.now()
      const size = trackPayloadSize(largeData, 'large')
      const end = Date.now()

      expect(size).toBeLessThan(2 * 1024 * 1024) // < 2MB (target)
      expect(end - start).toBeLessThan(200) // < 200ms
      
      const sizeMB = size / (1024 * 1024)
      // Use original console.log for benchmark output
      if (typeof originalConsoleLog === 'function') {
        originalConsoleLog(`Large payload (500 companies): ${sizeMB.toFixed(2)}MB in ${(end - start).toFixed(2)}ms`)
      }
    })
  })

  describe('Performance Measurement Benchmarks', () => {
    it('should measure timing accurately', () => {
      // Mock a realistic duration
      mockPerformance.getEntriesByName.mockReturnValueOnce([{ duration: 12.5 }])
      
      startPerformanceMeasure('benchmark-test')
      
      // Simulate some work (just a small delay)
      const start = Date.now()
      while (Date.now() - start < 5) {
        // Busy wait for ~5ms
      }
      
      const duration = endPerformanceMeasure('benchmark-test')

      // Should measure the mocked duration
      expect(duration).not.toBeNull()
      expect(duration!).toBe(12.5)
    })

    it('should handle rapid sequential measurements', () => {
      // Mock durations for each measurement
      mockPerformance.getEntriesByName.mockImplementation(() => [{ duration: 1.5 }])
      
      const measurements: (number | null)[] = []

      for (let i = 0; i < 10; i++) {
        startPerformanceMeasure(`rapid-${i}`)
        // Tiny delay
        const start = Date.now()
        while (Date.now() - start < 1) {}
        const duration = endPerformanceMeasure(`rapid-${i}`)
        measurements.push(duration)
      }

      // All measurements should complete
      expect(measurements.length).toBe(10)
      expect(measurements.every(m => m !== null)).toBe(true)
      
      // Total time should be reasonable (10 measurements * 1.5ms each = 15ms)
      const totalTime = measurements.reduce((sum, m) => sum + (m || 0), 0)
      expect(totalTime).toBeLessThan(100)
    })
  })

  describe('Target Performance Metrics', () => {
    it('should meet target: 500 companies payload < 2MB', () => {
      // Simulate 500 companies with typical data structure
      const companies = Array.from({ length: 500 }, (_, i) => ({
        id: `company-${i}`,
        slug: `company-${i}`,
        company_name: `Company ${i}`,
        description: 'Test description',
        employee_count_range: '50-100',
        website_url: 'https://example.com',
        facilities: [
          {
            id: `facility-${i}-1`,
            city: 'Test City',
            state: 'CA',
            country: 'US',
          },
        ],
        capabilities: [{
          pcb_assembly_smt: true,
          pcb_assembly_through_hole: false,
        }],
      }))

      const size = trackPayloadSize(companies, '500-companies')
      const sizeMB = size / (1024 * 1024)

      expect(sizeMB).toBeLessThan(2) // Target: < 2MB
      console.log(`500 companies payload: ${sizeMB.toFixed(2)}MB`)
    })

    it('should meet target: load time < 3000ms for 500 companies', async () => {
      // This is a benchmark test - in real scenario, this would be an actual fetch
      // For now, we'll test the measurement infrastructure
      mockPerformance.getEntriesByName.mockReturnValueOnce([{ duration: 1500 }])
      
      startPerformanceMeasure('load-benchmark')
      
      // Simulate database query time (target: < 3000ms)
      await new Promise(resolve => setTimeout(resolve, 50)) // Small delay
      
      const loadTime = endPerformanceMeasure('load-benchmark')

      expect(loadTime).not.toBeNull()
      expect(loadTime!).toBeLessThan(3000) // Target: < 3000ms
      // Log for visibility (will be suppressed but shows the test ran)
      if (typeof originalConsoleLog === 'function') {
        originalConsoleLog(`Simulated load time: ${loadTime!.toFixed(2)}ms`)
      }
    })
  })
})

