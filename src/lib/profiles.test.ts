import { describe, it, expect } from 'vitest'
import seed from '../data/projects.json'
import { validateProjects } from './validate'
import { categoriesFor, featuredFor } from './profiles'
import { t, categoryLabel } from './i18n'

const projects = validateProjects(seed)
const names = (p: Parameters<typeof categoriesFor>[0]) => categoriesFor(p, projects).map((c) => c.categoria)

describe('profiles', () => {
  it('recrutador puts "IA e Agentes" first and features orquestrador', () => {
    expect(names('recrutador')[0]).toBe('IA e Agentes')
    expect(featuredFor('recrutador', projects)?.id).toBe('orquestrador')
  })

  it('dev puts Sites then Hardware first and features reveste', () => {
    expect(names('dev').slice(0, 2)).toEqual(['Sites', 'Hardware'])
    expect(featuredFor('dev', projects)?.id).toBe('reveste')
  })

  it('curioso keeps data order and features tabbit', () => {
    expect(names('curioso')).toEqual(['Sites', 'Hackathons', 'IA e Agentes', 'Universidade', 'Hardware', 'Ferramentas'])
    expect(featuredFor('curioso', projects)?.id).toBe('tabbit')
  })

  it('every project appears exactly once for every profile', () => {
    for (const p of ['recrutador', 'dev', 'curioso'] as const) {
      const ids = categoriesFor(p, projects).flatMap((c) => c.items.map((i) => i.id))
      expect(ids.sort()).toEqual(projects.map((i) => i.id).sort())
    }
  })

  it('falls back to the first project when the featured id is missing, and to undefined when empty', () => {
    expect(featuredFor('dev', projects.filter((p) => p.id !== 'reveste'))?.id).toBe(projects.filter((p) => p.id !== 'reveste')[0].id)
    expect(featuredFor('dev', [])).toBeUndefined()
  })
})

describe('i18n', () => {
  it('translates a known key and falls back to the key itself when unknown', () => {
    expect(t('gate.title', 'pt')).toBe('Quem está assistindo?')
    expect(t('gate.title', 'en')).toBe("Who's watching?")
    expect(t('nope.nope', 'en')).toBe('nope.nope')
  })

  it('translates category labels and keeps unknown categories as they are', () => {
    expect(categoryLabel('IA e Agentes', 'en')).toBe('AI and Agents')
    expect(categoryLabel('Outra', 'en')).toBe('Outra')
  })
})
