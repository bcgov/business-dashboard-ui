import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount, VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { mockedI18n } from '../test-utils/mockedi18n'
import Dashboard from '../../src/pages/dashboard.vue'
import { DefaultRoles } from '../test-utils'
import { useBcrosAccount } from '../../src/stores/account'
import { BOOTSTRAP_AFFILIATION_RETRY } from '../../src/stores/businessBootstrap'

const identifier = 'BC1234567'

const { mockFetch, routeQuery } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  routeQuery: { value: {} as Record<string, string> }
}))

vi.mock('~/composables/useBcrosLegalApi', () => ({
  useBcrosLegalApi: () => ({
    getConfig: () => ({ apiURL: 'https://legal-api.example.com/api/v2' }),
    fetch: mockFetch
  })
}))

mockNuxtImport('useRoute', () => () => ({
  name: 'dashboard',
  params: { identifier },
  query: routeQuery.value,
  fullPath: `/${identifier}`
}))

/** Minimal legal-api responses keyed by path suffix; anything else resolves to an empty object. */
const responses: Array<[string, object]> = [
  ['/comments', { comments: [] }],
  ['/filings', { filings: [] }],
  ['/tasks', { tasks: [] }],
  ['/parties', { parties: [] }],
  ['/addresses', {}],
  [`/businesses/${identifier}`, {
    business: { identifier, legalType: 'BEN', lastModified: '2025-01-01T00:00:00+00:00' }
  }]
]

/** The options passed to the (non-slim) business details fetch. */
const businessFetchOptions = () => mockFetch.mock.calls.find(([url]) => url === `/businesses/${identifier}`)?.[1]

describe('dashboard page - business load after a bootstrap redirect', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    setActivePinia(createPinia())
    useBcrosAccount().setAuthorizedActions(DefaultRoles)
    mockFetch.mockReset()
    mockFetch.mockImplementation((url: string) => {
      const match = responses.find(([suffix]) => url.endsWith(suffix))
      return Promise.resolve({ data: ref(match ? match[1] : {}), error: ref(null) })
    })
  })

  afterEach(() => {
    wrapper?.unmount()
  })

  const mountDashboard = async () => {
    wrapper = mount(Dashboard, { global: { plugins: [mockedI18n] } })
    await flushPromises()
  }

  it('retries a 401 on the business fetch when redirected from a completed bootstrap filing', async () => {
    routeQuery.value = { bootstrap: 'T1234567AB' }

    await mountDashboard()

    expect(businessFetchOptions()).toEqual(expect.objectContaining(BOOTSTRAP_AFFILIATION_RETRY))
  })

  it('does not retry a 401 on a normal business load', async () => {
    routeQuery.value = {}

    await mountDashboard()

    expect(businessFetchOptions()).toBeDefined()
    expect(businessFetchOptions()).not.toHaveProperty('retry')
  })
})
