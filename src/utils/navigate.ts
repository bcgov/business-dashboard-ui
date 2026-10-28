/** Reloads the app under the given identifier, keeping the current URL parameters. */
export const reloadWithIdentifier = (identifier: string) => {
  const url = new URL(window.location.href)
  url.pathname = `/${identifier}`
  window.location.assign(url.toString())
}
