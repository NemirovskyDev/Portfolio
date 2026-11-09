import { describe, it, expect, vi, afterEach } from 'vitest'
import { readShelfCover, registerShelfReader, setCoverOrigin, takeCoverOrigin } from './coverOrigin'

const origin = { rect: { left: 1, top: 2, width: 3, height: 4 }, src: '/c.png' }

afterEach(() => {
  vi.useRealTimers()
  registerShelfReader(null)
  takeCoverOrigin()
})

describe('coverOrigin', () => {
  it('is read once', () => {
    setCoverOrigin(origin)
    expect(takeCoverOrigin()).toEqual(origin)
    expect(takeCoverOrigin()).toBeNull()
  })

  it('expires after one second', () => {
    vi.useFakeTimers()
    setCoverOrigin(origin)
    vi.advanceTimersByTime(1001)
    expect(takeCoverOrigin()).toBeNull()
  })

  it('shelf reader: absent gives null, registered is used, unregistered gives null again', () => {
    expect(readShelfCover(0)).toBeNull()
    registerShelfReader((i) => (i === 2 ? origin : null))
    expect(readShelfCover(2)).toEqual(origin)
    expect(readShelfCover(1)).toBeNull()
    registerShelfReader(null)
    expect(readShelfCover(2)).toBeNull()
  })
})
