export function useBcrosAuthApi<T>(path: string, options: any = {}) {
  const config = useRuntimeConfig()
  const apiURL = config.public.authApiGwURL
  const authApiKey = config.public.authApiKey

  const finalOptions = {
    ...options,
    headers: {
      ...options.headers,
      'X-Apikey': authApiKey
    }
  }

  return useFetch<T>(`${apiURL}${path}`, {
    ...finalOptions,
    watch: false,
    $fetch: useNuxtApp().$bcrosFetch
  })
}
