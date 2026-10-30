import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { FilingTypes } from '@bcrs-shared-components/enums'

import { doResumeFiling } from '~/utils/todo/action-functions'
import { useBcrosBusiness } from '~/stores/business'
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

describe('doResumeFiling', () => {
  let getStoredFlagSpy

  const setBusiness = (identifier: string, legalType: string) => {
    useBcrosBusiness().currentBusiness = { identifier, legalType } as any
  }

  /** Mocks the enable-new-feature flag list; every other flag resolves to an empty list. */
  const setNewFeatures = (features: string[]) => {
    getStoredFlagSpy.mockImplementation((flag: string) => flag === LDFlags.EnableNewFeature ? features : [])
  }

  /** Mocks the supported-filings-config flag; every other flag resolves to an empty object. */
  const setSupportedFilingsConfig = (features: object) => {
    getStoredFlagSpy.mockImplementation((flag: string) => flag === LDFlags.SupportedFilingsConfig ? features : {})
  }

  const todoItem = (name: FilingTypes, filingId = 123) => ({ name, filingId } as TodoItemI)

  beforeEach(() => {
    setActivePinia(createPinia())
    const launchdarkly = useBcrosLaunchdarkly()
    vi.spyOn(launchdarkly, 'getFeatureFlag').mockReturnValue(undefined)
    getStoredFlagSpy = vi.spyOn(launchdarkly, 'getStoredFlag')
    setNewFeatures([])
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('AGM location change', () => {
    it('resumes in the Filings UI when the migration flag is off', () => {
      setBusiness('BC1234567', 'BC')

      doResumeFiling(todoItem(FilingTypes.AGM_LOCATION_CHANGE))

      expect(mockGoToFilingsUI).toHaveBeenCalledWith('/BC1234567/agm-location-chg', { filingId: '123' })
      expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
    })

    it('resumes in the Corps UI with the draft id when the migration flag is on', () => {
      setNewFeatures(['migrated-agm-location-change'])
      setBusiness('BC1234567', 'BC')

      doResumeFiling(todoItem(FilingTypes.AGM_LOCATION_CHANGE))

      expect(mockGoToBusinessCorpsUI).toHaveBeenCalledWith('/agm-location-change/BC1234567', { draft: '123' })
      expect(mockGoToFilingsUI).not.toHaveBeenCalled()
    })
  })

  describe('change of directors', () => {
    it('resumes in the Filings UI when no migration flag is on', () => {
      setBusiness('BC1234567', 'BC')

      doResumeFiling(todoItem(FilingTypes.CHANGE_OF_DIRECTORS))

      expect(mockGoToFilingsUI).toHaveBeenCalledWith('/BC1234567/standalone-directors', { filingId: '123' })
      expect(mockGoToPersonRolesUI).not.toHaveBeenCalled()
    })

    it('resumes a base company in the People Roles UI when the corp flag is on', () => {
      setNewFeatures(['migrated-director-change'])
      setBusiness('BC1234567', 'BC')

      doResumeFiling(todoItem(FilingTypes.CHANGE_OF_DIRECTORS))

      expect(mockGoToPersonRolesUI).toHaveBeenCalledWith('manage-directors/BC1234567/', { draft: '123' })
      expect(mockGoToFilingsUI).not.toHaveBeenCalled()
    })

    it('keeps a base company in the Filings UI when only the coop flag is on', () => {
      setNewFeatures(['migrated-director-change-coop'])
      setBusiness('BC1234567', 'BC')

      doResumeFiling(todoItem(FilingTypes.CHANGE_OF_DIRECTORS))

      expect(mockGoToFilingsUI).toHaveBeenCalledWith('/BC1234567/standalone-directors', { filingId: '123' })
      expect(mockGoToPersonRolesUI).not.toHaveBeenCalled()
    })

    it('keeps a coop in the Filings UI when only the corp flag is on', () => {
      setNewFeatures(['migrated-director-change'])
      setBusiness('CP1234567', 'CP')

      doResumeFiling(todoItem(FilingTypes.CHANGE_OF_DIRECTORS))

      expect(mockGoToFilingsUI).toHaveBeenCalledWith('/CP1234567/standalone-directors', { filingId: '123' })
      expect(mockGoToPersonRolesUI).not.toHaveBeenCalled()
    })

    it('resumes a coop in the People Roles UI when the coop flag is on', () => {
      setNewFeatures(['migrated-director-change-coop'])
      setBusiness('CP1234567', 'CP')

      doResumeFiling(todoItem(FilingTypes.CHANGE_OF_DIRECTORS))

      expect(mockGoToPersonRolesUI).toHaveBeenCalledWith('manage-directors/CP1234567/', { draft: '123' })
      expect(mockGoToFilingsUI).not.toHaveBeenCalled()
    })
  })

  describe('correction', () => {
    const correctionTodoItem = (
      filingId = 123,
      correctedFilingType?: string,
      correctedFilingSubType?: string
    ) => ({
      name: FilingTypes.CORRECTION,
      filingId,
      correctedFilingType,
      correctedFilingSubType
    } as any)

    const supportedFilingsMockConfig = {
      changeOfLiquidators: {
        correction: 'modern',
        filing: 'legacy'
      },
      annualReport: {
        correction: 'legacy',
        filing: 'legacy'
      },
      correction: {
        filing: 'legacy'
      }
    }

    it('resumes in Corps UI when modern correction is configured for base company', () => {
      setSupportedFilingsConfig(supportedFilingsMockConfig)
      setBusiness('BC1234567', 'BC')

      doResumeFiling(correctionTodoItem(123, 'changeOfLiquidators', 'intentToLiquidate'))

      expect(mockGoToBusinessCorpsUI).toHaveBeenCalledWith('/correction/BC1234567/123', undefined)
      expect(mockGoToEditUI).not.toHaveBeenCalled()
    })

    it('resumes in Edit UI when legacy correction is configured', () => {
      setSupportedFilingsConfig(supportedFilingsMockConfig)
      setBusiness('BC1234567', 'BC')

      doResumeFiling(correctionTodoItem(123, 'annualReport'))

      expect(mockGoToEditUI).toHaveBeenCalledWith('/BC1234567/correction/', { 'correction-id': '123' })
      expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
    })

    it('resumes in Edit UI when correcting a correction (checks filing config, not correction)', () => {
      setSupportedFilingsConfig(supportedFilingsMockConfig)
      setBusiness('BC1234567', 'BC')

      doResumeFiling(correctionTodoItem(123, FilingTypes.CORRECTION))

      expect(mockGoToEditUI).toHaveBeenCalledWith('/BC1234567/correction/', { 'correction-id': '123' })
      expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
    })

    it('falls back to Edit UI if correctedFilingType is missing or not configured', () => {
      setSupportedFilingsConfig(supportedFilingsMockConfig)
      setBusiness('BC1234567', 'BC')

      doResumeFiling(correctionTodoItem(123))

      expect(mockGoToEditUI).toHaveBeenCalledWith('/BC1234567/correction/', { 'correction-id': '123' })
      expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
    })

    it('routes a non-base company (e.g. Coop) to Edit UI even if config is modern', () => {
      setSupportedFilingsConfig(supportedFilingsMockConfig)
      setBusiness('CP1234567', 'CP')

      doResumeFiling(correctionTodoItem(123, 'changeOfLiquidators'))

      expect(mockGoToEditUI).toHaveBeenCalledWith('/CP1234567/correction/', { 'correction-id': '123' })
      expect(mockGoToBusinessCorpsUI).not.toHaveBeenCalled()
    })
  })
})
