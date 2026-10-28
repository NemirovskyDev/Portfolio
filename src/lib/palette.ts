import palette from '../data/palette.json'

export type ChapterPalette = { ground: string; accent: string; ink: string }

const entries: Record<string, ChapterPalette> = palette

/** Unknown ids (or a project added without re-running the script) get the opening palette. */
export function paletteFor(id: string): ChapterPalette {
  return Object.hasOwn(entries, id) ? entries[id] : entries.opening
}
