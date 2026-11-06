import { describe, it, expect } from 'vitest'
import { projects } from '../test/utils'
import type { Project } from './types'
import { CATEGORY_ORDER, activeIndex, buildChapters } from './chapters'

const ids = (list: ReturnType<typeof buildChapters>) => list.map((c) => c.id)
const make = (id: string, categoria: string): Project => ({ ...projects[0], id, categoria })

describe('buildChapters', () => {
  it('keeps the category order constant', () => {
    expect(CATEGORY_ORDER).toEqual(['IA e Agentes', 'Sites', 'Hackathons', 'Hardware', 'Universidade', 'Ferramentas'])
  })

  it('holds one chapter per project and nothing else (the hero and contact live outside the stage)', () => {
    const list = buildChapters(projects)
    expect(list).toHaveLength(projects.length)
    expect(list.every((c) => c.kind === 'project')).toBe(true)
  })

  it('orders seed projects by category, then by data order', () => {
    const order = ids(buildChapters(projects))
    expect(order).toEqual([
      'orquestrador', 'companion', 'jarvis', 'reveste', 'pkz', 'chat-amigos', 'zenkai',
      'tabbit', 'bombas', 'ap2', 'b3', 'tradingbot',
    ])
    expect(order.indexOf('reveste')).toBeLessThan(order.indexOf('tabbit'))
    expect(order.indexOf('pkz')).toBeLessThan(order.indexOf('tabbit'))
  })

  it('puts an unknown category after the known ones, in data order', () => {
    const list = [make('x', 'Mistério'), make('y', 'Ferramentas'), make('z', 'Outro'), make('w', 'Sites')]
    expect(ids(buildChapters(list))).toEqual(['w', 'y', 'x', 'z'])
  })

  it('does not mutate its input', () => {
    const input = [make('a', 'Ferramentas'), make('b', 'Sites')]
    const snapshot = [...input]
    buildChapters(input)
    expect(input).toEqual(snapshot)
  })

  it('handles an empty list', () => {
    expect(buildChapters([])).toEqual([])
  })
})

describe('activeIndex', () => {
  it.each([
    [-3, 0],
    [0, 0],
    [6.4, 6],
    [6.5, 7],
    [99, 11],
    [Infinity, 11],
    [-Infinity, 0],
    [NaN, 0],
  ])('activeIndex(%s, 12) is %i', (f, expected) => {
    expect(activeIndex(f, 12)).toBe(expected)
  })

  it('returns 0 for an empty or single chapter list', () => {
    expect(activeIndex(5, 0)).toBe(0)
    expect(activeIndex(5, 1)).toBe(0)
  })
})
