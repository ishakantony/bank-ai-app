import { Component, type ReactNode } from 'react'

interface Props {
  fallback: ReactNode
  children: ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches runtime throws from a lazily-rendered block (bad render logic, an
 * unexpected data shape that slipped past Zod, a failed chunk load) and shows
 * the same inline fallback used for invalid data, so one broken block can never
 * take down the whole message.
 */
export class BlockErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) {
      console.warn('[block] render error', error)
    }
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children
  }
}
