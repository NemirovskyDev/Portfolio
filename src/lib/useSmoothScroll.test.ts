import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { StrictMode } from 'react'

const instances: { opts: unknown; stop: ReturnType<typeof vi.fn>; start: ReturnType<typeof vi.fn>; destroy: ReturnType<typeof vi.fn> }[] = []

vi.mock('lenis', () => ({
  default: class {
    stop = vi.fn()
    start = vi.fn()
    destroy = vi.fn()
    constructor(public opts: unknown) {
      instances.push(this)
    }
  },
}))

import { useSmoothScroll } from './useSmoothScroll'

beforeEach(() => {
  instances.length = 0
})

describe('useSmoothScroll', () => {
  it('creates one Lenis with its own RAF loop when enabled', () => {
    renderHook(() => useSmoothScroll({ enabled: true, paused: false }))
    expect(instances).toHaveLength(1)
    expect(instances[0].opts).toMatchObject({ autoRaf: true })
  })

  it('creates nothing when disabled', () => {
    renderHook(() => useSmoothScroll({ enabled: false, paused: false }))
    expect(instances).toHaveLength(0)
  })

  it('destroys on unmount', () => {
    const { unmount } = renderHook(() => useSmoothScroll({ enabled: true, paused: false }))
    unmount()
    expect(instances[0].destroy).toHaveBeenCalledTimes(1)
  })

  it('destroys when enabled turns false (reduced motion switched on mid-session)', () => {
    const { rerender } = renderHook((p) => useSmoothScroll(p), { initialProps: { enabled: true, paused: false } })
    rerender({ enabled: false, paused: false })
    expect(instances[0].destroy).toHaveBeenCalledTimes(1)
    expect(instances).toHaveLength(1)
  })

  it('stops when paused turns true and starts when it turns false, without recreating', () => {
    const { rerender } = renderHook((p) => useSmoothScroll(p), { initialProps: { enabled: true, paused: false } })
    rerender({ enabled: true, paused: true })
    expect(instances[0].stop).toHaveBeenCalledTimes(1)
    rerender({ enabled: true, paused: false })
    expect(instances[0].start).toHaveBeenCalledTimes(1)
    expect(instances).toHaveLength(1)
  })

  it('starts stopped when mounted already paused', () => {
    renderHook(() => useSmoothScroll({ enabled: true, paused: true }))
    expect(instances[0].stop).toHaveBeenCalledTimes(1)
  })

  it('survives StrictMode double effects: the live instance stays stopped, the discarded one is destroyed', () => {
    renderHook(() => useSmoothScroll({ enabled: true, paused: true }), { wrapper: StrictMode })
    const live = instances[instances.length - 1]
    expect(live.stop).toHaveBeenCalled()
    expect(live.start).not.toHaveBeenCalled()
    for (const old of instances.slice(0, -1)) expect(old.destroy).toHaveBeenCalled()
  })

  it('does not restart a destroyed instance when disabled while paused', () => {
    const { rerender } = renderHook((p) => useSmoothScroll(p), { initialProps: { enabled: true, paused: true } })
    const first = instances[0]
    rerender({ enabled: false, paused: true })
    expect(first.destroy).toHaveBeenCalled()
    expect(first.start).not.toHaveBeenCalled()
  })
})
