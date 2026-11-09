import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { RollText } from './RollText'

describe('RollText', () => {
  it('keeps a single accessible name and hides the copy', () => {
    render(
      <button type="button" className="roll-host">
        <RollText>Enviar e-mail</RollText>
      </button>,
    )
    expect(screen.getByRole('button', { name: 'Enviar e-mail' })).toBeInTheDocument()
    const copy = document.querySelector('.roll-b')
    expect(copy).toHaveAttribute('aria-hidden', 'true')
    expect(copy).toHaveTextContent('Enviar e-mail')
  })
})
