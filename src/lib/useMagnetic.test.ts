import { renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { gsap } from './gsap'
import { useMagnetic } from './useMagnetic'

function mockMedia(fine: boolean, reduce: boolean) {
  window.matchMedia = ((query: string) => ({
    matches: (!query.includes('pointer: fine') || fine) && (!query.includes('no-preference') || !reduce),
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  })) as typeof window.matchMedia
}

const move = (el: Element, x: number, y: number) =>
  el.dispatchEvent(new PointerEvent('pointermove', { bubbles: true, clientX: x, clientY: y }))

describe('useMagnetic', () => {
  const setX = vi.fn()
  const setY = vi.fn()
  let to: ReturnType<typeof vi.spyOn>
  let btn: HTMLButtonElement

  beforeEach(() => {
    vi.spyOn(gsap, 'quickTo').mockImplementation(((_el: unknown, prop: string) => (prop === 'x' ? setX : setY)) as never)
    to = vi.spyOn(gsap, 'to').mockImplementation((() => ({})) as never)
    btn = document.createElement('button')
    btn.dataset.magnetic = '0.5'
    btn.getBoundingClientRect = () => ({ left: 0, top: 0, width: 100, height: 40, right: 100, bottom: 40, x: 0, y: 0, toJSON: () => ({}) })
    document.body.append(btn)
  })
  afterEach(() => {
    btn.remove()
    vi.restoreAllMocks()
    setX.mockClear()
    setY.mockClear()
  })

  it('pulls toward the cursor and springs back on leave (fine pointer)', () => {
    mockMedia(true, false)
    renderHook(() => useMagnetic())
    move(btn, 70, 20) // centre is (50, 20): dx 20 * 0.5
    expect(setX).toHaveBeenCalledWith(10)
    expect(setY).toHaveBeenCalledWith(0)
    document.dispatchEvent(new Event('pointerleave'))
    expect(to).toHaveBeenCalledWith(btn, expect.objectContaining({ x: 0, y: 0 }))
  })

  it.each([
    ['a coarse pointer', false, false],
    ['reduced motion', true, true],
  ])('does nothing with %s', (_name, fine, reduce) => {
    mockMedia(fine, reduce)
    renderHook(() => useMagnetic())
    move(btn, 70, 20)
    expect(setX).not.toHaveBeenCalled()
  })

  it('removes its listeners on unmount', () => {
    mockMedia(true, false)
    const { unmount } = renderHook(() => useMagnetic())
    unmount()
    move(btn, 70, 20)
    expect(setX).not.toHaveBeenCalled()
  })
})
