import { describe, it, expect } from 'vitest'
import seed from '../data/projects.json'
import palette from '../data/palette.json'
import { paletteFor } from './palette'

// WCAG relative luminance, same formula as src/styles/contrast.test.ts.
const lum = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

const keys = [...seed.map((p) => p.id), 'opening', 'credits']
const entries = palette as Record<string, { ground: string; accent: string; ink: string }>

describe('palette.json', () => {
  it.each(keys)('%s has a complete hex entry', (key) => {
    const e = entries[key]
    expect(e, `missing palette entry for "${key}"`).toBeDefined()
    for (const c of [e.ground, e.accent, e.ink]) expect(c).toMatch(/^#[0-9a-f]{6}$/)
  })

  it.each(keys)('%s keeps text and accent at 4.5:1 on a dark ground', (key) => {
    const { ground, accent, ink } = entries[key]
    expect(ratio(ink, ground)).toBeGreaterThanOrEqual(4.5)
    expect(ratio(accent, ground)).toBeGreaterThanOrEqual(4.5)
    expect(lum(ground)).toBeLessThanOrEqual(0.06)
    // opening/credits use the fixed near-black #08090c (0.0027), darker than any tinted chapter.
    if (key !== 'opening' && key !== 'credits') expect(lum(ground)).toBeGreaterThanOrEqual(0.005)
  })

  it('lists projects in data order between opening and credits', () => {
    expect(Object.keys(entries)).toEqual(['opening', ...seed.map((p) => p.id), 'credits'])
  })
})

// Same order as CATEGORY_ORDER in chapters.ts, repeated so this test does not depend on that file.
const CATEGORY_ORDER = ['IA e Agentes', 'Sites', 'Hackathons', 'Hardware', 'Universidade', 'Ferramentas']
const hueOf = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const max = Math.max(r, g, b)
  const d = max - Math.min(r, g, b)
  if (d === 0) return 0
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return (h * 60 + 360) % 360
}

// Same bands as hue_name() in scripts/extract-palette.py.
const BANDS: [number, string][] = [[15, 'red'], [30, 'orange'], [55, 'amber'], [70, 'yellow'], [160, 'green'],
  [185, 'teal'], [205, 'cyan'], [260, 'blue'], [300, 'violet'], [345, 'magenta']]
const hueName = (deg: number): string => BANDS.find(([edge]) => deg < edge)?.[1] ?? 'red'

describe('chapter colors', () => {
  it('uses at least 6 distinct hue names across the projects', () => {
    const names = new Set(seed.map((p) => hueName(hueOf(entries[p.id].ground))))
    expect(names.size, [...names].join(', ')).toBeGreaterThanOrEqual(6)
  })

  it('adjacent chapters differ by at least 25 degrees of hue', () => {
    const rank = (c: string) => (CATEGORY_ORDER.includes(c) ? CATEGORY_ORDER.indexOf(c) : CATEGORY_ORDER.length)
    const order = [...seed].sort((a, b) => rank(a.categoria) - rank(b.categoria))
    for (let i = 1; i < order.length; i++) {
      const a = hueOf(entries[order[i - 1].id].ground)
      const b = hueOf(entries[order[i].id].ground)
      const gap = Math.min(Math.abs(a - b), 360 - Math.abs(a - b))
      expect(gap, `${order[i - 1].id} -> ${order[i].id}`).toBeGreaterThanOrEqual(25)
    }
  })
})

describe('paletteFor', () => {
  it('returns the project entry', () => {
    expect(paletteFor('jarvis')).toEqual(entries.jarvis)
  })

  it('falls back to the opening palette for an unknown id', () => {
    expect(paletteFor('nao-existe')).toEqual(entries.opening)
  })

  it('does not resolve inherited object keys such as "constructor"', () => {
    expect(paletteFor('constructor')).toEqual(entries.opening)
  })
})
