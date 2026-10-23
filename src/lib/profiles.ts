import type { Project } from './types'

export type Profile = 'recrutador' | 'dev' | 'curioso'
export const PROFILES: readonly Profile[] = ['recrutador', 'dev', 'curioso']

/** Categories listed first for each profile; the rest follow in data order. Curioso has no preference. */
const CATEGORY_ORDER: Record<Profile, string[]> = {
  recrutador: ['IA e Agentes', 'Hackathons', 'Sites'],
  dev: ['Sites', 'Hardware', 'Hackathons'],
  curioso: [],
}

const FEATURED: Record<Profile, string> = {
  recrutador: 'orquestrador',
  dev: 'reveste',
  curioso: 'tabbit',
}

export const isProfile = (v: unknown): v is Profile => PROFILES.includes(v as Profile)

export function categoriesFor(profile: Profile, projects: Project[]): { categoria: string; items: Project[] }[] {
  const groups = new Map<string, Project[]>()
  for (const p of projects) groups.set(p.categoria, [...(groups.get(p.categoria) ?? []), p])

  const first = CATEGORY_ORDER[profile].filter((c) => groups.has(c))
  const rest = [...groups.keys()].filter((c) => !first.includes(c))
  return [...first, ...rest].map((categoria) => ({ categoria, items: groups.get(categoria)! }))
}

export function featuredFor(profile: Profile, projects: Project[]): Project | undefined {
  return projects.find((p) => p.id === FEATURED[profile]) ?? projects[0]
}
