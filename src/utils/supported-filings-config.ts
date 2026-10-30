import merge from 'lodash.merge'
import { FilingTypes } from '@bcrs-shared-components/enums'

type SystemTarget = 'legacy' | 'modern' | 'off'

interface FilingConfigMeta {
  meta?: Record<string, unknown>
}

interface FilingConfig extends FilingConfigMeta {
  filing?: SystemTarget
  correction?: SystemTarget
}

type SubTypeTarget = SystemTarget | FilingConfig

interface FilingSubTypeConfig extends FilingConfig {
  [subType: string]: SubTypeTarget | Record<string, unknown>
}

type FilingTypeConfig = SystemTarget | FilingConfig | FilingSubTypeConfig

type SupportedFilingsConfig = Partial<Record<FilingTypes | string, FilingTypeConfig>>

// Any filing type not explicitly defined in this file or overrode by the LD flag will use this default config
const DEFAULT_FILING_CONFIG: FilingConfig = { filing: 'legacy', correction: 'off' } as const

// Filings that exist in legacy and allow both filing and correction
const FULL_LEGACY_FILINGS: FilingTypes[] = [
  FilingTypes.ALTERATION,
  FilingTypes.AMALGAMATION_APPLICATION,
  FilingTypes.ANNUAL_REPORT,
  FilingTypes.CHANGE_OF_ADDRESS,
  FilingTypes.CHANGE_OF_DIRECTORS,
  FilingTypes.CHANGE_OF_NAME,
  FilingTypes.CHANGE_OF_REGISTRATION,
  FilingTypes.CONTINUATION_IN,
  FilingTypes.CORRECTION,
  FilingTypes.INCORPORATION_APPLICATION,
  FilingTypes.REGISTRATION,
  FilingTypes.SPECIAL_RESOLUTION
] as const

// Filings completely disabled by default
const FULL_OFF_FILINGS: FilingTypes[] = [
  FilingTypes.CHANGE_OF_LIQUIDATORS,
  FilingTypes.CHANGE_OF_RECEIVERS
] as const

// Full modern filings
// update as filings are fully modernized (filing and correction) and remove override value from LD
const FULL_MODERN_FILINGS: FilingTypes[] = [] as const

function formatFilingsToTarget(
  filings: FilingTypes[],
  target: FilingTypeConfig
): SupportedFilingsConfig {
  return filings.reduce<SupportedFilingsConfig>((acc, filing) => {
    acc[filing] = target
    return acc
  }, {})
}

const DEFAULT_SUPPORTED_FILINGS_CONFIG: SupportedFilingsConfig = {
  ...formatFilingsToTarget(FULL_LEGACY_FILINGS, 'legacy'),
  ...formatFilingsToTarget(FULL_OFF_FILINGS, 'off'),
  ...formatFilingsToTarget(FULL_MODERN_FILINGS, 'modern'),

  // officers is only available in modern, has no correction and is in prod
  [FilingTypes.CHANGE_OF_OFFICERS]: { filing: 'modern', correction: 'off' }
} as const

const FILING_SUB_TYPES = new Set<string>(Object.values(FilingSubTypeE))

// format shorthands (modern) or objects into a FilingConfig object
function normalizeTarget(target?: SubTypeTarget): FilingConfig | undefined {
  if (!target) { return undefined }
  if (typeof target === 'string') {
    return { filing: target, correction: target }
  }
  return target
}

// finds matching config for a filing type or nested filing sub type
function resolveEntry(
  config: SupportedFilingsConfig | undefined,
  filingType: FilingTypes,
  filingSubType?: FilingSubTypeE
): FilingConfig | undefined {
  if (!config) { return undefined }

  const entry = config[filingType]
  if (!entry) { return undefined }

  // check top level shorthand (off/modern/legacy)
  if (typeof entry === 'string') {
    return normalizeTarget(entry)
  }

  // Parent (FilingTypes)
  const parentEntry = entry as FilingSubTypeConfig
  const hasSubType = Object.keys(parentEntry).some(key => FILING_SUB_TYPES.has(key))

  if (hasSubType) {
    // check for explicit sub type config
    if (filingSubType && parentEntry[filingSubType]) {
      const subTypeConfig = normalizeTarget(parentEntry[filingSubType] as SubTypeTarget)
      if (subTypeConfig) {
        return parentEntry.meta
          ? { ...subTypeConfig, meta: merge({}, parentEntry.meta, subTypeConfig.meta) }
          : subTypeConfig
      }
    }

    // use parent values if subType is not configured
    if (parentEntry.filing || parentEntry.correction) {
      const { filing, correction, meta } = parentEntry
      return {
        filing,
        correction,
        meta
      }
    }

    return undefined
  }

  // direct config without sub types
  return normalizeTarget(entry as FilingConfig)
}

/**
 * Resolves filing config in order:
 * 1. LaunchDarkly flag entry
 * 2. Default supported filings entry
 * 3. Base DEFAULT_FILING_CONFIG ({ filing: 'legacy', correction: 'off' })
 */
export function getSupportedFilingsConfig(
  filingType: FilingTypes,
  filingSubType?: FilingSubTypeE,
  flagConfig?: SupportedFilingsConfig
): FilingConfig {
  const flagEntry = resolveEntry(flagConfig, filingType, filingSubType)
  const defaultMapEntry = resolveEntry(DEFAULT_SUPPORTED_FILINGS_CONFIG, filingType, filingSubType)

  // Merge order: DEFAULT_FILING_CONFIG <- DEFAULT_SUPPORTED_FILINGS_CONFIG entry <- flag override
  return merge({}, DEFAULT_FILING_CONFIG, defaultMapEntry, flagEntry)
}
