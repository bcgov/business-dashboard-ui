/** Returns Legal API URL or Business API GW URL depending on FF. */
import { LDFlags } from "~/enums/ld-flags"

export const useBcrosLegalApi = () => {
  const config = useRuntimeConfig()
  const { ldInitialized, getStoredFlag } = useBcrosLaunchdarkly()

  function getConfig() {
    let apiURL = `${config.public.legalApiURL}`
    let addtionalHeaders = {}
  
    // Check feature flag to determine which API to use
    try {
      if (ldInitialized && getStoredFlag(LDFlags.UseBusinessApiGwUrl)) {
        apiURL = `${config.public.businessApiGwUrl}`
        addtionalHeaders = {
          'X-Apikey': config.public.businessApiKey
        }
      }
    } catch (error) {
      // LaunchDarkly not ready or error accessing store, use default legal API
      console.error('LaunchDarkly not available, using Legal API:', apiURL)
    }

    return { apiURL, addtionalHeaders }
  }

  function fetch<T>(path: string, options: any = {}) {
    const { apiURL, addtionalHeaders } = getConfig()
    const finalOptions = {
      ...options,
      headers: {
        ...options.headers,
        ...addtionalHeaders
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
