import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockedI18n } from '../test-utils/mockedi18n'
import Dashboard from '../../src/pages/dashboard.vue'
import { DefaultRoles } from '../test-utils'
import { useBcrosAccount } from '../../src/stores/account'
import { useBcrosDashboardUi } from '../../src/stores/ui'

const tempIdentifier = 'T1234567AB'

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))

vi.mock('~/composables/useBcrosLegalApi', () => ({
  useBcrosLegalApi: () => ({
    getConfig: () => ({ apiURL: 'https://legal-api.example.com/api/v2' }),
    fetch: mockFetch
  })
}))

mockNuxtImport('useRoute', () => () => ({
  name: 'dashboard',
  params: { identifier: tempIdentifier },
  query: {},
  fullPath: `/${tempIdentifier}`
}))

/** Builds a bootstrap filings response with only the fields the dashboard reads. */
const buildBootstrapResponse = (status: string, identifier: string) => ({
  filing: {
    business: { identifier, legalType: 'BC' },
    header: { name: 'incorporationApplication', status, filingId: 1, date: '2025-11-26T00:00:00+00:00' },
    incorporationApplication: { nameRequest: { legalType: 'BC' } }
  }
})

describe('dashboard page - completed bootstrap redirect', () => {
  const originalLocation = window.location
  let assign: ReturnType<typeof vi.fn>

  beforeEach(() => {
    setActivePinia(createPinia())
    useBcrosAccount().setAuthorizedActions(DefaultRoles)
    mockFetch.mockReset()
    assign = vi.fn()
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { href: `https://dashboard.test/${tempIdentifier}?filing_id=212031`, assign }
    })
  })

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: originalLocation })
  })

  it('redirects to the business with the spinner up when the bootstrap filing is completed', async () => {
    mockFetch.mockResolvedValue({ data: ref(buildBootstrapResponse('COMPLETED', 'BC1234567')), error: ref(null) })

    mount(Dashboard, { global: { plugins: [mockedI18n] } })
    await flushPromises()

    expect(assign).toHaveBeenCalledWith('https://dashboard.test/BC1234567?filing_id=212031')
    expect(useBcrosDashboardUi().dashboardIsLoading).toBe(true)
  })

  it('stays on the bootstrap dashboard while the filing is still paid', async () => {
    mockFetch.mockResolvedValue({ data: ref(buildBootstrapResponse('PAID', tempIdentifier)), error: ref(null) })

    mount(Dashboard, { global: { plugins: [mockedI18n] } })
    await flushPromises()

    expect(assign).not.toHaveBeenCalled()
    expect(useBcrosDashboardUi().dashboardIsLoading).toBe(false)
  })
})
