import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { motionValue } from 'motion/react'
import { hasWebGL } from '../../lib/hasWebGL'
import { StageCanvas } from './StageCanvas'
import { mockReducedMotion } from '../../test/utils'

vi.mock('../../lib/hasWebGL', () => ({ hasWebGL: vi.fn(() => true) }))

let sceneThrows = false
vi.mock('../../scenes/ShelfScene', () => ({
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

const covers = ['', 'a.webp', 'b.webp', '']
const backdrops = ['', 'a-bg.webp', 'b-bg.webp', '']
const progress = motionValue(0)
const fallback = <div data-testid="fb" />
const ui = (c = covers) => <StageCanvas covers={c} backdrops={backdrops} progress={progress} fallback={fallback} />

describe('StageCanvas', () => {
  it('renders the scene inside an aria-hidden wrapper when WebGL works', async () => {
    const { container } = render(ui())
    expect(await screen.findByTestId('scene')).toBeInTheDocument()
    expect(screen.queryByTestId('fb')).toBeNull()
    expect(container.querySelector('.stage-canvas')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renders the fallback when hasWebGL is false', () => {
    vi.mocked(hasWebGL).mockReturnValue(false)
    render(ui())
    expect(screen.getByTestId('fb')).toBeInTheDocument()
    expect(screen.queryByTestId('scene')).toBeNull()
  })

  it('renders the fallback when motion is reduced, without probing WebGL', () => {
    mockReducedMotion(true)
    render(ui())
    expect(screen.getByTestId('fb')).toBeInTheDocument()
    expect(hasWebGL).not.toHaveBeenCalled()
  })

  it('renders the fallback when the scene throws', async () => {
    sceneThrows = true
    render(ui())
    expect(await screen.findByTestId('fb')).toBeInTheDocument()
  })

  it('renders the fallback when there are no covers', () => {
    render(ui([]))
    expect(screen.getByTestId('fb')).toBeInTheDocument()
  })
})
