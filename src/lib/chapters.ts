import type { Project } from './types'

export type Chapter =
  | { id: 'opening'; kind: 'opening' }
  | { id: string; kind: 'project'; project: Project }
  | { id: 'credits'; kind: 'credits' }

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
  const ordered = [...projects].sort((a, b) => rank(a.categoria) - rank(b.categoria))
  return [
    { id: 'opening', kind: 'opening' },
    ...ordered.map((project): Chapter => ({ id: project.id, kind: 'project', project })),
    { id: 'credits', kind: 'credits' },
  ]
}

/** Chapter nearest to the continuous progress `f`; NaN and +-Infinity cannot leave the range. */
export function activeIndex(f: number, count: number): number {
  const last = Math.max(count - 1, 0)
  if (Number.isNaN(f)) return 0
  return Math.min(Math.max(Math.round(f), 0), last)
}
