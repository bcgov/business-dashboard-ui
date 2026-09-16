import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'

import { BcrosFilingAddStaffFiling } from '#components'
import { mockedI18n } from '~~/tests/test-utils/mockedi18n'
import { useBcrosBusiness } from '~/stores/business'
import { useBcrosFilings } from '~/stores/filings'
import { useBcrosLaunchdarkly } from '~/stores/launchdarkly'
import { LDFlags } from '~/enums/ld-flags'

const {
  mockGoToFilingsUI,
  mockGoToBusinessCorpsUI,
  mockGoToEditUI,
  mockGoToCreateUI,
  mockGoToPersonRolesUI
} = vi.hoisted(() => ({
  mockGoToFilingsUI: vi.fn(),
  mockGoToBusinessCorpsUI: vi.fn(),
  mockGoToEditUI: vi.fn(),
  mockGoToCreateUI: vi.fn(),
  mockGoToPersonRolesUI: vi.fn()
}))

// overrides the partial useBcrosNavigate mock from tests/setup.ts
mockNuxtImport('useBcrosNavigate', () => {
  return () => ({
    goToBcrosDashboard: vi.fn(),
    goToFilingsUI: mockGoToFilingsUI,
    goToBusinessCorpsUI: mockGoToBusinessCorpsUI,
    goToEditUI: mockGoToEditUI,
    goToCreateUI: mockGoToCreateUI,
    goToPersonRolesUI: mockGoToPersonRolesUI
  })
})

describe('BcrosFilingAddStaffFiling - startCourtOrder', () => {
  let wrapper
  let getStoredFlagSpy
  let createFilingSpy

  const mountWithBusiness = (identifier: string, legalType: string) => {
    const business = useBcrosBusiness()
    business.currentBusiness = { identifier, legalType } as any
    return mount(BcrosFilingAddStaffFiling, { global: { plugins: [mockedI18n] } })
  }

  beforeEach(() => {
    setActivePinia(createPinia())

    const launchdarkly = useBcrosLaunchdarkly()
    vi.spyOn(launchdarkly, 'getFeatureFlag').mockReturnValue(undefined)
    getStoredFlagSpy = vi.spyOn(launchdarkly, 'getStoredFlag').mockReturnValue(undefined)

    const filings = useBcrosFilings()
    createFilingSpy = vi.spyOn(filings, 'createFiling').mockResolvedValue({
      error: ref(null),
      data: ref({ filing: { header: { filingId: 999001 } } })
    })
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
  })

  it('keeps the legacy Filings UI redirect when the feature flag is off', async () => {
    wrapper = mountWithBusiness('BC1234567', 'BC')

    await (wrapper.vm as any).startCourtOrder()

    expect(mockGoToFilingsUI).toHaveBeenCalledWith('/BC1234567/court-order', { filingId: '0' })
    expect(createFilingSpy).not.toHaveBeenCalled()
    expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
  })

  it('keeps the legacy Filings UI redirect for non-BC-corp legal types even with the flag on', async () => {
    getStoredFlagSpy.mockReturnValue(['migrated-court-order'])
    wrapper = mountWithBusiness('CP1234567', 'CP')

    await (wrapper.vm as any).startCourtOrder()

    expect(mockGoToFilingsUI).toHaveBeenCalledWith('/CP1234567/court-order', { filingId: '0' })
    expect(createFilingSpy).not.toHaveBeenCalled()
    expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
  })

  it('creates a draft and redirects to the corps UI for a BC corp with the flag on', async () => {
    getStoredFlagSpy.mockReturnValue(['migrated-court-order'])
    wrapper = mountWithBusiness('BC1234567', 'BC')

    await (wrapper.vm as any).startCourtOrder()

    expect(getStoredFlagSpy).toHaveBeenCalledWith(LDFlags.EnableNewFeature)
    expect(createFilingSpy).toHaveBeenCalledWith(
      expect.objectContaining({ identifier: 'BC1234567', legalType: 'BC' }),
      'courtOrder',
      {},
      true
    )
    expect(mockGoToBusinessCorpsUI).toHaveBeenCalledWith('/court-order/BC1234567/999001')
    expect(mockGoToFilingsUI).not.toHaveBeenCalled()
  })

  it('does not redirect anywhere when the draft creation fails', async () => {
    getStoredFlagSpy.mockReturnValue(['migrated-court-order'])
    createFilingSpy.mockResolvedValue({ error: ref({ message: 'oops' }), data: ref(null) })
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    wrapper = mountWithBusiness('BC1234567', 'BC')

    await (wrapper.vm as any).startCourtOrder()

    expect(createFilingSpy).toHaveBeenCalled()
    expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
    expect(mockGoToFilingsUI).not.toHaveBeenCalled()
    expect(consoleErrorSpy).toHaveBeenCalled()
  })
})
