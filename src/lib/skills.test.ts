import { describe, expect, it } from 'vitest'
import seed from '../data/skills.json'
import { parseSkills } from './skills'

describe('parseSkills', () => {
  it('accepts the real data: every group has a PT and EN name and at least one item', () => {
    const groups = parseSkills(seed)
    expect(groups.length).toBeGreaterThanOrEqual(4)
    for (const g of groups) {
      expect(g.grupo.pt && g.grupo.en).toBeTruthy()
      expect(g.itens.length).toBeGreaterThan(0)
    }
  })

  it('turns a plain tool name into the same text in both languages and fills a missing English', () => {
    const [g] = parseSkills([{ id: 'x', grupo: { pt: 'Grupo' }, itens: [' React ', { pt: 'Só PT' }] }])
    expect(g.grupo).toEqual({ pt: 'Grupo', en: 'Grupo' })
    expect(g.itens).toEqual([{ pt: 'React', en: 'React' }, { pt: 'Só PT', en: 'Só PT' }])
  })

  it.each([
    ['not a list', {}],
    ['a group without items', [{ id: 'a', grupo: 'A', itens: [] }]],
    ['an empty item', [{ id: 'a', grupo: 'A', itens: ['  '] }]],
    ['a repeated id', [{ id: 'a', grupo: 'A', itens: ['x'] }, { id: 'a', grupo: 'B', itens: ['y'] }]],
    ['a group name without pt', [{ id: 'a', grupo: { en: 'A' }, itens: ['x'] }]],
  ])('rejects %s', (_, raw) => {
    expect(() => parseSkills(raw)).toThrow(/skills/)
  })
})
