import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useState } from 'react'
import { act, renderHook, screen } from '@testing-library/react'
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

  it('omits the links section when the project has none', () => {
    const pkz = projects.find((p) => p.id === 'pkz')!
    renderWithState(<ProjectModal project={pkz} onClose={() => {}} />)
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
    const link = screen.getByRole('link', { name: /Site/ })
    expect(close).toHaveFocus()
    await user.tab()
    expect(link).toHaveFocus()
    await user.tab()
    expect(close).toHaveFocus()
    await user.tab({ shift: true })
    expect(link).toHaveFocus()
  })

  it('shows the English texts when the language is EN', async () => {
    localStorage.setItem('lang', 'en')
    renderWithState(<ProjectModal project={reveste} onClose={() => {}} />)
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toHaveTextContent('Live')
  })
})
