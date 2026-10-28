import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AppStateProvider } from '../../state/AppState'
import { IndexPanel } from './IndexPanel'
import { projects, renderWithState } from '../../test/utils'

const noop = () => {}

describe('IndexPanel', () => {
  it('renders nothing when closed', () => {
    const { container } = renderWithState(<IndexPanel open={false} projects={projects} onClose={noop} onOpenProject={noop} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders a named modal dialog with one card per project', () => {
    renderWithState(<IndexPanel open projects={projects} onClose={noop} onOpenProject={noop} />)
    const dialog = screen.getByRole('dialog', { name: 'Todos os projetos' })
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    // cards + the close button
    expect(screen.getAllByRole('button')).toHaveLength(projects.length + 1)
  })

  it('moves focus inside on open and locks body scroll, restoring both on close', () => {
    function Harness({ open }: { open: boolean }) {
      return (
        <AppStateProvider>
          <button type="button">opener</button>
          <IndexPanel open={open} projects={projects} onClose={noop} onOpenProject={noop} />
        </AppStateProvider>
      )
    }
    const { rerender } = render(<Harness open={false} />)
    screen.getByText('opener').focus()
    rerender(<Harness open />)
    expect(screen.getByRole('dialog')).toContainElement(document.activeElement as HTMLElement)
    expect(document.body.style.overflow).toBe('hidden')
    rerender(<Harness open={false} />)
    expect(screen.getByText('opener')).toHaveFocus()
    expect(document.body.style.overflow).not.toBe('hidden')
  })

  it('closes with Esc, the close button and a backdrop click', () => {
    const onClose = vi.fn()
    renderWithState(<IndexPanel open projects={projects} onClose={onClose} onOpenProject={noop} />)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'Fechar índice' }))
    expect(onClose).toHaveBeenCalledTimes(2)
    fireEvent.click(screen.getByTestId('index-backdrop'))
    expect(onClose).toHaveBeenCalledTimes(3)
  })

  it('does not close when clicking inside the dialog', () => {
    const onClose = vi.fn()
    renderWithState(<IndexPanel open projects={projects} onClose={onClose} onOpenProject={noop} />)
    fireEvent.click(screen.getByRole('dialog'))
    expect(onClose).not.toHaveBeenCalled()
  })

  it('traps Tab and Shift+Tab inside the dialog', async () => {
    const user = userEvent.setup()
    renderWithState(<IndexPanel open projects={projects} onClose={noop} onOpenProject={noop} />)
    const buttons = screen.getAllByRole('button')
    buttons[buttons.length - 1].focus()
    await user.tab()
    expect(buttons[0]).toHaveFocus()
    await user.tab({ shift: true })
    expect(buttons[buttons.length - 1]).toHaveFocus()
  })

  it('opens a project and then closes', () => {
    const calls: string[] = []
    renderWithState(
      <IndexPanel open projects={projects} onClose={() => calls.push('close')} onOpenProject={(id) => calls.push(`open:${id}`)} />,
    )
    fireEvent.click(screen.getAllByRole('button')[1])
    expect(calls).toEqual([`open:${projects[0].id}`, 'close'])
  })
})
