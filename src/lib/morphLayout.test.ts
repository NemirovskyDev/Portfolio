import { describe, it, expect } from 'vitest'
import { ARC, morphLayout } from './morphLayout'

const dist = (p: { x: number; y: number }, cx = 0, cy = 0) => Math.hypot(p.x - cx, p.y - cy)

describe('morphLayout', () => {
  it('places all points at equal radius from the center at t=0.5 (circle)', () => {
    const pts = morphLayout(8, 0.5)
    const r = dist(pts[0])
    expect(r).toBeGreaterThan(0)
    for (const p of pts) expect(dist(p)).toBeCloseTo(r, 6)
  })

  it('spans an arc, not a full circle, at t=1', () => {
    const pts = morphLayout(8, 1)
    for (const p of pts) expect(dist(p, ARC.cx, ARC.cy)).toBeCloseTo(ARC.r, 6)
    const angles = pts.map((p) => Math.atan2(p.y - ARC.cy, p.x - ARC.cx))
    expect(Math.max(...angles) - Math.min(...angles)).toBeLessThan(Math.PI)
  })

  it('scatters the points at t=0 (not all on the circle)', () => {
    const radii = morphLayout(8, 0).map((p) => dist(p))
    expect(new Set(radii.map((r) => r.toFixed(3))).size).toBeGreaterThan(1)
  })

  it('returns n entries for n in 1..12 and finite numbers everywhere', () => {
    for (let n = 1; n <= 12; n++) {
      for (const t of [0, 0.25, 0.5, 0.75, 1]) {
        const pts = morphLayout(n, t)
        expect(pts).toHaveLength(n)
        for (const p of pts) expect([p.x, p.y, p.rotate].every(Number.isFinite)).toBe(true)
      }
    }
  })

  it('clamps t outside 0..1 and returns an empty list for n <= 0', () => {
    expect(morphLayout(5, -3)).toEqual(morphLayout(5, 0))
    expect(morphLayout(5, 9)).toEqual(morphLayout(5, 1))
    expect(morphLayout(0, 0.5)).toEqual([])
  })
})
