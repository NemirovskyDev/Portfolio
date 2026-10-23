import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(cleanup)

// jsdom has no canvas; make the probe quiet (tests that need a context mock it themselves)
HTMLCanvasElement.prototype.getContext = (() => null) as typeof HTMLCanvasElement.prototype.getContext

// scroll-linked effects observe sizes and visibility, which jsdom lacks
class NoopObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return []
  }
}
window.ResizeObserver ??= NoopObserver as unknown as typeof ResizeObserver
window.IntersectionObserver ??= NoopObserver as unknown as typeof IntersectionObserver
