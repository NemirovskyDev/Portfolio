import type { Demo, L10n, Project, Status } from './types'

const STATUS: readonly Status[] = ['concluido', 'no-ar', 'em-andamento']

type Options = { strict?: boolean }

class ProjectError extends Error {
  constructor(id: string, field: string, detail: string) {
    super(`project "${id}": ${field} ${detail}`)
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

function text(id: string, field: string, v: unknown): string {
  const s = str(v)
  if (!s) throw new ProjectError(id, field, 'is required')
  return s
}

function l10n(id: string, field: string, v: unknown): L10n {
  if (!isObj(v)) throw new ProjectError(id, `${field}.pt`, 'is required')
  const pt = text(id, `${field}.pt`, v.pt)
  return { pt, en: str(v.en) || pt }
}

function list(id: string, field: string, v: unknown): unknown[] {
  if (!Array.isArray(v)) throw new ProjectError(id, field, 'must be a list')
  return v
}

// relative paths only, to a file shipped in public/downloads: a leading slash or '..' would escape the deploy base
const isDownloadPath = (u: string) => /^downloads\/[\w\-.]+\.(html|pdf|zip)$/i.test(u)

// a recorded demo lives next to the project's other images; relative paths only, so it cannot escape the deploy base
const VIDEO_PATH = /^projetos\/[\w-]+\/[\w\-.]+\.(mp4|webm)$/i
const POSTER_PATH = /^projetos\/[\w-]+\/[\w\-.]+\.(webp|png|jpe?g|avif)$/i

function parseDemo(id: string, v: unknown): Demo {
  if (!isObj(v)) throw new ProjectError(id, 'demo', 'must be an object')
  if (v.tipo === 'site') {
    const url = str(v.url)
    // a live site (https) or the app published with this portfolio (downloads/*.html)
    if (!/^https:\/\//i.test(url) && !(isDownloadPath(url) && url.endsWith('.html'))) {
      throw new ProjectError(id, 'demo.url', 'must be an https url or a downloads/*.html path')
    }
    return { tipo: 'site', url }
  }
  if (v.tipo === 'video') {
    const src = str(v.src)
    const poster = str(v.poster)
    if (!VIDEO_PATH.test(src)) throw new ProjectError(id, 'demo.src', 'must be projetos/<id>/<file>.mp4 or .webm')
    if (!POSTER_PATH.test(poster)) throw new ProjectError(id, 'demo.poster', 'must be a projetos/<id>/ image')
    return { tipo: 'video', src, poster, legenda: l10n(id, 'demo.legenda', v.legenda) }
  }
  throw new ProjectError(id, 'demo.tipo', "must be 'site' or 'video'")
}

function parseGalleryItem(id: string, i: number, v: unknown) {
  const field = `galeria[${i}]`
  if (!isObj(v)) throw new ProjectError(id, field, 'must be an object')
  const src = text(id, `${field}.src`, v.src)
  // relative paths only: a leading slash or '//' would escape the deploy base or load from another host
  if (!/^[\w\-./]+\.(webp|png|jpe?g|avif)$/i.test(src) || src.startsWith('/') || src.includes('..')) {
    throw new ProjectError(id, `${field}.src`, 'must be a relative image path')
  }
  return { src, alt: l10n(id, `${field}.alt`, v.alt) }
}

function parseToolGroup(id: string, i: number, v: unknown) {
  const field = `ferramentas[${i}]`
  if (!isObj(v)) throw new ProjectError(id, field, 'must be an object')
  if (!Array.isArray(v.itens) || !v.itens.length || v.itens.some((s) => !str(s))) {
    throw new ProjectError(id, `${field}.itens`, 'must be a non-empty list of strings')
  }
  return { grupo: l10n(id, `${field}.grupo`, v.grupo), itens: (v.itens as string[]).map((s) => s.trim()) }
}

function parseProject(raw: unknown): Project {
  if (!isObj(raw)) throw new ProjectError('?', 'item', 'is not an object')
  const id = text('?', 'id', raw.id)
  // these ids belong to the opening and credits chapters
  if (id === 'opening' || id === 'credits') throw new ProjectError(id, 'id', 'is reserved')
  const status = raw.status as Status
  if (!STATUS.includes(status)) throw new ProjectError(id, 'status', `must be one of ${STATUS.join(', ')}`)
  if (!Array.isArray(raw.stack) || raw.stack.some((s) => !str(s))) throw new ProjectError(id, 'stack', 'must be a list of strings')

  let links: Project['links']
  if (raw.links !== undefined) {
    const ok =
      Array.isArray(raw.links) &&
      raw.links.every((l) => isObj(l) && str(l.label) && (/^https?:\/\//i.test(str(l.url)) || isDownloadPath(str(l.url))))
    if (!ok) throw new ProjectError(id, 'links', 'must have a label and an http(s) url or a downloads/ file path')
    links = (raw.links as { label: string; url: string }[]).map((l) => ({ label: l.label.trim(), url: l.url.trim() }))
  }

  return {
    id,
    categoria: text(id, 'categoria', raw.categoria),
    capa: text(id, 'capa', raw.capa),
    fundo: text(id, 'fundo', raw.fundo),
    titulo: l10n(id, 'titulo', raw.titulo),
    resumo: l10n(id, 'resumo', raw.resumo),
    proposito: l10n(id, 'proposito', raw.proposito),
    papel: l10n(id, 'papel', raw.papel),
    stack: (raw.stack as string[]).map((s) => s.trim()),
    status,
    ...(links ? { links } : {}),
    ...(raw.funcionalidades !== undefined
      ? { funcionalidades: list(id, 'funcionalidades', raw.funcionalidades).map((f, i) => l10n(id, `funcionalidades[${i}]`, f)) }
      : {}),
    ...(raw.comoFunciona !== undefined
      ? { comoFunciona: list(id, 'comoFunciona', raw.comoFunciona).map((s, i) => l10n(id, `comoFunciona[${i}]`, s)) }
      : {}),
    ...(raw.ferramentas !== undefined ? { ferramentas: list(id, 'ferramentas', raw.ferramentas).map((g, i) => parseToolGroup(id, i, g)) } : {}),
    ...(raw.metodologia !== undefined
      ? { metodologia: list(id, 'metodologia', raw.metodologia).map((m, i) => l10n(id, `metodologia[${i}]`, m)) }
      : {}),
    ...(raw.desafios !== undefined ? { desafios: l10n(id, 'desafios', raw.desafios) } : {}),
    ...(raw.galeria !== undefined ? { galeria: list(id, 'galeria', raw.galeria).map((g, i) => parseGalleryItem(id, i, g)) } : {}),
    ...(raw.demo !== undefined ? { demo: parseDemo(id, raw.demo) } : {}),
  }
}

/** Strict (dev default) throws on the first bad project; otherwise bad projects are dropped with a warning. */
export function validateProjects(raw: unknown, { strict = import.meta.env.DEV }: Options = {}): Project[] {
  if (!Array.isArray(raw)) throw new Error('projects data must be an array')
  const out: Project[] = []
  for (const item of raw) {
    try {
      out.push(parseProject(item))
    } catch (e) {
      if (strict) throw e
      console.warn(e instanceof Error ? e.message : e)
    }
  }
  return out
}
