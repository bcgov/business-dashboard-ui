import type { ApiResponseFilingI } from '#imports'

const getDashboardUrl = () => { return ''}

/** Reloads Filings UI using business id instead of temporary registration number. */
export const reloadWithBusinessId = (filing: ApiResponseFilingI) => {
  const getQueryParams = ''
  // build the URL to the business dashboard with the business id and any URL parameters
  const url = getDashboardUrl + filing.businessIdentifier // + this.$route.fullPath
  window.location.assign(url)
}
