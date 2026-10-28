import { describe, it, expect, beforeEach } from 'vitest'
import { fireEvent, screen } from '@testing-library/react'
import { Hero } from './Hero'
import { mockReducedMotion, projects, renderWithState } from '../../test/utils'

beforeEach(() => mockReducedMotion(false))

const project = projects[0]
const show = () => renderWithState(<Hero project={project} onOpen={() => {}} />)

describe('Hero', () => {
  it.each([false, true])('renders title and button (reduced motion: %s)', (reduce) => {
    mockReducedMotion(reduce)
    show()
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(project.titulo.pt)
    expect(screen.getByRole('button', { name: 'Ver detalhes' })).toBeInTheDocument()
  })

  it('applies the depth transforms to background and copy when motion is allowed', () => {
    show()
    expect(document.querySelector('.hero-bg-layer')?.getAttribute('style')).toMatch(/transform/)
    expect(document.querySelector('.hero-copy')?.getAttribute('style')).toMatch(/opacity/)
  })

  it('has no inline transform or opacity when motion is reduced', () => {
    mockReducedMotion(true)
    show()
    expect(document.querySelector('.hero-bg-layer')?.getAttribute('style') ?? '').not.toMatch(/transform|opacity/)
    expect(document.querySelector('.hero-copy')?.getAttribute('style') ?? '').not.toMatch(/transform|opacity/)
  })

  it('keeps the fallback gradient when the image fails to load', () => {
    show()
    fireEvent.error(document.querySelector('img.hero-bg')!)
    expect(document.querySelector('img.hero-bg')).toBeNull()
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
  })
})
