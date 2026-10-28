import { describe, expect, it, vi } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { StaticChapters } from './StaticChapters'
import type { Chapter } from '../../lib/chapters'
import { projects, renderWithState } from '../../test/utils'

vi.mock('../../lib/palette', () => ({
  paletteFor: (id: string) => ({ ground: id === 'opening' ? '#08090c' : '#101a14', accent: '#7fd6a0', ink: '#f4f2ee' }),
}))

const chapters: Chapter[] = [
  { id: 'opening', kind: 'opening' },
  ...projects.slice(0, 3).map((p): Chapter => ({ id: p.id, kind: 'project', project: p })),
  { id: 'credits', kind: 'credits' },
]

describe('StaticChapters', () => {
  it('renders every chapter except credits, without an h1 of its own and with visible content', () => {
    renderWithState(<StaticChapters chapters={chapters} onOpen={() => {}} />)
    expect(document.querySelectorAll('section')).toHaveLength(4)
    expect(screen.queryAllByRole('heading', { level: 1 })).toHaveLength(0)
    for (const p of projects.slice(0, 3)) {
      expect(screen.getByRole('heading', { level: 2, name: p.titulo.pt })).toBeVisible()
      expect(screen.getByText(p.resumo.pt)).toBeVisible()
    }
    expect(screen.getByText('3 projetos')).toBeVisible()
  })

  it('applies the chapter palette as CSS variables and the ground as background', () => {
    renderWithState(<StaticChapters chapters={chapters} onOpen={() => {}} />)
    const section = screen.getByRole('heading', { level: 2, name: projects[0].titulo.pt }).closest('section') as HTMLElement
    expect(section.style.getPropertyValue('--ground')).toBe('#101a14')
    expect(section.style.getPropertyValue('--ink')).toBe('#f4f2ee')
    expect(section.style.getPropertyValue('--accent-chapter')).toBe('#7fd6a0')
    expect(section.style.background).toContain('var(--ground)')
  })

  it('sets no inline transform, opacity or clip-path anywhere', () => {
    const { container } = renderWithState(<StaticChapters chapters={chapters} onOpen={() => {}} />)
    for (const el of container.querySelectorAll<HTMLElement>('[style]')) {
      expect(el.style.transform).toBe('')
      expect(el.style.opacity).toBe('')
      expect(el.style.clipPath).toBe('')
    }
  })

  it('shows the decorative backdrop and drops it for a flat color when it fails to load', () => {
    const { container } = renderWithState(<StaticChapters chapters={chapters} onOpen={() => {}} />)
    const imgs = container.querySelectorAll('img')
    expect(imgs).toHaveLength(3)
    expect(imgs[0]).toHaveAttribute('alt', '')
    fireEvent.error(imgs[0])
    expect(container.querySelectorAll('img')).toHaveLength(2)
    expect(screen.getByRole('heading', { level: 2, name: projects[0].titulo.pt })).toBeVisible()
  })

  it('calls onOpen with the project id', () => {
    const onOpen = vi.fn()
    renderWithState(<StaticChapters chapters={chapters} onOpen={onOpen} />)
    fireEvent.click(screen.getAllByRole('button', { name: /ver detalhes/i })[1])
    expect(onOpen).toHaveBeenCalledWith(projects[1].id)
  })
})
