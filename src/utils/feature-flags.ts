import { LDFlags } from '~/enums/ld-flags'

/**
 * Returns true if the enable-new-feature flag contains the exact feature name.
 * The flag is a comma-separated string (e.g. 'a,b'); values are compared whole
 */
export const isNewFeatureEnabled = (feature: string): boolean => {
  const { getStoredFlag } = useBcrosLaunchdarkly()
  const flag = getStoredFlag(LDFlags.EnableNewFeature)

  let values: unknown[] = []
  if (typeof flag === 'string') {
    values = flag.split(',')
  } else if (Array.isArray(flag)) {
    values = flag
  }

  return values.some(value => typeof value === 'string' && value.trim() === feature)
}
