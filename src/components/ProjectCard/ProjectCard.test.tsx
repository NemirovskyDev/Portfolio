import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { ProjectCard } from './ProjectCard'
import { Row } from '../Row/Row'
import { StaticGrid } from '../StaticGrid'
import { mockReducedMotion, projects, renderWithState } from '../../test/utils'

const reveste = projects.find((p) => p.id === 'reveste')!

beforeEach(() => {
  localStorage.clear()
  mockReducedMotion(false)
})

const rect = { left: 0, top: 0, width: 200, height: 300, right: 200, bottom: 300, x: 0, y: 0, toJSON: () => ({}) }

describe('ProjectCard', () => {
  it('is a button named after the title and calls onOpen with the id', () => {
    const onOpen = vi.fn()
    renderWithState(<ProjectCard project={reveste} onOpen={onOpen} />)
    fireEvent.click(screen.getByRole('button', { name: 'Reveste' }))
    expect(onOpen).toHaveBeenCalledWith('reveste')
  })

  it('shows a placeholder with the title when the image fails', () => {
    const { container } = renderWithState(<ProjectCard project={reveste} onOpen={() => {}} />)
    fireEvent.error(container.querySelector('img')!)
    expect(screen.getByTestId('card-placeholder')).toHaveTextContent('Reveste')
    expect(container.querySelector('img')).toBeNull()
  })

  it('clamps very long titles', () => {
    const long = { ...reveste, titulo: { pt: 'Um título extremamente longo '.repeat(8), en: 'x' } }
    renderWithState(<ProjectCard project={long} onOpen={() => {}} />)
    expect(screen.getByRole('button').querySelector('.clamp-2')).not.toBeNull()
  })

  it('tilts with the pointer', () => {
    renderWithState(<ProjectCard project={reveste} onOpen={() => {}} />)
    const btn = screen.getByRole('button')
    btn.getBoundingClientRect = () => rect as DOMRect
    fireEvent.pointerMove(btn, { clientX: 200, clientY: 150 })
    expect(btn.style.getPropertyValue('--ry')).not.toBe('')
    fireEvent.pointerLeave(btn)
    expect(btn.style.getPropertyValue('--ry')).toBe('0deg')
  })

  it('does not tilt with reduced motion', () => {
    mockReducedMotion(true)
    renderWithState(<ProjectCard project={reveste} onOpen={() => {}} />)
    const btn = screen.getByRole('button')
    btn.getBoundingClientRect = () => rect as DOMRect
    fireEvent.pointerMove(btn, { clientX: 200, clientY: 150 })
    expect(btn.style.getPropertyValue('--ry')).toBe('')
  })

  it('does not break when the pointer moves over a zero-size box', () => {
    renderWithState(<ProjectCard project={reveste} onOpen={() => {}} />)
    const btn = screen.getByRole('button')
    expect(() => fireEvent.pointerMove(btn, { clientX: 10, clientY: 10 })).not.toThrow()
  })
})

describe('Row and StaticGrid', () => {
  it('Row labels the list with the translated category', () => {
    renderWithState(<Row categoria="IA e Agentes" projects={projects.slice(0, 2)} onOpen={() => {}} />)
    expect(screen.getByRole('heading', { name: 'IA e Agentes' })).toBeInTheDocument()
    expect(screen.getAllByRole('button')).toHaveLength(2)
  })

  it('StaticGrid renders every project', () => {
    renderWithState(<StaticGrid projects={projects} onOpen={() => {}} />)
    expect(screen.getAllByRole('button')).toHaveLength(8)
  })
})
