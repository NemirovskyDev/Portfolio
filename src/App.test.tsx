import { render, screen } from '@testing-library/react'
import { it, expect } from 'vitest'
import App from './App'

it('renders the profile gate heading', () => {
  render(<App />)
  expect(screen.getByRole('heading', { name: /quem está assistindo/i })).toBeInTheDocument()
})
