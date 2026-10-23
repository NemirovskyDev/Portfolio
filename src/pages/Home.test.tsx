import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { About } from '../components/About/About'
import { ProfileGate } from '../components/ProfileGate/ProfileGate'
import { mockReducedMotion, renderWithState } from '../test/utils'

beforeEach(() => {
  localStorage.clear()
  window.history.replaceState(null, '', '/')
  mockReducedMotion(true)
})

describe('profile gate', () => {
  it('lists the three profiles and persists the choice', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: 'Quem está assistindo?' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Recrutador|Dev|Curioso/ })).toHaveLength(3)
    await user.click(screen.getByRole('button', { name: /^Curioso/ }))
    expect(localStorage.getItem('profile')).toBe('curioso')
  })

  it('calls onChoose with the profile', () => {
    const calls: string[] = []
    renderWithState(<ProfileGate onChoose={(p) => calls.push(p)} />)
    fireEvent.click(screen.getByRole('button', { name: /^Dev/ }))
    expect(calls).toEqual(['dev'])
  })
})

describe('home', () => {
  it('choosing "Dev" shows Reveste in the hero and the Sites row first', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Dev/ }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Reveste')
    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('Sites')
  })

  it('"Recrutador" features the orquestrador and starts with IA e Agentes', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /^Recrutador/ }))
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Orquestrador multiagente')
    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('IA e Agentes')
  })

  it('the language toggle switches visible text to EN', async () => {
    localStorage.setItem('profile', 'curioso')
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByRole('button', { name: 'Ver detalhes' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Mudar idioma para inglês' }))
    expect(screen.getByRole('button', { name: 'See details' })).toBeInTheDocument()
    expect(document.documentElement.lang).toBe('en')
  })

  it('the hero button opens the featured project modal', async () => {
    localStorage.setItem('profile', 'recrutador')
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Ver detalhes' }))
    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByRole('heading', { name: 'Orquestrador multiagente' })).toBeInTheDocument()
    expect(window.location.hash).toBe('#/p/orquestrador')
  })

  it('a deep link opens the project, and an unknown one shows only the home', () => {
    localStorage.setItem('profile', 'dev')
    window.location.hash = '#/p/tabbit'
    const { unmount } = render(<App />)
    expect(screen.getByRole('dialog')).toHaveTextContent('Tabbit')
    unmount()
    window.location.hash = '#/p/nao-existe'
    render(<App />)
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('"Trocar perfil" goes back to the gate', async () => {
    localStorage.setItem('profile', 'dev')
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: 'Trocar perfil' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Quem está assistindo?' })).toBeInTheDocument()
  })
})

describe('about', () => {
  it('shows the GitHub and LinkedIn links (clean urls) and no contact form', () => {
    renderWithState(<About />)
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/NemirovskyDev')
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute(
      'href',
      'https://www.linkedin.com/in/bernardo-nemirovsky-b21a4a3b2/',
    )
    expect(document.querySelector('form, input, textarea, a[href^="mailto:"]')).toBeNull()
  })
})
