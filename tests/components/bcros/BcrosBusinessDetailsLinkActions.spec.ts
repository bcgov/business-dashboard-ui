import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mount } from '@vue/test-utils'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { FilingTypes } from '@bcrs-shared-components/enums'

import { BcrosBusinessDetailsLinkActions } from '#components'
import { mockedI18n } from '~~/tests/test-utils/mockedi18n'
import { DefaultRoles, testAccount } from '~~/tests/test-utils'
import { useBcrosBusiness } from '~/stores/business'
import { useBcrosLaunchdarkly } from '~/stores/launchdarkly'
import { LDFlags } from '~/enums/ld-flags'

const {
  mockGoToFilingsUI,
  mockGoToBusinessCorpsUI,
  mockGoToDigitalCredentialsPage,
  mockGoToViewAccess,
  authorizedActions
} = vi.hoisted(() => ({
  mockGoToFilingsUI: vi.fn(),
  mockGoToBusinessCorpsUI: vi.fn(),
  mockGoToDigitalCredentialsPage: vi.fn(),
  mockGoToViewAccess: vi.fn(),
  authorizedActions: [] as string[]
}))

// overrides the useBcrosAccount mock from tests/setup.ts, which resets authorized actions on every call
mockNuxtImport('useBcrosAccount', () => {
  return () => ({
    currentAccount: ref({ ...testAccount }),
    getAuthorizedActions: () => authorizedActions,
    setAuthorizedActions: (actions: string[]) => { authorizedActions.splice(0, authorizedActions.length, ...actions) }
  })
})

// overrides the partial useBcrosNavigate mock from tests/setup.ts
mockNuxtImport('useBcrosNavigate', () => {
  return () => ({
    goToBcrosDashboard: vi.fn(),
    goToFilingsUI: mockGoToFilingsUI,
    goToBusinessCorpsUI: mockGoToBusinessCorpsUI,
    goToDigitalCredentialsPage: mockGoToDigitalCredentialsPage,
    goToViewAccess: mockGoToViewAccess
  })
})

describe('BcrosBusinessDetailsLinkActions - Request AGM Location Change', () => {
  let wrapper
  let getStoredFlagSpy
  let isAllowedToFileSpy

  /** Mocks the enable-new-feature flag list; every other flag resolves to an empty list. */
  const setNewFeatures = (features: string[]) => {
    getStoredFlagSpy.mockImplementation((flag: string) => flag === LDFlags.EnableNewFeature ? features : [])
  }

  const mountAndGetAction = () => {
    useBcrosBusiness().currentBusiness = { identifier: 'BC1234567', legalType: 'BC' } as any
    wrapper = mount(BcrosBusinessDetailsLinkActions, { global: { plugins: [mockedI18n] } })
    return (wrapper.vm as any).allActions1.find((action: any) => action.name === 'requestAgmLocationChange')
  }

  beforeEach(() => {
    setActivePinia(createPinia())
    useBcrosAccount().setAuthorizedActions(DefaultRoles)

    const launchdarkly = useBcrosLaunchdarkly()
    vi.spyOn(launchdarkly, 'getFeatureFlag').mockReturnValue(undefined)
    getStoredFlagSpy = vi.spyOn(launchdarkly, 'getStoredFlag')
    setNewFeatures([])

    isAllowedToFileSpy = vi.spyOn(useBcrosBusiness(), 'isAllowedToFile').mockReturnValue(true)
  })

  afterEach(() => {
    wrapper?.unmount()
    vi.restoreAllMocks()
  })

  it('redirects to the Filings UI when the migration flag is off', () => {
    const action = mountAndGetAction()

    action.click()

    expect(mockGoToFilingsUI).toHaveBeenCalledWith('/BC1234567/agm-location-chg', { filingId: '0' })
    expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
  })

  it('redirects to the Corps UI when the migration flag is on', () => {
    setNewFeatures(['migrated-agm-location-change'])
    const action = mountAndGetAction()

    action.click()

    expect(mockGoToBusinessCorpsUI).toHaveBeenCalledWith('/agm-location-change/BC1234567')
    expect(mockGoToFilingsUI).not.toHaveBeenCalled()
  })

  it('shows the requirements tooltip when the AGM location change is not allowed', () => {
    isAllowedToFileSpy.mockImplementation((filingType: FilingTypes) => filingType !== FilingTypes.AGM_LOCATION_CHANGE)
    const action = mountAndGetAction()

    expect(action.tooltip).toBe('The business must be in good standing to request an AGM location change.')
    expect(action.disabled).toBe(true)
  })

  it('shows the regular tooltip when the AGM location change is allowed', () => {
    const action = mountAndGetAction()

    expect(action.tooltip).toBe('Request an AGM location change.')
    expect(action.disabled).toBe(false)
  })
})
