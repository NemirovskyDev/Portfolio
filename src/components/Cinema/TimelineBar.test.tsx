import { describe, expect, it, vi } from 'vitest'
import { screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimelineBar } from './TimelineBar'
import type { Chapter } from '../../lib/chapters'
import { projects, renderWithState } from '../../test/utils'

const chapters: Chapter[] = [
  { id: 'opening', kind: 'opening' },
  ...projects.map((p): Chapter => ({ id: p.id, kind: 'project', project: p })),
  { id: 'credits', kind: 'credits' },
]

describe('TimelineBar', () => {
  it('is a named nav with one button per chapter named by its title', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={0} onJump={() => {}} />)
    const nav = screen.getByRole('navigation', { name: 'Linha do tempo dos projetos' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(chapters.length)
    expect(within(nav).getByRole('button', { name: 'Bernardo Nemirovsky' })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: projects[0].titulo.pt })).toBeInTheDocument()
    expect(within(nav).getByRole('button', { name: 'Sobre mim e contato' })).toBeInTheDocument()
    expect(buttons.every((b) => b.getAttribute('type') === 'button')).toBe(true)
  })

  it('marks only the active chapter with aria-current=step', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={2} onJump={() => {}} />)
    const current = document.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName(projects[1].titulo.pt)
  })

  it('calls onJump with the index on click and on Enter', async () => {
    const onJump = vi.fn()
    renderWithState(<TimelineBar chapters={chapters} activeIndex={0} onJump={onJump} />)
    fireEvent.click(screen.getByRole('button', { name: projects[2].titulo.pt }))
    expect(onJump).toHaveBeenLastCalledWith(3)
    const user = userEvent.setup()
    screen.getByRole('button', { name: projects[4].titulo.pt }).focus()
    await user.keyboard('{Enter}')
    expect(onJump).toHaveBeenLastCalledWith(5)
    await user.keyboard(' ')
    expect(onJump).toHaveBeenCalledTimes(3)
  })

  it('shows the current title and a zero-padded counter', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={2} onJump={() => {}} />)
    const total = chapters.filter((c) => c.kind === 'project').length
    expect(screen.getByText(`02 / ${String(total).padStart(2, '0')}`)).toBeInTheDocument()
    expect(screen.getByTestId('timeline-current')).toHaveTextContent(projects[1].titulo.pt)
  })

  it('does not number the opening or the credits', () => {
    for (const index of [0, chapters.length - 1]) {
      const { container, unmount } = renderWithState(<TimelineBar chapters={chapters} activeIndex={index} onJump={() => {}} />)
      expect(container.querySelector('.timeline-counter')).toBeEmptyDOMElement()
      unmount()
    }
  })

  it('separates category groups', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={0} onJump={() => {}} />)
    const items = [...document.querySelectorAll('.timeline-item')]
    const expected = chapters.filter((c, i) => {
      if (i === 0) return false
      const prev = chapters[i - 1]
      const key = (x: Chapter) => (x.kind === 'project' ? x.project.categoria : x.kind)
      return key(c) !== key(prev)
    }).length
    expect(items.filter((li) => li.classList.contains('timeline-item--group-start'))).toHaveLength(expected)
    expect(expected).toBeGreaterThan(1)
  })
})
