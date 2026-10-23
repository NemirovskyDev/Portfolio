import { describe, it, expect, vi, afterEach } from 'vitest'
import { safeGet, safeSet } from './storage'

afterEach(() => vi.restoreAllMocks())

describe('storage', () => {
  it('round-trips a value', () => {
    safeSet('k', 'v')
    expect(safeGet('k')).toBe('v')
  })

  it('safeGet returns null when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(safeGet('k')).toBeNull()
  })

  it('safeSet does not throw when localStorage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    expect(() => safeSet('k', 'v')).not.toThrow()
  })
})
