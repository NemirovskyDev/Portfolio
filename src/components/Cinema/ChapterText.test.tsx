import { describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, fireEvent } from '@testing-library/react'
import { motionValue } from 'motion/react'
import { ChapterText } from './ChapterText'
import type { Chapter } from '../../lib/chapters'
import { projects, renderWithState, mockReducedMotion } from '../../test/utils'

const project = projects[0]
const projectChapter: Chapter = { id: project.id, kind: 'project', project }
const opening: Chapter = { id: 'opening', kind: 'opening' }

beforeEach(() => mockReducedMotion(false))

describe('ChapterText', () => {
  it('renders a project chapter with h2, summary, meta, up to 4 tags and the details button', () => {
    const onOpen = vi.fn()
    renderWithState(
      <ChapterText chapter={projectChapter} index={1} progress={motionValue(1)} active onOpen={onOpen} />,
    )
    expect(screen.getByRole('heading', { level: 2, name: project.titulo.pt })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull()
    expect(screen.getByText(project.resumo.pt)).toBeInTheDocument()
    expect(screen.getAllByRole('listitem').length).toBe(Math.min(4, project.stack.length))
    fireEvent.click(screen.getByRole('button', { name: /ver detalhes/i }))
    expect(onOpen).toHaveBeenCalledWith(project.id)
  })

  it('renders the opening chapter with a decorative title, support line and count', () => {
    renderWithState(
      <ChapterText chapter={opening} index={0} progress={motionValue(0)} active count={10} onOpen={() => {}} />,
    )
    expect(screen.queryByRole('heading', { level: 1 })).toBeNull() // the header owns the only h1
    expect(screen.getByText('Bernardo')).toBeInTheDocument()
    expect(screen.getByText(/foco em IA e agentes/)).toBeInTheDocument()
    expect(screen.getByText('10 projetos')).toBeInTheDocument()
  })

  it('renders nothing for credits', () => {
    const { container } = renderWithState(
      <ChapterText chapter={{ id: 'credits', kind: 'credits' }} index={11} progress={motionValue(0)} active onOpen={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })

  it('hides inactive chapters from keyboard and screen readers', () => {
    renderWithState(
      <ChapterText chapter={projectChapter} index={1} progress={motionValue(5)} active={false} onOpen={() => {}} />,
    )
    expect(screen.queryByRole('button')).toBeNull()
    expect(screen.queryByRole('heading')).toBeNull()
    expect(screen.getByText(project.resumo.pt)).not.toBeVisible()
  })

  it('drives the title with clip-path and transform from progress when motion is allowed', () => {
    renderWithState(
      <ChapterText chapter={projectChapter} index={3} progress={motionValue(2.7)} active onOpen={() => {}} />,
    )
    const h = screen.getByRole('heading', { level: 2 })
    expect(h.innerHTML).toMatch(/clip-path/)
    expect(h.innerHTML).toMatch(/transform/)
  })

  it('sets no inline transform, opacity or clip-path with reduced motion', () => {
    mockReducedMotion(true)
    const { container } = renderWithState(
      <ChapterText chapter={projectChapter} index={3} progress={motionValue(2.7)} active onOpen={() => {}} />,
    )
    const styled = [...container.querySelectorAll<HTMLElement>('[style]')]
    for (const el of styled) {
      expect(el.style.transform).toBe('')
      expect(el.style.opacity).toBe('')
      expect(el.style.clipPath).toBe('')
    }
  })
})
