import { describe, it, expect } from 'vitest'
import { Group, PerspectiveCamera } from 'three'
import { projectPlaneRect } from './projectCorners'

const canvas = { left: 100, top: 50, width: 800, height: 600 }
const camera = () => {
  const c = new PerspectiveCamera(40, canvas.width / canvas.height, 0.1, 100)
  c.position.set(0, 0, 8)
  return c
}

describe('projectPlaneRect', () => {
  it('centres a plane at the origin on the canvas centre, keeping the cover ratio', () => {
    const r = projectPlaneRect(new Group(), [2, 3], camera(), canvas)!
    expect(r.left + r.width / 2).toBeCloseTo(500, 3)
    expect(r.top + r.height / 2).toBeCloseTo(350, 3)
    expect(r.height / r.width).toBeCloseTo(1.5, 3)
  })

  it('grows with the group scale and follows its position', () => {
    const base = projectPlaneRect(new Group(), [2, 3], camera(), canvas)!
    const g = new Group()
    g.scale.setScalar(2)
    g.position.x = 1
    const r = projectPlaneRect(g, [2, 3], camera(), canvas)!
    expect(r.width).toBeCloseTo(base.width * 2, 3)
    expect(r.left + r.width / 2).toBeGreaterThan(500)
  })

  it('returns null behind the camera, on NaN, and for an empty canvas', () => {
    const behind = new Group()
    behind.position.z = 20
    expect(projectPlaneRect(behind, [2, 3], camera(), canvas)).toBeNull()
    const nan = new Group()
    nan.position.x = NaN
    expect(projectPlaneRect(nan, [2, 3], camera(), canvas)).toBeNull()
    expect(projectPlaneRect(new Group(), [2, 3], camera(), { ...canvas, width: 0 })).toBeNull()
  })
})
