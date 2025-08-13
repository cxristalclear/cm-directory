'use client'

import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

export class FilterErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 text-red-700 rounded">
          <h2>Something went wrong with the filters.</h2>
          <button 
            onClick={() => window.location.href = window.location.pathname}
            className="mt-2 text-sm underline"
          >
            Reset All Filters
          </button>
        </div>
      )
    }

    return this.props.children
  }
}