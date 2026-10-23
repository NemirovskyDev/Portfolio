import { existsSync, readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { projects } from '../test/utils'

describe('assets', () => {
  it.each(projects.flatMap((p) => [p.capa, p.fundo]))('public/%s exists', (path) => {
    expect(existsSync(`public/${path}`)).toBe(true)
  })

  it('has an Open Graph image and complete meta tags in index.html', () => {
    expect(existsSync('public/og.png')).toBe(true)
    const html = readFileSync('index.html', 'utf8')
    for (const needle of ['name="description"', 'property="og:title"', 'property="og:description"', 'property="og:image"', 'rel="icon"']) {
      expect(html).toContain(needle)
    }
  })

  it('has a prompt for every project in docs/prompts-gemini.md', () => {
    const doc = readFileSync('docs/prompts-gemini.md', 'utf8')
    for (const p of projects) expect(doc).toContain(`public/projetos/${p.id}/`)
  })
})
