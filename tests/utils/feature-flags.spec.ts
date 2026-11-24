import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

import { isNewFeatureEnabled } from '~/utils/feature-flags'
import { useBcrosLaunchdarkly } from '~/stores/launchdarkly'
import { LDFlags } from '~/enums/ld-flags'

describe('isNewFeatureEnabled', () => {
  let getStoredFlagSpy

  beforeEach(() => {
    setActivePinia(createPinia())
    getStoredFlagSpy = vi.spyOn(useBcrosLaunchdarkly(), 'getStoredFlag')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  const company = 'migrated-director-change'
  const coop = 'migrated-director-change-coop'

  const cases: [string, any, boolean, boolean][] = [
    ['undefined', undefined, false, false],
    ['null', null, false, false],
    ['a non-string value', 42, false, false],
    ['an empty string', '', false, false],
    ['the company value only', company, true, false],
    ['the coop value only (regression)', coop, false, true],
    ['both values', `${company},${coop}`, true, true],
    ['both values with a space after the comma', `${company}, ${coop}`, true, true],
    ['another feature plus coop', `other-feature,${coop}`, false, true],
    ['an array of values', [company], true, false]
  ]

  it.each(cases)('flag is %s', (_label, flag, expectedCompany, expectedCoop) => {
    getStoredFlagSpy.mockImplementation((name: string) => name === LDFlags.EnableNewFeature ? flag : undefined)

    expect(isNewFeatureEnabled(company)).toBe(expectedCompany)
    expect(isNewFeatureEnabled(coop)).toBe(expectedCoop)
  })
})
