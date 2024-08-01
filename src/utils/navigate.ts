/** Reloads Filings UI using business id instead of temporary registration number. */
export const reloadWithBusinessId = () => {
  // build the URL to the business dashboard with the business id and any URL parameters
  // const url = getDashboardUrl + filing.businessIdentifier // + this.$route.fullPath
  const url = window.location.href
  window.location.assign(url)
}
