import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { motionValue, type MotionValue } from 'motion/react'
import { useStageProgress } from './useStageProgress'

// useScroll needs real layout; swap it for a value the test drives, keep the real mapping.
let scroll: MotionValue<number>
const useScrollMock = vi.fn()
vi.mock('motion/react', async (orig) => ({
  ...(await orig<typeof import('motion/react')>()),
  useScroll: (opts: unknown) => {
    useScrollMock(opts)
    return { scrollYProgress: scroll }
  },
}))

const ref = { current: null }

beforeEach(() => {
  scroll = motionValue(0)
  useScrollMock.mockClear()
})

describe('useStageProgress', () => {
  it('maps scroll 0, 0.5 and 1 onto 0 .. count-1', async () => {
    const { result } = renderHook(() => useStageProgress(ref, 12))
    expect(result.current.get()).toBe(0)
    scroll.set(0.5)
    // motion propagates derived values on the next frame, not synchronously.
    await vi.waitFor(() => expect(result.current.get()).toBeCloseTo(5.5))
    scroll.set(1)
    await vi.waitFor(() => expect(result.current.get()).toBe(11))
  })

  it('tracks the stage from its start to its end', () => {
    renderHook(() => useStageProgress(ref, 12))
    expect(useScrollMock).toHaveBeenCalledWith({ target: ref, offset: ['start start', 'end end'] })
  })

  it('stays at 0 for a single chapter, with no division by zero', async () => {
    const { result } = renderHook(() => useStageProgress(ref, 1))
    scroll.set(1)
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current.get()).toBe(0)
    expect(Number.isFinite(result.current.get())).toBe(true)
  })

  it('stays at 0 for no chapters', async () => {
    const { result } = renderHook(() => useStageProgress(ref, 0))
    scroll.set(1)
    await new Promise((r) => setTimeout(r, 50))
    expect(result.current.get()).toBe(0)
  })
})
