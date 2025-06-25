// following docs: https://nuxt.com/docs/guide/recipes/custom-usefetch
export function useBcrosFetch<T>(url: string, options: any) {
  // TODO: remove once fix the API
  const config = useRuntimeConfig()
  const { ldInitialized, getStoredFlag } = useBcrosLaunchdarkly()
  let finalUrl = url
  try {
    if (url.includes(config.public.businessApiUrl)) {
      if (ldInitialized && getStoredFlag(LDFlags.UseBusinessApiGwUrl)) {
        finalUrl = url.replace(config.public.businessApiUrl, config.public.businessApiGwUrl)
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
