import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { hasWebGL } from './hasWebGL'
import { useCinemaMode } from './useCinemaMode'
import { mockReducedMotion } from '../test/utils'

vi.mock('./hasWebGL', () => ({ hasWebGL: vi.fn(() => true) }))

const saved = {
  cores: Object.getOwnPropertyDescriptor(Navigator.prototype, 'hardwareConcurrency'),
}
function setNav(key: 'hardwareConcurrency' | 'deviceMemory', value: number | undefined) {
  Object.defineProperty(navigator, key, { value, configurable: true })
}

beforeEach(() => {
  vi.mocked(hasWebGL).mockReturnValue(true)
  mockReducedMotion(false)
  setNav('hardwareConcurrency', 8)
  setNav('deviceMemory', 8)
})

afterEach(() => {
  // remove own-property overrides so the prototype defaults come back
  delete (navigator as unknown as Record<string, unknown>).hardwareConcurrency
  delete (navigator as unknown as Record<string, unknown>).deviceMemory
  void saved
})

describe('useCinemaMode', () => {
  it('is cinema on a capable device', () => {
    expect(renderHook(() => useCinemaMode()).result.current).toBe('cinema')
  })

  it('is cinema when the device does not report cores or memory', () => {
    setNav('hardwareConcurrency', undefined)
    setNav('deviceMemory', undefined)
    expect(renderHook(() => useCinemaMode()).result.current).toBe('cinema')
  })

  it('is static with reduced motion', () => {
    mockReducedMotion(true)
    expect(renderHook(() => useCinemaMode()).result.current).toBe('static')
  })

  it('is static without WebGL', () => {
    vi.mocked(hasWebGL).mockReturnValue(false)
    expect(renderHook(() => useCinemaMode()).result.current).toBe('static')
  })

  it('is static with 2 or fewer cores', () => {
    setNav('hardwareConcurrency', 2)
    expect(renderHook(() => useCinemaMode()).result.current).toBe('static')
  })

  it('is static with 2 GB of memory or less', () => {
    setNav('deviceMemory', 2)
    expect(renderHook(() => useCinemaMode()).result.current).toBe('static')
  })
})
