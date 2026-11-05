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
  it('accepts every seed project', () => {
    const ids = validateProjects(seed).map((p) => p.id)
    expect(ids).toEqual(['reveste', 'pkz', 'tabbit', 'orquestrador', 'companion', 'ap2', 'bombas', 'b3', 'tradingbot', 'jarvis', 'chat-amigos'])
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

  it('accepts a download path and rejects paths that escape downloads/', () => {
    const ok = { ...valid, links: [{ label: 'Baixar', url: 'downloads/validador.html' }] }
    expect(validateProjects([ok], { strict: true })[0].links).toEqual([{ label: 'Baixar', url: 'downloads/validador.html' }])
    for (const url of ['/downloads/a.html', 'downloads/../a.html', 'other/a.html', 'downloads/a.exe']) {
      expect(() => validateProjects([{ ...valid, links: [{ label: 'Baixar', url }] }], { strict: true })).toThrow(/links/)
    }
  })

  describe('demo', () => {
    const video = { tipo: 'video', src: 'projetos/x/demo.mp4', poster: 'projetos/x/demo.webp', legenda: { pt: 'Legenda', en: '' } }
    const parse = (demo: unknown) => validateProjects([{ ...valid, demo }], { strict: true })[0].demo

    it('accepts a live https site, the bundled app and a video with a caption (English falls back to Portuguese)', () => {
      expect(parse({ tipo: 'site', url: 'https://example.com/app/' })).toEqual({ tipo: 'site', url: 'https://example.com/app/' })
      expect(parse({ tipo: 'site', url: 'downloads/validador.html' })).toEqual({ tipo: 'site', url: 'downloads/validador.html' })
      expect(parse(video)).toMatchObject({ tipo: 'video', legenda: { pt: 'Legenda', en: 'Legenda' } })
    })

    it.each([
      ['an http site (a frame on an https page would be blocked)', { tipo: 'site', url: 'http://example.com' }],
      ['a script url', { tipo: 'site', url: 'javascript:alert(1)' }],
      ['a download that is not html', { tipo: 'site', url: 'downloads/a.zip' }],
      ['a path that escapes the folder', { tipo: 'site', url: 'downloads/../x.html' }],
      ['an unknown type', { tipo: 'iframe', url: 'https://example.com' }],
      ['a video outside projetos/', { ...video, src: '/etc/x.mp4' }],
      ['a video with .. in the path', { ...video, src: 'projetos/../x.mp4' }],
      ['a video without a poster', { ...video, poster: '' }],
      ['a video without a caption', { ...video, legenda: undefined }],
      ['a demo that is not an object', 'https://example.com'],
    ])('rejects %s', (_, demo) => {
      expect(() => parse(demo)).toThrow(/demo/)
    })
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

  it('accepts tool groups and methodology and falls back to pt when en is empty', () => {
    const p = validateProjects(
      [{ ...detailed, ferramentas: [{ grupo: { pt: 'Testes', en: '' }, itens: ['vitest', ' Playwright '] }], metodologia: [{ pt: 'TDD', en: '' }] }],
      { strict: true },
    )[0]
    expect(p.ferramentas).toEqual([{ grupo: { pt: 'Testes', en: 'Testes' }, itens: ['vitest', 'Playwright'] }])
    expect(p.metodologia).toEqual([{ pt: 'TDD', en: 'TDD' }])
  })

  it('rejects tool groups without items, with blank items, or that are not a list', () => {
    const grupo = { pt: 'Testes', en: 'Tests' }
    expect(() => validateProjects([{ ...detailed, ferramentas: 'x' }], { strict: true })).toThrow(/ferramentas/)
    expect(() => validateProjects([{ ...detailed, ferramentas: [{ grupo, itens: [] }] }], { strict: true })).toThrow(/ferramentas/)
    expect(() => validateProjects([{ ...detailed, ferramentas: [{ grupo, itens: [' '] }] }], { strict: true })).toThrow(/ferramentas/)
    expect(() => validateProjects([{ ...detailed, metodologia: [{ pt: '', en: 'x' }] }], { strict: true })).toThrow(/metodologia/)
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
