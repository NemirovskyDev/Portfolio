export type Lang = 'pt' | 'en'
export type L10n = { pt: string; en: string }
export type Status = 'concluido' | 'no-ar' | 'em-andamento'

export type Project = {
  id: string
  categoria: string
  capa: string
  fundo: string
  titulo: L10n
  resumo: L10n
  proposito: L10n
  papel: L10n
  stack: string[]
  status: Status
  links?: { label: string; url: string }[]
  funcionalidades?: L10n[]
  /** Short step-by-step of how the project works, in order. */
  comoFunciona?: L10n[]
  /** Tools grouped by purpose, e.g. "Testes": ["vitest", "Playwright"]. */
  ferramentas?: { grupo: L10n; itens: string[] }[]
  /** Methods and engineering practices actually used in the project. */
  metodologia?: L10n[]
  desafios?: L10n
  galeria?: { src: string; alt: L10n }[]
}
