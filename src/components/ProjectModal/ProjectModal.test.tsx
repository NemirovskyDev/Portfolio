import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import { act, fireEvent, renderHook, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectModal } from './ProjectModal'
import { useHashProject } from '../../lib/useHashProject'
import { mockReducedMotion, projects, renderWithState } from '../../test/utils'

const reveste = projects.find((p) => p.id === 'reveste')!

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  mockReducedMotion(true)
})

describe('useHashProject', () => {
  it('opens from #/p/reveste', () => {
    window.location.hash = '#/p/reveste'
    const { result } = renderHook(() => useHashProject(projects))
    expect(result.current.project?.id).toBe('reveste')
  })

  it('unknown id yields no project and no error', () => {
    window.location.hash = '#/p/nao-existe'
    const { result } = renderHook(() => useHashProject(projects))
    expect(result.current.project).toBeNull()
  })

  it('open() sets the hash and close() clears it', () => {
    const { result } = renderHook(() => useHashProject(projects))
    act(() => result.current.open('tabbit'))
    expect(window.location.hash).toBe('#/p/tabbit')
    expect(result.current.project?.id).toBe('tabbit')
    act(() => result.current.close())
    expect(window.location.hash).toBe('')
    expect(result.current.project).toBeNull()
  })

  it('reacts to hashchange from the browser', () => {
    const { result } = renderHook(() => useHashProject(projects))
    act(() => {
      window.location.hash = '#/p/b3'
      window.dispatchEvent(new HashChangeEvent('hashchange'))
    })
    expect(result.current.project?.id).toBe('b3')
  })
})

function Harness() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>opener</button>
      {open && <ProjectModal project={reveste} onClose={() => setOpen(false)} />}
    </>
  )
}

