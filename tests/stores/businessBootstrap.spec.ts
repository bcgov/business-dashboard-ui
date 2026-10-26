import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { useBcrosBusinessBootstrap } from '../../src/stores/businessBootstrap'

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))

vi.mock('~/composables/useBcrosLegalApi', () => ({
  useBcrosLegalApi: () => ({
    getConfig: () => ({ apiURL: 'https://legal-api.example.com/api/v2' }),
    fetch: mockFetch
  })
}))

const tempIdentifier = 'T1234567AB'

/** Builds a bootstrap filings response with only the fields the store reads. */
const buildBootstrapResponse = (status: string, identifier: string) => ({
  filing: {
    business: { identifier, legalType: 'BC' },
    header: { name: 'incorporationApplication', status, filingId: 1 },
    incorporationApplication: { nameRequest: { legalType: 'BC' } }
  }
})

describe('business bootstrap store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('exposes the business identifier once the bootstrap filing is completed', async () => {
    mockFetch.mockResolvedValue({ data: ref(buildBootstrapResponse('COMPLETED', 'BC1234567')), error: ref(null) })
    const store = useBcrosBusinessBootstrap()

    await store.loadBusinessBootstrap(tempIdentifier)

    expect(store.bootstrapCompletedBusinessIdentifier).toBe('BC1234567')
  })

  it('has no business identifier while the bootstrap filing is still paid', async () => {
    mockFetch.mockResolvedValue({ data: ref(buildBootstrapResponse('PAID', tempIdentifier)), error: ref(null) })
    const store = useBcrosBusinessBootstrap()

    await store.loadBusinessBootstrap(tempIdentifier)

    expect(store.bootstrapCompletedBusinessIdentifier).toBeUndefined()
  })

  it('has no business identifier when a completed filing still carries the temporary number', async () => {
    mockFetch.mockResolvedValue({ data: ref(buildBootstrapResponse('COMPLETED', tempIdentifier)), error: ref(null) })
    const store = useBcrosBusinessBootstrap()

    await store.loadBusinessBootstrap(tempIdentifier)

    expect(store.bootstrapCompletedBusinessIdentifier).toBeUndefined()
  })
})
