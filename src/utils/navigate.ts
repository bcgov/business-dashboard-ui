/** Reloads app using business id instead of temporary registration number. */
export const reloadWithBusinessId = (filing: ApiResponseFilingI) => {
  // build the URL to the business dashboard with the business id and any URL parameters
  // const url = getDashboardUrl + filing.businessIdentifier // + this.$route.fullPath
  const businessIdentifier = filing.businessIdentifier
  const url = new URL(window.location.href)
  url.pathname = `/${businessIdentifier}`
  window.location.assign(url.toString())
}
