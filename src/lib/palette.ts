import palette from '../data/palette.json'

export type ChapterPalette = { ground: string; accent: string; ink: string }

const entries: Record<string, ChapterPalette> = palette

/** Unknown ids (or a project added without re-running the script) get the opening palette. */
export function paletteFor(id: string): ChapterPalette {
  return Object.hasOwn(entries, id) ? entries[id] : entries.opening
}

export type FluidColors = { base: string; c1: string; c2: string; c3: string }

const channels = (hex: string): number[] => {
  const h = /^#?([0-9a-f]{6})$/i.exec(hex.trim())?.[1]
  if (!h) throw new Error(`not a #rrggbb colour: ${hex}`)
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
}

/** Straight sRGB mix of two #rrggbb colours; t = 0 gives `a`, t = 1 gives `b`. */
export function mixHex(a: string, b: string, t: number): string {
  const k = Math.min(Math.max(Number.isFinite(t) ? t : 0, 0), 1)
  const [ca, cb] = [channels(a), channels(b)]
  return `#${ca.map((v, i) => Math.round(v + (cb[i] - v) * k).toString(16).padStart(2, '0')).join('')}`
}

/**
 * Colours for the living gradient: the neutral ground as base and three chapter accents picked evenly
 * across `ids`, pulled toward the base by `1 - strength` so white text on top keeps AA contrast.
 */
export function fluidColors(ids: string[], strength = 0.7): FluidColors {
  const base = entries.opening.ground
  const pick = (at: number) => paletteFor(ids[Math.round(at * Math.max(ids.length - 1, 0))] ?? 'opening').accent
  const tone = (hex: string) => mixHex(base, hex, strength)
  return { base, c1: tone(pick(0)), c2: tone(pick(0.5)), c3: tone(pick(1)) }
}
