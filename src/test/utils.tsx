import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { AppStateProvider } from '../state/AppState'
import { validateProjects } from '../lib/validate'
import seed from '../data/projects.json'

export const projects = validateProjects(seed)

export function renderWithState(ui: ReactElement) {
  return render(<AppStateProvider>{ui}</AppStateProvider>)
}

/** jsdom has no matchMedia; this installs one that reports prefers-reduced-motion. */
export function mockReducedMotion(reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: reduce && query.includes('prefers-reduced-motion'),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as typeof window.matchMedia
}
