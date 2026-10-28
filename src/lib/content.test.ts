import { describe, expect, it } from 'vitest'
import seed from '../data/projects.json'
import raw from '../data/projects.json?raw'
import { validateProjects } from './validate'

const projects = validateProjects(seed, { strict: true })

const FORBIDDEN = ['Giovanni', 'Alexia', 'João Pedro', 'Vitor', 'Bernardo Vaz', 'Armando Lombardi', 'Carteira']

describe('project detail content', () => {
  it('has at least the 8 original projects', () => {
    expect(projects.length).toBeGreaterThanOrEqual(8)
  })

  describe.each(projects.map((p) => [p.id, p] as const))('%s', (_id, p) => {
    it('has 3 to 6 short features, in PT and EN', () => {
      const items = p.funcionalidades ?? []
      expect(items.length).toBeGreaterThanOrEqual(3)
      expect(items.length).toBeLessThanOrEqual(6)
      for (const f of items) {
        // validate() fills a missing `en` from `pt`, so these only catch empty
        // strings; the real translation check is `en !== pt` in the next tests.
        expect(f.pt.trim()).not.toBe('')
        expect(f.en.trim()).not.toBe('')
        expect(f.pt.length).toBeLessThanOrEqual(140)
        expect(f.en.length).toBeLessThanOrEqual(140)
      }
    })

    it('translates at least half of the features', () => {
      const items = p.funcionalidades ?? []
      const translated = items.filter((f) => f.en !== f.pt).length
      expect(translated).toBeGreaterThanOrEqual(items.length / 2)
    })

    it('has a translated challenge of at most 420 characters per language', () => {
      expect(p.desafios).toBeDefined()
      const d = p.desafios!
      expect(d.pt.trim()).not.toBe('')
      expect(d.en.trim()).not.toBe('')
      expect(d.pt.length).toBeLessThanOrEqual(420)
      expect(d.en.length).toBeLessThanOrEqual(420)
      expect(d.en).not.toBe(d.pt)
    })
  })

  it('includes jarvis and chat-amigos with GitHub links', () => {
    const expected = {
      jarvis: ['IA e Agentes', 'https://github.com/NemirovskyDev/Jarvis'],
      'chat-amigos': ['Sites', 'https://github.com/NemirovskyDev/chat-amigos'],
    }
    for (const [id, [categoria, url]] of Object.entries(expected)) {
      const p = projects.find((x) => x.id === id)
      expect(p, id).toBeDefined()
      expect(p!.categoria).toBe(categoria)
      expect(p!.links).toContainEqual({ label: 'GitHub', url })
    }
  })

  it('names no people and has no financial data', () => {
    for (const word of FORBIDDEN) expect(raw).not.toContain(word)
  })
})
