export type CoverRect = { left: number; top: number; width: number; height: number }
export type CoverOrigin = { rect: CoverRect; src: string }

// An origin older than this belongs to a click that never opened a window: animating from it would look broken.
const MAX_AGE_MS = 1000

let pending: { origin: CoverOrigin; at: number } | null = null
let shelfReader: ((index: number) => CoverOrigin | null) | null = null

export function setCoverOrigin(origin: CoverOrigin) {
  pending = { origin, at: Date.now() }
}

/** Reads the origin once and clears it; null when there is none or it expired. */
export function takeCoverOrigin(): CoverOrigin | null {
  const taken = pending
  pending = null
  return taken && Date.now() - taken.at <= MAX_AGE_MS ? taken.origin : null
}

/** The 3D shelf registers how to find a cover's on-screen rectangle; null unregisters. */
export function registerShelfReader(fn: ((index: number) => CoverOrigin | null) | null) {
  shelfReader = fn
}

export function readShelfCover(index: number): CoverOrigin | null {
  return shelfReader ? shelfReader(index) : null
}
