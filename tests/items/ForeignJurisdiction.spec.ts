import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'

import { FilingTypes } from '@bcrs-shared-components/enums'

import ConsentContinuationOut from '../../src/components/bcros/filing/item/ConsentContinuationOut.vue'
import ContinuationOut from '../../src/components/bcros/filing/item/ContinuationOut.vue'
import AmalgamationOut from '../../src/components/bcros/filing/item/AmalgamationOut.vue'
import ConsentAmalgamationOut from '../../src/components/bcros/filing/item/ConsentAmalgamationOut.vue'

import type { ApiResponseFilingI } from '#imports'
import { FilingStatusE } from '#imports'

// Pinia setup
beforeEach(() => {
  setActivePinia(createPinia())
})

const createJurisdictionMockFiling = (
  filingType: FilingTypes,
  country?: string,
  region?: string
): ApiResponseFilingI => {
  const filingData: any = {
    applicationDate: '2024-01-01',
    legalFilings: []
  }

  const jurisdictionData = { country, region }

  switch (filingType) {
    case FilingTypes.CONSENT_CONTINUATION_OUT:
      filingData.consentContinuationOut = { ...jurisdictionData, expiry: '2099-12-31T23:59:59+00:00' }
      break
    case FilingTypes.CONTINUATION_OUT:
      filingData.continuationOut = { ...jurisdictionData }
      break
    case FilingTypes.AMALGAMATION_OUT:
      filingData.amalgamationOut = { ...jurisdictionData }
      break
    case FilingTypes.CONSENT_AMALGAMATION_OUT:
      filingData.consentAmalgamationOut = { ...jurisdictionData, expiry: '2099-12-31T23:59:59+00:00' }
      break
    default:
      break
  }

  return {
    availableOnPaperOnly: false,
    businessIdentifier: 'BC1234567',
    commentsCount: 0,
    commentsLink: '',
    data: filingData,
    displayName: 'Mock Filing',
    documentsLink: '',
    effectiveDate: '',
    filingId: 123,
    filingLink: '',
    isFutureEffective: false,
    name: filingType,
    status: FilingStatusE.COMPLETED,
    submittedDate: '',
    submitter: '',
    displayLedger: false,
    withdrawalPending: false
  }
}

// Helper for mounting and testing
const testJurisdiction = (
  component: any,
  filingType: FilingTypes,
  expectedJurisdiction: string,
  country?: string,
  region?: string
) => {
  const mockFiling = createJurisdictionMockFiling(filingType, country, region)
  const wrapper = mount(component, {
    props: { filing: mockFiling },
    global: {
      mocks: {
        $t: (key: string) => key
      }
    }
  })
  const vm = wrapper.vm as any
  expect(vm.foreignJurisdiction).toBe(expectedJurisdiction)
}

describe('Foreign Jurisdiction Display in Components', () => {
  // --- Tests for ConsentContinuationOut --- //
  describe('ConsentContinuationOut', () => {
    const component = ConsentContinuationOut
    const filingType = FilingTypes.CONSENT_CONTINUATION_OUT

    it('displays only country name when region is not provided', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB')
    })

    it('displays only country name when region is "Federal"', () => {
      testJurisdiction(component, filingType, 'Canada', 'CA', 'FEDERAL')
    })

    it('displays region and country name for Canada', () => {
      testJurisdiction(component, filingType, 'British Columbia, Canada', 'CA', 'BC')
    })

    it('displays region and country name for USA', () => {
      testJurisdiction(component, filingType, 'Washington, United States', 'US', 'WA')
    })

    it('displays only country name for non-CA/US regions', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB', 'ENG')
    })
  })

  // --- Tests for ContinuationOut --- //
  describe('ContinuationOut', () => {
    const component = ContinuationOut
    const filingType = FilingTypes.CONTINUATION_OUT

    it('displays only country name when region is not provided', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB')
    })

    it('displays only country name when region is "Federal"', () => {
      testJurisdiction(component, filingType, 'Canada', 'CA', 'FEDERAL')
    })

    it('displays region and country name for Canada', () => {
      testJurisdiction(component, filingType, 'British Columbia, Canada', 'CA', 'BC')
    })

    it('displays region and country name for USA', () => {
      testJurisdiction(component, filingType, 'Washington, United States', 'US', 'WA')
    })

    it('displays only country name for non-CA/US regions', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB', 'ENG')
    })
  })

  // --- Tests for AmalgamationOut --- //
  describe('AmalgamationOut', () => {
    const component = AmalgamationOut
    const filingType = FilingTypes.AMALGAMATION_OUT

    it('displays only country name when region is not provided', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB')
    })

    it('displays only country name when region is "Federal"', () => {
      testJurisdiction(component, filingType, 'Canada', 'CA', 'FEDERAL')
    })

    it('displays region and country name for Canada', () => {
      testJurisdiction(component, filingType, 'British Columbia, Canada', 'CA', 'BC')
    })

    it('displays region and country name for USA', () => {
      testJurisdiction(component, filingType, 'Washington, United States', 'US', 'WA')
    })

    it('displays only country name for non-CA/US regions', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB', 'ENG')
    })
  })

  // --- Tests for ConsentAmalgamationOut --- //
  describe('ConsentAmalgamationOut', () => {
    const component = ConsentAmalgamationOut
    const filingType = FilingTypes.CONSENT_AMALGAMATION_OUT

    it('displays only country name when region is not provided', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB')
    })

    it('displays only country name when region is "Federal"', () => {
      testJurisdiction(component, filingType, 'Canada', 'CA', 'FEDERAL')
    })

    it('displays region and country name for Canada', () => {
      testJurisdiction(component, filingType, 'British Columbia, Canada', 'CA', 'BC')
    })

    it('displays region and country name for USA', () => {
      testJurisdiction(component, filingType, 'Washington, United States', 'US', 'WA')
    })

    it('displays only country name for non-CA/US regions', () => {
      testJurisdiction(component, filingType, 'United Kingdom', 'GB', 'ENG')
    })
  })
})
