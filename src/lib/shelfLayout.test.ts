import { describe, it, expect } from 'vitest'
import { shelfLayout } from './shelfLayout'

describe('shelfLayout', () => {
  it('returns count finite items', () => {
    const items = shelfLayout(5, 1.3)
    expect(items).toHaveLength(5)
    for (const it of items) for (const v of Object.values(it)) expect(Number.isFinite(v)).toBe(true)
  })

  it('returns [] for count 0', () => {
    expect(shelfLayout(0, 0)).toEqual([])
  })

  it('places items by d = i - f', () => {
    const [a, b, c] = shelfLayout(3, 1.25)
    const d = [-1.25, -0.25, 0.75]
    ;[a, b, c].forEach((item, i) => {
      const a = Math.abs(d[i])
      expect(item.x).toBeCloseTo(Math.sign(d[i]) * (a <= 1 ? a * 3.2 : 3.2 + (a - 1) * 1.9))
      expect(item.z).toBeCloseTo(-Math.abs(d[i]) * 1.6)
      expect(item.rotY).toBeCloseTo(-d[i] * 0.35)
      expect(item.opacity).toBeCloseTo(1 - Math.min(1, Math.abs(d[i])) * 0.6)
    })
  })

  it('scales the focused item to exactly 1.7 with opacity 1', () => {
    const item = shelfLayout(3, 1)[1]
    expect(item.scale).toBe(1.7)
    expect(item.opacity).toBe(1)
  })

  it('keeps scale 1 for |d| >= 0.5 and rises monotonically inside', () => {
    const far = shelfLayout(3, 0.5)
    expect(far[0].scale).toBe(1)
    expect(far[1].scale).toBe(1)
    const s = [0.45, 0.3, 0.1, 0].map((f) => shelfLayout(1, f)[0].scale)
    for (let i = 1; i < s.length; i++) expect(s[i]).toBeGreaterThan(s[i - 1])
  })

  it('stays finite for f outside the range and for non-finite f', () => {
    for (const f of [-50, 99, NaN, Infinity]) {
      const items = shelfLayout(4, f)
      for (const it of items) for (const v of Object.values(it)) expect(Number.isFinite(v)).toBe(true)
    }
    expect(shelfLayout(3, NaN)).toEqual(shelfLayout(3, 0))
  })
})
