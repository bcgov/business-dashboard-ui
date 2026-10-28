import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { reloadWithIdentifier } from '../../src/utils/navigate'

describe('navigate utils', () => {
  const originalLocation = window.location
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: 'https://dashboard.test/T1234567AB?filing_id=212031', assign }
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('reloads under the given identifier and keeps the URL parameters', () => {
    reloadWithIdentifier('BC1234567')

    expect(assign).toHaveBeenCalledWith('https://dashboard.test/BC1234567?filing_id=212031')
  })
})
