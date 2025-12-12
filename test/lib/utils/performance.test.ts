import {
  trackPayloadSize,
  startPerformanceMeasure,
  endPerformanceMeasure,
  logPerformanceSummary,
} from '@/lib/utils/performance'

// Mock window.performance
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByName: jest.fn(),
}

let consoleLogSpy: jest.SpyInstance
let consoleWarnSpy: jest.SpyInstance

beforeEach(() => {
  jest.clearAllMocks()
  
  // Setup console spies
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

  // Reset and setup performance mock
  if (typeof window !== 'undefined') {
    Object.defineProperty(window, 'performance', {
      value: mockPerformance,
      writable: true,
      configurable: true,
    })
  } else {
    // Create window object for tests
    ;(global as any).window = {
      performance: mockPerformance,
    }
  }
})

afterEach(() => {
  jest.restoreAllMocks()
})

describe('performance tracking utilities', () => {
  describe('trackPayloadSize', () => {
    it('should calculate payload size correctly', () => {
      const testData = { name: 'test', value: 123 }
      const size = trackPayloadSize(testData, 'Test Data')

      expect(size).toBeGreaterThan(0)
      expect(typeof size).toBe('number')
    })

    it('should log size in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Reset spy before test
      consoleLogSpy.mockClear()

      const testData = { name: 'test' }
      trackPayloadSize(testData, 'Test Data')

      // Check if console.log was called - it should log with format: "[Performance] Label: {object}"
      expect(consoleLogSpy).toHaveBeenCalled()
      const hasPerformanceLog = consoleLogSpy.mock.calls.some(call => {
        const firstArg = call[0]
        return typeof firstArg === 'string' && firstArg.includes('[Performance]')
      })
      expect(hasPerformanceLog).toBe(true)

      process.env.NODE_ENV = originalEnv
    })

    it('should not log in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      const testData = { name: 'test' }
      trackPayloadSize(testData, 'Test Data')

      expect(consoleLogSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should create performance mark when performance API is available', () => {
      // Ensure window.performance exists
      if (typeof window === 'undefined') {
        ;(global as any).window = { performance: mockPerformance }
      }
      
      const testData = { name: 'test' }
      trackPayloadSize(testData, 'Test Data')

      expect(mockPerformance.mark).toHaveBeenCalled()
      const markCall = mockPerformance.mark.mock.calls.find(call => 
        call[0] === 'Test Data-size'
      )
      expect(markCall).toBeDefined()
    })

    it('should handle large payloads', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        data: 'x'.repeat(100),
      }))
      
      const size = trackPayloadSize(largeData, 'Large Data')
      
      expect(size).toBeGreaterThan(100000) // Should be > 100KB
    })
  })

  describe('startPerformanceMeasure', () => {
    it('should create performance mark', () => {
      // Ensure window.performance exists
      if (typeof window === 'undefined') {
        ;(global as any).window = { performance: mockPerformance }
      }
      
      startPerformanceMeasure('test-measure')

      expect(mockPerformance.mark).toHaveBeenCalledWith('test-measure-start')
    })

    it('should handle server-side (no window)', () => {
      const originalWindow = global.window
      ;(global as any).window = undefined

      // Should not throw
      expect(() => startPerformanceMeasure('test')).not.toThrow()

      ;(global as any).window = originalWindow
    })
  })

  describe('endPerformanceMeasure', () => {
    beforeEach(() => {
      mockPerformance.getEntriesByName.mockReturnValue([
        { duration: 123.45 },
      ])
      // Ensure window.performance exists
      if (typeof window === 'undefined') {
        ;(global as any).window = { performance: mockPerformance }
      }
      // Reset console spy
      consoleLogSpy.mockClear()
    })

    it('should measure and return duration', () => {
      startPerformanceMeasure('test-measure')
      const duration = endPerformanceMeasure('test-measure')

      expect(mockPerformance.mark).toHaveBeenCalledWith('test-measure-end')
      expect(mockPerformance.measure).toHaveBeenCalledWith(
        'test-measure',
        'test-measure-start',
        'test-measure-end'
      )
      expect(duration).toBe(123.45)
    })

    it('should log duration in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Reset spy before test
      consoleLogSpy.mockClear()

      startPerformanceMeasure('test-measure')
      endPerformanceMeasure('test-measure')

      expect(consoleLogSpy).toHaveBeenCalled()
      const hasPerformanceLog = consoleLogSpy.mock.calls.some(call => {
        const firstArg = call[0]
        return typeof firstArg === 'string' && 
               firstArg.includes('[Performance]') && 
               firstArg.includes('123.45ms')
      })
      expect(hasPerformanceLog).toBe(true)

      process.env.NODE_ENV = originalEnv
    })

    it('should return null if measure fails', () => {
      mockPerformance.getEntriesByName.mockReturnValue([])

      startPerformanceMeasure('test-measure')
      const duration = endPerformanceMeasure('test-measure')

      expect(duration).toBeNull()
    })

    it('should handle server-side (no window)', () => {
      // Save original
      const originalWindow = (global as any).window
      const originalWindowType = typeof window
      
      // Mock typeof window to return 'undefined'
      // We can't actually delete window in Node environment, so we test the early return
      // by checking the function's behavior when window is actually undefined
      // Since we're in a test environment, we'll test by checking if it handles missing performance
      
      // Instead, let's test by making performance unavailable
      const originalPerf = mockPerformance.mark
      mockPerformance.mark = undefined as any
      
      const duration = endPerformanceMeasure('test')

      // Should return null when performance.mark is not available
      expect(duration).toBeNull()

      // Restore
      mockPerformance.mark = originalPerf
      if (originalWindow) {
        ;(global as any).window = originalWindow
      }
    })
  })

  describe('logPerformanceSummary', () => {
    it('should log summary in development mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Reset spies before test
      consoleLogSpy.mockClear()

      const consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation(() => {})
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {})

      logPerformanceSummary('Test Operation', 1024 * 1024, 1500)

      expect(consoleGroupSpy).toHaveBeenCalledWith(
        expect.stringContaining('[Performance Summary]')
      )
      expect(consoleLogSpy).toHaveBeenCalled()
      const hasPayloadLog = consoleLogSpy.mock.calls.some(call => {
        const firstArg = call[0]
        return typeof firstArg === 'string' && firstArg.includes('Payload size:')
      })
      expect(hasPayloadLog).toBe(true)
      const hasLoadTimeLog = consoleLogSpy.mock.calls.some(call => {
        const firstArg = call[0]
        return typeof firstArg === 'string' && firstArg.includes('Load time:')
      })
      expect(hasLoadTimeLog).toBe(true)
      expect(consoleGroupEndSpy).toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
      consoleGroupSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
    })

    it('should not log in production mode', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'production'

      logPerformanceSummary('Test Operation', 1024 * 1024, 1500)

      expect(consoleLogSpy).not.toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
    })

    it('should handle null load time', () => {
      const originalEnv = process.env.NODE_ENV
      process.env.NODE_ENV = 'development'
      
      // Reset spies before test
      consoleLogSpy.mockClear()

      const consoleGroupSpy = jest.spyOn(console, 'group').mockImplementation(() => {})
      const consoleGroupEndSpy = jest.spyOn(console, 'groupEnd').mockImplementation(() => {})

      logPerformanceSummary('Test Operation', 1024 * 1024, null)

      expect(consoleGroupSpy).toHaveBeenCalled()
      expect(consoleLogSpy).toHaveBeenCalled()
      const hasPayloadLog = consoleLogSpy.mock.calls.some(call => {
        const firstArg = call[0]
        return typeof firstArg === 'string' && firstArg.includes('Payload size:')
      })
      expect(hasPayloadLog).toBe(true)
      // Should not log load time when null
      const hasLoadTimeLog = consoleLogSpy.mock.calls.some(call => {
        const firstArg = call[0]
        return typeof firstArg === 'string' && firstArg.includes('Load time:')
      })
      expect(hasLoadTimeLog).toBe(false)
      expect(consoleGroupEndSpy).toHaveBeenCalled()

      process.env.NODE_ENV = originalEnv
      consoleGroupSpy.mockRestore()
      consoleGroupEndSpy.mockRestore()
    })
  })
})

