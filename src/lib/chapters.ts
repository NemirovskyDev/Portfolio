import type { Project } from './types'

// The stage holds the projects only: the hero opens the page before it and the contact section closes it after.
export type Chapter = { id: string; kind: 'project'; project: Project }

export const CATEGORY_ORDER: readonly string[] = [
  'IA e Agentes',
  'Sites',
  'Hackathons',
  'Hardware',
  'Universidade',
  'Ferramentas',
]

// Unknown categories sort after every known one; Array.sort is stable, so data order is kept.
const rank = (categoria: string): number => {
  const i = CATEGORY_ORDER.indexOf(categoria)
  return i === -1 ? CATEGORY_ORDER.length : i
}

export function buildChapters(projects: Project[]): Chapter[] {
  return [...projects]
    .sort((a, b) => rank(a.categoria) - rank(b.categoria))
    .map((project): Chapter => ({ id: project.id, kind: 'project', project }))
}

/** Chapter nearest to the continuous progress `f`; NaN and +-Infinity cannot leave the range. */
export function activeIndex(f: number, count: number): number {
  const last = Math.max(count - 1, 0)
  if (Number.isNaN(f)) return 0
  return Math.min(Math.max(Math.round(f), 0), last)
}
