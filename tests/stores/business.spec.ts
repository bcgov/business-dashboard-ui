import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useBcrosBusiness } from '../../src/stores/business'
import { BOOTSTRAP_AFFILIATION_RETRY } from '../../src/stores/businessBootstrap'

const { mockFetch, routeQuery } = vi.hoisted(() => ({
  mockFetch: vi.fn(),
  routeQuery: { value: {} as Record<string, string> }
}))

mockNuxtImport('useRoute', () => () => ({ name: 'dashboard', params: { identifier }, query: routeQuery.value }))

vi.mock('~/composables/useBcrosLegalApi', () => ({
  useBcrosLegalApi: () => ({
    getConfig: () => ({ apiURL: 'https://legal-api.example.com/api/v2' }),
    fetch: mockFetch
  })
}))

const identifier = 'BC1234567'

/** Resolves the business details fetch with a minimal business and the comments fetch with none. */
const mockBusinessResponses = () => {
  mockFetch.mockImplementation((url: string) => Promise.resolve(
    url.endsWith('/comments')
      ? { data: ref({ comments: [] }), error: ref(null) }
      : {
          data: ref({ business: { identifier, legalType: 'BEN', lastModified: '2025-01-01T00:00:00+00:00' } }),
          error: ref(null)
        }
  ))
}

/** The options passed to the business details fetch. */
const businessFetchOptions = () => mockFetch.mock.calls.find(([url]) => url === `/businesses/${identifier}`)?.[1]

describe('business store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
    mockBusinessResponses()
    routeQuery.value = {}
  })

  it('loads the business without retry options by default', async () => {
    const store = useBcrosBusiness()

    await store.loadBusiness(identifier)

    expect(store.currentBusinessIdentifier).toBe(identifier)
    expect(businessFetchOptions()).toEqual({ params: undefined, dedupe: 'defer' })
  })

  it('retries a 401 on the business details fetch when redirected from a completed bootstrap filing', async () => {
    routeQuery.value = { bootstrap: 'T1234567AB' }
    const store = useBcrosBusiness()

    await store.loadBusiness(identifier)

    expect(businessFetchOptions()).toEqual(expect.objectContaining(BOOTSTRAP_AFFILIATION_RETRY))
  })

  it('does not apply the fetch options to the slim business details fetch', async () => {
    const store = useBcrosBusiness()

    await store.getBusinessDetails(identifier, undefined, true)

    const slimCall = mockFetch.mock.calls.find(([url]) => url === `/businesses/${identifier}?slim=true`)
    expect(slimCall?.[1]).toEqual({ params: undefined, dedupe: 'defer' })
  })
})
