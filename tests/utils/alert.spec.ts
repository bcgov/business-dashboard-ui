import { describe, it, expect } from 'vitest'

import { BusinessTypeE, GOOD_STANDING_NOT_APPLICABLE_TYPES, isGoodStandingAlertApplicable } from '#imports'

describe('isGoodStandingAlertApplicable', () => {
  it('covers exactly the mainframe-migrated entity types', () => {
    expect([...GOOD_STANDING_NOT_APPLICABLE_TYPES].sort()).toEqual(
      ['CEM', 'LIB', 'PAR', 'PFS', 'RLY', 'SB', 'TMY', 'XCP']
    )
  })

  it.each(['CEM', 'LIB', 'PAR', 'PFS', 'RLY', 'SB', 'TMY', 'XCP'])(
    'does not show the good standing alert for %s',
    (legalType) => {
      expect(isGoodStandingAlertApplicable(legalType)).toBe(false)
    }
  )

  it.each([
    BusinessTypeE.COOP,
    BusinessTypeE.BENEFIT_COMPANY,
    BusinessTypeE.BC_COMPANY,
    BusinessTypeE.BC_CCC,
    BusinessTypeE.BC_ULC_COMPANY,
    BusinessTypeE.CONTINUE_IN,
    BusinessTypeE.PARTNERSHIP,
    BusinessTypeE.SOLE_PROP,
    BusinessTypeE.SOCIETY
  ])('still shows the good standing alert for %s', (legalType) => {
    expect(isGoodStandingAlertApplicable(legalType)).toBe(true)
  })

  it('still shows the good standing alert when the legal type is unknown', () => {
    expect(isGoodStandingAlertApplicable(undefined)).toBe(true)
  })
})
