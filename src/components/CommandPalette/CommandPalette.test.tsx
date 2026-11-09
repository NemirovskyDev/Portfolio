import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { projects, renderWithState } from '../../test/utils'
import { CommandPalette } from './CommandPalette'
import { useCommandShortcut } from './useCommandShortcut'

// The skills module is built by another front; a fixed list keeps these tests about the palette only.
vi.mock('../../lib/skills', () => ({
  SKILL_GROUPS: [
    {
      id: 'front',
      grupo: { pt: 'Front-end e 3D', en: 'Front-end and 3D' },
      itens: [{ pt: 'GSAP', en: 'GSAP', id: 'front-gsap', projetos: ['zenkai'] }],
    },
  ],
}))

function setup(over: Partial<Parameters<typeof CommandPalette>[0]> = {}) {
  const cb = { onClose: vi.fn(), onPickSection: vi.fn(), onPickProject: vi.fn(), onPickSkill: vi.fn() }
  const ui = <CommandPalette open projects={projects} {...cb} {...over} />
  return { cb, ...renderWithState(ui) }
}

const box = () => screen.getByRole('combobox')

describe('CommandPalette', () => {
  it('renders nothing when closed and a dialog when open', () => {
    const closed = setup({ open: false })
    expect(screen.queryByRole('dialog')).toBeNull()
    closed.unmount()
    setup()
    expect(screen.getByRole('dialog', { name: 'Buscar no portfólio' })).toBeInTheDocument()
  })

  it('focuses the input and lists the three groups', () => {
    setup()
    expect(box()).toHaveFocus()
    expect(screen.getByRole('option', { name: /Orquestrador multiagente/ })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Seções' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Competências' })).toBeInTheDocument()
  })

  it('searches without accents or case', async () => {
    setup()
    await userEvent.type(box(), 'ORQUESTRA')
    expect(screen.getByRole('option', { name: /Orquestrador/ })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: /Tabbit/ })).toBeNull()
  })

  it('finds a skill by name', async () => {
    setup()
    await userEvent.type(box(), 'gsap')
    expect(screen.getByRole('option', { name: /GSAP/ })).toBeInTheDocument()
  })

  it('moves the active option with the arrow keys, Home and End', async () => {
    setup()
    const first = box().getAttribute('aria-activedescendant')
    expect(screen.getByRole('option', { selected: true })).toHaveAttribute('id', first)
    await userEvent.keyboard('{ArrowDown}')
    const second = box().getAttribute('aria-activedescendant')
    expect(second).not.toBe(first)
    await userEvent.keyboard('{End}')
    expect(screen.getByRole('option', { selected: true })).toHaveTextContent('GSAP')
    await userEvent.keyboard('{Home}')
    expect(box()).toHaveAttribute('aria-activedescendant', first)
  })

  it('Enter picks a section, a project and a skill', async () => {
    const { cb } = setup()
    await userEvent.keyboard('{Enter}') // first option: Início
    expect(cb.onPickSection).toHaveBeenCalledWith('inicio')
    expect(cb.onClose).toHaveBeenCalledTimes(1)

    await userEvent.type(box(), 'orquestra{Enter}')
    expect(cb.onPickProject).toHaveBeenCalledWith('orquestrador')

    await userEvent.clear(box())
    await userEvent.type(box(), 'gsap{End}{Enter}') // projects built with GSAP come first; the skill is the last hit
    expect(cb.onPickSkill).toHaveBeenCalledWith('front-gsap')
  })

  it('also matches a project by its stack', async () => {
    setup()
    await userEvent.type(box(), projects[0].stack[0])
    expect(screen.getByRole('option', { name: new RegExp(projects[0].titulo.pt) })).toBeInTheDocument()
  })

  it('announces "Nenhum resultado" and drops the active descendant', async () => {
    setup()
    await userEvent.type(box(), 'zzzzqx')
    expect(screen.getByRole('status')).toHaveTextContent('Nenhum resultado')
    expect(box()).not.toHaveAttribute('aria-activedescendant')
    expect(box()).toHaveAttribute('aria-expanded', 'false')
  })

  it('returns to the first option when the query changes', async () => {
    setup()
    await userEvent.keyboard('{ArrowDown}{ArrowDown}')
    await userEvent.type(box(), 'o')
    expect(screen.getAllByRole('option')[0]).toHaveAttribute('aria-selected', 'true')
  })

  it('Esc closes and focus goes back to the opener', async () => {
    function Host() {
      const [open, setOpen] = useState(false)
      return (
        <>
          <button onClick={() => setOpen(true)}>abrir</button>
          <CommandPalette open={open} projects={projects} onClose={() => setOpen(false)} onPickSection={() => {}} onPickProject={() => {}} onPickSkill={() => {}} />
        </>
      )
    }
    renderWithState(<Host />)
    const opener = screen.getByRole('button', { name: 'abrir' })
    await userEvent.click(opener)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(screen.queryByRole('dialog')).toBeNull()
    expect(opener).toHaveFocus()
  })

  it('keeps Tab inside the dialog', async () => {
    setup()
    await userEvent.tab() // input -> close button
    expect(screen.getByRole('button', { name: 'Fechar busca' })).toHaveFocus()
    await userEvent.tab() // wraps
    expect(box()).toHaveFocus()
  })
})

describe('useCommandShortcut', () => {
  function Probe({ onOpen }: { onOpen: () => void }) {
    useCommandShortcut(onOpen)
    return null
  }

  it('fires on Ctrl+K and on Cmd+K, and prevents the browser default', () => {
    const onOpen = vi.fn()
    render(<Probe onOpen={onOpen} />)
    expect(fireEvent.keyDown(document, { key: 'k', ctrlKey: true })).toBe(false)
    fireEvent.keyDown(document, { key: 'K', metaKey: true })
    expect(onOpen).toHaveBeenCalledTimes(2)
  })

  it('ignores a plain K, and stops listening after unmount', () => {
    const onOpen = vi.fn()
    const { unmount } = render(<Probe onOpen={onOpen} />)
    fireEvent.keyDown(document, { key: 'k' })
    unmount()
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(onOpen).not.toHaveBeenCalled()
  })
})