describe('ProjectModal', () => {
  it('renders stack tags, status, papel, purpose and links', () => {
    renderWithState(<ProjectModal project={reveste} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog', { name: 'Reveste' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveTextContent('No ar')
    expect(dialog).toHaveTextContent('Next.js')
    expect(dialog).toHaveTextContent(reveste.papel.pt)
    expect(dialog).toHaveTextContent(reveste.proposito.pt)
    const link = screen.getByRole('link', { name: /Site/ })
    expect(link).toHaveAttribute('href', 'https://nemirovskydev.github.io/Reveste/')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('renders features, challenges and gallery when the project has them', () => {
    const rich = {
      ...reveste,
      funcionalidades: [{ pt: 'Calculadora de medidas', en: 'Size calculator' }, { pt: 'Doação de peças', en: 'Clothing donation' }],
      desafios: { pt: 'Regras de preço complicadas', en: 'Tricky pricing rules' },
      galeria: [{ src: 'projetos/reveste/shot-1.webp', alt: { pt: 'Página inicial do Reveste', en: 'Reveste home page' } }],
    }
    renderWithState(<ProjectModal project={rich} onClose={() => {}} />)
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Funcionalidades' })).toBeInTheDocument()
    expect(within(dialog).getAllByRole('listitem').map((li) => li.textContent)).toEqual(
      expect.arrayContaining(['Calculadora de medidas', 'Doação de peças']),
    )
    expect(within(dialog).getByRole('heading', { name: 'Desafios e aprendizados' })).toBeInTheDocument()
    expect(dialog).toHaveTextContent('Regras de preço complicadas')
    expect(within(dialog).getByRole('img', { name: 'Página inicial do Reveste' })).toHaveAttribute('loading', 'lazy')
  })

  it('each gallery print opens the full image in a new tab and says so', () => {
    const rich = { ...reveste, galeria: [{ src: 'projetos/reveste/shot-1.webp', alt: { pt: 'Página inicial do Reveste', en: 'Home' } }] }
    renderWithState(<ProjectModal project={rich} onClose={() => {}} />)
    const link = screen.getByRole('link', { name: /Página inicial do Reveste.*abre em nova aba/ })
    expect(link.getAttribute('href')).toMatch(/projetos\/reveste\/shot-1\.webp$/)
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('external links announce the new tab and use a drawn icon instead of a glyph', () => {
    renderWithState(<ProjectModal project={reveste} onClose={() => {}} />)
    const link = screen.getByRole('link', { name: /Site.*abre em nova aba/ })
    expect(link.querySelector('svg[aria-hidden="true"]')).not.toBeNull()
    expect(screen.getByRole('dialog')).not.toHaveTextContent('↗')
  })

  it('omits the new sections when the project has no detail fields', () => {
    const plain = { ...reveste, funcionalidades: undefined, desafios: undefined, galeria: undefined }
    renderWithState(<ProjectModal project={plain} onClose={() => {}} />)
    expect(screen.queryByRole('heading', { name: 'Funcionalidades' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Desafios e aprendizados' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Capturas de tela' })).toBeNull()
  })

  it('shows the detail labels in English', () => {
    localStorage.setItem('lang', 'en')
    const rich = { ...reveste, funcionalidades: [{ pt: 'a', en: 'Feature one' }], desafios: { pt: 'b', en: 'A challenge' } }
    renderWithState(<ProjectModal project={rich} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Key features' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Challenges and lessons learned' })).toBeInTheDocument()
  })

  it('omits the links section when the project has none', () => {
    // the orquestrador has neither links nor a gallery
    const orquestrador = projects.find((p) => p.id === 'orquestrador')!
    renderWithState(<ProjectModal project={orquestrador} onClose={() => {}} />)
    expect(screen.queryByRole('link')).toBeNull()
  })

  it('Esc closes and restores focus to the opener', async () => {
    const user = userEvent.setup()
    renderWithState(<Harness />)
    const opener = screen.getByRole('button', { name: 'opener' })
    await user.click(opener)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(opener).toHaveFocus()
  })

  it('closes from the close button and from the backdrop', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    renderWithState(<ProjectModal project={reveste} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: 'Fechar' }))
    await user.click(screen.getByTestId('modal-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('Tab cycles inside the dialog', async () => {
    const user = userEvent.setup()
    renderWithState(<ProjectModal project={reveste} onClose={() => {}} />)
    const close = screen.getByRole('button', { name: 'Fechar' })
    const links = screen.getAllByRole('link')
    const last = links[links.length - 1]
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(last).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab()
    expect(links[0]).toHaveFocus()
  })

  it('pulls focus back into the dialog when it escaped (e.g. after clicking plain text)', async () => {
    const user = userEvent.setup()
    renderWithState(
      <>
        <button>outside</button>
        <ProjectModal project={reveste} onClose={() => {}} />
      </>,
    )
    screen.getByRole('button', { name: 'outside' }).focus()
    await user.tab()
    expect(screen.getByRole('dialog').contains(document.activeElement)).toBe(true)
  })

  it('hides a section whose list is empty', () => {
    const empty = { ...reveste, funcionalidades: [], galeria: [] }
    renderWithState(<ProjectModal project={empty} onClose={() => {}} />)
    expect(screen.queryByRole('heading', { name: 'Funcionalidades' })).toBeNull()
    expect(screen.queryByRole('heading', { name: 'Capturas de tela' })).toBeNull()
  })

  it('hides the whole gallery when every print fails to load', () => {
    const rich = {
      ...reveste,
      galeria: [
        { src: 'projetos/reveste/shot-1.webp', alt: { pt: 'A', en: 'A' } },
        { src: 'projetos/reveste/shot-2.webp', alt: { pt: 'B', en: 'B' } },
      ],
    }
    renderWithState(<ProjectModal project={rich} onClose={() => {}} />)
    expect(screen.getByRole('heading', { name: 'Capturas de tela' })).toBeInTheDocument()
    for (const img of screen.getAllByRole('img', { name: /^(A|B)$/ })) fireEvent.error(img)
    expect(screen.queryByRole('heading', { name: 'Capturas de tela' })).toBeNull()
  })

  it('localizes the "Site" link label and keeps list semantics on styled lists', () => {
    localStorage.setItem('lang', 'en')
    renderWithState(<ProjectModal project={reveste} onClose={() => {}} />)
    expect(screen.getByRole('link', { name: /^Website/ })).toBeInTheDocument()
    for (const ul of screen.getByRole('dialog').querySelectorAll('ul.tags, ul.links, ul.gallery')) {
      expect(ul).toHaveAttribute('role', 'list')
    }
  })

  it('shows the English texts when the language is EN', async () => {
    localStorage.setItem('lang', 'en')
    renderWithState(<ProjectModal project={reveste} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveTextContent('Live')
  })
})
