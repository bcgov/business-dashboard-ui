/** Reloads the app under the given identifier, keeping the current URL parameters and adding `query`. */
export const reloadWithIdentifier = (identifier: string, query: Record<string, string> = {}) => {
  const url = new URL(window.location.href)
  url.pathname = `/${identifier}`
  Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, value))
  window.location.assign(url.toString())
}
