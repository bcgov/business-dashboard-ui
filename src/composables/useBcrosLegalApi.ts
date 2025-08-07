/** Returns Legal API URL or Business API GW URL depending on FF. */
import { LDFlags } from '~/enums/ld-flags'

export const useBcrosLegalApi = () => {
  const config = useRuntimeConfig()
  const { ldInitialized, getStoredFlag } = useBcrosLaunchdarkly()

  function getConfig(originalUrl: string = '') {
    let apiURL = `${config.public.legalApiURL}`
    let path = originalUrl
    let additionalHeaders = {}

    // Check feature flag to determine which API to use
    try {
      if (ldInitialized && getStoredFlag(LDFlags.UseBusinessApiGwURL)) {
        apiURL = `${config.public.businessApiGwURL}`
        additionalHeaders = {
          'X-Apikey': config.public.businessApiKey
        }
      }
    } catch (error) {
      // LaunchDarkly not ready or error accessing store, use default legal API
      console.error('LaunchDarkly not available, using Legal API:', apiURL)
    }

    // Extract API path from full URL or just use the path as-is
    if (originalUrl) {
      const match = originalUrl.match(/\/api\/v[12](\/.+)/)
      if (match && match[1]) {
        path = match[1]
      }
    }

    return { apiURL, path, additionalHeaders }
  }

  function fetch<T>(url: string, options: any = {}) {
    const { apiURL, path, additionalHeaders } = getConfig(url)
    const finalOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...additionalHeaders
      }
    }
    return useFetch<T>(`${apiURL}${path}`, {
      ...finalOptions,
      watch: false,
      $fetch: useNuxtApp().$bcrosFetch
    })
  }

  return {
    fetch,
    getConfig
  }
}
