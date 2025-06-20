/** Returns Legal API URL or Business API GW URL depending on FF. */

export const useBcrosLegalApi = () => {
  const config = useRuntimeConfig()
  const { ldInitialized, getStoredFlag } = useBcrosLaunchdarkly()

  let baseURL = config.public.legalApiUrl
  let options = {}

  // Check feature flag to determine which API to use
  try {
    if (ldInitialized && getStoredFlag('use-business-api-gw-url')) {
      baseURL = config.public.businessApiGwUrl
      options = {
        headers: { 'X-Apikey': config.public.businessApiKey }
      }
    }
  } catch (error) {
    // LaunchDarkly not ready or error accessing store, use default legal API
    console.error('LaunchDarkly not available, using Legal API:', baseURL)
  }

  return { legalApiURL: baseURL, legalApiOptions: options }
}
