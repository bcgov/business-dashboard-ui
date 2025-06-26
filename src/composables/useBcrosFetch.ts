// TODO: remove once fix the API
function replaceBusinessApiUrl(originalUrl: string): string {
  const config = useRuntimeConfig()
  const versionRegex = /(api\/v[12]\/.*)/;

  const match = originalUrl.match(versionRegex);
  if (match) {
    return config.public.businessApiGwUrl + '/' + match[1];
  }

  const strippedPath = originalUrl.replace(config.public.businessApiUrl, '');
  return config.public.businessApiGwUrl + config.public.businessApiVersion + strippedPath;
}

// following docs: https://nuxt.com/docs/guide/recipes/custom-usefetch
export function useBcrosFetch<T>(url: string, options: any) {
  // TODO: remove once fix the API
  const config = useRuntimeConfig()
  const { ldInitialized, getStoredFlag } = useBcrosLaunchdarkly()
  let finalUrl = url
  try {
    if (url.includes(config.public.businessApiUrl)) {
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


// https://test.api.connect.gov.bc.ca/business-dev/api/v2/businesse/api/v2/businesses/BC0888039/filings/198133/documents/changeOfDirectors
// https://business-api-dev-dy4loprnwa-nn.a.run.app/businesse/api/v2/businesses/BC0888039/filings/198133/documents/changeOfDirectors
// https://business-api-dev-dy4loprnwa-nn.a.run.app/businesses/BC0888039/filings/198133

// https://business-api-dev-dy4loprnwa-nn.a.run.app/businesse/api/v2/businesses/BC0888039/filings/198133/documents/changeOfDirectors
// https://test.api.connect.gov.bc.ca/business-dev/businesse/api/v2/businesses/BC0888039/filings/198133/documents/changeOfDirectors
// https://test.api.connect.gov.bc.ca/api/v2/businesses/BC0888039/filings/198133/documents/changeOfDirectors