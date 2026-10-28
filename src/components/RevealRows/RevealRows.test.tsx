import { describe, it, expect, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { RevealRows, rowVariants, cardVariants } from './RevealRows'
import { Row } from '../Row/Row'
import { mockReducedMotion, projects, renderWithState } from '../../test/utils'

beforeEach(() => mockReducedMotion(false))

const hiddenNodes = () => document.querySelectorAll('[style*="opacity: 0"]')

describe('RevealRows', () => {
  it('renders a plain wrapper with no inline opacity or transform when motion is reduced', () => {
    mockReducedMotion(true)
    renderWithState(
      <RevealRows>
        <Row categoria="Sites" projects={projects.slice(0, 2)} onOpen={() => {}} />
      </RevealRows>,
    )
    expect(document.querySelector('.reveal-static')).not.toBeNull()
    expect(document.querySelector('[style*="transform"], [style*="opacity"]')).toBeNull()
  })

  it('never leaves rows hidden when IntersectionObserver is missing', () => {
    const original = window.IntersectionObserver
    // @ts-expect-error simulating an old browser, print or crawler
    delete window.IntersectionObserver
    try {
      renderWithState(
        <RevealRows>
          <Row categoria="Sites" projects={projects.slice(0, 2)} onOpen={() => {}} />
        </RevealRows>,
      )
      expect(hiddenNodes()).toHaveLength(0)
    } finally {
      window.IntersectionObserver = original
    }
  })

  it('renders every row and card when motion is allowed, starting hidden', () => {
    renderWithState(
      <RevealRows>
        <Row categoria="Sites" projects={projects.slice(0, 2)} onOpen={() => {}} />
        <section>two</section>
      </RevealRows>,
    )
    expect(screen.getByText('two')).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
    expect(document.querySelector('.reveal-rows')).not.toBeNull()
    expect(hiddenNodes().length).toBeGreaterThan(0)
  })

  it('reveals a row when keyboard focus lands inside it', async () => {
    renderWithState(
      <RevealRows>
        <Row categoria="Sites" projects={projects.slice(0, 2)} onOpen={() => {}} />
      </RevealRows>,
    )
    const item = document.querySelector('.reveal-item') as HTMLElement
    expect(item.style.opacity).toBe('0')
    screen.getAllByRole('button')[0].focus()
    await waitFor(() => expect(item.style.opacity).toBe('1'))
  })

  it('keeps medium intensity: rotation <= 20deg, translation <= 120px', () => {
    const h = rowVariants.hidden as { rotateX: number; y: number }
    const c = cardVariants.hidden as { rotateY: number; y: number }
    expect(Math.abs(h.rotateX)).toBeLessThanOrEqual(20)
    expect(Math.abs(c.rotateY)).toBeLessThanOrEqual(20)
    expect(Math.abs(h.y)).toBeLessThanOrEqual(120)
    expect(Math.abs(c.y)).toBeLessThanOrEqual(120)
  })
})
