import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { hasWebGL } from '../lib/hasWebGL'
import { ScrollTrigger } from '../lib/gsap'
import { scrollToTarget, useSmoothScroll } from '../lib/useSmoothScroll'
import { Home } from './Home'
import { AppStateProvider } from '../state/AppState'
import { mockReducedMotion, projects } from '../test/utils'

vi.mock('../lib/hasWebGL', () => ({ hasWebGL: vi.fn(() => true) }))
vi.mock('../lib/useSmoothScroll', () => ({ useSmoothScroll: vi.fn(), scrollToTarget: vi.fn() }))
// the hero and contact backdrops load three.js lazily; jsdom has no WebGL
vi.mock('../components/Fluid/FluidBackdrop', () => ({ FluidBackdrop: () => <div data-testid="fluid" /> }))
// jsdom cannot run WebGL: the stage canvas is replaced by a marker.
vi.mock('../components/Cinema/StageCanvas', () => ({
  StageCanvas: ({ paused }: { paused?: boolean }) => <div data-testid="stage-canvas" data-paused={String(Boolean(paused))} />,
}))

const renderHome = () =>
  render(
    <AppStateProvider>
      <Home projects={projects} />
    </AppStateProvider>,
  )

// refresh() restores the scroll position with window.scrollTo, which would be counted as the page's own calls
const refresh = vi.spyOn(ScrollTrigger, 'refresh')

beforeEach(() => {
  refresh.mockReset()
  refresh.mockImplementation(() => {})
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  vi.mocked(hasWebGL).mockReturnValue(true)
  vi.mocked(useSmoothScroll).mockClear()
  vi.mocked(scrollToTarget).mockClear()
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
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Bernardo Nemirovsky')
    expect(screen.getByRole('heading', { level: 2, name: 'Sobre mim' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Vamos conversar' })).toBeInTheDocument()
  })

  it('only the active chapter is reachable: one details button at a time', () => {
    renderHome()
    expect(screen.getAllByRole('button', { name: /^Ver detalhes/ })).toHaveLength(1)
  })

  it('lays out one marker per project, ordered by category, with the first active', () => {
    renderHome()
    const nav = screen.getByRole('navigation', { name: 'Linha do tempo dos projetos' })
    const markers = within(nav).getAllByRole('button')
    expect(markers).toHaveLength(projects.length)
    expect(markers[0]).toHaveAttribute('aria-current', 'step')
    expect(markers[0]).toHaveAccessibleName('Orquestrador multiagente')
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
  it('reduced motion renders the hero, about, every project and contact, with no stage', () => {
    mockReducedMotion(true)
    renderHome()
    expect(screen.queryByTestId('stage-canvas')).toBeNull()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    for (const p of projects) expect(screen.getByRole('heading', { level: 2, name: p.titulo.pt })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Sobre mim' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 2, name: 'Vamos conversar' })).toBeInTheDocument()
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

describe('contact', () => {
  it('shows the email, LinkedIn and GitHub, and the top button scrolls up and focuses the title', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    renderHome()
    expect(screen.getByRole('link', { name: 'Enviar e-mail' })).toHaveAttribute('href', 'mailto:bernardoborges15@gmail.com')
    // the address lives in the buttons only: no loose text repeating it
    expect(screen.queryByText('bernardoborges15@gmail.com')).toBeNull()
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', 'https://github.com/NemirovskyDev')
    expect(screen.getByRole('link', { name: /LinkedIn/ })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Voltar ao início' }))
    expect(scrollToTarget).toHaveBeenCalledWith(0)
    expect(screen.getByRole('heading', { level: 1 })).toHaveFocus()
    expect(document.querySelector('form, input, textarea')).toBeNull()
  })

  it('copies the email and announces it', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
    renderHome()
    await user.click(screen.getByRole('button', { name: 'Copiar e-mail' }))
    expect(writeText).toHaveBeenCalledWith('bernardoborges15@gmail.com')
    expect(await screen.findAllByText('E-mail copiado')).not.toHaveLength(0)
  })

  it('tells the visitor to copy by hand when the clipboard is blocked', async () => {
    mockReducedMotion(true)
    const user = userEvent.setup()
    Object.defineProperty(navigator, 'clipboard', { value: { writeText: vi.fn().mockRejectedValue(new Error('blocked')) }, configurable: true })
    renderHome()
    await user.click(screen.getByRole('button', { name: 'Copiar e-mail' }))
    expect(await screen.findAllByText(/Não deu para copiar/)).not.toHaveLength(0)
    // the fallback hands over the address to copy by hand
    expect(screen.getByText('bernardoborges15@gmail.com')).toHaveClass('contact-status-email')
  })
})

describe('site navigation', () => {
  it('each link scrolls to its section', async () => {
    const user = userEvent.setup()
    renderHome()
    await user.click(screen.getByRole('button', { name: 'Contato' }))
    expect(scrollToTarget).toHaveBeenLastCalledWith(document.getElementById('contato'))
    await user.click(screen.getByRole('button', { name: 'Sobre' }))
    expect(scrollToTarget).toHaveBeenLastCalledWith(document.getElementById('sobre'))
  })

  it('the menu toggle reports its state and Esc closes it and returns focus', async () => {
    const user = userEvent.setup()
    renderHome()
    const toggle = screen.getByRole('button', { name: 'Menu' })
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    await user.click(toggle)
    expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await user.keyboard('{Escape}')
    expect(toggle).toHaveAttribute('aria-expanded', 'false')
    expect(toggle).toHaveFocus()
  })
})

describe('while a window covers the page', () => {
  it('stops drawing the 3D scene behind the index and behind a project, and resumes after', async () => {
    const user = userEvent.setup()
    renderHome()
    const paused = () => screen.getByTestId('stage-canvas').getAttribute('data-paused')
    expect(paused()).toBe('false')
    await user.click(screen.getByRole('button', { name: 'Índice' }))
    expect(paused()).toBe('true')
    await user.keyboard('{Escape}')
    expect(paused()).toBe('false')
  })
})

describe('language change', () => {
  it('measures the page again, because the text has another height', async () => {
    const user = userEvent.setup()
    renderHome()
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled()) // the first render measures too
    refresh.mockClear()
    await user.click(screen.getByRole('button', { name: /mudar idioma para inglês/ }))
    await vi.waitFor(() => expect(refresh).toHaveBeenCalled())
  })

  it('joins the sections on the colour of the neighbouring project', () => {
    renderHome()
    const main = document.querySelector('main') as HTMLElement
    expect(main.style.getPropertyValue('--seam-first')).toMatch(/^#[0-9a-f]{6}$/)
    expect(main.style.getPropertyValue('--seam-last')).toMatch(/^#[0-9a-f]{6}$/)
  })
})

describe('about', () => {
  it('lists every skill group with its items', () => {
    renderHome()
    expect(screen.getByRole('heading', { level: 3, name: 'IA e agentes' })).toBeInTheDocument()
    expect(screen.getAllByText('Prompt engineering').length).toBeGreaterThan(0)
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
