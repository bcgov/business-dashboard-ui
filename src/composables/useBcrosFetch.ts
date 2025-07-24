// TODO: remove once fix the API
function replaceBusinessApiUrl(originalUrl: string): string {
  const config = useRuntimeConfig()
  const versionRegex = /(api\/v[12]\/.*)/

  const match = originalUrl.match(versionRegex)
  if (match) {
    return config.public.businessApiGwUrl + '/' + match[1]
  }

  const strippedPath = originalUrl.replace(config.public.businessApiUrl, '')
  return config.public.businessApiGwUrl + config.public.businessApiVersion + strippedPath
}

// following docs: https://nuxt.com/docs/guide/recipes/custom-usefetch
export function useBcrosFetch<T>(url: string, options: any) {
  // TODO: remove once fix the API
  const config = useRuntimeConfig()
  const { ldInitialized, getStoredFlag } = useBcrosLaunchdarkly()
  let finalUrl = url
  try {
    if (url.includes(config.public.businessApiUrl) || url.includes(config.public.legalApiURL)) {
      if (ldInitialized && getStoredFlag(LDFlags.UseBusinessApiGwUrl)) {
        finalUrl = replaceBusinessApiUrl(url)
      }
    }
  } catch (error) {
    // LaunchDarkly not ready or error accessing store
    console.error('LaunchDarkly not available')
  }

  return useFetch<T>(finalUrl, {
    ...options,
    watch: false,
    $fetch: useNuxtApp().$bcrosFetch
  })
}
