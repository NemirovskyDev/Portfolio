import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useStageProgress } from './useStageProgress'

// ScrollTrigger needs real layout; capture the trigger options and drive onUpdate by hand.
type Opts = { trigger: unknown; start: string; end: string; onUpdate: (s: { progress: number }) => void }
let opts: Opts | undefined
const kill = vi.fn()
vi.mock('./gsap', () => ({
  ScrollTrigger: {
    create: (o: Opts) => {
      opts = o
      return { progress: 0, kill }
    },
  },
}))

const ref = { current: document.createElement('div') }
const scrollTo = (p: number) => opts?.onUpdate({ progress: p })

beforeEach(() => {
  opts = undefined
  kill.mockClear()
})

describe('useStageProgress', () => {
  it('maps scroll 0, 0.5 and 1 onto 0 .. count-1', () => {
    const { result } = renderHook(() => useStageProgress(ref, 12))
    expect(result.current.get()).toBe(0)
    scrollTo(0.5)
    expect(result.current.get()).toBeCloseTo(5.5)
    scrollTo(1)
    expect(result.current.get()).toBe(11)
  })

  it('tracks the stage from its top to its bottom and stops tracking on unmount', () => {
    const { unmount } = renderHook(() => useStageProgress(ref, 12))
    expect(opts).toMatchObject({ trigger: ref.current, start: 'top top', end: 'bottom bottom' })
    unmount()
    expect(kill).toHaveBeenCalled()
  })

  it('stays at 0 for one chapter or none, with no division by zero', () => {
    for (const count of [1, 0]) {
      const { result, unmount } = renderHook(() => useStageProgress(ref, count))
      scrollTo(1)
      expect(result.current.get()).toBe(0)
      unmount()
    }
  })

  it('ignores a NaN progress from a zero-height stage', () => {
    const { result } = renderHook(() => useStageProgress(ref, 12))
    scrollTo(0.5)
    scrollTo(Number.NaN)
    expect(result.current.get()).toBeCloseTo(5.5)
  })
})
