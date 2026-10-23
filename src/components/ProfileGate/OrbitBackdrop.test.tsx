import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { hasWebGL } from '../../lib/hasWebGL'
import { CanvasBoundary } from '../CanvasBoundary'
import { OrbitBackdrop } from './OrbitBackdrop'
import { mockReducedMotion } from '../../test/utils'

vi.mock('../../lib/hasWebGL', () => ({ hasWebGL: vi.fn(() => true) }))

let sceneThrows = false
vi.mock('../../scenes/OrbitScene', () => ({
  default: () => {
    if (sceneThrows) throw new Error('webgl context lost')
    return <div data-testid="scene" />
  },
}))

beforeEach(() => {
  sceneThrows = false
  vi.mocked(hasWebGL).mockReturnValue(true)
  mockReducedMotion(false)
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

const covers = ['a.webp', 'b.webp']

describe('OrbitBackdrop', () => {
  it('renders the scene when WebGL works and motion is allowed', async () => {
    render(<OrbitBackdrop covers={covers} />)
    expect(await screen.findByTestId('scene')).toBeInTheDocument()
    expect(screen.queryByTestId('orbit-fallback')).toBeNull()
  })

  it('renders the fallback when hasWebGL is false', () => {
    vi.mocked(hasWebGL).mockReturnValue(false)
    render(<OrbitBackdrop covers={covers} />)
    expect(screen.getByTestId('orbit-fallback')).toBeInTheDocument()
    expect(screen.queryByTestId('scene')).toBeNull()
  })

  it('renders the fallback when motion is reduced, without probing WebGL', () => {
    mockReducedMotion(true)
    render(<OrbitBackdrop covers={covers} />)
    expect(screen.getByTestId('orbit-fallback')).toBeInTheDocument()
    expect(hasWebGL).not.toHaveBeenCalled()
  })

  it('renders the fallback when the scene throws', async () => {
    sceneThrows = true
    render(<OrbitBackdrop covers={covers} />)
    expect(await screen.findByTestId('orbit-fallback')).toBeInTheDocument()
  })

  it('renders the fallback when there are no covers', () => {
    render(<OrbitBackdrop covers={[]} />)
    expect(screen.getByTestId('orbit-fallback')).toBeInTheDocument()
  })
})

describe('CanvasBoundary', () => {
  it('shows the fallback when a child throws and keeps siblings working', () => {
    const Boom = () => {
      throw new Error('boom')
    }
    render(
      <CanvasBoundary fallback={<p>fallback</p>}>
        <Boom />
      </CanvasBoundary>,
    )
    expect(screen.getByText('fallback')).toBeInTheDocument()
  })

  it('renders children when nothing throws', () => {
    render(
      <CanvasBoundary fallback={<p>fallback</p>}>
        <p>ok</p>
      </CanvasBoundary>,
    )
    expect(screen.getByText('ok')).toBeInTheDocument()
  })
})
