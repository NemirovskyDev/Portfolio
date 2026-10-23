import { describe, it, expect, vi } from 'vitest'
import seed from '../data/projects.json'
import { validateProjects } from './validate'

const valid = {
  id: 'x',
  categoria: 'Sites',
  capa: 'projetos/x/cover.webp',
  fundo: 'projetos/x/backdrop.webp',
  titulo: { pt: 'Título', en: 'Title' },
  resumo: { pt: 'Resumo', en: 'Summary' },
  proposito: { pt: 'Propósito', en: 'Purpose' },
  papel: { pt: 'Papel', en: 'Role' },
  stack: ['React'],
  status: 'no-ar',
}

describe('validateProjects', () => {
  it('accepts the 8 seed projects', () => {
    const ids = validateProjects(seed).map((p) => p.id)
    expect(ids).toEqual(['reveste', 'pkz', 'tabbit', 'orquestrador', 'companion', 'ap2', 'bombas', 'b3'])
  })

  it('throws naming id and field when titulo.pt is missing (strict)', () => {
    const bad = { ...valid, titulo: { pt: '', en: 'Title' } }
    expect(() => validateProjects([bad], { strict: true })).toThrow(/"x".*titulo\.pt/)
  })

  it('drops the invalid project and keeps the rest when not strict', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const bad = { ...valid, id: 'bad', titulo: { pt: '', en: '' } }
    expect(validateProjects([bad, valid], { strict: false }).map((p) => p.id)).toEqual(['x'])
    warn.mockRestore()
  })

  it('falls back to pt when en is empty', () => {
    const p = validateProjects([{ ...valid, resumo: { pt: 'Só PT', en: '' } }], { strict: true })[0]
    expect(p.resumo.en).toBe('Só PT')
  })

  it("rejects status 'x'", () => {
    expect(() => validateProjects([{ ...valid, status: 'x' }], { strict: true })).toThrow(/status/)
  })

  it('rejects non-http link urls', () => {
    const bad = { ...valid, links: [{ label: 'a', url: 'javascript:alert(1)' }] }
    expect(() => validateProjects([bad], { strict: true })).toThrow(/links/)
  })

  it('rejects input that is not an array', () => {
    expect(() => validateProjects({}, { strict: true })).toThrow(/array/)
  })
})
