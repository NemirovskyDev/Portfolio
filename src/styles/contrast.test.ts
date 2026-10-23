import { readFileSync } from 'node:fs'
import { it, expect } from 'vitest'

const css = readFileSync('src/styles/tokens.css', 'utf8')
const token = (name: string): string => {
  const m = css.match(new RegExp(`--${name}: *(#[0-9a-fA-F]{6})`))
  if (!m) throw new Error(`token --${name} missing`)
  return m[1]
}
const lum = (hex: string): number => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string): number => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
  return (x + 0.05) / (y + 0.05)
}

it.each([
  ['fg', 'bg'],
  ['muted', 'bg'],
  ['muted', 'card'],
  ['accent', 'bg'],
  ['on-accent', 'accent'],
])('contrast %s on %s is at least 4.5:1', (fg, bg) => {
  expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5)
})
