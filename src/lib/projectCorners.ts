import { Vector3, type Camera, type Object3D } from 'three'
import type { CoverRect } from './coverOrigin'

/** Screen-pixel bounding box of a w x h plane (centred on its group's origin) as seen by `camera`; null when not fully in front of it. */
export function projectPlaneRect(
  group: Object3D,
  [w, h]: [number, number],
  camera: Camera,
  canvas: { left: number; top: number; width: number; height: number },
): CoverRect | null {
  if (canvas.width <= 0 || canvas.height <= 0) return null
  group.updateWorldMatrix(true, false)
  camera.updateMatrixWorld()
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const p = group.localToWorld(new Vector3((sx * w) / 2, (sy * h) / 2, 0)).project(camera)
    // z > 1 is behind the camera or past the far plane
    if (![p.x, p.y, p.z].every(Number.isFinite) || p.z > 1) return null
    const x = canvas.left + ((p.x + 1) / 2) * canvas.width
    const y = canvas.top + ((1 - p.y) / 2) * canvas.height
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minY = Math.min(minY, y)
    maxY = Math.max(maxY, y)
  }
  const width = maxX - minX
  const height = maxY - minY
  return width > 0 && height > 0 ? { left: minX, top: minY, width, height } : null
}
