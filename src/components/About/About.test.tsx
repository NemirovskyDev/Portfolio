import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockReducedMotion, renderWithState } from '../../test/utils'
import { SKILL_GROUPS, skillId } from '../../lib/skills'
import { projects } from '../../data/projects'
import { AppStateProvider } from '../../state/AppState'
import { LangToggle } from '../LangToggle'
import { About } from './About'

const title = (id: string) => projects.find((p) => p.id === id)!.titulo.pt

beforeEach(() => {
  localStorage.clear() // a language chosen in one test must not leak into the next
  mockReducedMotion(true)
})

function setup() {
  const onOpenProject = vi.fn()
  const view = renderWithState(<About animated={false} onOpenProject={onOpenProject} />)
  return { onOpenProject, ...view }
}

describe('About words', () => {
  it('splits every text into one box per word, and the accessible names keep their spaces', () => {
    setup()
    const heading = screen.getByRole('heading', { level: 2, name: 'Sobre mim' })
    expect([...heading.querySelectorAll('.w')].map((w) => w.textContent)).toEqual(['Sobre', 'mim'])
    // a multi-word skill is read as one name, not as separate words glued together
    const skill = screen.getByRole('button', { name: 'Prompt engineering' })
    expect(skill.querySelectorAll('.w')).toHaveLength(2)
  })

  it('renders the same words in English after a language change', () => {
    render(
      <AppStateProvider>
        <LangToggle />
        <About animated={false} onOpenProject={() => {}} />
      </AppStateProvider>,
    )
    fireEvent.click(screen.getByRole('button', { name: /mudar idioma para inglês/ }))
    expect(screen.getByRole('heading', { level: 2, name: 'About me' }).querySelectorAll('.w')).toHaveLength(2)
  })
})

describe('About skills', () => {
  it('opens "Usado em" with the right projects below the clicked skill', () => {
    setup()
    const btn = screen.getByRole('button', { name: 'Claude Code' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    fireEvent.click(btn)
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(btn.getAttribute('aria-controls')!)!
    expect(panel).toHaveTextContent('Usado em:')
    for (const id of ['orquestrador', 'jarvis', 'chat-amigos']) {
      expect(panel).toContainElement(screen.getByRole('button', { name: title(id) }))
    }
  })

  it('keeps one open at a time', () => {
    setup()
    fireEvent.click(screen.getByRole('button', { name: 'Claude Code' }))
    fireEvent.click(screen.getByRole('button', { name: 'Prompt engineering' }))
    expect(screen.getByRole('button', { name: 'Claude Code' })).toHaveAttribute('aria-expanded', 'false')
    expect(screen.getAllByRole('group', { name: 'Usado em' })).toHaveLength(1)
  })

  it('a chip calls onOpenProject with the id and returns focus to the skill', () => {
    const { onOpenProject } = setup()
    const btn = screen.getByRole('button', { name: 'Scrum' })
    fireEvent.click(btn)
    fireEvent.click(screen.getByRole('button', { name: title('ap2') }))
    expect(onOpenProject).toHaveBeenCalledWith('ap2')
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(btn).toHaveFocus()
  })

  it('Esc closes and gives focus back to the skill', () => {
    setup()
    const btn = screen.getByRole('button', { name: 'Scrum' })
    fireEvent.click(btn)
    screen.getByRole('button', { name: title('ap2') }).focus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    expect(btn).toHaveFocus()
  })

  it('a press outside closes it', () => {
    setup()
    const btn = screen.getByRole('button', { name: 'Scrum' })
    fireEvent.click(btn)
    fireEvent.pointerDown(document.body)
    expect(btn).toHaveAttribute('aria-expanded', 'false')
  })

  it('focusSkill opens that skill and focuses it, and a new request n opens it again', () => {
    const id = skillId('entrega', 'pytest')
    expect(SKILL_GROUPS.flatMap((g) => g.itens).some((i) => i.id === id)).toBe(true)
    const onOpenProject = vi.fn()
    const { rerender } = renderWithState(<About animated={false} onOpenProject={onOpenProject} focusSkill={{ id, n: 1 }} />)
    const btn = screen.getByRole('button', { name: 'pytest' })
    expect(btn).toHaveAttribute('aria-expanded', 'true')
    expect(btn).toHaveFocus()
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(btn).toHaveAttribute('aria-expanded', 'false')
    rerender(
      <AppStateProvider>
        <About animated={false} onOpenProject={onOpenProject} focusSkill={{ id, n: 2 }} />
      </AppStateProvider>,
    )
    expect(btn).toHaveAttribute('aria-expanded', 'true')
  })
})
