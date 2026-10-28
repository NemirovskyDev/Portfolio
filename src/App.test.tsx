import { render, screen } from '@testing-library/react'
import { it, expect } from 'vitest'
import App from './App'

it('renders the page with the opening title', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1, name: /bernardo nemirovsky/i })).toBeInTheDocument()
})
