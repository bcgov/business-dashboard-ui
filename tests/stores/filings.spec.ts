import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import type { ApiResponseFilingI } from '../../src/interfaces/filing-i'
import { useBcrosFilings } from '../../src/stores/filings'

const { mockFetch } = vi.hoisted(() => ({ mockFetch: vi.fn() }))

vi.mock('~/composables/useBcrosLegalApi', () => ({
  useBcrosLegalApi: () => ({
    getConfig: () => ({ apiURL: 'https://legal-api.example.com/api/v2' }),
    fetch: mockFetch
  })
}))

/** Builds a minimal filing exposing only the fields the store reads. */
const buildFiling = (filingId: number, overrides: Partial<ApiResponseFilingI> = {}): ApiResponseFilingI =>
  ({
    filingId,
    businessIdentifier: 'BC1234567',
    displayLedger: true,
    name: 'changeOfDirectors',
    status: 'COMPLETED',
    ...overrides
  } as unknown as ApiResponseFilingI)

/** Mocks the legal-api fetch to resolve with the given filings. */
const mockFilingsResponse = (filings: Array<ApiResponseFilingI>) => {
  mockFetch.mockResolvedValue({ data: ref({ filings }), error: ref(null) })
}

describe('filings store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    mockFetch.mockReset()
  })

  it('populates filings on initial load', async () => {
    mockFilingsResponse([buildFiling(1), buildFiling(2)])
    const store = useBcrosFilings()

    await store.loadFilings('BC1234567')

    expect(store.filings.map(f => f.filingId)).toEqual([1, 2])
    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('skips the fetch when filings are cached and force is not set', async () => {
    mockFilingsResponse([buildFiling(1)])
    const store = useBcrosFilings()

    await store.loadFilings('BC1234567')
    await store.loadFilings('BC1234567')

    expect(mockFetch).toHaveBeenCalledTimes(1)
  })

  it('does not duplicate filings on a forced reload', async () => {
    mockFilingsResponse([buildFiling(1), buildFiling(2)])
    const store = useBcrosFilings()

    await store.loadFilings('BC1234567')
    await store.loadFilings('BC1234567', true)

    expect(store.filings.map(f => f.filingId)).toEqual([1, 2])
  })

  it('preserves task-derived filings absent from the API response on a forced reload', async () => {
    mockFilingsResponse([buildFiling(1), buildFiling(2)])
    const store = useBcrosFilings()

    await store.loadFilings('BC1234567')
    // a pending payment-completed maintenance filing inserted by the todo store
    store.insertFiling(buildFiling(99, { status: 'PENDING' }))
    await store.loadFilings('BC1234567', true)

    expect(store.filings.map(f => f.filingId)).toEqual([99, 1, 2])
  })

  it('replaces a task-derived filing that now appears in the API response', async () => {
    mockFilingsResponse([buildFiling(1)])
    const store = useBcrosFilings()

    await store.loadFilings('BC1234567')
    store.insertFiling(buildFiling(99, { status: 'PENDING' }))
    // the pending filing has since completed and is now in the ledger response
    mockFilingsResponse([buildFiling(1), buildFiling(99, { status: 'COMPLETED' })])
    await store.loadFilings('BC1234567', true)

    expect(store.filings.map(f => f.filingId)).toEqual([1, 99])
    expect(store.filings.find(f => f.filingId === 99).status).toBe('COMPLETED')
  })

  it('inserts the same filing only once, updating it in place', () => {
    const store = useBcrosFilings()

    store.insertFiling(buildFiling(99, { status: 'PENDING' }))
    store.insertFiling(buildFiling(99, { status: 'PAID' }))

    expect(store.filings).toHaveLength(1)
    expect(store.filings[0].status).toBe('PAID')
  })

  it('sets loading while the fetch is in flight', async () => {
    let resolveFetch: (value: unknown) => void
    mockFetch.mockReturnValue(new Promise((resolve) => { resolveFetch = resolve }))
    const store = useBcrosFilings()

    const load = store.loadFilings('BC1234567')
    expect(store.loading).toBe(true)

    resolveFetch({ data: ref({ filings: [buildFiling(1)] }), error: ref(null) })
    await load

    expect(store.loading).toBe(false)
    expect(store.filings).toHaveLength(1)
  })
})
