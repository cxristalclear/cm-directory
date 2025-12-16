import React from 'react'
import { render, screen } from '@testing-library/react'
import DataErrorBoundary from '../DataErrorBoundary'

// Component that throws an error
const ThrowError = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error')
  }
  return <div>No error</div>
}

describe('DataErrorBoundary', () => {
  // Suppress console.error for error boundary tests
  const originalError = console.error
  beforeAll(() => {
    console.error = jest.fn()
  })

  afterAll(() => {
    console.error = originalError
  })

  it('should render children when there is no error', () => {
    render(
      <DataErrorBoundary>
        <div>Test content</div>
      </DataErrorBoundary>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render error UI when error occurs', () => {
    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    )

    expect(screen.getByText('Unable to Load Data')).toBeInTheDocument()
    expect(screen.getByText(/There was a problem loading the data/i)).toBeInTheDocument()
    expect(screen.getByText('Try Again')).toBeInTheDocument()
  })

  it('should show custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>

    render(
      <DataErrorBoundary fallback={customFallback}>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    )

    expect(screen.getByText('Custom error message')).toBeInTheDocument()
    expect(screen.queryByText('Unable to Load Data')).not.toBeInTheDocument()
  })

  it('should show network error message for network errors', () => {
    const NetworkError = () => {
      throw new TypeError('fetch failed')
    }

    render(
      <DataErrorBoundary>
        <NetworkError />
      </DataErrorBoundary>
    )

    expect(screen.getByText(/check your internet connection/i)).toBeInTheDocument()
  })

  it('should show timeout message for timeout errors', () => {
    const TimeoutError = () => {
      throw new Error('Request timeout')
    }

    render(
      <DataErrorBoundary>
        <TimeoutError />
      </DataErrorBoundary>
    )

    expect(screen.getByText(/request took too long/i)).toBeInTheDocument()
  })

  it('should call onReset when retry button is clicked', () => {
    const onReset = jest.fn()

    render(
      <DataErrorBoundary onReset={onReset}>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    )

    const retryButton = screen.getByText('Try Again')
    retryButton.click()

    expect(onReset).toHaveBeenCalled()
  })

  it('should show error details in development mode', () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'development'

    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    )

    expect(screen.getByText('Error Details (Development Only)')).toBeInTheDocument()

    ;(process.env as { NODE_ENV: string }).NODE_ENV = originalEnv
  })

  it('should not show error details in production mode', () => {
    const originalEnv = process.env.NODE_ENV
    ;(process.env as { NODE_ENV: string }).NODE_ENV = 'production'

    render(
      <DataErrorBoundary>
        <ThrowError shouldThrow={true} />
      </DataErrorBoundary>
    )

    expect(screen.queryByText('Error Details (Development Only)')).not.toBeInTheDocument()

    ;(process.env as { NODE_ENV: string }).NODE_ENV = originalEnv
  })
})

