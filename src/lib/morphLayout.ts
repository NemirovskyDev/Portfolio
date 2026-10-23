export type MorphPoint = { x: number; y: number; rotate: number }

/** Arc the covers settle into (same unit space as the points; the component scales it to the viewport). */
export const ARC = { cx: 0, cy: 0.9, r: 1.3 }
const CIRCLE_R = 0.5

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (u: number) => u * u * (3 - 2 * u)
const lerp = (a: number, b: number, u: number) => a + (b - a) * u
const deg = (rad: number) => (rad * 180) / Math.PI
// deterministic pseudo-random in [0, 1) so the scatter is stable between renders
const rand = (i: number, k: number) => {
  const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453
  return s - Math.floor(s)
}

function scattered(i: number): MorphPoint {
  return { x: (rand(i, 1) - 0.5) * 2.2, y: (rand(i, 2) - 0.5) * 1.6, rotate: (rand(i, 3) - 0.5) * 50 }
}

function circle(i: number, n: number): MorphPoint {
  const a = -Math.PI / 2 + (i / n) * Math.PI * 2
  return { x: Math.cos(a) * CIRCLE_R, y: Math.sin(a) * CIRCLE_R, rotate: deg(a) + 90 }
}

function arc(i: number, n: number): MorphPoint {
  const u = n === 1 ? 0.5 : i / (n - 1)
  const a = lerp(-Math.PI * 0.82, -Math.PI * 0.18, u) // upper arc: negative angles point up on screen
  return { x: ARC.cx + Math.cos(a) * ARC.r, y: ARC.cy + Math.sin(a) * ARC.r, rotate: deg(a) + 90 }
}

const mix = (a: MorphPoint, b: MorphPoint, u: number): MorphPoint => ({
  x: lerp(a.x, b.x, u),
  y: lerp(a.y, b.y, u),
  rotate: lerp(a.rotate, b.rotate, u),
})

/** t: 0 scattered, 0.5 circle, 1 arc. Pure; t is clamped to 0..1. */
export function morphLayout(n: number, t: number): MorphPoint[] {
  if (n <= 0) return []
  const p = clamp01(t)
  return Array.from({ length: n }, (_, i) =>
    p <= 0.5 ? mix(scattered(i), circle(i, n), smooth(p / 0.5)) : mix(circle(i, n), arc(i, n), smooth((p - 0.5) / 0.5)),
  )
}
