import { RouteNameE } from '~/enums/route-name-e'

export default defineNuxtRouteMiddleware(async (to) => {
  const identifier = to.params.identifier as string

  // check account authorizations
  const isAllowed = await useBcrosAccount().verifyAccountAuthorizations(identifier)
  if (!isAllowed && RouteNameE.CRITICAL_ERRORS !== to.name) {
    return navigateTo({ name: RouteNameE.CRITICAL_ERRORS, params: { identifier } })
  }
})
