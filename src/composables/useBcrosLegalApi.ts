/**
 * Provides configuration and fetch functionality for the Business API Gateway.
 * This composable exposes methods to construct API URLs, set required headers,
 * and perform API requests using the configured gateway and authentication.
 */
export const useBcrosLegalApi = () => {
  const config = useRuntimeConfig()

  function getConfig(originalUrl: string = '') {
    const apiURL = `${config.public.businessApiGwURL}`
    const additionalHeaders = {
      'X-Apikey': config.public.businessApiKey
    }

    // Extract API path from full URL or just use the path as-is
    let path = originalUrl
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
