import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hasWebGL } from '../lib/hasWebGL'
import { useSmoothScroll } from '../lib/useSmoothScroll'
import { Home } from './Home'
import { AppStateProvider } from '../state/AppState'
import { mockReducedMotion, projects } from '../test/utils'

vi.mock('../lib/hasWebGL', () => ({ hasWebGL: vi.fn(() => true) }))
vi.mock('../lib/useSmoothScroll', () => ({ useSmoothScroll: vi.fn() }))
// jsdom cannot run WebGL: the stage canvas is replaced by a marker.
vi.mock('../components/Cinema/StageCanvas', () => ({
  StageCanvas: () => <div data-testid="stage-canvas" />,
}))

const renderHome = () =>
  render(
    <AppStateProvider>
      <Home projects={projects} />
    </AppStateProvider>,
  )

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.mocked(hasWebGL).mockReturnValue(true)
  vi.mocked(useSmoothScroll).mockClear()
  window.scrollTo = vi.fn() as unknown as typeof window.scrollTo
  mockReducedMotion(false)
})

describe('cinema mode', () => {
  it('renders the header, the stage, the timeline and exactly one h1', () => {
    renderHome()
    expect(screen.getByTestId('stage-canvas')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Linha do tempo dos projetos' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Índice' })).toBeInTheDocument()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bernardo Paes Nemirovsky Borges')
  })

  it('only the active chapter is reachable: the first project button is not focusable at the opening', () => {
    renderHome()
    expect(screen.queryByRole('button', { name: /^Ver detalhes/ })).toBeNull()
  })

  it('lays out one marker per chapter, ordered by category, with the opening active', () => {
    renderHome()
    const nav = screen.getByRole('navigation', { name: 'Linha do tempo dos projetos' })
    const markers = within(nav).getAllByRole('button')
    expect(markers).toHaveLength(projects.length + 2)
    expect(markers[0]).toHaveAttribute('aria-current', 'step')
    expect(markers[1]).toHaveAccessibleName('Orquestrador multiagente')
  })

  it('jumping from the timeline scrolls the page', async () => {
    const user = userEvent.setup()
    renderHome()
    const nav = screen.getByRole('navigation', { name: 'Linha do tempo dos projetos' })
    await user.click(within(nav).getAllByRole('button')[4])
    expect(window.scrollTo).toHaveBeenCalledTimes(1)
  })

  it('pauses smooth scrolling while a project or the index is open', async () => {
    const user = userEvent.setup()
    renderHome()
    expect(vi.mocked(useSmoothScroll).mock.lastCall?.[0]).toEqual({ enabled: true, paused: false })
    await user.click(screen.getByRole('button', { name: 'Índice' }))
    expect(vi.mocked(useSmoothScroll).mock.lastCall?.[0]).toEqual({ enabled: true, paused: true })
  })
})

describe('index and modal', () => {
  it('the Índice button opens the panel, and choosing a project opens its modal by hash', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(screen.getByRole('button', { name: 'Índice' }))
    const panel = screen.getByRole('dialog', { name: 'Todos os projetos' })
    await user.click(within(panel).getByRole('button', { name: 'Tabbit' }))
    expect(window.location.hash).toBe('#/p/tabbit')
    expect(screen.getByRole('dialog', { name: 'Tabbit' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Todos os projetos' })).toBeNull()
  })

  it('Esc closes the index panel', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(screen.getByRole('button', { name: 'Índice' }))
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog', { name: 'Todos os projetos' })).toBeNull()
  })

  it('a deep link opens the project, and an unknown one shows only the page', () => {
    window.location.hash = '#/p/jarvis'
    const { unmount } = renderHome()
    expect(screen.getByRole('dialog', { name: 'Jarvis' })).toBeInTheDocument()
    unmount()
    window.location.hash = '#/p/nao-existe'
    renderHome()
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('closing the modal keeps the page where it was (no scroll call)', async () => {
    const user = userEvent.setup()
    window.location.hash = '#/p/reveste'
    renderHome()
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(window.scrollTo).not.toHaveBeenCalled()
  })
})

describe('static mode', () => {
  it('reduced motion renders every chapter and the credits, with no stage', () => {
    mockReducedMotion(true)
    renderHome()
    expect(screen.queryByTestId('stage-canvas')).toBeNull()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    for (const p of projects) expect(screen.getByRole('heading', { level: 2, name: p.titulo.pt })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Sobre mim e contato' })).toBeInTheDocument()
    expect(vi.mocked(useSmoothScroll).mock.lastCall?.[0]).toMatchObject({ enabled: false })
  })

  it('no WebGL gives the same static page', () => {
    vi.mocked(hasWebGL).mockReturnValue(false)
    renderHome()
    expect(screen.queryByTestId('stage-canvas')).toBeNull()
    expect(screen.getAllByRole('button', { name: /^Ver detalhes/ })).toHaveLength(projects.length)
  })

  it('the detail buttons open the modal', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    renderHome()
    await user.click(screen.getAllByRole('button', { name: /^Ver detalhes/ })[0])
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('language', () => {
  it('the toggle switches the visible texts to English', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(screen.getByRole('button', { name: /mudar idioma para inglês/ }))
    expect(screen.getByRole('button', { name: 'Index' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })
})

describe('credits', () => {
  it('shows GitHub and LinkedIn and sends the visitor back to the top', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    renderHome()
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/NemirovskyDev')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Voltar ao início' }))
    expect(window.scrollTo).toHaveBeenCalledWith(expect.objectContaining({ top: 0 }))
    expect(document.querySelector('form, input, textarea, a[href^="mailto:"]')).toBeNull()
  })
})

describe('keyboard', () => {
  it('the index opener gets focus back when the panel closes', async () => {
    const user = userEvent.setup()
    renderHome()
    const opener = screen.getByRole('button', { name: 'Índice' })
    await user.click(opener)
    await user.keyboard('{Escape}')
    expect(opener).toHaveFocus()
  })
})
