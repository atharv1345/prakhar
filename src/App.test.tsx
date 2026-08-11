import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { afterEach, describe, expect, it } from 'vitest'
import App from './App'

afterEach(() => {
  localStorage.clear()
})

describe('birthday surprise app', () => {
  it('shows the welcome screen and the first action', () => {
    render(<App />)

    expect(screen.getByText('AVNITA')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /a birthday adventure just for you/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /start the magic/i })).toBeInTheDocument()
  })

  it(
    'moves through the quiz journey into the poem',
    async () => {
      render(<App />)

      fireEvent.click(screen.getByRole('button', { name: /start the magic/i }))

      expect(
        await screen.findByRole('heading', { name: /What do you think describes our friendship best?/i }, { timeout: 5000 }),
      ).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /quiet understanding without saying much 💞/i }))
      expect(
        await screen.findByRole('heading', { name: /which one sounds more like us/i }, { timeout: 4000 }),
      ).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /two people who somehow understand each other 🤍/i }))
      expect(
        await screen.findByRole('heading', { name: /what makes AVNITA shine most/i }, { timeout: 4000 }),
      ).toBeInTheDocument()

      fireEvent.click(screen.getByRole('button', { name: /a soft heart and a brave smile/i }))
      expect(
        await screen.findByRole('heading', { name: /Some lines From My Heart/i }, { timeout: 4000 }),
      ).toBeInTheDocument()
    },
    20000,
  )
})
