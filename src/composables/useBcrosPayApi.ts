export function useBcrosPayApi<T>(path: string, options: any = {}) {
  const config = useRuntimeConfig()
  const apiURL = config.public.payApiGwURL
  const apiKey = config.public.payApiKey

  const finalOptions = {
    ...options,
    headers: {
      ...options.headers,
      'X-Apikey': apiKey
    }
  }

  return useFetch<T>(`${apiURL}${path}`, {
    ...finalOptions,
    watch: false,
    $fetch: useNuxtApp().$bcrosFetch
  })
}
