import type { L10n, Project, Status } from './types'

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

function parseProject(raw: unknown): Project {
  if (!isObj(raw)) throw new ProjectError('?', 'item', 'is not an object')
  const id = text('?', 'id', raw.id)
  const status = raw.status as Status
  if (!STATUS.includes(status)) throw new ProjectError(id, 'status', `must be one of ${STATUS.join(', ')}`)
  if (!Array.isArray(raw.stack) || raw.stack.some((s) => !str(s))) throw new ProjectError(id, 'stack', 'must be a list of strings')

  let links: Project['links']
  if (raw.links !== undefined) {
    const ok =
      Array.isArray(raw.links) &&
      raw.links.every((l) => isObj(l) && str(l.label) && /^https?:\/\//i.test(str(l.url)))
    if (!ok) throw new ProjectError(id, 'links', 'must have label and an http(s) url')
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
