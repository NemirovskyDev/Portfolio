import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MorphTransition } from './MorphTransition'
import { mockReducedMotion } from '../../test/utils'

beforeEach(() => mockReducedMotion(false))

describe('MorphTransition', () => {
  it('calls onDone immediately and renders nothing when motion is reduced', () => {
    mockReducedMotion(true)
    const onDone = vi.fn()
    const { container } = render(<MorphTransition covers={['a', 'b']} onDone={onDone} />)
    expect(onDone).toHaveBeenCalledTimes(1)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders one tile per cover, hidden from assistive tech, and does not finish synchronously', () => {
    const onDone = vi.fn()
    render(<MorphTransition covers={['a', 'b', 'c']} onDone={onDone} />)
    const overlay = screen.getByTestId('morph')
    expect(overlay).toHaveAttribute('aria-hidden', 'true')
    expect(overlay.querySelectorAll('.morph-tile')).toHaveLength(3)
    expect(onDone).not.toHaveBeenCalled()
  })

  it('finishes right away when there are no covers', () => {
    const onDone = vi.fn()
    render(<MorphTransition covers={[]} onDone={onDone} />)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
