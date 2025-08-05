// TODO: remove once fix the API
function replaceApiURL(originalUrl: string): string {
  const config = useRuntimeConfig()
  const { ldInitialized, getStoredFlag } = useBcrosLaunchdarkly()

  if (originalUrl.includes(config.public.businessApiURL) || originalUrl.includes(config.public.legalApiURL)) {
    if (ldInitialized && getStoredFlag(LDFlags.UseBusinessApiGwURL)) {
      const versionRegex = /(api\/v[12]\/.*)/
      const match = originalUrl.match(versionRegex)
      if (match) {
        return config.public.businessApiGwURL + '/' + match[1]
      }
      const strippedPath = originalUrl.replace(config.public.businessApiURL, '')
      return config.public.businessApiGwURL + config.public.businessApiVersion + strippedPath
    }
  } else if (originalUrl.includes(config.public.authApiURL)) {
    return originalUrl.replace(config.public.authApiURL, config.public.authApiGwURL)
  }

  return originalUrl
}

// following docs: https://nuxt.com/docs/guide/recipes/custom-usefetch
export function useBcrosFetch<T>(url: string, options: any) {
  const finalUrl = replaceApiURL(url)
  return useFetch<T>(finalUrl, {
    ...options,
    watch: false,
    $fetch: useNuxtApp().$bcrosFetch
  })
}
