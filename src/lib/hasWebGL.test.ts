import { describe, it, expect, vi, afterEach } from 'vitest'
import { hasWebGL } from './hasWebGL'

afterEach(() => vi.restoreAllMocks())

describe('hasWebGL', () => {
  it('is false when no context can be created', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    expect(hasWebGL()).toBe(false)
  })

  it('is true when a webgl context is returned', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as unknown as RenderingContext)
    expect(hasWebGL()).toBe(true)
  })

  it('is false when probing throws', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(hasWebGL()).toBe(false)
  })
})
