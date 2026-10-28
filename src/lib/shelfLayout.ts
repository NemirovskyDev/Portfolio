export type ShelfItem = { x: number; z: number; rotY: number; scale: number; opacity: number }

const FOCUS_SCALE = 1.7
const FOCUS_RADIUS = 0.5 // |d| under this grows the cover toward FOCUS_SCALE

/** Pure layout of the cover shelf: item i sits at distance d = i - f from the focus. */
export function shelfLayout(count: number, f: number): ShelfItem[] {
  const focus = Number.isFinite(f) ? f : 0
  return Array.from({ length: Math.max(0, count) }, (_, i) => {
    const d = i - focus
    const a = Math.abs(d)
    const t = Math.max(0, 1 - a / FOCUS_RADIUS)
    const ease = t * t * (3 - 2 * t) // smoothstep: 0 at the edge, exactly 1 at d = 0
    return {
      // beyond the first neighbour the spacing tightens, so the opening shows an arc of covers instead of one at the edge
      x: Math.sign(d) * (a <= 1 ? a * 3.2 : 3.2 + (a - 1) * 1.9),
      z: -a * 1.6,
      rotY: -d * 0.35,
      scale: 1 * (1 - ease) + FOCUS_SCALE * ease,
      opacity: 1 - Math.min(1, a) * 0.6,
    }
  })
}
