import type { L10n } from './types'

export type SkillGroup = { id: string; grupo: L10n; itens: L10n[] }

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v)
const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

class SkillError extends Error {
  constructor(where: string, detail: string) {
    super(`skills ${where}: ${detail}`)
  }
}

/** A label is either the same in both languages (a tool name) or a { pt, en } pair; English falls back to Portuguese. */
function label(where: string, v: unknown): L10n {
  if (typeof v === 'string') {
    const s = str(v)
    if (!s) throw new SkillError(where, 'is empty')
    return { pt: s, en: s }
  }
  if (!isObj(v) || !str(v.pt)) throw new SkillError(where, 'needs a pt text')
  return { pt: str(v.pt), en: str(v.en) || str(v.pt) }
}

/** Validates src/data/skills.json at load, so a typo fails the build instead of showing an empty group. */
export function parseSkills(raw: unknown): SkillGroup[] {
  if (!Array.isArray(raw)) throw new SkillError('root', 'must be a list')
  const seen = new Set<string>()
  return raw.map((g, i) => {
    if (!isObj(g)) throw new SkillError(`[${i}]`, 'must be an object')
    const id = str(g.id)
    if (!id || seen.has(id)) throw new SkillError(`[${i}].id`, 'must be present and unique')
    seen.add(id)
    if (!Array.isArray(g.itens) || !g.itens.length) throw new SkillError(`${id}.itens`, 'must be a non-empty list')
    return { id, grupo: label(`${id}.grupo`, g.grupo), itens: g.itens.map((it, j) => label(`${id}.itens[${j}]`, it)) }
  })
}
