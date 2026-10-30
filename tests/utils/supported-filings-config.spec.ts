import { describe, it, expect } from 'vitest'
import { FilingTypes } from '@bcrs-shared-components/enums'

describe('getSupportedFilingsConfig', () => {
  it('falls back to DEFAULT_FILING_CONFIG when filing has no code or flag configuration', () => {
    const result = getSupportedFilingsConfig('UNKNOWN_FILING' as FilingTypes)
    expect(result).toEqual({ filing: 'legacy', correction: 'off' })
  })

  it('resolves legacy shorthand defaults', () => {
    expect(getSupportedFilingsConfig(FilingTypes.ANNUAL_REPORT)).toEqual({
      filing: 'legacy',
      correction: 'legacy'
    })
  })

  it('resolves off shorthand defaults', () => {
    expect(getSupportedFilingsConfig(FilingTypes.CHANGE_OF_LIQUIDATORS)).toEqual({
      filing: 'off',
      correction: 'off'
    })
  })

  it('resolves separate type default configurations', () => {
    expect(getSupportedFilingsConfig(FilingTypes.CHANGE_OF_OFFICERS)).toEqual({
      filing: 'modern',
      correction: 'off'
    })
  })

  it('overrides defaults with shorthand', () => {
    const flagConfig = {
      [FilingTypes.ANNUAL_REPORT]: 'modern'
    } as const

    const result = getSupportedFilingsConfig(FilingTypes.ANNUAL_REPORT, undefined, flagConfig)
    expect(result).toEqual({
      filing: 'modern',
      correction: 'modern'
    })
  })

  it('overrides parent with partial object', () => {
    const flagConfig = {
      [FilingTypes.COURT_ORDER]: {
        filing: 'modern'
      }
    } as const

    const result = getSupportedFilingsConfig(FilingTypes.COURT_ORDER, undefined, flagConfig)
    expect(result).toEqual({
      filing: 'modern',
      correction: 'off'
    })
  })

  it('resolves subType targets directly', () => {
    const flagConfig = {
      [FilingTypes.DISSOLUTION]: {
        [FilingSubTypeE.DISSOLUTION_VOLUNTARY]: {
          filing: 'modern',
          correction: 'legacy'
        }
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.DISSOLUTION,
      FilingSubTypeE.DISSOLUTION_VOLUNTARY,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'modern',
      correction: 'legacy'
    })
  })

  it('uses parent config when a subType is unconfigured', () => {
    const flagConfig = {
      [FilingTypes.DISSOLUTION]: {
        correction: 'modern',
        filing: 'modern'
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.DISSOLUTION,
      FilingSubTypeE.DISSOLUTION_VOLUNTARY,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'modern',
      correction: 'modern'
    })
  })

  it('prioritizes subType config over parent config', () => {
    const flagConfig = {
      [FilingTypes.DISSOLUTION]: {
        filing: 'modern',
        correction: 'modern',
        [FilingSubTypeE.DISSOLUTION_VOLUNTARY]: {
          filing: 'legacy',
          correction: 'off'
        }
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.DISSOLUTION,
      FilingSubTypeE.DISSOLUTION_VOLUNTARY,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'legacy',
      correction: 'off'
    })
  })

  it('falls back to parent when missing subType', () => {
    const flagConfig = {
      [FilingTypes.DISSOLUTION]: {
        filing: 'modern',
        correction: 'off',
        [FilingSubTypeE.DISSOLUTION_INVOLUNTARY]: 'legacy'
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.DISSOLUTION,
      FilingSubTypeE.DISSOLUTION_VOLUNTARY,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'modern',
      correction: 'off'
    })
  })

  it('merges parent meta into subType meta', () => {
    const flagConfig = {
      [FilingTypes.AMALGAMATION_APPLICATION]: {
        meta: {
          inheritedKey: 'from-parent',
          collidingKey: 'parent-value'
        },
        [FilingSubTypeE.AMALGAMATION_HORIZONTAL]: {
          filing: 'modern',
          correction: 'off',
          meta: {
            childKey: 'from-child',
            collidingKey: 'child-value'
          }
        }
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.AMALGAMATION_APPLICATION,
      FilingSubTypeE.AMALGAMATION_HORIZONTAL,
      flagConfig
    )

    expect(result).toEqual({
      filing: 'modern',
      correction: 'off',
      meta: {
        inheritedKey: 'from-parent',
        childKey: 'from-child',
        collidingKey: 'child-value'
      }
    })
  })

  it('falls back to default if flag only defines sibling subTypes', () => {
    const flagConfig = {
      [FilingTypes.DISSOLUTION]: {
        [FilingSubTypeE.DISSOLUTION_INVOLUNTARY]: 'legacy'
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.DISSOLUTION,
      FilingSubTypeE.DISSOLUTION_VOLUNTARY,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'legacy',
      correction: 'off'
    })
  })

  it('expands nested subType shorthand', () => {
    const flagConfig = {
      [FilingTypes.DISSOLUTION]: {
        [FilingSubTypeE.DISSOLUTION_VOLUNTARY]: 'modern'
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.DISSOLUTION,
      FilingSubTypeE.DISSOLUTION_VOLUNTARY,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'modern',
      correction: 'modern'
    })
  })

  it('inherits parent meta', () => {
    const flagConfig = {
      [FilingTypes.AMALGAMATION_APPLICATION]: {
        meta: { courtOrderRequired: true },
        [FilingSubTypeE.AMALGAMATION_HORIZONTAL]: 'modern'
      }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.AMALGAMATION_APPLICATION,
      FilingSubTypeE.AMALGAMATION_HORIZONTAL,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'modern',
      correction: 'modern',
      meta: { courtOrderRequired: true }
    })
  })

  it('applies parent shorthand for sub types', () => {
    const flagConfig = {
      [FilingTypes.AMALGAMATION_APPLICATION]: 'off'
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.AMALGAMATION_APPLICATION,
      FilingSubTypeE.AMALGAMATION_HORIZONTAL,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'off',
      correction: 'off'
    })
  })

  it('applies parent full target for sub types', () => {
    const flagConfig = {
      [FilingTypes.AMALGAMATION_APPLICATION]: { correction: 'modern', filing: 'modern' }
    } as const

    const result = getSupportedFilingsConfig(
      FilingTypes.AMALGAMATION_APPLICATION,
      FilingSubTypeE.AMALGAMATION_HORIZONTAL,
      flagConfig
    )
    expect(result).toEqual({
      filing: 'modern',
      correction: 'modern'
    })
  })
})
