import { describe, expect, it, vi } from 'vitest'
import { createProgress } from '../../lib/progress'
import { screen, fireEvent, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimelineBar } from './TimelineBar'
import type { Chapter } from '../../lib/chapters'
import { projects, renderWithState } from '../../test/utils'

const chapters: Chapter[] = projects.map((p): Chapter => ({ id: p.id, kind: 'project', project: p }))

describe('TimelineBar', () => {
  it('is a named nav with one button per chapter named by its title', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={0} onJump={() => {}} />)
    const nav = screen.getByRole('navigation', { name: 'Linha do tempo dos projetos' })
    const buttons = within(nav).getAllByRole('button')
    expect(buttons).toHaveLength(chapters.length)
    expect(within(nav).getByRole('button', { name: projects[0].titulo.pt })).toBeInTheDocument()
    expect(buttons.every((b) => b.getAttribute('type') === 'button')).toBe(true)
  })

  it('marks only the active chapter with aria-current=step', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={2} onJump={() => {}} />)
    const current = document.querySelectorAll('[aria-current="step"]')
    expect(current).toHaveLength(1)
    expect(current[0]).toHaveAccessibleName(projects[2].titulo.pt)
  })

  it('calls onJump with the index on click and on Enter', async () => {
    const onJump = vi.fn()
    renderWithState(<TimelineBar chapters={chapters} activeIndex={0} onJump={onJump} />)
    fireEvent.click(screen.getByRole('button', { name: projects[2].titulo.pt }))
    expect(onJump).toHaveBeenLastCalledWith(2)
    const user = userEvent.setup()
    screen.getByRole('button', { name: projects[4].titulo.pt }).focus()
    await user.keyboard('{Enter}')
    expect(onJump).toHaveBeenLastCalledWith(4)
    await user.keyboard(' ')
    expect(onJump).toHaveBeenCalledTimes(3)
  })

  it('shows the current title and a zero-padded counter', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={2} onJump={() => {}} />)
    expect(screen.getByText(`03 / ${String(chapters.length).padStart(2, '0')}`)).toBeInTheDocument()
    expect(screen.getByTestId('timeline-current')).toHaveTextContent(projects[2].titulo.pt)
  })

  it('fills each marker like a loading bar as the scroll position advances', () => {
    const f = createProgress(2.5)
    renderWithState(<TimelineBar chapters={chapters} activeIndex={3} onJump={() => {}} progress={f} />)
    const scale = (i: number) => (document.querySelectorAll('.timeline-fill')[i] as HTMLElement).style.transform
    expect(scale(1)).toBe('none') // fully filled is the identity transform
    expect(scale(2)).toBe('none')
    expect(scale(3)).toContain('scaleX(0.5)')
    expect(scale(4)).toContain('scaleX(0)')
  })

  it('numbers every chapter, since each one is a project', () => {
    const { container } = renderWithState(<TimelineBar chapters={chapters} activeIndex={0} onJump={() => {}} />)
    expect(container.querySelector('.timeline-counter')).toHaveTextContent(`01 / ${String(chapters.length).padStart(2, '0')}`)
  })

  it('separates category groups', () => {
    renderWithState(<TimelineBar chapters={chapters} activeIndex={0} onJump={() => {}} />)
    const items = [...document.querySelectorAll('.timeline-item')]
    const expected = chapters.filter((c, i) => {
      if (i === 0) return false
      const prev = chapters[i - 1]
      const key = (x: Chapter) => x.project.categoria
      return key(c) !== key(prev)
    }).length
    expect(items.filter((li) => li.classList.contains('timeline-item--group-start'))).toHaveLength(expected)
    expect(expected).toBeGreaterThan(1)
  })
})
