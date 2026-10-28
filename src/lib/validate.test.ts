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

describe('validateProjects: detail fields', () => {
  const detailed = {
    ...valid,
    funcionalidades: [{ pt: 'Uma coisa', en: 'One thing' }, { pt: 'Outra coisa', en: '' }],
    desafios: { pt: 'Foi difícil', en: 'It was hard' },
    galeria: [{ src: 'projetos/x/shot-1.webp', alt: { pt: 'Tela inicial', en: '' } }],
  }

  it('accepts the optional fields and falls back to pt when en is empty', () => {
    const p = validateProjects([detailed], { strict: true })[0]
    expect(p.funcionalidades?.map((f) => f.en)).toEqual(['One thing', 'Outra coisa'])
    expect(p.desafios?.en).toBe('It was hard')
    expect(p.galeria?.[0]).toEqual({ src: 'projetos/x/shot-1.webp', alt: { pt: 'Tela inicial', en: 'Tela inicial' } })
  })

  it('leaves the fields undefined when the project has none', () => {
    const p = validateProjects([valid], { strict: true })[0]
    expect(p.funcionalidades).toBeUndefined()
    expect(p.desafios).toBeUndefined()
    expect(p.galeria).toBeUndefined()
  })

  it('rejects funcionalidades that are not a list or have an empty pt', () => {
    expect(() => validateProjects([{ ...detailed, funcionalidades: 'x' }], { strict: true })).toThrow(/funcionalidades/)
    expect(() => validateProjects([{ ...detailed, funcionalidades: [{ pt: '', en: 'x' }] }], { strict: true })).toThrow(/funcionalidades/)
  })

  it.each(['//cdn.example/x.png', '../secret.webp', '/abs.webp', 'projetos/x/shot.gif', 'https://x.dev/a.webp'])(
    'rejects gallery src %s (only relative image paths)',
    (src) => {
      expect(() => validateProjects([{ ...detailed, galeria: [{ src, alt: { pt: 'a', en: 'a' } }] }], { strict: true })).toThrow(/galeria/)
    },
  )

  it('rejects a gallery item without src or alt', () => {
    expect(() => validateProjects([{ ...detailed, galeria: [{ alt: { pt: 'a', en: 'a' } }] }], { strict: true })).toThrow(/galeria/)
    expect(() => validateProjects([{ ...detailed, galeria: [{ src: 'a.webp', alt: { pt: '', en: '' } }] }], { strict: true })).toThrow(/galeria/)
  })

  it('does not drop the project in production when a detail field is bad: it drops only that project', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const bad = { ...detailed, id: 'bad', desafios: 5 }
    expect(validateProjects([bad, valid], { strict: false }).map((p) => p.id)).toEqual(['x'])
    warn.mockRestore()
  })
})
