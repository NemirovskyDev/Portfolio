import { describe, expect, it } from 'vitest'
import seed from '../data/skills.json'
import { projects } from '../data/projects'
import { SKILL_GROUPS, parseSkills, skillId } from './skills'

describe('parseSkills', () => {
  it('accepts the real data: every group has a PT and EN name and at least one item', () => {
    const groups = parseSkills(seed)
    expect(groups.length).toBeGreaterThanOrEqual(4)
    for (const g of groups) {
      expect(g.grupo.pt && g.grupo.en).toBeTruthy()
      expect(g.itens.length).toBeGreaterThan(0)
    }
  })

  it('fills a missing English, trims names and builds the item id', () => {
    const [g] = parseSkills([
      { id: 'x', grupo: { pt: 'Grupo' }, itens: [{ pt: ' React ', projetos: ['a'] }, { pt: 'Só PT', projetos: ['b'] }] },
    ])
    expect(g.grupo).toEqual({ pt: 'Grupo', en: 'Grupo' })
    expect(g.itens).toEqual([
      { pt: 'React', en: 'React', id: 'x-react', projetos: ['a'] },
      { pt: 'Só PT', en: 'Só PT', id: 'x-so-pt', projetos: ['b'] },
    ])
  })

  const item = { pt: 'x', projetos: ['p'] }
  it.each([
    ['not a list', {}],
    ['a group without items', [{ id: 'a', grupo: 'A', itens: [] }]],
    ['an empty item', [{ id: 'a', grupo: 'A', itens: [{ pt: '  ', projetos: ['p'] }] }]],
    ['an item without projects', [{ id: 'a', grupo: 'A', itens: [{ pt: 'x' }] }]],
    ['an item with an empty project list', [{ id: 'a', grupo: 'A', itens: [{ pt: 'x', projetos: [] }] }]],
    ['an item with a blank project id', [{ id: 'a', grupo: 'A', itens: [{ pt: 'x', projetos: [' '] }] }]],
    ['a plain-string item', [{ id: 'a', grupo: 'A', itens: ['x'] }]],
    ['a repeated id', [{ id: 'a', grupo: 'A', itens: [item] }, { id: 'a', grupo: 'B', itens: [item] }]],
    ['a group name without pt', [{ id: 'a', grupo: { en: 'A' }, itens: [item] }]],
  ])('rejects %s', (_, raw) => {
    expect(() => parseSkills(raw)).toThrow(/skills/)
  })
})

describe('SKILL_GROUPS', () => {
  const items = SKILL_GROUPS.flatMap((g) => g.itens)

  it('points every skill at projects that exist in projects.json', () => {
    const ids = new Set(projects.map((p) => p.id))
    for (const it of items) for (const pid of it.projetos) expect(ids.has(pid), `${it.pt} -> ${pid}`).toBe(true)
  })

  it('gives every skill a unique id', () => {
    expect(new Set(items.map((i) => i.id)).size).toBe(items.length)
  })
})

describe('skillId', () => {
  it('slugs without accents, lowercase, with dashes', () => {
    expect(skillId('back', 'Eletrônica: LEDs, 7 segmentos')).toBe('back-eletronica-leds-7-segmentos')
    expect(skillId('front', 'Next.js')).toBe('front-next-js')
  })
})
